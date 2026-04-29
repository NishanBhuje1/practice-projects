import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:twowallet/shared/providers/subscription_provider.dart';

bool hasPremiumAccess(WidgetRef ref) {
  final sub = ref.read(subscriptionStatusProvider).valueOrNull;
  if (sub == null) return true;
  return sub.hasAccess;
}

/// Shows a soft paywall bottom sheet when the user taps a premium feature.
/// Returns true if the user has access or successfully subscribed.
Future<bool> requirePremium(
  BuildContext context,
  WidgetRef ref, {
  String? featureName,
}) async {
  if (hasPremiumAccess(ref)) return true;

  final result = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => DraggableScrollableSheet(
      initialChildSize: 0.55,
      maxChildSize: 0.75,
      minChildSize: 0.45,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          controller: controller,
          child: _PremiumGateContent(featureName: featureName),
        ),
      ),
    ),
  );

  ref.invalidate(subscriptionStatusProvider);
  return result == true;
}

class _PremiumGateContent extends StatelessWidget {
  final String? featureName;
  const _PremiumGateContent({this.featureName});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFF1D9E75),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.star, color: Colors.white, size: 32),
          ),
          const SizedBox(height: 16),
          Text(
            featureName != null
                ? '$featureName is a Premium feature'
                : 'Premium feature',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Your trial has ended. Subscribe to keep using premium features.',
            style: TextStyle(fontSize: 14, color: Colors.black54),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.push('/paywall');
            },
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF1D9E75),
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('See Plans'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Not now'),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
