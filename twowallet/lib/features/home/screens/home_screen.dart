import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../../../data/models/transaction.dart';
import '../../../data/models/partner.dart';
import '../providers/home_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';
import '../../../data/services/seed_data_service.dart';
import '../../spending/screens/transaction_detail_sheet.dart';

// ════════════════════════════════════════════════════════════════════════════
// HomeScreen
// Purpose: Bucket overview — the central financial dashboard for the couple.
// ════════════════════════════════════════════════════════════════════════════

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.ours,
        onRefresh: () async {
          ref.invalidate(bucketTotalsProvider);
          ref.invalidate(recentTransactionsProvider);
          ref.invalidate(fairSplitResultProvider);
          ref.invalidate(householdProvider);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          slivers: [
            // ── Greeting header ────────────────────────────────────────────
            _GreetingHeader(),

            // ── Content ────────────────────────────────────────────────────
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _PausedBanner(),
                  _BucketCards(),
                  const SizedBox(height: 24),
                  _QuickActionsRow(),
                  const SizedBox(height: 20),
                  _UpgradeBanner(),
                  _FairSplitBanner(),
                  const SizedBox(height: 24),
                  _RecentTransactions(),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Greeting header ──────────────────────────────────────────────────────────

class _GreetingHeader extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnersAsync = ref.watch(partnersProvider);
    final txAsync = ref.watch(recentTransactionsProvider);

    return SliverToBoxAdapter(
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 16, 20),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: partnersAsync.when(
                  loading: () => _buildGreetingText('', '', txAsync, ref),
                  error: (_, __) => _buildGreetingText('', '', txAsync, ref),
                  data: (partners) {
                    final userId = ref.watch(authUserProvider).value?.id;
                    final me = partners.where((p) => p.userId == userId).firstOrNull;
                    final other = partners.where((p) => p.userId != userId).firstOrNull;
                    return _buildGreetingText(
                      me?.displayName ?? '',
                      other?.displayName ?? '',
                      txAsync,
                      ref,
                    );
                  },
                ),
              ),
              // Profile menu
              PopupMenuButton<String>(
                offset: const Offset(0, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                icon: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.mineLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, size: 18, color: AppColors.mine),
                ),
                itemBuilder: (_) => [
                  const PopupMenuItem<String>(
                    value: 'upgrade',
                    child: Row(children: [
                      Icon(Icons.star_outline, size: 18),
                      SizedBox(width: 10),
                      Text('Upgrade to Together'),
                    ]),
                  ),
                  const PopupMenuDivider(),
                  const PopupMenuItem<String>(
                    value: 'settings',
                    child: Row(children: [
                      Icon(Icons.settings_outlined, size: 18),
                      SizedBox(width: 10),
                      Text('Settings'),
                    ]),
                  ),
                  const PopupMenuItem<String>(
                    value: 'notifications',
                    child: Row(children: [
                      Icon(Icons.notifications_outlined, size: 18),
                      SizedBox(width: 10),
                      Text('Notification schedule'),
                    ]),
                  ),
                  const PopupMenuItem<String>(
                    value: 'relationship',
                    child: Row(children: [
                      Icon(Icons.pause_circle_outline, size: 18),
                      SizedBox(width: 10),
                      Text('Relationship status'),
                    ]),
                  ),
                  const PopupMenuDivider(),
                  const PopupMenuItem<String>(
                    value: 'signout',
                    child: Row(children: [
                      Icon(Icons.logout, size: 18, color: AppColors.destructive),
                      SizedBox(width: 10),
                      Text('Sign out', style: TextStyle(color: AppColors.destructive)),
                    ]),
                  ),
                ],
                onSelected: (value) async {
                  if (value == 'upgrade') context.push('/paywall');
                  else if (value == 'settings') context.push('/settings');
                  else if (value == 'notifications') context.push('/notification-settings');
                  else if (value == 'relationship') context.push('/relationship-status');
                  else if (value == 'signout') {
                    await ref.read(authServiceProvider).signOut();
                    if (context.mounted) context.go('/welcome');
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGreetingText(
    String name,
    String partnerName,
    AsyncValue<List<Transaction>> txAsync,
    WidgetRef ref,
  ) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    final displayName = name.isNotEmpty ? name : '';

    // Find the most recent transaction by partner
    String partnerStatus = '';
    if (txAsync.value != null && partnerName.isNotEmpty) {
      final userId = ref.watch(authUserProvider).value?.id;
      final partners = ref.watch(partnersProvider).value ?? [];
      final me = partners.where((p) => p.userId == userId).firstOrNull;
      final partnerTx = txAsync.value!
          .where((t) => t.partnerId != me?.id && !t.isPrivate)
          .firstOrNull;
      if (partnerTx != null) {
        final amount = partnerTx.amountAud.abs().toAUD();
        partnerStatus = '$partnerName last added $amount';
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          displayName.isNotEmpty ? '$greeting, $displayName' : 'TwoWallet',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            height: 1.1,
          ),
        ),
        if (partnerStatus.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            partnerStatus,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ],
    );
  }
}

