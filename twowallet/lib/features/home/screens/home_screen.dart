import 'package:flutter/material.dart';
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

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnersAsync = ref.watch(partnersProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bucketTotalsProvider);
          ref.invalidate(recentTransactionsProvider);
          ref.invalidate(fairSplitResultProvider);
          ref.invalidate(householdProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 100,
              floating: true,
              snap: true,
              backgroundColor: const Color(0xFFF8F9FA),
              elevation: 0,
              scrolledUnderElevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
                title: partnersAsync.when(
                  loading: () => Text('TwoWallet',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: Colors.black87)),
                  error: (_, __) => Text('TwoWallet',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: Colors.black87)),
                  data: (partners) {
                    final userId = ref.watch(authUserProvider).value?.id;
                    final me =
                        partners.where((p) => p.userId == userId).firstOrNull;
                    return Text(
                      'Hey ${me?.displayName ?? ''} 👋',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Colors.black87,
                      ),
                    );
                  },
                ),
              ),
              actions: [
                IconButton(
                  icon:
                      const Icon(Icons.favorite_outline, color: Colors.black87),
                  onPressed: () => context.push('/money-date'),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.account_circle_outlined,
                      color: Colors.black87),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  itemBuilder: (_) => [
                    const PopupMenuItem<String>(
                      value: 'upgrade',
                      child: Row(children: [
                        Icon(Icons.star_outline, size: 18),
                        SizedBox(width: 8),
                        Text('Upgrade to Together'),
                      ]),
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem<String>(
                      value: 'settings',
                      child: Row(children: [
                        Icon(Icons.settings_outlined, size: 18),
                        SizedBox(width: 8),
                        Text('Settings'),
                      ]),
                    ),
                    const PopupMenuItem<String>(
                      value: 'notifications',
                      child: Row(children: [
                        Icon(Icons.notifications_outlined, size: 18),
                        SizedBox(width: 8),
                        Text('Money Date schedule'),
                      ]),
                    ),
                    const PopupMenuItem<String>(
                      value: 'relationship',
                      child: Row(children: [
                        Icon(Icons.pause_circle_outline, size: 18),
                        SizedBox(width: 8),
                        Text('Relationship status'),
                      ]),
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem<String>(
                      value: 'signout',
                      child: Row(children: [
                        Icon(Icons.logout, size: 18),
                        SizedBox(width: 8),
                        Text('Sign out'),
                      ]),
                    ),
                  ],
                  onSelected: (value) async {
                    if (value == 'upgrade') {
                      context.push('/paywall');
                    } else if (value == 'settings') {
                      context.push('/settings');
                    } else if (value == 'notifications') {
                      context.push('/notification-settings');
                    } else if (value == 'relationship') {
                      context.push('/relationship-status');
                    } else if (value == 'signout') {
                      await ref.read(authServiceProvider).signOut();
                      if (context.mounted) context.go('/welcome');
                    }
                  },
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _PausedBanner(),
                  _BucketSummary(),
                  const SizedBox(height: 12),
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

// ── Paused banner ─────────────────────────────────────────────────────────────

class _PausedBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final householdAsync = ref.watch(householdProvider);
    return householdAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (household) {
        if (household == null || !household.isPaused)
          return const SizedBox.shrink();
        return GestureDetector(
          onTap: () => context.push('/relationship-status'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.pause_circle_outline,
                    color: Colors.orange.shade700, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Household paused — tap to resume',
                    style: GoogleFonts.inter(
                        fontSize: 13,
                        color: Colors.orange.shade800,
                        fontWeight: FontWeight.w500),
                  ),
                ),
                Icon(Icons.chevron_right,
                    color: Colors.orange.shade700, size: 18),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Three bucket summary ──────────────────────────────────────────────────────

class _BucketSummary extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalsAsync = ref.watch(bucketTotalsProvider);
    final partnersAsync = ref.watch(partnersProvider);

    return totalsAsync.when(
      loading: () => const _BucketSummaryLoading(),
      error: (_, __) => const SizedBox.shrink(),
      data: (totals) {
        final partners = partnersAsync.value ?? [];
        final userId = ref.watch(authUserProvider).value?.id;
        final me = partners.where((p) => p.userId == userId).firstOrNull;
        final other = partners.where((p) => p.userId != userId).firstOrNull;

        return Row(
          children: [
            _BucketTile(
              label: me?.displayName ?? 'Mine',
              amount: totals.mine,
              color: AppColors.mine,
              lightColor: AppColors.mineLight,
              darkColor: AppColors.mineDark,
            ),
            const SizedBox(width: 10),
            _BucketTile(
              label: 'Ours',
              amount: totals.ours,
              color: AppColors.ours,
              lightColor: AppColors.oursLight,
              darkColor: AppColors.oursDark,
            ),
            const SizedBox(width: 10),
            _BucketTile(
              label: other?.displayName ?? 'Theirs',
              amount: totals.theirs,
              color: AppColors.theirs,
              lightColor: AppColors.theirsLight,
              darkColor: AppColors.theirsDark,
            ),
          ],
        );
      },
    );
  }
}

class _BucketTile extends StatelessWidget {
  final String label;
  final double amount;
  final Color color;
  final Color lightColor;
  final Color darkColor;

  const _BucketTile({
    required this.label,
    required this.amount,
    required this.color,
    required this.lightColor,
    required this.darkColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.12),
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
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    label,
                    style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade500),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              amount.toAUD(showCents: false),
              style: GoogleFonts.plusJakartaSans(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            Text(
              'this month',
              style: GoogleFonts.inter(fontSize: 10, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class _BucketSummaryLoading extends StatelessWidget {
  const _BucketSummaryLoading();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
          3,
          (i) => Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: i < 2 ? 10 : 0),
                  height: 88,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              )),
    );
  }
}

// ── Upgrade banner ────────────────────────────────────────────────────────────

class _UpgradeBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final householdAsync = ref.watch(householdProvider);
    return householdAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (household) {
        if (household == null) return const SizedBox.shrink();
        if (household.subscriptionTier != 'free')
          return const SizedBox.shrink();
        return GestureDetector(
          onTap: () => context.push('/paywall'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1D9E75), Color(0xFF378ADD)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.star_outline, color: Colors.white, size: 18),
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
    final resultAsync = ref.watch(fairSplitResultProvider);
    final partnersAsync = ref.watch(partnersProvider);

    return resultAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (result) {
        if (result == null) return const SizedBox.shrink();
        final partners = partnersAsync.value ?? [];
        if (partners.length < 2) return const SizedBox.shrink();

        final partnerA = partners.firstWhere((p) => p.role == 'partner_a');
        final partnerB = partners.firstWhere((p) => p.role == 'partner_b');
        final fromPartner =
            result.fromPartnerId == partnerA.id ? partnerA : partnerB;
        final toPartner =
            result.fromPartnerId == partnerA.id ? partnerB : partnerA;

        return GestureDetector(
          onTap: () => context.go('/fair-split'),
          child: Container(
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
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.isEven
                            ? 'You\'re square this month 🎉'
                            : '${fromPartner.displayName} owes ${toPartner.displayName}',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: Colors.grey.shade500,
                        ),
                      ),
                      if (!result.isEven) ...[
                        const SizedBox(height: 4),
                        Text(
                          result.settlementAmount.toAUD(),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppColors.mine,
                          ),
                        ),
                      ] else ...[
                        const SizedBox(height: 4),
                        Text(
                          'No settlement needed',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.ours,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: result.isEven
                        ? AppColors.oursLight
                        : AppColors.mineLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    Icons.chevron_right,
                    color: result.isEven ? AppColors.ours : AppColors.mine,
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
  ConsumerState<_RecentTransactions> createState() =>
      _RecentTransactionsState();
}

class _RecentTransactionsState extends ConsumerState<_RecentTransactions> {
  List<Transaction> _cache = [];
  List<Partner> _partnerCache = [];
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
    final txAsync = ref.watch(recentTransactionsProvider);
    final partnersAsync = ref.watch(partnersProvider);

    // Keep cache updated whenever fresh data arrives
    if (txAsync.value != null) _cache = txAsync.value!;
    if (partnersAsync.value != null) _partnerCache = partnersAsync.value!;

    final transactions = txAsync.value ?? _cache;
    final partners = partnersAsync.value ?? _partnerCache;
    final isFirstLoad = _cache.isEmpty && txAsync.isLoading;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
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
          const Center(child: CircularProgressIndicator())
        else if (transactions.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
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
              children: [
                Text(
                  'No transactions yet',
                  style: GoogleFonts.inter(color: Colors.grey.shade400),
                ),
                const SizedBox(height: 12),
                _seeding
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : TextButton(
                        onPressed: _loadSampleData,
                        child: Text(
                          'Load sample data',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.ours,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
              ],
            ),
          )
        else
          _buildGrouped(context, transactions, partners),
      ],
    );
  }

  Widget _buildGrouped(
    BuildContext context,
    List<Transaction> transactions,
    List<Partner> partners,
  ) {
    // Group by date
    final Map<String, List<Transaction>> grouped = {};
    for (final tx in transactions) {
      grouped.putIfAbsent(tx.date, () => []).add(tx);
    }
    final dates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: dates.asMap().entries.map((dateEntry) {
        final date = dateEntry.value;
        final dayTxs = grouped[date]!;
        final label = _formatDate(DateTime.parse(date));
        final isLastGroup = dateEntry.key == dates.length - 1;

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
                  color: Colors.grey.shade500,
                ),
              ),
            ),
            Container(
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
                children: dayTxs.asMap().entries.map((entry) {
                  final tx = entry.value;
                  final isLast = entry.key == dayTxs.length - 1;
                  return _TransactionRow(
                      tx: tx, partners: partners, isLast: isLast);
                }).toList(),
              ),
            ),
            if (!isLastGroup) const SizedBox(height: 10),
          ],
        );
      }).toList(),
    );
  }

  String _formatDate(DateTime d) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final date = DateTime(d.year, d.month, d.day);

    if (date == today) return 'Today';
    if (date == yesterday) return 'Yesterday';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${d.day} ${months[d.month - 1]}';
  }
}

