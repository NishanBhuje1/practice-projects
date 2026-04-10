import 'package:app_links/app_links.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class DeepLinkService {
  final _appLinks = AppLinks();

  void init(GoRouter router) {
    // Handle link when app is already open
    _appLinks.uriLinkStream.listen((uri) {
      _handleLink(uri, router);
    });
  }

  Future<void> checkInitialLink(GoRouter router) async {
    // Handle link that launched the app cold
    final uri = await _appLinks.getInitialLink();
    if (uri != null) _handleLink(uri, router);
  }

  void _handleLink(Uri uri, GoRouter router) {
    // Custom scheme: twowallet://invite/HOUSEHOLD_ID
    if (uri.scheme == 'twowallet' && uri.host == 'invite') {
      final householdId = uri.pathSegments.first;
      router.push('/onboarding/join?code=$householdId');
      return;
    }
    // Universal link: https://twowallet.app/join?code=HOUSEHOLD_ID
    if (uri.host == 'twowallet.app' && uri.path == '/join') {
      final code = uri.queryParameters['code'];
      if (code != null && code.isNotEmpty) {
        router.push('/onboarding/join?code=$code');
      }
    }
  }
}

final deepLinkServiceProvider = Provider((_) => DeepLinkService());