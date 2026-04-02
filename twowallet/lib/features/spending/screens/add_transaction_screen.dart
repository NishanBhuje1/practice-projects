import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/transaction.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';
import '../../home/providers/home_provider.dart';
import '../providers/spending_provider.dart';
import '../../analytics/providers/analytics_provider.dart';
import '../../../shared/providers/subscription_provider.dart';
import '../../../data/services/analytics_service.dart';

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
  bool _isPrivate = false;
  bool _loading = false;
  String? _error;

  static const _expenseCategories = [
    'Groceries', 'Dining Out', 'Rent', 'Utilities',
    'Transport', 'Clothing', 'Health', 'Entertainment',
    'Streaming', 'Subscriptions', 'Food Delivery',
    'Travel', 'Insurance', 'Other',
  ];

  static const _incomeCategories = [
    'Salary', 'Freelance', 'Rental Income',
    'Investment Return', 'Gift', 'Refund', 'Other Income',
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

    final accountId = await _getOrCreateAccountId(
      householdId: me.householdId,
      partnerId: me.id,
      bucket: _bucket,
    );
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
        isPrivate: _isPrivate,
      ),
    );

    await AnalyticsService.transactionAdded(_bucket, _category);

    // Spending & home
    ref.invalidate(spendingTransactionsProvider);
    ref.invalidate(recentTransactionsProvider);
    ref.invalidate(allTransactionsThisMonthProvider); // cascades → bucketTotals, bucketBreakdown, topCategories

    // Fair split — invalidate source so fairSplitResultProvider auto-cascades
    ref.invalidate(oursTransactionsProvider);

    // Analytics — these use ref.read per month so won't cascade automatically
    ref.invalidate(monthlyTotalsProvider);
    ref.invalidate(lastMonthBucketBreakdownProvider);

    if (mounted) context.pop();
  } catch (e) {
    setState(() => _error = e.toString());
  } finally {
    setState(() => _loading = false);
  }
}

  Future<String> _getOrCreateAccountId({
    required String householdId,
    required String partnerId,
    required String bucket,
  }) async {
    final client = Supabase.instance.client;

    // Look for an existing manual account for this household + bucket
    final existing = await client
        .from('accounts')
        .select()
        .eq('household_id', householdId)
        .eq('bucket', bucket)
        .eq('is_manual', true)
        .limit(1);

    if (existing.isNotEmpty) return existing.first['id'] as String;

    // Auto-create a default manual account for this bucket
    final label = switch (bucket) {
      'mine' => 'My Wallet',
      'ours' => 'Joint Wallet',
      _ => 'Their Wallet',
    };

    final result = await client
        .from('accounts')
        .insert({
          'household_id': householdId,
          'partner_id': bucket == 'ours' ? null : partnerId,
          'bucket': bucket,
          'institution_name': 'Manual',
          'account_name': label,
          'account_type': 'transaction',
          'balance_aud': 0,
          'is_manual': true,
        })
        .select()
        .single();

    return result['id'] as String;
  }

  @override
  Widget build(BuildContext context) {
    final isFreeAsync = ref.watch(isFreeProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        scrolledUnderElevation: 0,
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
            // Bank sync banner for free tier
            isFreeAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (isFree) => isFree
                  ? Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE1F5EE),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.ours),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.account_balance,
                                color: AppColors.ours, size: 18),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Connect your bank',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.grey.shade800,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Upgrade to Together to sync transactions automatically',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () => context.push('/paywall'),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                minimumSize: const Size(0, 0),
                              ),
                              child: Text(
                                'Upgrade',
                                style: TextStyle(color: AppColors.ours),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),

            // ── Income / Expense toggle ──────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(14),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  _TypeTab(
                    label: 'Expense',
                    icon: Icons.arrow_upward_rounded,
                    selected: !_isIncome,
                    selectedColor: const Color(0xFFE53935),
                    onTap: () => setState(() {
                      _isIncome = false;
                      // Reset to an expense category if still on an income one
                      if (_incomeCategories.contains(_category)) {
                        _category = 'Groceries';
                      }
                    }),
                  ),
                  _TypeTab(
                    label: 'Income',
                    icon: Icons.arrow_downward_rounded,
                    selected: _isIncome,
                    selectedColor: AppColors.ours,
                    onTap: () => setState(() {
                      _isIncome = true;
                      _category = 'Salary';
                      _bucket = 'mine';
                    }),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Amount ───────────────────────────────────────────────────────
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount',
                prefixText: _isIncome ? '+\$ ' : '-\$ ',
                prefixStyle: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: _isIncome
                      ? AppColors.ours
                      : const Color(0xFFE53935),
                ),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: _isIncome
                        ? AppColors.ours
                        : const Color(0xFFE53935),
                    width: 1.5,
                  ),
                ),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(
                  fontSize: 24, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),

            // ── Merchant / description ────────────────────────────────────────
            TextField(
              controller: _merchantController,
              decoration: InputDecoration(
                labelText:
                    _isIncome ? 'Source / description' : 'Merchant / description',
                hintText:
                    _isIncome ? 'e.g. Employer Payroll' : 'e.g. Woolworths',
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

            // ── Bucket selector (hidden for income — always "mine") ───────────
            if (!_isIncome) ...[
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
                      padding:
                          EdgeInsets.only(right: b != 'theirs' ? 8 : 0),
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _bucket = b;
                          if (b != 'mine') _isPrivate = false;
                        }),
                        child: Container(
                          padding:
                              const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: selected ? light : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color:
                                  selected ? color : Colors.grey.shade200,
                              width: selected ? 1.5 : 0.5,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: selected
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                                color: selected
                                    ? color
                                    : Colors.grey.shade500,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              // Only show for own spending
              if (_bucket == 'mine')
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('Private pocket',
                      style: GoogleFonts.inter(fontSize: 14)),
                  subtitle: Text('Hidden from your partner',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: Colors.grey.shade500)),
                  value: _isPrivate,
                  activeColor: const Color(0xFF1D9E75),
                  onChanged: (v) => setState(() => _isPrivate = v),
                ),
              const SizedBox(height: 16),
            ],

            // ── Category ──────────────────────────────────────────────────────
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
              items: (_isIncome ? _incomeCategories : _expenseCategories)
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
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
  final IconData icon;
  final bool selected;
  final Color selectedColor;
  final VoidCallback onTap;

  const _TypeTab({
    required this.label,
    required this.icon,
    required this.selected,
    required this.selectedColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? selectedColor : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 15,
                color: selected ? Colors.white : Colors.grey.shade500,
              ),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: selected ? Colors.white : Colors.grey.shade500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}