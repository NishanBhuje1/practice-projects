import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../../../data/models/goal.dart';
import '../../../data/models/partner.dart';
import '../providers/goals_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/subscription_provider.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goalsAsync = ref.watch(goalsProvider);
    final isFreeAsync = ref.watch(isFreeProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        title: const Text('Goals'),
      ),
      floatingActionButton: goalsAsync.when(
        loading: () => FloatingActionButton(
          onPressed: null,
          backgroundColor: AppColors.ours,
          child: const Icon(Icons.add, color: Colors.white),
        ),
        error: (_, __) => FloatingActionButton(
          onPressed: () => _showCreateGoalSheet(context, ref),
          backgroundColor: AppColors.ours,
          child: const Icon(Icons.add, color: Colors.white),
        ),
        data: (goals) => isFreeAsync.when(
          loading: () => FloatingActionButton(
            onPressed: () => _showCreateGoalSheet(context, ref),
            backgroundColor: AppColors.ours,
            child: const Icon(Icons.add, color: Colors.white),
          ),
          error: (_, __) => FloatingActionButton(
            onPressed: () => _showCreateGoalSheet(context, ref),
            backgroundColor: AppColors.ours,
            child: const Icon(Icons.add, color: Colors.white),
          ),
          data: (isFree) {
            final canCreate = !isFree || goals.length < 3;
            return FloatingActionButton(
              onPressed: canCreate ? () => _showCreateGoalSheet(context, ref) : () => context.push('/paywall'),
              backgroundColor: canCreate ? AppColors.ours : Colors.grey.shade400,
              child: const Icon(Icons.add, color: Colors.white),
            );
          },
        ),
      ),
      body: goalsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (goals) {
          if (goals.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.flag_outlined,
                      size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No goals yet',
                      style: TextStyle(
                          fontSize: 16, color: Colors.grey.shade500)),
                  const SizedBox(height: 8),
                  Text('Tap + to create your first shared goal',
                      style: TextStyle(
                          fontSize: 13, color: Colors.grey.shade400)),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: goals.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _GoalCard(goal: goals[i]),
          );
        },
      ),
    );
  }

  void _showCreateGoalSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _CreateGoalSheet(),
    );
  }
}

// ── Goal card ─────────────────────────────────────────────────────────────────

class _GoalCard extends ConsumerWidget {
  final Goal goal;
  const _GoalCard({required this.goal});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalsAsync = ref.watch(goalContributionTotalsProvider(goal.id));
    final partnersAsync = ref.watch(
        Provider((ref) => ref.watch(
            // access partners from auth provider
            Provider<AsyncValue<List<Partner>>>((ref) =>
                ref.watch(
                  Provider((ref) => AsyncData<List<Partner>>([])))))));

    return ref
        .watch(Provider<AsyncValue<List<Partner>>>((ref) =>
            ref.watch(Provider((ref) => AsyncData<List<Partner>>([])))
        ))
        .when(
          data: (_) => _buildCard(context, ref, totalsAsync),
          error: (_, __) => _buildCard(context, ref, totalsAsync),
          loading: () => _buildCard(context, ref, totalsAsync),
        );
  }

  Widget _buildCard(BuildContext context, WidgetRef ref,
      AsyncValue<Map<String, double>> totalsAsync) {
    return totalsAsync.when(
      loading: () => _GoalCardShell(goal: goal, partnerATot: 0, partnerBTotal: 0),
error: (_, __) => _GoalCardShell(goal: goal, partnerATot: 0, partnerBTotal: 0),
      data: (totals) {
        final entries = totals.entries.toList();
        final partnerATot = entries.isNotEmpty ? entries[0].value : 0.0;
        final partnerBTot = entries.length > 1 ? entries[1].value : 0.0;
        return _GoalCardShell(
          goal: goal,
          partnerATot: partnerATot,
          partnerBTotal: partnerBTot,
          onAddContribution: () => _showAddContribution(context, ref),
        );
      },
    );
  }

  void _showAddContribution(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _AddContributionSheet(goal: goal),
    );
  }
}

class _GoalCardShell extends StatelessWidget {
  final Goal goal;
  final double partnerATot;
  final double partnerBTotal;
  final VoidCallback? onAddContribution;

  const _GoalCardShell({
    required this.goal,
    this.partnerATot = 0,
    required this.partnerBTotal,
    this.onAddContribution,
  });

