import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:go_router/go_router.dart';

class DeepLinkHandler {
  static StreamSubscription<Uri>? _sub;

  static void initialize(GoRouter router) {
    final appLinks = AppLinks();
    _sub = appLinks.uriLinkStream.listen((uri) => _handle(uri, router));
    appLinks.getInitialLink().then((uri) {
      if (uri != null) _handle(uri, router);
    });
  }

  static void dispose() => _sub?.cancel();

  static void _handle(Uri uri, GoRouter router) {
    String? code;
    if (uri.host == 'twowallet.app' && uri.path == '/join') {
      code = uri.queryParameters['code'];
    } else if (uri.scheme == 'twowallet' && uri.host == 'invite') {
      code = uri.pathSegments.isNotEmpty ? uri.pathSegments.first : null;
    }
    if (code != null && code.isNotEmpty) {
      router.go('/join?code=$code');
    }
  }
}
