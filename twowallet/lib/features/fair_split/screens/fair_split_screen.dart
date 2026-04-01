import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../../../core/utils/fair_split_calc.dart';
import '../../../data/models/transaction.dart';
import '../../../data/models/settlement.dart';
import '../../../data/models/partner.dart';
import '../providers/fair_split_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../data/repositories/household_repository.dart';
import '../../../data/services/analytics_service.dart';

class FairSplitScreen extends ConsumerStatefulWidget {
  const FairSplitScreen({super.key});

  @override
  ConsumerState<FairSplitScreen> createState() => _FairSplitScreenState();
}

class _FairSplitScreenState extends ConsumerState<FairSplitScreen> {
  @override
  void initState() {
    super.initState();
    AnalyticsService.fairSplitViewed();
  }

  @override
  Widget build(BuildContext context) {
    final resultAsync = ref.watch(fairSplitResultProvider);
    final partnersAsync = ref.watch(partnersProvider);
    final historyAsync = ref.watch(settlementHistoryProvider);
    final transactionsAsync = ref.watch(oursTransactionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fair split'),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text(
              _currentMonth(),
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ),
        ],
      ),
      body: resultAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (result) {
          if (result == null) {
            return const Center(
                child: Text('Add some shared expenses to get started'));
          }
          return partnersAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
            data: (partners) {
              if (partners.length < 2) {
                return const Center(
                    child: Text('Waiting for your partner to join'));
              }
              final partnerA =
                  partners.firstWhere((p) => p.role == 'partner_a');
              final partnerB =
                  partners.firstWhere((p) => p.role == 'partner_b');
              final fromPartner =
                  result.fromPartnerId == partnerA.id ? partnerA : partnerB;
              final toPartner =
                  result.fromPartnerId == partnerA.id ? partnerB : partnerA;

              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                children: [
                  _SettlementHero(
                    result: result,
                    fromPartner: fromPartner,
                    toPartner: toPartner,
                    partnerA: partnerA,
                    partnerB: partnerB,
                  ),
                  const SizedBox(height: 16),
                  _SplitRatioCard(partnerA: partnerA, partnerB: partnerB),
                  const SizedBox(height: 16),
                  _ContributionsCard(
                    result: result,
                    partnerA: partnerA,
                    partnerB: partnerB,
                  ),
                  const SizedBox(height: 16),
                  transactionsAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (txs) => _SharedExpensesCard(
                      transactions: txs,
                      partnerA: partnerA,
                      partnerB: partnerB,
                    ),
                  ),
                  const SizedBox(height: 16),
                  historyAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (history) => _HistoryCard(history: history),
                  ),
                  const SizedBox(height: 32),
                ],
              );
            },
          );
        },
      ),
    );
  }

  String _currentMonth() {
    final now = DateTime.now();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${months[now.month - 1]} ${now.year}';
  }
}

// ── Settlement hero card ──────────────────────────────────────────────────────

class _SettlementHero extends ConsumerWidget {
  final FairSplitResult result;
  final Partner fromPartner;
  final Partner toPartner;
  final Partner partnerA;
  final Partner partnerB;

  const _SettlementHero({
    required this.result,
    required this.fromPartner,
    required this.toPartner,
    required this.partnerA,
    required this.partnerB,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              result.isEven
                  ? 'You\'re square'
                  : '${fromPartner.displayName} owes ${toPartner.displayName}',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 8),
            Text(
              result.isEven ? '🎉' : result.settlementAmount.toAUD(),
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.w600,
                color: result.isEven ? AppColors.ours : AppColors.mine,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${result.totalOurs.toAUD(showCents: false)} total shared expenses',
              style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
            ),
            if (!result.isEven) ...[
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => _showSettleSheet(context, ref),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.mine,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Settle up'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showSettleSheet(BuildContext context, WidgetRef ref) {
    AnalyticsService.settleUpTapped();
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _SettleSheet(
        amount: result.settlementAmount,
        fromPartner: fromPartner,
        toPartner: toPartner,
      ),
    );
  }
}

// ── Settle up bottom sheet ────────────────────────────────────────────────────

class _SettleSheet extends StatelessWidget {
  final double amount;
  final Partner fromPartner;
  final Partner toPartner;

  const _SettleSheet({
    required this.amount,
    required this.fromPartner,
    required this.toPartner,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Settle ${amount.toAUD()} with ${toPartner.displayName}',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          _SettleOption(
            icon: Icons.attach_money,
            title: 'PayID',
            subtitle: 'Instant AU bank transfer',
            onTap: () => Navigator.pop(context),
          ),
          _SettleOption(
            icon: Icons.account_balance,
            title: 'BSB + account number',
            subtitle: 'Copy details for manual transfer',
            onTap: () => Navigator.pop(context),
          ),
          _SettleOption(
            icon: Icons.copy,
            title: 'Copy amount',
            subtitle: amount.toAUD(),
            onTap: () {
              Clipboard.setData(ClipboardData(text: amount.toAUD()));
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Amount copied')),
              );
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _SettleOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettleOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }
}

// ── Split ratio card ──────────────────────────────────────────────────────────

class _SplitRatioCard extends ConsumerWidget {
  final Partner partnerA;
  final Partner partnerB;

