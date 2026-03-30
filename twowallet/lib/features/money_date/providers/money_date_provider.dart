import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/services/claude_service.dart';
import '../../../data/repositories/transaction_repository.dart';
import '../../../data/repositories/household_repository.dart';
import '../../../data/models/money_date.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';

final claudeServiceProvider = Provider((_) => ClaudeService());

final moneyDateInsightsProvider =
    FutureProvider<MoneyDateInsights>((ref) async {
  final now = DateTime.now();
  final weekStart = now.subtract(Duration(days: now.weekday - 1));
  final weekStartStr =
      '${weekStart.year}-${weekStart.month.toString().padLeft(2, '0')}-${weekStart.day.toString().padLeft(2, '0')}';

  // Fetch this week's transactions
  final allTxs = await ref.read(transactionRepoProvider).fetchThisMonthAll();
  final weekTxs =
      allTxs.where((t) => t.date.compareTo(weekStartStr) >= 0).toList();

  final household = await ref.read(householdRepoProvider).fetchMyHousehold();
  final partners = await ref.read(partnersProvider.future);

  if (household == null || partners.length < 2) {
    throw Exception('Household not set up');
  }

  return ref.read(claudeServiceProvider).generateMoneyDateInsights(
        weekTransactions: weekTxs,
        household: household,
        partners: partners,
      );
});
