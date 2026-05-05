import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/dashboard_provider.dart';
import 'presentation/providers/product_provider.dart';
import 'presentation/providers/warehouse_provider.dart';
import 'presentation/providers/transaction_provider.dart';
import 'presentation/providers/inventory_provider.dart';
import 'presentation/providers/sync_provider.dart';
import 'presentation/providers/theme_provider.dart';
import 'presentation/screens/splash_screen.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/home_screen.dart';
import 'presentation/screens/products_screen.dart';
import 'presentation/screens/warehouses_screen.dart';

/// Root application widget with all providers and routing.
class StokkuApp extends StatelessWidget {
  const StokkuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => WarehouseProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => InventoryProvider()),
        ChangeNotifierProvider(create: (_) => SyncProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProv, _) {
          return MaterialApp(
            title: 'Stokku.ai',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: themeProv.mode,
            initialRoute: '/',
            routes: {
              '/': (_) => const SplashScreen(),
              '/login': (_) => const LoginScreen(),
              '/home': (_) => const HomeScreen(),
              '/products': (_) => const ProductsScreen(),
              '/warehouses': (_) => const WarehousesScreen(),
            },
          );
        },
      ),
    );
  }
}
