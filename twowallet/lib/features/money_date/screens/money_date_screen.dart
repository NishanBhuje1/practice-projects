import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../providers/money_date_provider.dart';
import '../../../data/services/claude_service.dart';

class MoneyDateScreen extends ConsumerWidget {
  const MoneyDateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final insightsAsync = ref.watch(moneyDateInsightsProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.grey.shade50,
        elevation: 0,
        title: const Text('Money Date'),
      ),
      body: insightsAsync.when(
        loading: () => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Generating your talking points...'),
            ],
          ),
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline,
                    size: 48, color: Colors.grey.shade300),
                const SizedBox(height: 16),
                Text('Could not generate insights',
                    style: TextStyle(color: Colors.grey.shade600)),
                const SizedBox(height: 8),
                Text('$e',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                    textAlign: TextAlign.center),
                const SizedBox(height: 24),
                OutlinedButton(
                  onPressed: () => ref.invalidate(moneyDateInsightsProvider),
                  child: const Text('Try again'),
                ),
              ],
            ),
          ),
        ),
        data: (insights) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _WeekInNumbers(insights: insights),
            const SizedBox(height: 16),
            _TalkingPoints(insights: insights),
            const SizedBox(height: 16),
            _DecisionPrompt(insights: insights),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ── Week in numbers ───────────────────────────────────────────────────────────

class _WeekInNumbers extends StatelessWidget {
  final MoneyDateInsights insights;
  const _WeekInNumbers({required this.insights});

  @override
  Widget build(BuildContext context) {
    final total = (insights.weekInNumbers['total_spent'] as num).toDouble();
    final ours = (insights.weekInNumbers['ours_spent'] as num).toDouble();
    final count = insights.weekInNumbers['transaction_count'] as int;

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
            const Text('This week',
                style: TextStyle(fontSize: 13, color: Colors.grey)),
            const SizedBox(height: 12),
            Row(
              children: [
                _StatBox(
                    label: 'Total spent',
                    value: total.toAUD(showCents: false),
                    color: AppColors.mine),
                const SizedBox(width: 8),
                _StatBox(
                    label: 'Shared',
                    value: ours.toAUD(showCents: false),
                    color: AppColors.ours),
                const SizedBox(width: 8),
                _StatBox(
                    label: 'Transactions',
                    value: '$count',
                    color: AppColors.theirs),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatBox({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w600, color: color)),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
          ],
        ),
      ),
    );
  }
}

// ── Talking points ────────────────────────────────────────────────────────────

class _TalkingPoints extends StatefulWidget {
  final MoneyDateInsights insights;
  const _TalkingPoints({required this.insights});

  @override
  State<_TalkingPoints> createState() => _TalkingPointsState();
}

class _TalkingPointsState extends State<_TalkingPoints> {
  final Set<int> _checked = {};

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
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.oursLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.chat_bubble_outline,
                      size: 16, color: AppColors.ours),
                ),
                const SizedBox(width: 8),
                const Text('Talk about this',
                    style:
                        TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
              ],
            ),
            const SizedBox(height: 12),
            ...widget.insights.talkingPoints.asMap().entries.map((e) {
              final i = e.key;
              final point = e.value;
              final checked = _checked.contains(i);

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () => setState(() {
                    if (checked) {
                      _checked.remove(i);
                    } else {
                      _checked.add(i);
                    }
                  }),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        margin: const EdgeInsets.only(top: 1),
                        decoration: BoxDecoration(
                          color: checked ? AppColors.ours : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color:
                                checked ? AppColors.ours : Colors.grey.shade300,
                          ),
                        ),
                        child: checked
                            ? const Icon(Icons.check,
                                size: 14, color: Colors.white)
                            : null,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          point,
                          style: TextStyle(
                            fontSize: 14,
                            color:
                                checked ? Colors.grey.shade400 : Colors.black87,
                            decoration:
                                checked ? TextDecoration.lineThrough : null,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// ── Decision prompt ───────────────────────────────────────────────────────────

class _DecisionPrompt extends StatefulWidget {
  final MoneyDateInsights insights;
  const _DecisionPrompt({required this.insights});

  @override
  State<_DecisionPrompt> createState() => _DecisionPromptState();
}

class _DecisionPromptState extends State<_DecisionPrompt> {
  bool _dismissed = false;

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.mine.withOpacity(0.3)),
      ),
      color: AppColors.mineLight,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.lightbulb_outline, color: AppColors.mine, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('This week\'s action',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.mineDark)),
                  const SizedBox(height: 4),
                  Text(widget.insights.decisionPrompt,
                      style:
                          TextStyle(fontSize: 14, color: AppColors.mineDark)),
                ],
              ),
            ),
            GestureDetector(
              onTap: () => setState(() => _dismissed = true),
              child: Icon(Icons.close, size: 18, color: AppColors.mine),
            ),
          ],
        ),
      ),
    );
  }
}
