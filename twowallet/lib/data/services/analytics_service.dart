import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

class AnalyticsService {
  static final _posthog = Posthog();
  static const _apiKey = String.fromEnvironment('POSTHOG_API_KEY');

  static Future<void> init() async {
    if (_apiKey.isEmpty) {
      debugPrint('PostHog API key not set — analytics disabled');
      return;
    }

    final config = PostHogConfig(_apiKey)
      ..host = 'https://us.i.posthog.com'
      ..debug = true
      ..captureApplicationLifecycleEvents = true;

    await _posthog.setup(config);
    debugPrint('PostHog initialized — host: ${config.host}, key length: ${_apiKey.length}');
  }

  // ===== USER IDENTIFICATION =====

  static Future<void> identify(String userId, {Map<String, Object>? properties}) async {
    try {
      await _posthog.identify(userId: userId, userProperties: properties);
    } catch (e) {
      debugPrint('Analytics identify error: $e');
    }
  }

  static Future<void> reset() async {
    try {
      await _posthog.reset();
    } catch (e) {
      debugPrint('Analytics reset error: $e');
    }
  }

  static Future<void> _capture(String event, [Map<String, Object>? properties]) async {
    try {
      await _posthog.capture(eventName: event, properties: properties);
    } catch (e) {
      debugPrint('Analytics capture error ($event): $e');
    }
  }

  // ===== ACQUISITION =====

  static Future<void> appFirstOpen() => _capture('app_first_open');
  static Future<void> appOpened() => _capture('app_opened');
  static Future<void> signupStarted() => _capture('signup_started');
  static Future<void> signupMethodSelected(String method) =>
      _capture('signup_method_selected', {'method': method});
  static Future<void> signupCompleted(String method) =>
      _capture('signup_completed', {'method': method});
  static Future<void> signupFailed(String method, String reason) =>
      _capture('signup_failed', {'method': method, 'reason': reason});

  static Future<void> signinStarted() => _capture('signin_started');
  static Future<void> signinCompleted(String method) =>
      _capture('signin_completed', {'method': method});
  static Future<void> signinFailed(String method, String reason) =>
      _capture('signin_failed', {'method': method, 'reason': reason});

  // ===== ONBOARDING =====

  static Future<void> onboardingScreenViewed(String screenName) =>
      _capture('onboarding_screen_viewed', {'screen': screenName});
  static Future<void> onboardingSkipped() => _capture('onboarding_skipped');
  static Future<void> onboardingCompleted() => _capture('onboarding_completed');

  // ===== PARTNER CONNECTION =====

  static Future<void> partnerInvited({required String method}) =>
      _capture('partner_invited', {'method': method});
  static Future<void> partnerInviteLinkCopied() => _capture('partner_invite_link_copied');
  static Future<void> partnerInviteLinkShared() => _capture('partner_invite_link_shared');
  static Future<void> partnerInviteReceived() => _capture('partner_invite_received');
  static Future<void> partnerInviteAccepted() => _capture('partner_invite_accepted');
  static Future<void> partnerInviteFailed(String reason) =>
      _capture('partner_invite_failed', {'reason': reason});
  static Future<void> householdConnected() => _capture('household_connected');

  // ===== CORE FEATURES =====

  static Future<void> transactionAdded({
    required String bucket,
    required bool isIncome,
    required double amount,
  }) =>
      _capture('transaction_added', {
        'bucket': bucket,
        'is_income': isIncome,
        'amount_range': _amountBucket(amount),
      });

  static Future<void> transactionEdited(String bucket) =>
      _capture('transaction_edited', {'bucket': bucket});
  static Future<void> transactionDeleted(String bucket) =>
      _capture('transaction_deleted', {'bucket': bucket});

  static Future<void> bucketViewed(String bucket) =>
      _capture('bucket_viewed', {'bucket': bucket});

  static Future<void> goalCreated({required double targetAmount}) =>
      _capture('goal_created', {'amount_range': _amountBucket(targetAmount)});
  static Future<void> goalCompleted() => _capture('goal_completed');
  static Future<void> goalContributionMade(double amount) =>
      _capture('goal_contribution_made', {'amount_range': _amountBucket(amount)});

  static Future<void> moneyDateStarted() => _capture('money_date_started');
  static Future<void> moneyDateCompleted() => _capture('money_date_completed');
  static Future<void> moneyDateAiPromptUsed() => _capture('money_date_ai_prompt_used');

  static Future<void> fairSplitViewed() => _capture('fair_split_viewed');
  static Future<void> fairSplitIncomeUpdated() => _capture('fair_split_income_updated');

  static Future<void> privatePocketUsed() => _capture('private_pocket_used');

  static Future<void> analyticsScreenViewed() => _capture('analytics_screen_viewed');
  static Future<void> dataExported(String format) =>
      _capture('data_exported', {'format': format});

  // ===== MONETIZATION =====

  static Future<void> paywallViewed(String trigger) =>
      _capture('paywall_viewed', {'trigger': trigger});
  static Future<void> paywallDismissed(String trigger) =>
      _capture('paywall_dismissed', {'trigger': trigger});
  static Future<void> paywallPackageSelected(String packageType) =>
      _capture('paywall_package_selected', {'package': packageType});

  static Future<void> subscriptionPurchaseAttempted(String packageType) =>
      _capture('subscription_purchase_attempted', {'package': packageType});
  static Future<void> subscriptionPurchaseSucceeded(String packageType) =>
      _capture('subscription_purchase_succeeded', {'package': packageType});
  static Future<void> subscriptionPurchaseFailed(String packageType, String reason) =>
      _capture('subscription_purchase_failed', {'package': packageType, 'reason': reason});
  static Future<void> subscriptionRestored() => _capture('subscription_restored');
  static Future<void> subscriptionCancelled() => _capture('subscription_cancelled');

  static Future<void> trialStarted() => _capture('trial_started');
  static Future<void> trialDayWarningShown(int daysRemaining) =>
      _capture('trial_day_warning_shown', {'days_remaining': daysRemaining});
  static Future<void> trialEndedNaturally() => _capture('trial_ended_naturally');
  static Future<void> winbackPaywallShown() => _capture('winback_paywall_shown');

  // ===== ENGAGEMENT =====

  static Future<void> featureUsed(String featureName) =>
      _capture('feature_used', {'feature': featureName});
  static Future<void> settingChanged(String setting, String value) =>
      _capture('setting_changed', {'setting': setting, 'value': value});

  static Future<void> screenViewed(String screenName) =>
      _capture(r'$screen', {'screen_name': screenName});

  // ===== HELPERS =====

  static String _amountBucket(double amount) {
    if (amount < 10) return '0-10';
    if (amount < 50) return '10-50';
    if (amount < 100) return '50-100';
    if (amount < 500) return '100-500';
    if (amount < 1000) return '500-1000';
    if (amount < 5000) return '1000-5000';
    return '5000+';
  }
}
