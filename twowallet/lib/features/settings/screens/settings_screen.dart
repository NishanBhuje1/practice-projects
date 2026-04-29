import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/premium_gate.dart';
import '../../../data/services/revenue_cat_service.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/subscription_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          _SubscriptionTile(),
          _SectionHeader(title: 'Profile'),
          Container(
            color: Colors.white,
            child: ListTile(
              leading: const Icon(Icons.person_outline),
              title:
                  Text('Display name', style: GoogleFonts.inter(fontSize: 14)),
              subtitle: Text('How your partner sees you',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey.shade500)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _showDisplayNameEditor(context, ref),
            ),
          ),
          _SectionHeader(title: 'Privacy'),
          Container(
            color: Colors.white,
            child: ListTile(
              leading: const Icon(Icons.lock_outline),
              title: Text('Private pocket allowance',
                  style: GoogleFonts.inter(fontSize: 14)),
              subtitle: Text('Your monthly no-questions-asked budget',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey.shade500)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                final allowed = await requirePremium(
                  context,
                  ref,
                  featureName: 'Private Pocket',
                );
                if (allowed && context.mounted) {
                  _showPocketEditor(context, ref);
                }
              },
            ),
          ),
          _SectionHeader(title: 'Schedule'),
          Container(
            color: Colors.white,
            child: ListTile(
              leading: const Icon(Icons.calendar_today_outlined),
              title: Text('Money Date schedule',
                  style: GoogleFonts.inter(fontSize: 14)),
              subtitle: Text('Set your weekly check-in time',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey.shade500)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/notification-settings'),
            ),
          ),
          _SectionHeader(title: 'Relationship'),
          Container(
            color: Colors.white,
            child: ListTile(
              leading: const Icon(Icons.pause_circle_outline),
              title: Text('Relationship status',
                  style: GoogleFonts.inter(fontSize: 14)),
              subtitle: Text('Pause or resume your household',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey.shade500)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/relationship-status'),
            ),
          ),
          _SectionHeader(title: 'Account'),
          Container(
            color: Colors.white,
            child: Column(
              children: [
                ListTile(
                  leading:
                      const Icon(Icons.file_download_outlined),
                  title: Text('Export data',
                      style: GoogleFonts.inter(fontSize: 14)),
                  subtitle: Text('Download your transactions as CSV',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: Colors.grey.shade500)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    final allowed = await requirePremium(
                      context,
                      ref,
                      featureName: 'Export Data',
                    );
                    if (allowed && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Export coming soon')),
                      );
                    }
                  },
                ),
                Divider(
                    height: 1, indent: 56, color: Colors.grey.shade100),
                ListTile(
                  leading: const Icon(Icons.restore),
                  title: Text('Restore purchases',
                      style: GoogleFonts.inter(fontSize: 14)),
                  subtitle: Text(
                      'Reconnect an existing subscription',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: Colors.grey.shade500)),
                  onTap: () => _restorePurchases(context, ref),
                ),
                _ManageSubscriptionTile(),
                Divider(
                    height: 1, indent: 56, color: Colors.grey.shade100),
                ListTile(
                  leading:
                      const Icon(Icons.delete_outline, color: Colors.red),
                  title: Text('Delete account',
                      style:
                          GoogleFonts.inter(fontSize: 14, color: Colors.red)),
                  subtitle: Text(
                      'Permanently delete your account and all data',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: Colors.grey.shade500)),
                  onTap: () => launchUrl(
                    Uri.parse('https://twowallet.app/delete-account'),
                    mode: LaunchMode.externalApplication,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _restorePurchases(
      BuildContext context, WidgetRef ref) async {
    final scaffold = ScaffoldMessenger.of(context);
    try {
      final restored = await RevenueCatService.restorePurchases();
      if (restored) {
        ref.invalidate(subscriptionStatusProvider);
        scaffold.showSnackBar(
          const SnackBar(
            content: Text('Subscription restored!'),
            backgroundColor: Color(0xFF1D9E75),
          ),
        );
      } else {
        scaffold.showSnackBar(
          const SnackBar(
              content: Text('No active subscription found to restore.')),
        );
      }
    } catch (_) {
      scaffold
          .showSnackBar(const SnackBar(content: Text('Restore failed.')));
    }
  }

  Future<void> _showDisplayNameEditor(
      BuildContext context, WidgetRef ref) async {
    final partners = await ref.read(partnersProvider.future);
    final userId = ref.read(authUserProvider).value?.id;
    final me = partners.where((p) => p.userId == userId).firstOrNull;
    if (me == null || !context.mounted) return;

    final controller = TextEditingController(text: me.displayName);

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetCtx) {
        bool loading = false;
        return StatefulBuilder(
          builder: (innerCtx, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                24,
                24,
                24,
                MediaQuery.of(innerCtx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Display name',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'This is how your partner sees you in the app',
                    style: GoogleFonts.inter(
                        fontSize: 13, color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: controller,
                    autofocus: true,
                    textCapitalization: TextCapitalization.words,
                    decoration: InputDecoration(
                      labelText: 'Your name',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide:
                            BorderSide(color: Colors.grey.shade200),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                            color: Color(0xFF1D9E75), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: loading
                          ? null
                          : () async {
                              final name = controller.text.trim();
                              if (name.isEmpty) return;
                              setSheetState(() => loading = true);
                              try {
                                await ref
                                    .read(householdRepoProvider)
                                    .updateDisplayName(me.id, name);
                                ref.invalidate(partnersProvider);
                                ref.invalidate(myPartnerProvider);
                                if (innerCtx.mounted) {
                                  Navigator.pop(innerCtx);
                                }
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: const Text('Name updated'),
                                      backgroundColor: AppColors.ours,
                                    ),
                                  );
                                }
                              } catch (_) {
                                setSheetState(() => loading = false);
                              }
                            },
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.ours,
                        padding:
                            const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'Save',
                              style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _showPocketEditor(
      BuildContext context, WidgetRef ref) async {
    final household =
        await ref.read(householdRepoProvider).fetchMyHousehold();
    if (household == null || !context.mounted) return;

    final partners = await ref.read(partnersProvider.future);
    final userId = ref.read(authUserProvider).value?.id;
    final me = partners.where((p) => p.userId == userId).firstOrNull;
    if (me == null || !context.mounted) return;

    final isPartnerA = me.role == 'partner_a';
    final currentAmount =
        isPartnerA ? household.privatePocketAAud : household.privatePocketBAud;

    final controller =
        TextEditingController(text: currentAmount.toStringAsFixed(0));

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetCtx) {
        bool loading = false;
        return StatefulBuilder(
          builder: (innerCtx, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                24,
                24,
                24,
                MediaQuery.of(innerCtx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Private pocket allowance',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Set your monthly no-questions-asked budget',
                    style: GoogleFonts.inter(
                        fontSize: 13, color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: controller,
                    autofocus: true,
                    keyboardType: const TextInputType.numberWithOptions(
                        decimal: true),
                    decoration: InputDecoration(
                      labelText: 'Monthly allowance',
                      prefixText: '\$ ',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide:
                            BorderSide(color: Colors.grey.shade200),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                            color: Color(0xFF1D9E75), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: loading
                          ? null
                          : () async {
                              final amount =
                                  double.tryParse(controller.text);
                              if (amount == null || amount < 0) return;
                              setSheetState(() => loading = true);
                              try {
                                await ref
                                    .read(householdRepoProvider)
                                    .updatePrivatePockets(
                                      pocketA: isPartnerA
                                          ? amount
                                          : household.privatePocketAAud,
                                      pocketB: isPartnerA
                                          ? household.privatePocketBAud
                                          : amount,
                                    );
                                ref.invalidate(householdProvider);
                                if (innerCtx.mounted) {
                                  Navigator.pop(innerCtx);
                                }
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content:
                                          const Text('Allowance updated'),
                                      backgroundColor: AppColors.ours,
                                    ),
                                  );
                                }
                              } catch (_) {
                                setSheetState(() => loading = false);
                              }
                            },
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.ours,
                        padding:
                            const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'Save',
                              style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// ── Subscription tile (top of settings list) ─────────────────────────────────

class _SubscriptionTile extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(subscriptionStatusProvider).when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (sub) {
        if (sub.isGrandfathered) return const SizedBox.shrink();

        if (sub.status == 'active') {
          return _PremiumStatusTile(sub: sub);
        }

        return _UpgradePromptTile(sub: sub);
      },
    );
  }
}

class _UpgradePromptTile extends StatelessWidget {
  final SubscriptionStatus sub;
  const _UpgradePromptTile({required this.sub});

  @override
  Widget build(BuildContext context) {
    final label = sub.status == 'trial'
        ? '${sub.daysRemaining} ${sub.daysRemaining == 1 ? "day" : "days"} left in trial'
        : 'Trial ended — Subscribe';

    return GestureDetector(
      onTap: () => context.push('/paywall'),
      child: Container(
        margin: const EdgeInsets.fromLTRB(0, 12, 0, 4),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1D9E75), Color(0xFF158A65)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: ListTile(
          leading: const Icon(Icons.star_outline_rounded,
              color: Colors.white),
          title: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          subtitle: Text(
            sub.status == 'trial'
                ? 'Subscribe to keep all premium features'
                : 'Unlock Money Date, Goals, Analytics and more',
            style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
          ),
          trailing:
              const Icon(Icons.chevron_right, color: Colors.white),
        ),
      ),
    );
  }
}

class _PremiumStatusTile extends StatelessWidget {
  final SubscriptionStatus sub;
  const _PremiumStatusTile({required this.sub});

  @override
  Widget build(BuildContext context) {
    final manageUrl = Platform.isIOS
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

    return Container(
      margin: const EdgeInsets.fromLTRB(0, 12, 0, 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1D9E75).withOpacity(0.3)),
      ),
      child: ListTile(
        leading: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFF1D9E75).withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.star_rounded,
              color: Color(0xFF1D9E75), size: 20),
        ),
        title: Text(
          'TwoWallet Premium',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1D9E75),
          ),
        ),
        subtitle: Text(
          'Active',
          style: GoogleFonts.inter(
              fontSize: 12, color: Colors.grey.shade500),
        ),
        trailing: TextButton(
          onPressed: () => launchUrl(
            Uri.parse(manageUrl),
            mode: LaunchMode.externalApplication,
          ),
          child: Text(
            'Manage',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(0xFF1D9E75),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Manage subscription tile (account section, active subs only) ──────────────

class _ManageSubscriptionTile extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(subscriptionStatusProvider).when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (sub) {
        if (sub.status != 'active') return const SizedBox.shrink();

        final manageUrl = Platform.isIOS
            ? 'https://apps.apple.com/account/subscriptions'
            : 'https://play.google.com/store/account/subscriptions';

        return Column(
          children: [
            Divider(height: 1, indent: 56, color: Colors.grey.shade100),
            ListTile(
              leading: const Icon(Icons.manage_accounts_outlined),
              title: Text('Manage subscription',
                  style: GoogleFonts.inter(fontSize: 14)),
              subtitle: Text('View, change, or cancel your plan',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey.shade500)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => launchUrl(
                Uri.parse(manageUrl),
                mode: LaunchMode.externalApplication,
              ),
            ),
          ],
        );
      },
    );
  }
}

// ── Section header ────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: Colors.grey.shade500,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