// ── Paused banner ─────────────────────────────────────────────────────────────

class _PausedBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(householdProvider).when(
      loading: () => const SizedBox.shrink(),
      error:   (_, __) => const SizedBox.shrink(),
      data: (household) {
        if (household == null || !household.isPaused) return const SizedBox.shrink();
        return GestureDetector(
          onTap: () => context.push('/relationship-status'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.pause_circle_outline, color: AppColors.warning, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Household paused — tap to resume',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.warning,
                    ),
                  ),
                ),
                Icon(Icons.chevron_right, color: AppColors.warning, size: 18),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Stacked bucket cards ──────────────────────────────────────────────────────

class _BucketCards extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalsAsync = ref.watch(bucketTotalsProvider);
    final partnersAsync = ref.watch(partnersProvider);
    final txAsync = ref.watch(recentTransactionsProvider);

    return totalsAsync.when(
      loading: () => const _BucketCardsShimmer(),
      error:   (_, __) => const SizedBox.shrink(),
      data: (totals) {
        final partners = partnersAsync.value ?? [];
        final userId = ref.watch(authUserProvider).value?.id;
        final me    = partners.where((p) => p.userId == userId).firstOrNull;
        final other = partners.where((p) => p.userId != userId).firstOrNull;
        final transactions = txAsync.value ?? [];

        final myLastTx = transactions
            .where((t) => t.bucket == 'mine' && t.partnerId == me?.id)
            .firstOrNull;
        final ourLastTx = transactions
            .where((t) => t.bucket == 'ours')
            .firstOrNull;
        final theirLastTx = transactions
            .where((t) => t.bucket == 'theirs')
            .firstOrNull;

        return Column(
          children: [
            _AnimatedBucketCard(
              bucket: 'mine',
              label: me?.displayName ?? 'Mine',
              amount: totals.mine,
              lastTx: myLastTx,
              onAdd: () => context.push('/add-transaction'),
            ),
            const SizedBox(height: 12),
            _AnimatedBucketCard(
              bucket: 'ours',
              label: 'Ours',
              amount: totals.ours,
              lastTx: ourLastTx,
              partners: partners,
              myPartnerId: me?.id,
              onAdd: () => context.push('/add-transaction'),
            ),
            const SizedBox(height: 12),
            _AnimatedBucketCard(
              bucket: 'theirs',
              label: other?.displayName ?? 'Theirs',
              amount: totals.theirs,
              lastTx: theirLastTx,
              isViewOnly: true,
            ),
          ],
        );
      },
    );
  }
}

// ── Individual animated bucket card ──────────────────────────────────────────

class _AnimatedBucketCard extends StatefulWidget {
  final String bucket;
  final String label;
  final double amount;
  final Transaction? lastTx;
  final List<Partner> partners;
  final String? myPartnerId;
  final bool isViewOnly;
  final VoidCallback? onAdd;

  const _AnimatedBucketCard({
    required this.bucket,
    required this.label,
    required this.amount,
    this.lastTx,
    this.partners = const [],
    this.myPartnerId,
    this.isViewOnly = false,
    this.onAdd,
  });

  @override
  State<_AnimatedBucketCard> createState() => _AnimatedBucketCardState();
}