  @override
  Widget build(BuildContext context) {
    final total = partnerATot + partnerBTotal;
    final progress = goal.targetAmountAud > 0
        ? (total / goal.targetAmountAud).clamp(0.0, 1.0)
        : 0.0;
    final percent = (progress * 100).round();

    String? daysLeft;
    if (goal.targetDate != null) {
      final target = DateTime.parse(goal.targetDate!);
      final diff = target.difference(DateTime.now()).inDays;
      daysLeft = diff > 0 ? '$diff days left' : 'Past due';
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (goal.emoji != null)
                  Text(goal.emoji!,
                      style: const TextStyle(fontSize: 24)),
                if (goal.emoji != null) const SizedBox(width: 8),
                Expanded(
                  child: Text(goal.name,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500)),
                ),
                Text('$percent%',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ours)),
              ],
            ),
            const SizedBox(height: 12),

            // Dual contribution bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Stack(
                children: [
                  Container(
                      height: 8, color: Colors.grey.shade100),
                  Row(
                    children: [
                      Flexible(
                        flex: (partnerATot * 1000).round(),
                        child: Container(
                            height: 8, color: AppColors.mine),
                      ),
                      Flexible(
                        flex: (partnerBTotal * 1000).round(),
                        child: Container(
                            height: 8, color: AppColors.theirs),
                      ),
                      Flexible(
                        flex: ((goal.targetAmountAud - total).clamp(0, goal.targetAmountAud) * 1000).round(),
                        child: Container(
                            height: 8,
                            color: Colors.grey.shade100),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                            color: AppColors.mine,
                            shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    Text(partnerATot.toAUD(showCents: false),
                        style: TextStyle(
                            fontSize: 12, color: AppColors.mineDark)),
                    const SizedBox(width: 12),
                    Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                            color: AppColors.theirs,
                            shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    Text(partnerBTotal.toAUD(showCents: false),
                        style: TextStyle(
                            fontSize: 12, color: AppColors.theirsDark)),
                  ],
                ),
                Text(
                  '${total.toAUD(showCents: false)} of ${goal.targetAmountAud.toAUD(showCents: false)}',
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey.shade500),
                ),
              ],
            ),

            if (daysLeft != null) ...[
              const SizedBox(height: 4),
              Text(daysLeft,
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey.shade400)),
            ],

            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: onAddContribution,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.ours),
                  foregroundColor: AppColors.ours,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
                child: const Text('Add contribution'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Add contribution sheet ────────────────────────────────────────────────────

class _AddContributionSheet extends ConsumerStatefulWidget {
  final Goal goal;
  const _AddContributionSheet({required this.goal});

  @override
  ConsumerState<_AddContributionSheet> createState() =>
      _AddContributionSheetState();
}

class _AddContributionSheetState
    extends ConsumerState<_AddContributionSheet> {
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) return;

    setState(() => _loading = true);
    await ref.read(goalsNotifierProvider.notifier).addContribution(
      goalId: widget.goal.id,
      amountAud: amount,
      notes: _notesController.text.isEmpty ? null : _notesController.text,
    );
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Add to ${widget.goal.name}',
            style: const TextStyle(
                fontSize: 17, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _amountController,
            decoration: const InputDecoration(
              labelText: 'Amount',
              prefixText: '\$ ',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
            autofocus: true,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Notes (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _loading ? null : _submit,
              style: FilledButton.styleFrom(
                  backgroundColor: AppColors.ours,
                  padding: const EdgeInsets.symmetric(vertical: 14)),
              child: _loading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Add contribution'),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Create goal sheet ─────────────────────────────────────────────────────────

class _CreateGoalSheet extends ConsumerStatefulWidget {
  @override
  ConsumerState<_CreateGoalSheet> createState() => _CreateGoalSheetState();
}

class _CreateGoalSheetState extends ConsumerState<_CreateGoalSheet> {
  final _nameController = TextEditingController();
  final _amountController = TextEditingController();
  String _selectedEmoji = '🎯';
  String _splitMethod = 'fifty_fifty';
  bool _loading = false;

  final _emojis = ['🎯', '✈️', '🏠', '🚗', '💍', '👶', '🛡️', '🏦', '🎓', '💰'];

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.isEmpty) return;
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) return;

    setState(() => _loading = true);
    await ref.read(goalsNotifierProvider.notifier).createGoal(
      name: _nameController.text.trim(),
      targetAmountAud: amount,
      emoji: _selectedEmoji,
      contributionSplit: _splitMethod,
      contributionRatioA: _splitMethod == 'fifty_fifty' ? 0.5 : 0.55,
    );
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('New goal',
              style:
                  TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),

          // Emoji picker
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _emojis.length,
              itemBuilder: (_, i) {
                final e = _emojis[i];
                final selected = e == _selectedEmoji;
                return GestureDetector(
                  onTap: () => setState(() => _selectedEmoji = e),
                  child: Container(
                    width: 44,
                    height: 44,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.oursLight
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                      border: selected
                          ? Border.all(color: AppColors.ours)
                          : null,
                    ),
                    child: Center(
                        child: Text(e,
                            style: const TextStyle(fontSize: 20))),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Goal name',
              hintText: 'e.g. Europe holiday',
              border: OutlineInputBorder(),
            ),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _amountController,
            decoration: const InputDecoration(
              labelText: 'Target amount',
              prefixText: '\$ ',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),

          // Split method
          DropdownButtonFormField<String>(
            value: _splitMethod,
            decoration: const InputDecoration(
              labelText: 'How to split contributions',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(
                  value: 'fifty_fifty', child: Text('50 / 50')),
              DropdownMenuItem(
                  value: 'income_ratio',
                  child: Text('By income ratio')),
              DropdownMenuItem(
                  value: 'custom', child: Text('Custom')),
            ],
            onChanged: (v) => setState(() => _splitMethod = v!),
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _loading ? null : _submit,
              style: FilledButton.styleFrom(
                  backgroundColor: AppColors.ours,
                  padding: const EdgeInsets.symmetric(vertical: 14)),
              child: _loading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Create goal'),
            ),
          ),
        ],
      ),
    );
  }
}