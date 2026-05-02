import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SubscriptionStatus {
  final String status; // 'trial', 'active', 'grandfathered', 'expired'
  final bool isGrandfathered;
  final DateTime? trialStartedAt;
  final DateTime? trialEndsAt;
  final int daysRemaining;
  final bool hasAccess;

  SubscriptionStatus({
    required this.status,
    required this.isGrandfathered,
    this.trialStartedAt,
    this.trialEndsAt,
    required this.daysRemaining,
    required this.hasAccess,
  });

  factory SubscriptionStatus.fromJson(Map<String, dynamic> json) {
    return SubscriptionStatus(
      status: json['status'] as String? ?? 'trial',
      isGrandfathered: json['is_grandfathered'] as bool? ?? false,
      trialStartedAt: json['trial_started_at'] != null
          ? DateTime.parse(json['trial_started_at'].toString())
          : null,
      trialEndsAt: json['trial_ends_at'] != null
          ? DateTime.parse(json['trial_ends_at'].toString())
          : null,
      daysRemaining: (json['days_remaining'] as num?)?.toInt() ?? 0,
      hasAccess: json['has_access'] as bool? ?? true,
    );
  }
}

final subscriptionStatusProvider = FutureProvider<SubscriptionStatus?>((ref) async {
  final user = Supabase.instance.client.auth.currentUser;
  debugPrint('🔵 SubProvider: user=${user?.email}');

  if (user == null) {
    debugPrint('🔵 SubProvider: no user, returning null');
    return null;
  }

  final partner = await Supabase.instance.client
      .from('partners')
      .select('household_id')
      .eq('user_id', user.id)
      .maybeSingle();

  debugPrint('🔵 SubProvider: partner=$partner');

  if (partner == null || partner['household_id'] == null) {
    debugPrint('🔵 SubProvider: no partner record, returning null');
    return null;
  }

  // SINGLE SOURCE OF TRUTH: the database decides grandfathered/trial/active/expired
  final response = await Supabase.instance.client
      .rpc('get_subscription_status', params: {
    'p_household_id': partner['household_id'],
  });

  debugPrint('🔵 SubProvider: RPC response=$response');

  if (response is List && response.isNotEmpty) {
    final status = SubscriptionStatus.fromJson(response.first as Map<String, dynamic>);
    debugPrint(
        '🔵 SubProvider: parsed — status=${status.status}, days=${status.daysRemaining}, grandfathered=${status.isGrandfathered}, hasAccess=${status.hasAccess}');
    return status;
  }

  debugPrint('🔵 SubProvider: empty response, returning null');
  return null;
});
