import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/extensions/currency_ext.dart';
import '../../../data/models/transaction.dart';
import '../../home/providers/home_provider.dart';
import '../providers/spending_provider.dart';
import '../../fair_split/providers/fair_split_provider.dart';
import '../../analytics/providers/analytics_provider.dart';
import '../../../data/repositories/transaction_repository.dart';

// ════════════════════════════════════════════════════════════════════════════
// TransactionDetailSheet
// Purpose: Full metadata view for a single transaction, shown as a bottom
//          sheet. Amount is the hero element; metadata is in grouped sections
//          below. Includes a delete action.
// ════════════════════════════════════════════════════════════════════════════

/// Show the transaction detail bottom sheet.
void showTransactionDetail(BuildContext context, Transaction tx) {
  HapticFeedback.lightImpact();
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => TransactionDetailSheet(tx: tx),
  );
}

class TransactionDetailSheet extends ConsumerStatefulWidget {
  final Transaction tx;
  const TransactionDetailSheet({super.key, required this.tx});

  @override
  ConsumerState<TransactionDetailSheet> createState() =>
      _TransactionDetailSheetState();
}

class _TransactionDetailSheetState
    extends ConsumerState<TransactionDetailSheet> {
  bool _deleting = false;

  // ── Helpers ─────────────────────────────────────────────────────────────

  IconData get _icon => switch (widget.tx.category) {
    'Groceries'     => Icons.shopping_basket_outlined,
    'Dining Out'    => Icons.restaurant_outlined,
    'Rent'          => Icons.home_outlined,
    'Utilities'     => Icons.bolt_outlined,
    'Transport'     => Icons.directions_car_outlined,
    'Clothing'      => Icons.checkroom_outlined,
    'Health'        => Icons.favorite_outline,
    'Entertainment' => Icons.movie_outlined,
    'Streaming'     => Icons.play_circle_outline,
    'Subscriptions' => Icons.subscriptions_outlined,
    'Salary'        => Icons.account_balance_outlined,
    _               => Icons.receipt_outlined,
  };

  String get _bucketLabel => switch (widget.tx.bucket) {
    'mine'   => 'My spending',
    'ours'   => 'Our spending',
    'theirs' => "Partner's spending",
    _        => widget.tx.bucket,
  };

  String get _formattedDate {
    try {
      final d = DateTime.parse(widget.tx.date);
      return DateFormat('EEEE, d MMMM yyyy').format(d);
    } catch (_) {
      return widget.tx.date;
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Delete transaction?',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 17,
            color: AppColors.textPrimary,
          ),
        ),
        content: Text(
          'This will permanently remove "${widget.tx.merchantName}" from your records.',
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('Cancel',
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text('Delete',
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600, color: AppColors.destructive)),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    HapticFeedback.mediumImpact();
    setState(() => _deleting = true);
    try {
      await ref.read(transactionRepoProvider).deleteTransaction(widget.tx.id);
      // Invalidate all downstream providers
      ref.invalidate(recentTransactionsProvider);
      ref.invalidate(allTransactionsThisMonthProvider);
      ref.invalidate(spendingTransactionsProvider);
      ref.invalidate(oursTransactionsProvider);
      ref.invalidate(bucketTotalsProvider);
      ref.invalidate(monthlyTotalsProvider);
      ref.invalidate(lastMonthBucketBreakdownProvider);
      ref.invalidate(fairSplitResultProvider);
      if (mounted) Navigator.of(context).pop();
      HapticFeedback.mediumImpact();
    } catch (e) {
      setState(() => _deleting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not delete: $e')),
        );
      }
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final color      = AppColors.forBucket(widget.tx.bucket);
    final lightColor = AppColors.lightForBucket(widget.tx.bucket);
    final bottomPad  = MediaQuery.of(context).padding.bottom;

    return DraggableScrollableSheet(
      initialChildSize: 0.72,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      snap: true,
      snapSizes: const [0.72, 0.92],
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // ── Drag handle ──────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.only(top: 12, bottom: 4),
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.separator,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // ── Scrollable content ───────────────────────────────────
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.fromLTRB(16, 8, 16, bottomPad + 16),
                  children: [
                    // ── Hero: amount + merchant ──────────────────────
                    _HeroSection(tx: widget.tx, color: color, lightColor: lightColor, icon: _icon),

                    const SizedBox(height: 20),

                    // ── Details card ──────────────────────────────────
                    _DetailCard(
                      rows: [
                        _DetailRow(
                          label: 'Date',
                          value: _formattedDate,
                          icon: Icons.calendar_today_outlined,
                        ),
                        _DetailRow(
                          label: 'Category',
                          value: widget.tx.category ?? 'Uncategorised',
                          icon: _icon,
                        ),
                        _DetailRow(
                          label: 'Bucket',
                          value: _bucketLabel,
                          icon: Icons.account_balance_wallet_outlined,
                          valueColor: color,
                          valueBgColor: lightColor,
                        ),
                        _DetailRow(
                          label: 'Type',
                          value: widget.tx.isIncome ? 'Income' : 'Expense',
                          icon: widget.tx.isIncome
                              ? Icons.arrow_downward_rounded
                              : Icons.arrow_upward_rounded,
                          valueColor: widget.tx.isIncome
                              ? AppColors.success
                              : AppColors.textSecondary,
                        ),
                        if (widget.tx.isPrivate)
                          _DetailRow(
                            label: 'Visibility',
                            value: 'Private pocket',
                            icon: Icons.lock_outline,
                            valueColor: AppColors.textSecondary,
                          ),
                      ],
                    ),

                    // ── Notes ─────────────────────────────────────────
                    if (widget.tx.notes != null && widget.tx.notes!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      _NotesCard(notes: widget.tx.notes!),
                    ],

                    const SizedBox(height: 24),

                    // ── Delete ────────────────────────────────────────
                    _DeleteButton(deleting: _deleting, onTap: _delete),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Hero section ──────────────────────────────────────────────────────────────

class _HeroSection extends StatelessWidget {
  final Transaction tx;
  final Color color;
  final Color lightColor;
  final IconData icon;

  const _HeroSection({
    required this.tx,
    required this.color,
    required this.lightColor,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final displayAmount = tx.isIncome
        ? '+${tx.amountAud.toAUD()}'
        : '-${tx.amountAud.abs().toAUD()}';

    return Column(
      children: [
        // Category icon
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: lightColor,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 26, color: color),
        ),
        const SizedBox(height: 14),

        // Amount — hero
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: tx.amountAud.abs()),
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
          builder: (context, value, _) {
            final sign = tx.isIncome ? '+' : '-';
            final formatted = value.toAUD();
            return Text(
              '$sign$formatted',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 40,
                fontWeight: FontWeight.w700,
                color: tx.isIncome ? AppColors.success : AppColors.textPrimary,
                letterSpacing: -1,
              ),
            );
          },
        ),

        const SizedBox(height: 6),

        // Merchant name
        Text(
          tx.merchantName,
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 4),

        // Bucket pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: lightColor,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Text(
                switch (tx.bucket) {
                  'mine'   => 'My spending',
                  'ours'   => 'Our spending',
                  'theirs' => "Partner's spending",
                  _        => tx.bucket,
                },
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Detail card ────────────────────────────────────────────────────────────────

class _DetailCard extends StatelessWidget {
  final List<_DetailRow> rows;
  const _DetailCard({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: rows.asMap().entries.map((entry) {
          final row    = entry.value;
          final isLast = entry.key == rows.length - 1;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Icon(row.icon, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: 12),
                    Text(
                      row.label,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const Spacer(),
                    if (row.valueBgColor != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: row.valueBgColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          row.value,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: row.valueColor ?? AppColors.textPrimary,
                          ),
                        ),
                      )
                    else
                      Text(
                        row.value,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: row.valueColor ?? AppColors.textPrimary,
                        ),
                      ),
                  ],
                ),
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  indent: 46,
                  endIndent: 16,
                  color: AppColors.separatorOpaque,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _DetailRow {
  final String   label;
  final String   value;
  final IconData icon;
  final Color?   valueColor;
  final Color?   valueBgColor;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
    this.valueColor,
    this.valueBgColor,
  });
}

// ── Notes card ─────────────────────────────────────────────────────────────────

class _NotesCard extends StatelessWidget {
  final String notes;
  const _NotesCard({required this.notes});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.notes_outlined,
                  size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Text(
                'Notes',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            notes,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Delete button ──────────────────────────────────────────────────────────────

class _DeleteButton extends StatefulWidget {
  final bool deleting;
  final VoidCallback onTap;

  const _DeleteButton({required this.deleting, required this.onTap});

  @override
  State<_DeleteButton> createState() => _DeleteButtonState();
}

class _DeleteButtonState extends State<_DeleteButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        HapticFeedback.lightImpact();
        setState(() => _pressed = true);
      },
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: _pressed
              ? AppColors.destructive.withValues(alpha: 0.08)
              : AppColors.destructive.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Center(
          child: widget.deleting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.destructive,
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.delete_outline_rounded,
                        size: 18, color: AppColors.destructive),
                    const SizedBox(width: 8),
                    Text(
                      'Delete transaction',
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.destructive,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
