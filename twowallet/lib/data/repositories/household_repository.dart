import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/household.dart';
import '../models/partner.dart';

class HouseholdRepository {
  final _client = Supabase.instance.client;

  Future<Household?> fetchMyHousehold() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return null;

    final partners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

    if (partners.isEmpty) return null;
    final householdId = partners.first['household_id'] as String;

    final households = await _client
        .from('households')
        .select()
        .eq('id', householdId)
        .limit(1);

    if (households.isEmpty) return null;
    return Household.fromJson(households.first);
  }

  Future<List<Partner>> fetchPartners() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return [];

    final myPartners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

    if (myPartners.isEmpty) return [];
    final householdId = myPartners.first['household_id'] as String;

    final data = await _client
        .from('partners')
        .select()
        .eq('household_id', householdId)
        .order('role');

    return data.map((e) => Partner.fromJson(e)).toList();
  }

  Future<void> updateSplitRatio(double ratioA) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    final partners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

    if (partners.isEmpty) return;

    await _client.from('households').update({'split_ratio_a': ratioA}).eq(
        'id', partners.first['household_id'] as String);
  }

  Future<void> updateSplitMethod(String method) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    final partners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

    if (partners.isEmpty) return;

    await _client.from('households').update({'split_method': method}).eq(
        'id', partners.first['household_id'] as String);
  }

  Future<void> updatePrivatePockets({
    required double pocketA,
    required double pocketB,
  }) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    final partners = await _client
        .from('partners')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

    if (partners.isEmpty) return;

    await _client.from('households').update({
      'private_pocket_a_aud': pocketA,
      'private_pocket_b_aud': pocketB,
    }).eq('id', partners.first['household_id'] as String);
  }

  Future<void> pauseHousehold({
    required String householdId,
    required String partnerId,
    String? reason,
  }) async {
    await _client.from('households').update({
      'status': 'paused',
      'paused_at': DateTime.now().toIso8601String(),
      'pause_reason': reason,
    }).eq('id', householdId);

    await _client.from('household_events').insert({
      'household_id': householdId,
      'event_type': 'paused',
      'initiated_by': partnerId,
      'note': reason,
    });

    await _client
        .from('goals')
        .update({'status': 'paused'})
        .eq('household_id', householdId)
        .eq('status', 'active');
  }

Future<void> updateMoneyDateSchedule({
  required int day,
  required int hour,
}) async {
  final userId = _client.auth.currentUser?.id;
  if (userId == null) return;

  final partners = await _client
      .from('partners')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1);

  if (partners.isEmpty) return;

  await _client.from('households').update({
    'money_date_day': day,
    'money_date_hour': hour,
  }).eq('id', partners.first['household_id'] as String);
}

  Future<void> resumeHousehold({
    required String householdId,
    required String partnerId,
  }) async {
    await _client.from('households').update({
      'status': 'active',
      'resumed_at': DateTime.now().toIso8601String(),
    }).eq('id', householdId);

    await _client.from('household_events').insert({
      'household_id': householdId,
      'event_type': 'resumed',
      'initiated_by': partnerId,
    });

    await _client
        .from('goals')
        .update({'status': 'active'})
        .eq('household_id', householdId)
        .eq('status', 'paused');
  }
}
