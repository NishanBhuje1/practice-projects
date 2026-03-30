import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/repositories/transaction_repository.dart';
import '../../../data/repositories/settlement_repository.dart';
import '../../../data/repositories/household_repository.dart';
import '../../../data/models/transaction.dart';
import '../../../data/models/settlement.dart';
import '../../../data/models/household.dart';
import '../../../data/models/partner.dart';
import '../../../core/utils/fair_split_calc.dart';
import '../../../shared/providers/auth_provider.dart';


// Repositories
final transactionRepoProvider = Provider((_) => TransactionRepository());
final settlementRepoProvider = Provider((_) => SettlementRepository());
final householdRepoProvider = Provider((_) => HouseholdRepository());

// Raw data providers
final oursTransactionsProvider = FutureProvider<List<Transaction>>((ref) {
  return ref.read(transactionRepoProvider).fetchOursThisMonth();
});

final settlementHistoryProvider = FutureProvider<List<Settlement>>((ref) {
  return ref.read(settlementRepoProvider).fetchHistory();
});

final householdProvider = FutureProvider<Household?>((ref) {
  return ref.read(householdRepoProvider).fetchMyHousehold();
});

// The core derived provider — computes the settlement from real data
final fairSplitResultProvider = FutureProvider<FairSplitResult?>((ref) async {
  final transactions = await ref.watch(oursTransactionsProvider.future);
  final household = await ref.watch(householdProvider.future);
  final partners = await ref.watch(partnersProvider.future);

  if (household == null || partners.length < 2) return null;

  final partnerA = partners.firstWhere((p) => p.role == 'partner_a');
  final partnerB = partners.firstWhere((p) => p.role == 'partner_b');

  return FairSplitCalc.calculate(
    oursTransactions: transactions,
    splitRatioA: household.splitRatioA,
    partnerAId: partnerA.id,
    partnerBId: partnerB.id,
  );
});

// Notifier to handle settling up
class SettlementNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> settle({
    required String householdId,
    required double amountAud,
    required String fromPartnerId,
    required String toPartnerId,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(settlementRepoProvider).saveSettlement(
        householdId: householdId,
        amountAud: amountAud,
        fromPartnerId: fromPartnerId,
        toPartnerId: toPartnerId,
      );
      // Invalidate so UI refreshes
      ref.invalidate(oursTransactionsProvider);
      ref.invalidate(settlementHistoryProvider);
    });
  }
}

final settlementNotifierProvider =
    AsyncNotifierProvider<SettlementNotifier, void>(SettlementNotifier.new);