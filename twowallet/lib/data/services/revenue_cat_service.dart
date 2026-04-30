import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

class RevenueCatService {
  static bool _isConfigured = false;

  // Your product IDs — match these exactly in App Store / Play Store
  static const monthlyTogether = 'twowallet_together_monthly';
  static const annualTogether = 'twowallet_together_annual';
  static const monthlyTogetherPlus = 'twowallet_together_plus_monthly';
  static const annualTogetherPlus = 'twowallet_together_plus_annual';

  // Entitlement IDs — set these up in RevenueCat dashboard
  static const entitlementTogether = 'together';
  static const entitlementTogetherPlus = 'together_plus';

  /// Initializes RevenueCat with the provided Supabase User ID.
  static Future<void> init(String? userId) async {
    try {
      final iosKey = dotenv.env['RC_API_KEY_IOS'] ?? '';
      final androidKey = dotenv.env['RC_API_KEY_ANDROID'] ?? '';

      final apiKey = Platform.isIOS ? iosKey : androidKey;

      if (apiKey.isEmpty) {
        debugPrint('RevenueCat API key not set for ${Platform.operatingSystem}');
        _isConfigured = false;
        return;
      }

      await Purchases.setLogLevel(kDebugMode ? LogLevel.debug : LogLevel.warn);

      await Purchases.configure(
        PurchasesConfiguration(apiKey)..appUserID = userId,
      );
      _isConfigured = true;
      debugPrint('RevenueCat configured for ${Platform.operatingSystem}');
    } catch (e) {
      debugPrint('RevenueCat init error: $e — app will work without subscriptions');
      _isConfigured = false;
    }
  }

  static Future<String> getCurrentTier() async {
    if (!_isConfigured) {
      debugPrint('RevenueCat not configured — returning together tier');
      return 'together'; // Default to together during beta
    }

    try {
      final info = await Purchases.getCustomerInfo();
      if (info.entitlements.active.containsKey(entitlementTogetherPlus)) {
        return 'together_plus';
      }
      if (info.entitlements.active.containsKey(entitlementTogether)) {
        return 'together';
      }
      return 'free';
    } catch (e) {
      debugPrint('RevenueCat tier check failed: $e');
      return 'together'; // Default to together during beta
    }
  }

  static Future<List<Package>> getPackages() async {
    try {
      final offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch (e) {
      debugPrint('Error fetching packages: $e');
      return [];
    }
  }

  static Future<Offering?> getCurrentOffering() async {
    try {
      final offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (e) {
      debugPrint('Failed to get offering: $e');
      return null;
    }
  }

  static Future<bool> purchasePackage(Package package) async {
    if (!_isConfigured) return false;
    try {
      final result = await Purchases.purchasePackage(package);
      return result.entitlements.active.isNotEmpty;
    } on PurchasesErrorCode catch (e) {
      if (e == PurchasesErrorCode.purchaseCancelledError) {
        debugPrint('Purchase cancelled by user');
      } else {
        debugPrint('Purchase failed: $e');
      }
      return false;
    } catch (e) {
      debugPrint('Purchase error: $e');
      return false;
    }
  }

  static Future<CustomerInfo> purchase(Package package) async {
    return Purchases.purchasePackage(package);
  }

  static Future<bool> hasPremiumEntitlement() async {
    if (!_isConfigured) return false;
    try {
      final info = await Purchases.getCustomerInfo();
      return info.entitlements.active.containsKey(entitlementTogether) ||
          info.entitlements.active.containsKey(entitlementTogetherPlus);
    } catch (e) {
      debugPrint('RevenueCat entitlement check failed: $e');
      return false;
    }
  }

  static Future<bool> restorePurchases() async {
    try {
      final info = await Purchases.restorePurchases();
      return info.entitlements.active.isNotEmpty;
    } catch (e) {
      debugPrint('Restore failed: $e');
      return false;
    }
  }
}
