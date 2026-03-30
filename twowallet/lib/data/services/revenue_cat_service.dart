import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

class RevenueCatService {
  // Single test API key for both platforms
  static const _apiKey = 'test_lxIKsEYpnWWdbjTsEuGNHlWLMQv';

  // Your product IDs — match these exactly in App Store / Play Store
  static const monthlyTogether = 'twowallet_together_monthly';
  static const annualTogether = 'twowallet_together_annual';
  static const monthlyTogetherPlus = 'twowallet_together_plus_monthly';
  static const annualTogetherPlus = 'twowallet_together_plus_annual';

  // Entitlement IDs — set these up in RevenueCat dashboard
  static const entitlementTogether = 'together';
  static const entitlementTogetherPlus = 'together_plus';

  /// Initializes RevenueCat with the provided Supabase User ID.
  static Future<void> init(String userId) async {
    // Keep debug logs on for testing/sandbox environments
    await Purchases.setLogLevel(LogLevel.debug);

    final config = PurchasesConfiguration(_apiKey)
      ..appUserID = userId;

    await Purchases.configure(config);
  }

  Future<CustomerInfo> getCustomerInfo() async {
    return await Purchases.getCustomerInfo();
  }

  Future<String> getCurrentTier() async {
    try {
      final info = await getCustomerInfo();
      if (info.entitlements.active.containsKey(entitlementTogetherPlus)) {
        return 'together_plus';
      }
      if (info.entitlements.active.containsKey(entitlementTogether)) {
        return 'together';
      }
      return 'free';
    } catch (e) {
      debugPrint('Error fetching tier: $e');
      return 'free';
    }
  }

  Future<List<Package>> getPackages() async {
    try {
      final offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch (e) {
      debugPrint('Error fetching packages: $e');
      return [];
    }
  }

  Future<CustomerInfo> purchase(Package package) async {
    return await Purchases.purchasePackage(package);
  }

  Future<CustomerInfo> restorePurchases() async {
    return await Purchases.restorePurchases();
  }
}