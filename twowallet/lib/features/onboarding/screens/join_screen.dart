import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../onboarding_controller.dart';

class JoinScreen extends ConsumerStatefulWidget {
  final String? householdId;
  const JoinScreen({super.key, this.householdId});

  @override
  ConsumerState<JoinScreen> createState() => _JoinScreenState();
}

class _JoinScreenState extends ConsumerState<JoinScreen> {
  bool _loading = false;

  Future<void> _joinHousehold() async {
    if (widget.householdId == null) return;
    setState(() => _loading = true);

    try {
      final client = Supabase.instance.client;
      final userId = client.auth.currentUser?.id;

      if (userId == null) {
        // Not logged in — save household ID and redirect to signup
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('pending_household_id', widget.householdId!);
        if (mounted) context.push('/onboarding/signup');
        return;
      }

      // Check if already in a household
      final existing = await client
          .from('partners')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

      if (existing != null) {
        if (mounted) context.go('/home');
        return;
      }

      // Verify household exists
      await client
          .from('households')
          .select('id')
          .eq('id', widget.householdId!)
          .single();

      // Derive display name from auth metadata
      final user = client.auth.currentUser!;
      final displayName =
          user.userMetadata?['full_name'] as String? ??
          user.userMetadata?['display_name'] as String? ??
          user.email?.split('@')[0] ??
          'Partner';

      // Join as partner_b
      await client.from('partners').insert({
        'household_id': widget.householdId,
        'user_id': userId,
        'display_name': displayName,
        'role': 'partner_b',
      });

      await OnboardingController.markOnboardingComplete();
      await OnboardingController.markSetupComplete();
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error joining household: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(flex: 2),
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: Color(0xFFE1F5EE),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.favorite,
                  size: 40,
                  color: Color(0xFF1D9E75),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'You\'ve been invited!',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Your partner is waiting for you on TwoWallet. Join their household to start managing money together.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: Colors.grey.shade500,
                  height: 1.5,
                ),
              ),
              const Spacer(flex: 3),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: _loading ? null : _joinHousehold,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1D9E75),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Join household',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/onboarding'),
                child: Text(
                  'Create my own account instead',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: Colors.grey.shade500,
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