class _AnimatedBucketCardState extends State<_AnimatedBucketCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final color     = AppColors.forBucket(widget.bucket);
    final lightColor = AppColors.lightForBucket(widget.bucket);

    return GestureDetector(
      onTapDown: (_) {
        HapticFeedback.lightImpact();
        setState(() => _pressed = true);
      },
      onTapUp: (_) {
        setState(() => _pressed = false);
        // Navigate to bucket detail / spending filtered
        context.push('/spending');
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: _pressed ? 0.04 : 0.08),
                blurRadius: _pressed ? 4 : 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Card header: label + action ──────────────────────────
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    widget.label,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  if (!widget.isViewOnly && widget.onAdd != null)
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        widget.onAdd!();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: lightColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, size: 13, color: color),
                            const SizedBox(width: 4),
                            Text(
                              'Add',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: color,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: lightColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.visibility_outlined, size: 13, color: color),
                          const SizedBox(width: 4),
                          Text(
                            'View',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: color,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 16),

              // ── Animated balance ──────────────────────────────────────
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: widget.amount),
                duration: const Duration(milliseconds: 700),
                curve: Curves.easeOut,
                builder: (context, value, _) => Text(
                  value.toAUD(),
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              Text(
                'spent this month',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),

              // ── Ours: contribution bar ────────────────────────────────
              if (widget.bucket == 'ours' && widget.partners.length >= 2) ...[
                const SizedBox(height: 14),
                _OursContributionBar(
                  partners: widget.partners,
                  myPartnerId: widget.myPartnerId,
                ),
              ]

              // ── Mine / Theirs: last transaction preview ───────────────
              else if (widget.lastTx != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        '${widget.lastTx!.merchantName}  ·  ${widget.lastTx!.amountAud.abs().toAUD()}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Ours contribution bar ─────────────────────────────────────────────────────

class _OursContributionBar extends ConsumerWidget {
  final List<Partner> partners;
  final String? myPartnerId;

  const _OursContributionBar({required this.partners, this.myPartnerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txAsync = ref.watch(allTransactionsThisMonthProvider);
    return txAsync.when(
      loading: () => const SizedBox(height: 4),
      error:   (_, __) => const SizedBox.shrink(),
      data: (transactions) {
        final oursTx = transactions.where((t) => t.bucket == 'ours' && !t.isIncome);

        double myTotal = 0;
        double theirTotal = 0;
        for (final t in oursTx) {
          if (t.partnerId == myPartnerId) {
            myTotal += t.amountAud.abs();
          } else {
            theirTotal += t.amountAud.abs();
          }
        }

        final total = myTotal + theirTotal;
        final myFraction = total > 0 ? myTotal / total : 0.5;

        final me    = partners.where((p) => p.id == myPartnerId).firstOrNull;
        final other = partners.where((p) => p.id != myPartnerId).firstOrNull;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  me?.displayName ?? 'You',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
                ),
                Text(
                  other?.displayName ?? 'Partner',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 5),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: SizedBox(
                height: 5,
                child: LayoutBuilder(builder: (context, constraints) {
                  return Row(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeOut,
                        width: constraints.maxWidth * myFraction,
                        height: 5,
                        color: AppColors.ours,
                      ),
                      Expanded(
                        child: Container(
                          height: 5,
                          color: AppColors.theirsLight,
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),
            const SizedBox(height: 5),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${(myFraction * 100).round()}%',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ours,
                  ),
                ),
                Text(
                  '${((1 - myFraction) * 100).round()}%',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.theirs,
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

// ── Quick actions row ─────────────────────────────────────────────────────────

class _QuickActionsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick actions',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _QuickAction(
                icon: Icons.add_circle_outline_rounded,
                label: 'Add expense',
                color: AppColors.ours,
                onTap: () => context.push('/add-transaction'),
              ),
              const SizedBox(width: 10),
              _QuickAction(
                icon: Icons.favorite_outline_rounded,
                label: 'Money Date',
                color: AppColors.mine,
                onTap: () => context.push('/money-date'),
              ),
              const SizedBox(width: 10),
              _QuickAction(
                icon: Icons.balance_outlined,
                label: 'Fair Split',
                color: AppColors.theirs,
                onTap: () => context.go('/fair-split'),
              ),
              const SizedBox(width: 10),
              _QuickAction(
                icon: Icons.flag_outlined,
                label: 'Goals',
                color: AppColors.ours,
                onTap: () => context.go('/goals'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _QuickAction extends StatefulWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  State<_QuickAction> createState() => _QuickActionState();
}

class _QuickActionState extends State<_QuickAction> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        HapticFeedback.lightImpact();
        setState(() => _pressed = true);
      },
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.94 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: widget.color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(widget.icon, size: 16, color: widget.color),
              ),
              const SizedBox(width: 8),
              Text(
                widget.label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Upgrade banner ────────────────────────────────────────────────────────────

class _UpgradeBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(householdProvider).when(
      loading: () => const SizedBox.shrink(),
      error:   (_, __) => const SizedBox.shrink(),
      data: (household) {
        if (household == null || household.subscriptionTier != 'free') {
          return const SizedBox.shrink();
        }
        return GestureDetector(
          onTap: () => context.push('/paywall'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.mine, AppColors.ours],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(Icons.star_outline_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Try Together free for 30 days',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.white, size: 18),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Fair split banner ─────────────────────────────────────────────────────────

class _FairSplitBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultAsync   = ref.watch(fairSplitResultProvider);
    final partnersAsync = ref.watch(partnersProvider);

    return resultAsync.when(
      loading: () => const SizedBox.shrink(),
      error:   (_, __) => const SizedBox.shrink(),
      data: (result) {
        if (result == null) return const SizedBox.shrink();
        final partners = partnersAsync.value ?? [];
        if (partners.length < 2) return const SizedBox.shrink();

        final partnerA = partners.firstWhere((p) => p.role == 'partner_a');
        final partnerB = partners.firstWhere((p) => p.role == 'partner_b');
        final fromPartner = result.fromPartnerId == partnerA.id ? partnerA : partnerB;
        final toPartner   = result.fromPartnerId == partnerA.id ? partnerB : partnerA;

        return GestureDetector(
          onTap: () => context.go('/fair-split'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.isEven
                            ? "You're square this month"
                            : '${fromPartner.displayName} owes ${toPartner.displayName}',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        result.isEven
                            ? 'No settlement needed'
                            : result.settlementAmount.toAUD(),
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: result.isEven ? 17 : 26,
                          fontWeight: FontWeight.w700,
                          color: result.isEven ? AppColors.success : AppColors.mine,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: result.isEven ? AppColors.oursLight : AppColors.mineLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    Icons.chevron_right,
                    color: result.isEven ? AppColors.ours : AppColors.mine,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Recent transactions ───────────────────────────────────────────────────────

class _RecentTransactions extends ConsumerStatefulWidget {
  @override
  ConsumerState<_RecentTransactions> createState() => _RecentTransactionsState();
}

class _RecentTransactionsState extends ConsumerState<_RecentTransactions> {
  List<Transaction> _cache = [];
  List<Partner>     _partnerCache = [];
  bool _seeding = false;

  Future<void> _loadSampleData() async {
    setState(() => _seeding = true);
    try {
      await SeedDataService.seed();
      ref.invalidate(recentTransactionsProvider);
      ref.invalidate(allTransactionsThisMonthProvider);
      ref.invalidate(bucketTotalsProvider);
      ref.invalidate(fairSplitResultProvider);
    } finally {
      if (mounted) setState(() => _seeding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final txAsync       = ref.watch(recentTransactionsProvider);
    final partnersAsync = ref.watch(partnersProvider);

    if (txAsync.value      != null) _cache        = txAsync.value!;
    if (partnersAsync.value != null) _partnerCache = partnersAsync.value!;

    final transactions = txAsync.value ?? _cache;
    final partners     = partnersAsync.value ?? _partnerCache;
    final isFirstLoad  = _cache.isEmpty && txAsync.isLoading;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            GestureDetector(
              onTap: () => context.go('/spending'),
              child: Text(
                'See all',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.ours,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        if (isFirstLoad)
          const _RecentShimmer()
        else if (transactions.isEmpty)
          _EmptyTransactions(seeding: _seeding, onSeed: _loadSampleData)
        else
          _GroupedTransactions(transactions: transactions, partners: partners),
      ],
    );
  }
}

class _EmptyTransactions extends StatelessWidget {
  final bool seeding;
  final VoidCallback onSeed;

  const _EmptyTransactions({required this.seeding, required this.onSeed});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.oursLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.receipt_long_outlined, size: 28, color: AppColors.ours),
          ),
          const SizedBox(height: 16),
          Text(
            'No transactions yet',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Transactions you add will appear here',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          if (seeding)
            const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.ours),
            )
          else
            TextButton(
              onPressed: onSeed,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.ours,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              child: Text(
                'Load sample data',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _GroupedTransactions extends StatelessWidget {
  final List<Transaction> transactions;
  final List<Partner>     partners;

  const _GroupedTransactions({required this.transactions, required this.partners});

  @override
  Widget build(BuildContext context) {
    final Map<String, List<Transaction>> grouped = {};
    for (final tx in transactions) {
      grouped.putIfAbsent(tx.date, () => []).add(tx);
    }
    final dates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: dates.asMap().entries.map((dateEntry) {
        final date    = dateEntry.value;
        final dayTxs  = grouped[date]!;
        final label   = _formatDate(DateTime.parse(date));
        final isLast  = dateEntry.key == dates.length - 1;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 6, top: 2),
              child: Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: dayTxs.asMap().entries.map((entry) {
                  final tx     = entry.value;
                  final isRowLast = entry.key == dayTxs.length - 1;
                  return _TransactionRow(
                    tx: tx,
                    partners: partners,
                    isLast: isRowLast,
                  );
                }).toList(),
              ),
            ),
            if (!isLast) const SizedBox(height: 10),
          ],
        );
      }).toList(),
    );
  }

  String _formatDate(DateTime d) {
    final now       = DateTime.now();
    final today     = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final date      = DateTime(d.year, d.month, d.day);

    if (date == today)     return 'Today';
    if (date == yesterday) return 'Yesterday';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${d.day} ${months[d.month - 1]}';
  }
}

// ── Transaction row ────────────────────────────────────────────────────────────

class _TransactionRow extends StatefulWidget {
  final Transaction  tx;
  final List<Partner> partners;
  final bool isLast;

  const _TransactionRow({
    required this.tx,
    required this.partners,
    required this.isLast,
  });

  @override
  State<_TransactionRow> createState() => _TransactionRowState();
}

class _TransactionRowState extends State<_TransactionRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final bucketColor = AppColors.forBucket(widget.tx.bucket);

    return Column(
      children: [
        GestureDetector(
          onTapDown: (_) {
            HapticFeedback.selectionClick();
            setState(() => _pressed = true);
          },
          onTapUp: (_) {
            setState(() => _pressed = false);
            showTransactionDetail(context, widget.tx);
          },
          onTapCancel: () => setState(() => _pressed = false),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            color: _pressed ? AppColors.background : Colors.transparent,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Category icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: bucketColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Icon(
                      _categoryIcon(widget.tx.category),
                      size: 18,
                      color: bucketColor,
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Merchant + category
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.tx.merchantName,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: bucketColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            widget.tx.category ?? widget.tx.bucket,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Amount
                Text(
                  widget.tx.isIncome
                      ? '+${widget.tx.amountAud.toAUD()}'
                      : '-${widget.tx.amountAud.abs().toAUD()}',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: widget.tx.isIncome ? AppColors.success : AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (!widget.isLast)
          Divider(
            height: 1,
            indent: 68,
            endIndent: 16,
            color: AppColors.separatorOpaque,
          ),
      ],
    );
  }

  IconData _categoryIcon(String? category) => switch (category) {
    'Groceries'     => Icons.shopping_basket_outlined,
    'Dining Out'    => Icons.restaurant_outlined,
    'Rent'          => Icons.home_outlined,
    'Utilities'     => Icons.bolt_outlined,
    'Transport'     => Icons.directions_car_outlined,
    'Clothing'      => Icons.checkroom_outlined,
    'Health'        => Icons.favorite_outline,
    'Entertainment' => Icons.movie_outlined,
    'Streaming'     => Icons.play_circle_outline,
    'Subscriptions' => Icons.subscriptions_outlined,
    'Income'        => Icons.account_balance_outlined,
    _               => Icons.receipt_outlined,
  };
}

// ── Loading shimmer ────────────────────────────────────────────────────────────

class _BucketCardsShimmer extends StatefulWidget {
  const _BucketCardsShimmer();

  @override
  State<_BucketCardsShimmer> createState() => _BucketCardsShimmerState();
}

class _BucketCardsShimmerState extends State<_BucketCardsShimmer>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        final shimmer = Color.lerp(
          const Color(0xFFEEEEEE),
          const Color(0xFFF8F8F8),
          _anim.value,
        )!;
        return Column(
          children: List.generate(3, (i) => Container(
            margin: EdgeInsets.only(bottom: i < 2 ? 12 : 0),
            height: 130,
            decoration: BoxDecoration(
              color: shimmer,
              borderRadius: BorderRadius.circular(20),
            ),
          )),
        );
      },
    );
  }
}

class _RecentShimmer extends StatefulWidget {
  const _RecentShimmer();

  @override
  State<_RecentShimmer> createState() => _RecentShimmerState();
}

class _RecentShimmerState extends State<_RecentShimmer>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        final shimmer = Color.lerp(
          const Color(0xFFEEEEEE),
          const Color(0xFFF8F8F8),
          _anim.value,
        )!;
        return Container(
          height: 180,
          decoration: BoxDecoration(
            color: shimmer,
            borderRadius: BorderRadius.circular(16),
          ),
        );
      },
    );
  }
}
