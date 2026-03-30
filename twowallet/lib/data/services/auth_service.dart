import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import 'revenue_cat_service.dart';

class AuthService {
  final _client = SupabaseService.client;

  // Sign up Partner A — trigger auto-creates household + partner_a
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

    // Wait briefly for trigger to complete
    await Future.delayed(const Duration(milliseconds: 500));

    // Update income if provided
    if (monthlyIncomeNetAud != null) {
      await _client
          .from('partners')
          .update({'monthly_income_net_aud': monthlyIncomeNetAud}).eq(
              'user_id', response.user!.id);
    }

    // Fetch the household_id that was auto-created
    final partners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', response.user!.id)
        .limit(1);

    if (partners.isEmpty) throw Exception('Household creation failed');
    return partners.first['household_id'] as String;
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

    // Wait for trigger
    await Future.delayed(const Duration(milliseconds: 500));

    // Update income if provided
    if (monthlyIncomeNetAud != null) {
      await _client
          .from('partners')
          .update({'monthly_income_net_aud': monthlyIncomeNetAud}).eq(
              'user_id', response.user!.id);
    }
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
  }
}

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  String generateInviteLink(String householdId) {
    return 'twowallet://invite/$householdId';
  }
}