  const _SplitRatioCard({required this.partnerA, required this.partnerB});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final householdAsync = ref.watch(householdProvider);

    return householdAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (household) {
        if (household == null) return const SizedBox.shrink();
        final ratioA = (household.splitRatioA * 100).round();
        final ratioB = 100 - ratioA;

        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Split ratio',
                    style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                        letterSpacing: 0.5)),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Row(
                    children: [
                      Flexible(
                        flex: ratioA,
                        child: Container(height: 8, color: AppColors.mine),
                      ),
                      Flexible(
                        flex: ratioB,
                        child: Container(height: 8, color: AppColors.theirs),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${partnerA.displayName} $ratioA%',
                        style: TextStyle(
                            fontSize: 13,
                            color: AppColors.mineDark,
                            fontWeight: FontWeight.w500)),
                    Text('${partnerB.displayName} $ratioB%',
                        style: TextStyle(
                            fontSize: 13,
                            color: AppColors.theirsDark,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  household.splitMethod == 'income_ratio'
                      ? 'Based on income'
                      : 'Custom ratio',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Contributions card ────────────────────────────────────────────────────────

class _ContributionsCard extends StatelessWidget {
  final FairSplitResult result;
  final Partner partnerA;
  final Partner partnerB;

  const _ContributionsCard({
    required this.result,
    required this.partnerA,
    required this.partnerB,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('This month\'s contributions',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            const SizedBox(height: 12),
            _ContributionRow(
              partner: partnerA,
              paid: result.partnerAPaid,
              share: result.partnerAShare,
              avatarColor: AppColors.mineLight,
              avatarTextColor: AppColors.mineDark,
            ),
            const Divider(height: 24),
            _ContributionRow(
              partner: partnerB,
              paid: result.partnerBPaid,
              share: result.partnerBShare,
              avatarColor: AppColors.theirsLight,
              avatarTextColor: AppColors.theirsDark,
            ),
          ],
        ),
      ),
    );
  }
}

class _ContributionRow extends StatelessWidget {
  final Partner partner;
  final double paid;
  final double share;
  final Color avatarColor;
  final Color avatarTextColor;

  const _ContributionRow({
    required this.partner,
    required this.paid,
    required this.share,
    required this.avatarColor,
    required this.avatarTextColor,
  });

  @override
  Widget build(BuildContext context) {
    final diff = paid - share;
    final overpaid = diff >= 0;

    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: avatarColor,
          child: Text(
            partner.displayName.substring(0, 2).toUpperCase(),
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: avatarTextColor),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(partner.displayName,
                  style: const TextStyle(fontWeight: FontWeight.w500)),
              Text('Fair share: ${share.toAUD()}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(paid.toAUD(),
                style: const TextStyle(fontWeight: FontWeight.w500)),
            Text(
              '${overpaid ? '+' : ''}${diff.toAUD()} ${overpaid ? 'overpaid' : 'underpaid'}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: overpaid ? AppColors.ours : AppColors.theirs,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── Shared expenses card ──────────────────────────────────────────────────────

class _SharedExpensesCard extends StatelessWidget {
  final List<Transaction> transactions;
  final Partner partnerA;
  final Partner partnerB;

  const _SharedExpensesCard({
    required this.transactions,
    required this.partnerA,
    required this.partnerB,
  });

  @override
  Widget build(BuildContext context) {
    final expenses = transactions.where((t) => !t.isIncome).toList();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Shared expenses',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            ...expenses.map((tx) {
              final paidBy = tx.partnerId == partnerA.id
                  ? partnerA.displayName
                  : partnerB.displayName;
              return _ExpenseRow(tx: tx, paidBy: paidBy);
            }),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total shared',
                    style: TextStyle(fontWeight: FontWeight.w500)),
                Text(
                  expenses.fold(0.0, (s, t) => s + t.amountAud.abs()).toAUD(),
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ExpenseRow extends StatelessWidget {
  final Transaction tx;
  final String paidBy;

  const _ExpenseRow({required this.tx, required this.paidBy});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: AppColors.ours,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx.merchantName, style: const TextStyle(fontSize: 14)),
                Text('Paid by $paidBy',
                    style:
                        TextStyle(fontSize: 12, color: Colors.grey.shade500)),
              ],
            ),
          ),
          Text(tx.amountAud.abs().toAUD(),
              style:
                  const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

// ── Settlement history card ───────────────────────────────────────────────────

class _HistoryCard extends StatelessWidget {
  final List<Settlement> history;
  const _HistoryCard({required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) return const SizedBox.shrink();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Settlement history',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            ...history.map((s) => _HistoryRow(settlement: s)),
          ],
        ),
      ),
    );
  }
}

class _HistoryRow extends StatelessWidget {
  final Settlement settlement;
  const _HistoryRow({required this.settlement});

  @override
  Widget build(BuildContext context) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    final parsed = DateTime.parse(settlement.month);
    final label = '${months[parsed.month - 1]} ${parsed.year}';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14)),
          Row(
            children: [
              Text(settlement.amountAud.toAUD(),
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: settlement.settled
                      ? AppColors.oursLight
                      : AppColors.theirsLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  settlement.settled ? 'Settled' : 'Pending',
                  style: TextStyle(
                    fontSize: 11,
                    color: settlement.settled
                        ? AppColors.oursDark
                        : AppColors.theirsDark,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