class _TransactionRow extends StatelessWidget {
  final Transaction tx;
  final List<Partner> partners;
  final bool isLast;

  const _TransactionRow({
    required this.tx,
    required this.partners,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final bucketColor = AppColors.forBucket(tx.bucket);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: bucketColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Icon(
                    _categoryIcon(tx.category),
                    size: 18,
                    color: bucketColor,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tx.merchantName,
                      style: GoogleFonts.inter(
                          fontSize: 14, fontWeight: FontWeight.w500),
                    ),
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
                          tx.category ?? tx.bucket,
                          style: GoogleFonts.inter(
                              fontSize: 12, color: Colors.grey.shade400),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Text(
                tx.isIncome
                    ? '+${tx.amountAud.toAUD()}'
                    : '-${tx.amountAud.abs().toAUD()}',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: tx.isIncome ? AppColors.ours : Colors.black87,
                ),
              ),
            ],
          ),
        ),
        if (!isLast)
          Divider(
              height: 1,
              indent: 68,
              endIndent: 16,
              color: Colors.grey.shade100),
      ],
    );
  }

  IconData _categoryIcon(String? category) {
    return switch (category) {
      'Groceries' => Icons.shopping_basket_outlined,
      'Dining Out' => Icons.restaurant_outlined,
      'Rent' => Icons.home_outlined,
      'Utilities' => Icons.bolt_outlined,
      'Transport' => Icons.directions_car_outlined,
      'Clothing' => Icons.checkroom_outlined,
      'Health' => Icons.favorite_outline,
      'Entertainment' => Icons.movie_outlined,
      'Streaming' => Icons.play_circle_outline,
      'Subscriptions' => Icons.subscriptions_outlined,
      'Income' => Icons.account_balance_outlined,
      _ => Icons.receipt_outlined,
    };
  }
}

