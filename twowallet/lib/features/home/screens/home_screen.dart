import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../../../data/models/transaction.dart';
import '../../../data/models/partner.dart';
import '../providers/home_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';
import '../../../data/repositories/household_repository.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnersAsync = ref.watch(partnersProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        title: partnersAsync.when(
          loading: () => const Text('TwoWallet'),
          error: (_, __) => const Text('TwoWallet'),
          data: (partners) {
            if (partners.isEmpty) return const Text('TwoWallet');
            final userId = ref.watch(authUserProvider).value?.id;
            final me = partners.where((p) => p.userId == userId).firstOrNull;
            return Text(
              'Hey ${me?.displayName ?? ''} 👋',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_outline),
            onPressed: () => context.push('/money-date'),
            tooltip: 'Money Date',
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle_outlined),
            itemBuilder: (_) => [
              const PopupMenuItem<String>(
                value: 'upgrade',
                child: Row(
                  children: [
                    Icon(Icons.star_outline, size: 18),
                    SizedBox(width: 8),
                    Text('Upgrade to Together'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              // --- New Notification Settings Item ---
              const PopupMenuItem<String>(
                value: 'notifications',
                child: Row(
                  children: [
                    Icon(Icons.notifications_outlined, size: 18),
                    SizedBox(width: 8),
                    Text('Money Date schedule'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'relationship',
                child: Row(
                  children: [
                    Icon(Icons.pause_circle_outline, size: 18),
                    SizedBox(width: 8),
                    Text('Relationship status'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'signout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 18),
                    SizedBox(width: 8),
                    Text('Sign out'),
                  ],
                ),
              ),
            ],
            onSelected: (value) async {
              if (value == 'upgrade') {
                context.push('/paywall');
              } else if (value == 'notifications') {
                // --- Handle Navigation ---
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
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bucketTotalsProvider);
          ref.invalidate(recentTransactionsProvider);
          ref.invalidate(fairSplitResultProvider);
          ref.invalidate(householdProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _PausedBanner(),
            const SizedBox(height: 0),
            _BucketSummary(),
            const SizedBox(height: 16),
            _UpgradeBanner(),
            _FairSplitBanner(),
            const SizedBox(height: 16),
            _RecentTransactions(),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: _BottomNav(),
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
        if (household == null || !household.isPaused) {
          return const SizedBox.shrink();
        }
        return GestureDetector(
          onTap: () => context.push('/relationship-status'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
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
                    style: TextStyle(
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
            const SizedBox(width: 8),
            _BucketTile(
              label: 'Ours',
              amount: totals.ours,
              color: AppColors.ours,
              lightColor: AppColors.oursLight,
              darkColor: AppColors.oursDark,
            ),
            const SizedBox(width: 8),
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
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: lightColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: darkColor)),
            const SizedBox(height: 6),
            Text(
              amount.toAUD(showCents: false),
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: darkColor),
            ),
            Text('this month',
                style: TextStyle(fontSize: 11, color: color)),
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
                  margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(12),
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
        if (household.subscriptionTier != 'free') return const SizedBox.shrink();

        return GestureDetector(
          onTap: () => context.push('/paywall'),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.ours, AppColors.mine],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.star_outline, color: Colors.white, size: 18),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Try Together free for 30 days — unlock bank sync & AI insights',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Icon(Icons.chevron_right, color: Colors.white, size: 18),
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
          onTap: () => context.push('/fair-split'),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color:
                  result.isEven ? AppColors.oursLight : AppColors.mineLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: result.isEven ? AppColors.ours : AppColors.mine,
                width: 0.5,
              ),
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
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: result.isEven
                              ? AppColors.oursDark
                              : AppColors.mineDark,
                        ),
                      ),
                      if (!result.isEven) ...[
                        const SizedBox(height: 4),
                        Text(
                          result.settlementAmount.toAUD(),
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            color: AppColors.mine,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  color: result.isEven ? AppColors.ours : AppColors.mine,
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

class _RecentTransactions extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txAsync = ref.watch(recentTransactionsProvider);
    final partnersAsync = ref.watch(partnersProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Recent',
                style:
                    TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            TextButton(
              onPressed: () => context.push('/spending'),
              child: const Text('See all'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        txAsync.when(
          loading: () =>
              const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('Error: $e'),
          data: (transactions) {
            if (transactions.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Center(
                  child: Text('No transactions yet',
                      style:
                          TextStyle(color: Colors.grey.shade500)),
                ),
              );
            }

            final partners = partnersAsync.value ?? [];

            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: transactions.asMap().entries.map((entry) {
                  final i = entry.key;
                  final tx = entry.value;
                  final isLast = i == transactions.length - 1;
                  return _TransactionRow(
                    tx: tx,
                    partners: partners,
                    isLast: isLast,
                  );
                }).toList(),
              ),
            );
          },
        ),
      ],
    );
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
    final bucketLight = AppColors.lightForBucket(tx.bucket);

    final bucketLabel = switch (tx.bucket) {
      'mine' => 'M',
      'ours' => 'O',
      'theirs' => 'T',
      _ => '?',
    };

    return Column(
      children: [
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: bucketLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    bucketLabel,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: bucketColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tx.merchantName,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500)),
                    Text(
                      tx.category ?? tx.bucket,
                      style: TextStyle(
                          fontSize: 12, color: Colors.grey.shade500),
                    ),
                  ],
                ),
              ),
              Text(
                tx.isIncome
                    ? '+${tx.amountAud.toAUD()}'
                    : '-${tx.amountAud.abs().toAUD()}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: tx.isIncome ? AppColors.ours : Colors.black87,
                ),
              ),
            ],
          ),
        ),
        if (!isLast)
          Divider(
              height: 1,
              indent: 64,
              endIndent: 16,
              color: Colors.grey.shade100),
      ],
    );
  }
}

// ── Bottom nav ────────────────────────────────────────────────────────────────

class _BottomNav extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.ours,
      unselectedItemColor: Colors.grey.shade400,
      currentIndex: 0,
      onTap: (i) {
        switch (i) {
          case 0:
            context.go('/home');
            break;
          case 1:
            context.push('/spending');
            break;
          case 2:
            context.push('/fair-split');
            break;
          case 3:
            context.push('/goals');
            break;
        }
      },
      items: const [
        BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined), label: 'Home'),
        BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined), label: 'Spending'),
        BottomNavigationBarItem(
            icon: Icon(Icons.balance_outlined), label: 'Fair split'),
        BottomNavigationBarItem(
            icon: Icon(Icons.flag_outlined), label: 'Goals'),
      ],
    );
  }
}