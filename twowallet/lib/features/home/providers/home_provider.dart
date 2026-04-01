import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/repositories/transaction_repository.dart';
import '../../../data/repositories/household_repository.dart';
import '../../../data/models/transaction.dart';
import '../../../data/models/partner.dart';
import '../../../core/utils/fair_split_calc.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';

final recentTransactionsProvider = FutureProvider<List<Transaction>>((ref) async {
  final user = ref.watch(authUserProvider).value;
  if (user == null) return [];
  return ref.read(transactionRepoProvider).fetchRecent();
});

final allTransactionsThisMonthProvider = FutureProvider<List<Transaction>>((ref) async {
  final user = ref.watch(authUserProvider).value;
  if (user == null) return [];
  return ref.read(transactionRepoProvider).fetchThisMonthAll();
});

// Spending totals per bucket this month
class BucketTotals {
  final double mine;
  final double ours;
  final double theirs;
  const BucketTotals({required this.mine, required this.ours, required this.theirs});
}

final bucketTotalsProvider = FutureProvider<BucketTotals>((ref) async {
  final transactions = await ref.watch(allTransactionsThisMonthProvider.future);
  final partners = await ref.watch(partnersProvider.future);

  String? myPartnerId;
  if (partners.isNotEmpty) {
    final userId = ref.watch(authUserProvider).value?.id;
    myPartnerId = partners
        .where((p) => p.userId == userId)
        .map((p) => p.id)
        .firstOrNull;
  }

  final expenses = transactions.where((t) => !t.isIncome && !t.isPrivate);

  double mine = 0;
  double ours = 0;
  double theirs = 0;

  for (final t in expenses) {
    if (t.bucket == 'mine' && t.partnerId == myPartnerId) {
      mine += t.amountAud.abs();
    } else if (t.bucket == 'ours') {
      ours += t.amountAud.abs();
    } else if (t.bucket == 'theirs' && t.partnerId != myPartnerId) {
      theirs += t.amountAud.abs();
    }
  }

  return BucketTotals(mine: mine, ours: ours, theirs: theirs);
});