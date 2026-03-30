import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/repositories/transaction_repository.dart';
import '../../../data/models/transaction.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';
import '../../home/providers/home_provider.dart';
import '../providers/spending_provider.dart';

class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({super.key});

  @override
  ConsumerState<AddTransactionScreen> createState() =>
      _AddTransactionScreenState();
}

class _AddTransactionScreenState
    extends ConsumerState<AddTransactionScreen> {
  final _merchantController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();

  String _bucket = 'ours';
  String _category = 'Groceries';
  bool _isIncome = false;
  bool _loading = false;
  String? _error;

  final _categories = [
    'Groceries', 'Dining Out', 'Rent', 'Utilities',
    'Transport', 'Clothing', 'Health', 'Entertainment',
    'Streaming', 'Subscriptions', 'Food Delivery',
    'Travel', 'Insurance', 'Income', 'Other',
  ];

  @override
  void dispose() {
    _merchantController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
  if (_merchantController.text.isEmpty) {
    setState(() => _error = 'Enter a merchant name');
    return;
  }
  final amount = double.tryParse(_amountController.text);
  if (amount == null || amount <= 0) {
    setState(() => _error = 'Enter a valid amount');
    return;
  }

  setState(() { _loading = true; _error = null; });

  try {
    final partners = await ref.read(partnersProvider.future);
    final userId = ref.read(authUserProvider).value?.id;
    final me = partners.where((p) => p.userId == userId).firstOrNull;
    if (me == null) throw Exception('Partner not found');

    final accountId = await _getAccountId(me.id, _bucket);
    final now = DateTime.now();
    final dateStr =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    await ref.read(transactionRepoProvider).addTransaction(
      Transaction(
        id: '',
        householdId: me.householdId,
        accountId: accountId,
        partnerId: me.id,
        bucket: _bucket,
        amountAud: amount,
        merchantName: _merchantController.text.trim(),
        category: _category,
        date: dateStr,
        isIncome: _isIncome,
      ),
    );

    ref.invalidate(spendingTransactionsProvider);
    ref.invalidate(recentTransactionsProvider);
    ref.invalidate(allTransactionsThisMonthProvider);
    ref.invalidate(fairSplitResultProvider);

    if (mounted) context.pop();
  } catch (e) {
    setState(() => _error = e.toString());
  } finally {
    setState(() => _loading = false);
  }
}

  Future<String> _getAccountId(String partnerId, String bucket) async {
  final client = Supabase.instance.client;
  final accounts = await client
      .from('accounts')
      .select()
      .eq('bucket', bucket)
      .limit(1);

  if (accounts.isEmpty) throw Exception('No account found for bucket $bucket');
  return accounts.first['id'] as String;
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        title: const Text('Add transaction'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: _loading ? null : _submit,
            child: _loading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Income / Expense toggle
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  _TypeTab(
                    label: 'Expense',
                    selected: !_isIncome,
                    onTap: () => setState(() => _isIncome = false),
                  ),
                  _TypeTab(
                    label: 'Income',
                    selected: _isIncome,
                    onTap: () => setState(() => _isIncome = true),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Amount
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount',
                prefixText: '\$ ',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
              ),
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),

            // Merchant
            TextField(
              controller: _merchantController,
              decoration: InputDecoration(
                labelText: 'Merchant / description',
                hintText: 'e.g. Woolworths',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
              ),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 12),

            // Bucket selector
            const Text('Bucket',
                style: TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Row(
              children: ['mine', 'ours', 'theirs'].map((b) {
                final selected = _bucket == b;
                final color = AppColors.forBucket(b);
                final light = AppColors.lightForBucket(b);
                final label = b[0].toUpperCase() + b.substring(1);
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(
                        right: b != 'theirs' ? 8 : 0),
                    child: GestureDetector(
                      onTap: () => setState(() => _bucket = b),
                      child: Container(
                        padding:
                            const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: selected ? light : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected
                                ? color
                                : Colors.grey.shade200,
                            width: selected ? 1.5 : 0.5,
                          ),
                        ),
                        child: Center(
                          child: Text(label,
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: selected
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                  color: selected
                                      ? color
                                      : Colors.grey.shade500)),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Category
            DropdownButtonFormField<String>(
              value: _category,
              decoration: InputDecoration(
                labelText: 'Category',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
              ),
              items: _categories
                  .map((c) =>
                      DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => setState(() => _category = v!),
            ),
            const SizedBox(height: 12),

            // Notes
            TextField(
              controller: _notesController,
              decoration: InputDecoration(
                labelText: 'Notes (optional)',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!,
                  style: const TextStyle(color: Colors.red)),
            ],
          ],
        ),
      ),
    );
  }
}

class _TypeTab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TypeTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppColors.ours : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(label,
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: selected
                        ? Colors.white
                        : Colors.grey.shade500)),
          ),
        ),
      ),
    );
  }
}