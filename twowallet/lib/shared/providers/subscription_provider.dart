import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/revenue_cat_service.dart';
import '../../shared/providers/repo_providers.dart';

// Households created before this date are grandfathered (all existing users).
const _grandfatherCutoff = '2026-05-01';
const _trialDays = 40;

class SubscriptionStatus {
  final String status; // 'grandfathered' | 'trial' | 'active' | 'expired'
  final bool hasAccess;
  final int daysRemaining;
  final DateTime? trialEndDate;

  const SubscriptionStatus({
    required this.status,
    required this.hasAccess,
    required this.daysRemaining,
    this.trialEndDate,
  });

  bool get isGrandfathered => status == 'grandfathered';
}

final subscriptionStatusProvider = FutureProvider<SubscriptionStatus>((ref) async {
  // Active RevenueCat subscription always wins.
  final hasPremium = await RevenueCatService.hasPremiumEntitlement();
  if (hasPremium) {
    return const SubscriptionStatus(
      status: 'active',
      hasAccess: true,
      daysRemaining: 0,
    );
  }

  try {
    final household = await ref.read(householdRepoProvider).fetchMyHousehold();

    if (household == null) {
      // No household yet — allow access during setup.
      return const SubscriptionStatus(
        status: 'trial',
        hasAccess: true,
        daysRemaining: _trialDays,
      );
    }

    final cutoff = DateTime.parse(_grandfatherCutoff);
    final createdAt = household.createdAt != null
        ? DateTime.tryParse(household.createdAt!)
        : null;

    if (createdAt == null || createdAt.isBefore(cutoff)) {
      return const SubscriptionStatus(
        status: 'grandfathered',
        hasAccess: true,
        daysRemaining: 0,
      );
    }

    final trialEnd = createdAt.add(const Duration(days: _trialDays));
    final now = DateTime.now();
    final daysLeft = trialEnd.difference(now).inDays;

    if (daysLeft > 0) {
      return SubscriptionStatus(
        status: 'trial',
        hasAccess: true,
        daysRemaining: daysLeft,
        trialEndDate: trialEnd,
      );
    }

    return SubscriptionStatus(
      status: 'expired',
      hasAccess: false,
      daysRemaining: 0,
      trialEndDate: trialEnd,
    );
  } catch (_) {
    // Default to trial access if status can't be determined.
    return const SubscriptionStatus(
      status: 'trial',
      hasAccess: true,
      daysRemaining: _trialDays,
    );
  }
});
