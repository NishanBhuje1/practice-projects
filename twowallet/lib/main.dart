import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants/supabase_config.dart';
import 'app.dart';
import 'data/services/revenue_cat_service.dart';
import 'data/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.init();

  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
      autoRefreshToken: true,
    ),
  );

  // Init RevenueCat with the current user ID if logged in
  final user = Supabase.instance.client.auth.currentUser;
  if (user != null) {
    await RevenueCatService.init(user.id);
  }

  runApp(const ProviderScope(child: TwoWalletApp()));
}
