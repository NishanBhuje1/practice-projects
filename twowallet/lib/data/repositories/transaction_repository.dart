import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';

class TransactionRepository {
  final _client = Supabase.instance.client;

  Future<List<Transaction>> fetchThisMonth() async {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month + 1, 1);

    final data = await _client
        .from('transactions')
        .select()
        .gte('date', '${start.year}-${start.month.toString().padLeft(2, '0')}-01')
        .lt('date', '${end.year}-${end.month.toString().padLeft(2, '0')}-01')
        .order('date', ascending: false);

    return data.map((e) => Transaction.fromJson(e)).toList();
  }

  Future<List<Transaction>> fetchOursThisMonth() async {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month + 1, 1);

    final data = await _client
        .from('transactions')
        .select()
        .eq('bucket', 'ours')
        .gte('date', '${start.year}-${start.month.toString().padLeft(2, '0')}-01')
        .lt('date', '${end.year}-${end.month.toString().padLeft(2, '0')}-01')
        .order('date', ascending: false);

    return data.map((e) => Transaction.fromJson(e)).toList();
  }

  Future<List<Transaction>> fetchRecent({int limit = 5}) async {
    final data = await _client
        .from('transactions')
        .select()
        .eq('is_private', false)
        .order('date', ascending: false)
        .limit(limit);

    return data.map((e) => Transaction.fromJson(e)).toList();
  }

  Future<List<Transaction>> fetchThisMonthAll() async {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month + 1, 1);

    final data = await _client
        .from('transactions')
        .select()
        .gte('date', '${start.year}-${start.month.toString().padLeft(2, '0')}-01')
        .lt('date', '${end.year}-${end.month.toString().padLeft(2, '0')}-01')
        .order('date', ascending: false);

    return data.map((e) => Transaction.fromJson(e)).toList();
  }

  Future<Transaction> addTransaction(Transaction tx) async {
    final data = await _client
        .from('transactions')
        .insert({
          'household_id': tx.householdId,
          'account_id': tx.accountId,
          'partner_id': tx.partnerId,
          'bucket': tx.bucket,
          'amount_aud': tx.amountAud,
          'merchant_name': tx.merchantName,
          'category': tx.category,
          'date': tx.date,
          'is_private': tx.isPrivate,
          'is_income': tx.isIncome,
          'is_recurring': tx.isRecurring,
          'notes': tx.notes,
        })
        .select()
        .single();

    return Transaction.fromJson(data);
  }

  Future<void> updateBucket(String transactionId, String bucket) async {
    await _client
        .from('transactions')
        .update({'bucket': bucket})
        .eq('id', transactionId);
  }

  Future<void> updateCategory(String transactionId, String category) async {
    await _client
        .from('transactions')
        .update({'category': category})
        .eq('id', transactionId);
  }
}