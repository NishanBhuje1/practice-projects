import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'shared/providers/auth_provider.dart';
import 'features/onboarding/screens/welcome_screen.dart';
import 'features/onboarding/screens/signup_screen.dart';
import 'features/onboarding/screens/invite_screen.dart';
import 'features/onboarding/screens/join_screen.dart';
import 'features/fair_split/screens/fair_split_screen.dart';
import 'features/onboarding/screens/signin_screen.dart';
import 'data/services/deep_link_service.dart';
import 'features/home/screens/home_screen.dart';
import 'features/goals/screens/goals_screen.dart';
import 'features/spending/screens/spending_screen.dart';
import 'features/money_date/screens/money_date_screen.dart';
import 'features/spending/screens/add_transaction_screen.dart';
import 'features/paywall/screens/paywall_screen.dart';
import 'features/settings/screens/relationship_status_screen.dart';
import 'features/settings/screens/notification_settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/welcome',
    redirect: (context, state) {
      final authState = ref.watch(authUserProvider);

      if (authState.isLoading) return null;

      final isLoggedIn = authState.value != null;
      final isOnboarding = state.matchedLocation.startsWith('/onboarding') ||
          state.matchedLocation == '/welcome' ||
          state.matchedLocation == '/signin';

      if (!isLoggedIn && !isOnboarding) return '/welcome';
      if (isLoggedIn && state.matchedLocation == '/welcome') return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(
  path: '/relationship-status',
  builder: (_, __) => const RelationshipStatusScreen(),
),
      GoRoute(
          path: '/onboarding/signup', builder: (_, __) => const SignUpScreen()),
      GoRoute(path: '/signin', builder: (_, __) => const SignInScreen()),
      GoRoute(
  path: '/notification-settings',
  builder: (_, __) => const NotificationSettingsScreen(),
),
      GoRoute(
        path: '/onboarding/invite',
        builder: (_, state) => InviteScreen(householdId: state.extra as String),
      ),
      GoRoute(
        path: '/onboarding/join',
        builder: (_, state) => JoinScreen(
          householdId: state.uri.queryParameters['code'],
        ),
      ),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/spending', builder: (_, __) => const SpendingScreen()),
      GoRoute(path: '/money-date', builder: (_, __) => const MoneyDateScreen()),
      GoRoute(
        path: '/paywall',
        builder: (_, __) => const PaywallScreen(),
      ),
      GoRoute(
          path: '/add-transaction',
          builder: (_, __) => const AddTransactionScreen()),
      GoRoute(path: '/goals', builder: (_, __) => const GoalsScreen()),
      GoRoute(path: '/fair-split', builder: (_, __) => const FairSplitScreen()),
    ],
  );
});

class TwoWalletApp extends ConsumerWidget {
  const TwoWalletApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    ref.read(deepLinkServiceProvider).init(router);

    return MaterialApp.router(
      title: 'TwoWallet',
      routerConfig: router,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1D9E75),
        useMaterial3: true,
      ),
    );
  }
}
