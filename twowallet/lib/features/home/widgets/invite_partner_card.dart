import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../shared/providers/auth_provider.dart';

class InvitePartnerCard extends ConsumerStatefulWidget {
  const InvitePartnerCard({super.key});

  @override
  ConsumerState<InvitePartnerCard> createState() => _InvitePartnerCardState();
}

class _InvitePartnerCardState extends ConsumerState<InvitePartnerCard> {
  final _emailController = TextEditingController();
  bool _showEmailInput = false;
  bool _sending = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendEmailInvite() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;
    if (!email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    setState(() => _sending = true);

    try {
      final client = Supabase.instance.client;
      final partners = ref.read(partnersProvider).value ?? [];
      final userId = client.auth.currentUser?.id;
      final me = partners.firstWhere((p) => p.userId == userId);
      final householdId = me.householdId;

      // 1. Create invite record
      final invite = await client.from('household_invites').insert({
        'household_id': householdId,
        'invited_by_partner_id': me.id,
        'invited_email': email,
      }).select().single();

      // 2. Call edge function to send email
      await client.functions.invoke('send-partner-invite', body: {
        'invite_id': invite['id'],
        'invited_email': email,
        'inviter_name': me.displayName,
        'household_id': householdId,
      });

      if (mounted) {
        setState(() {
          _showEmailInput = false;
          _emailController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Invite sent to $email ✉️'),
            backgroundColor: const Color(0xFF1D9E75),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send invite: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final partnersAsync = ref.watch(partnersProvider);

    return partnersAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (partners) {
        // Only show when partner hasn't joined yet
        if (partners.length >= 2) return const SizedBox.shrink();

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1D9E75).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person_add_outlined,
                      color: Color(0xFF1D9E75),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Invite your partner',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Send them an email invite to join your household',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (_showEmailInput) ...[
                const SizedBox(height: 16),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autofocus: true,
                  style: GoogleFonts.inter(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'partner@email.com',
                    hintStyle: GoogleFonts.inter(
                        fontSize: 14, color: Colors.grey.shade400),
                    prefixIcon: const Icon(Icons.email_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF1D9E75)),
                    ),
                  ),
                  onSubmitted: (_) => _sendEmailInvite(),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: _sending ? null : _sendEmailInvite,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF1D9E75),
                          minimumSize: const Size(double.infinity, 44),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _sending
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2),
                              )
                            : Text(
                                'Send invite',
                                style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white),
                              ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => setState(() {
                        _showEmailInput = false;
                        _emailController.clear();
                      }),
                      child: Text(
                        'Cancel',
                        style: GoogleFonts.inter(
                            fontSize: 14, color: Colors.grey.shade500),
                      ),
                    ),
                  ],
                ),
              ] else ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => setState(() => _showEmailInput = true),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1D9E75),
                      minimumSize: const Size(double.infinity, 44),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'Invite by email',
                      style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
