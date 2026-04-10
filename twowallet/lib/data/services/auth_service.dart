import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import 'revenue_cat_service.dart';
import 'analytics_service.dart';

class AuthService {
  final _client = SupabaseService.client;

  /// Polls until the DB trigger has created the partner row for [userId],
  /// then returns its household_id. Retries up to 10 times at 150 ms intervals
  /// (~1.5 s max) before throwing. Replaces the previous hardcoded 500 ms sleep.
  Future<String> _awaitHouseholdId(String userId) async {
    for (int i = 0; i < 10; i++) {
      final rows = await _client
          .from('partners')
          .select('household_id')
          .eq('user_id', userId)
          .limit(1);
      if (rows.isNotEmpty) return rows.first['household_id'] as String;
      await Future.delayed(const Duration(milliseconds: 150));
    }
    throw Exception('Household creation timed out — please try again.');
  }

  // Sign up Partner A — trigger auto-creates household + partner_a.
  // If a pending invite exists in SharedPreferences, transitions the new user
  // to partner_b of that household instead.
  Future<String> signUpPartnerA({
    required String email,
    required String password,
    required String displayName,
    double? monthlyIncomeNetAud,
  }) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'display_name': displayName,
      },
    );

    if (response.user == null) throw Exception('Sign up failed');

    // Poll until the DB trigger has created the partner row.
    final newHouseholdId = await _awaitHouseholdId(response.user!.id);

    // Update income if provided
    if (monthlyIncomeNetAud != null) {
      await _client
          .from('partners')
          .update({'monthly_income_net_aud': monthlyIncomeNetAud}).eq(
              'user_id', response.user!.id);
    }

    // Check if this user arrived via a partner invite
    final prefs = await SharedPreferences.getInstance();
    final pendingHouseholdId = prefs.getString('pending_household_id');

    if (pendingHouseholdId != null) {
      await prefs.remove('pending_household_id');

      // Delete auto-created partner record and household so we can join the
      // invited household as partner_b instead.
      await _client
          .from('partners')
          .delete()
          .eq('user_id', response.user!.id);
      await _client
          .from('households')
          .delete()
          .eq('id', newHouseholdId);

      await _client.from('partners').insert({
        'household_id': pendingHouseholdId,
        'user_id': response.user!.id,
        'display_name': displayName,
        'role': 'partner_b',
      });

      // Mark onboarding complete so the router redirects to /home
      await prefs.setBool('hasSeenOnboarding', true);
      await prefs.setBool('hasCompletedSetup', true);

      await AnalyticsService.signupCompleted('partner_b');
      await AnalyticsService.partnerJoined();
      await AnalyticsService.identify(response.user!.id);
      return pendingHouseholdId;
    }

    await AnalyticsService.signupCompleted('partner_a');
    await AnalyticsService.identify(response.user!.id);
    return newHouseholdId;
  }

  // Sign up Partner B — trigger joins existing household
  Future<void> signUpPartnerB({
    required String email,
    required String password,
    required String displayName,
    required String householdId,
    double? monthlyIncomeNetAud,
  }) async {
    // Verify household exists first
    final household = await _client
        .from('households')
        .select()
        .eq('id', householdId)
        .maybeSingle();

    if (household == null)
      throw Exception('Invalid invite code — household not found');

    final existing = await _client
        .from('partners')
        .select()
        .eq('household_id', householdId)
        .eq('role', 'partner_b')
        .maybeSingle();

    if (existing != null)
      throw Exception('This household already has two partners');

    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'display_name': displayName,
        'household_id': householdId,
      },
    );

    if (response.user == null) throw Exception('Sign up failed');

    // Poll until the DB trigger has created the partner row.
    await _awaitHouseholdId(response.user!.id);

    // Update income if provided
    if (monthlyIncomeNetAud != null) {
      await _client
          .from('partners')
          .update({'monthly_income_net_aud': monthlyIncomeNetAud}).eq(
              'user_id', response.user!.id);
    }

    await AnalyticsService.signupCompleted('partner_b');
    await AnalyticsService.partnerJoined();
    await AnalyticsService.identify(response.user!.id);
  }

  Future<void> signIn({
  required String email,
  required String password,
}) async {
  final response = await _client.auth.signInWithPassword(
    email: email,
    password: password,
  );
  if (response.user != null) {
    await RevenueCatService.init(response.user!.id);
    await AnalyticsService.identify(response.user!.id);
  }
}

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  String generateInviteLink(String householdId) {
    return 'https://twowallet.app/join?code=$householdId';
  }

  // Google Sign In — OAuth redirect via Supabase (no SHA-1 / google-services.json required)
  Future<void> signInWithGoogle() async {
    await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'com.twowallet.twowallet://login-callback',
    );
  }

  // Called from main.dart after the OAuth deep-link callback resolves
  Future<void> handleOAuthCallback(Uri uri) async {
    await _client.auth.getSessionFromUrl(uri);

    final user = _client.auth.currentUser;
    if (user == null) return;

    final fullName = user.userMetadata?['full_name'] as String? ??
        user.userMetadata?['name'] as String?;

    // Fix display_name if it was saved as an email address
    if (fullName != null && fullName.isNotEmpty) {
      await _client
          .from('partners')
          .update({'display_name': fullName})
          .eq('user_id', user.id)
          .filter('display_name', 'like', '%@%');
    }

    await RevenueCatService.init(user.id);
    await AnalyticsService.identify(user.id);

    await _ensureHouseholdExists(
      userId: user.id,
      displayName: fullName ?? user.email?.split('@')[0] ?? 'Partner',
    );
  }

  // Apple Sign In — native iOS using sign_in_with_apple + nonce for Supabase
  Future<void> signInWithApple() async {
    final rawNonce = _client.auth.generateRawNonce();
    final hashedNonce = sha256.convert(utf8.encode(rawNonce)).toString();

    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
      nonce: hashedNonce,
    );

    final idToken = credential.identityToken;
    if (idToken == null) {
      throw Exception('Apple Sign In failed — no ID token');
    }

    final response = await _client.auth.signInWithIdToken(
      provider: OAuthProvider.apple,
      idToken: idToken,
      nonce: rawNonce,
    );

    if (response.user == null) throw Exception('Supabase sign in failed');

    final fullName = [
      credential.givenName,
      credential.familyName,
    ].where((e) => e != null && e.isNotEmpty).join(' ');

    await RevenueCatService.init(response.user!.id);
    await AnalyticsService.identify(response.user!.id);

    await _ensureHouseholdExists(
      userId: response.user!.id,
      displayName: fullName.isNotEmpty
          ? fullName
          : response.user!.email?.split('@')[0] ?? 'Partner',
    );
  }

  // Create household if user doesn't have one yet
  Future<void> _ensureHouseholdExists({
    required String userId,
    required String displayName,
  }) async {
    // Prefer metadata name over a raw email address
    final user = _client.auth.currentUser;
    String name = displayName;

    if (name.isEmpty || name.contains('@')) {
      name = user?.userMetadata?['full_name'] as String? ??
          user?.userMetadata?['name'] as String? ??
          user?.userMetadata?['given_name'] as String? ??
          user?.email?.split('@')[0] ??
          'Partner';
    }

    final existing = await _client
        .from('partners')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existing != null) return;

    final household = await _client
        .from('households')
        .insert({
          'name': "$name's household",
          'split_ratio_a': 0.5,
          'split_method': 'fifty_fifty',
          'private_pocket_a_aud': 200,
          'private_pocket_b_aud': 200,
          'subscription_tier': 'together',
        })
        .select()
        .single();

    await _client.from('partners').insert({
      'household_id': household['id'],
      'user_id': userId,
      'display_name': name,
      'role': 'partner_a',
    });
  }

}
