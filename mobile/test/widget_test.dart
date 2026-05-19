// Stokku.ai — Widget Tests
//
// Replaces the default Flutter counter test with meaningful smoke tests
// for the actual StokkuApp components.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:stokku_mobile/presentation/providers/auth_provider.dart';
import 'package:stokku_mobile/presentation/providers/dashboard_provider.dart';
import 'package:stokku_mobile/presentation/providers/product_provider.dart';
import 'package:stokku_mobile/presentation/providers/warehouse_provider.dart';
import 'package:stokku_mobile/presentation/providers/transaction_provider.dart';
import 'package:stokku_mobile/presentation/providers/inventory_provider.dart';
import 'package:stokku_mobile/presentation/providers/sync_provider.dart';
import 'package:stokku_mobile/presentation/providers/theme_provider.dart';
import 'package:stokku_mobile/presentation/providers/chatbot_provider.dart';

import 'package:stokku_mobile/presentation/screens/chatbot_screen.dart';
import 'package:stokku_mobile/presentation/widgets/stat_card.dart';
import 'package:stokku_mobile/presentation/widgets/glass_card.dart';
import 'package:stokku_mobile/core/theme/app_theme.dart';

/// Helper: wraps a widget in MaterialApp with all necessary providers.
Widget buildTestApp(Widget child) {
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
      ChangeNotifierProvider(create: (_) => ChatbotProvider()),
    ],
    child: MaterialApp(
      theme: AppTheme.dark,
      home: child,
    ),
  );
}

void main() {
  // ── Test 1: StokkuApp theme is dark by default ────────────
  testWidgets('ThemeProvider defaults to dark mode', (tester) async {
    final provider = ThemeProvider();
    expect(provider.isDark, isTrue);
    expect(provider.mode, equals(ThemeMode.dark));
  });

  // ── Test 2: ThemeProvider can toggle ──────────────────────
  testWidgets('ThemeProvider toggles between dark and light', (tester) async {
    final provider = ThemeProvider();
    expect(provider.isDark, isTrue);
    provider.toggle();
    expect(provider.isDark, isFalse);
    expect(provider.mode, equals(ThemeMode.light));
    provider.toggle();
    expect(provider.isDark, isTrue);
  });

  // ── Test 3: StatCard renders title, value, and icon ───────
  testWidgets('StatCard displays title, value, and icon', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: StatCard(
            title: 'TOTAL PRODUK',
            value: '42',
            icon: Icons.category_rounded,
          ),
        ),
      ),
    );

    expect(find.text('TOTAL PRODUK'), findsOneWidget);
    expect(find.text('42'), findsOneWidget);
    expect(find.byIcon(Icons.category_rounded), findsOneWidget);
  });

  // ── Test 4: StatCard shows subtitle when provided ─────────
  testWidgets('StatCard shows subtitle when provided', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: StatCard(
            title: 'NILAI ASET',
            value: 'Rp 10jt',
            icon: Icons.account_balance_wallet_rounded,
            subtitle: '+5% dari kemarin',
          ),
        ),
      ),
    );

    expect(find.text('NILAI ASET'), findsOneWidget);
    expect(find.text('Rp 10jt'), findsOneWidget);
    expect(find.text('+5% dari kemarin'), findsOneWidget);
  });

  // ── Test 5: GlassCard renders child widget ────────────────
  testWidgets('GlassCard renders its child widget', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: GlassCard(
            child: Text('Konten dalam GlassCard'),
          ),
        ),
      ),
    );

    expect(find.text('Konten dalam GlassCard'), findsOneWidget);
    expect(find.byType(GlassCard), findsOneWidget);
  });

  // ── Test 6: GlassCard onTap callback ──────────────────────
  testWidgets('GlassCard fires onTap callback', (tester) async {
    bool tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: Scaffold(
          body: GlassCard(
            onTap: () => tapped = true,
            child: const Text('Tappable card'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Tappable card'));
    expect(tapped, isTrue);
  });

  // ── Test 7: ChatbotScreen renders quick replies and input ─
  testWidgets('ChatbotScreen shows quick replies and input field', (tester) async {
    await tester.pumpWidget(buildTestApp(const ChatbotScreen()));
    await tester.pumpAndSettle();

    // Quick replies should be visible (initial state — only 1 bot message)
    expect(find.text('Apa stok kritis hari ini?'), findsOneWidget);
    expect(find.text('Berikan rekomendasi restock'), findsOneWidget);
    expect(find.text('Deteksi dead-stock'), findsOneWidget);
    expect(find.text('Ringkas kondisi inventaris'), findsOneWidget);

    // Input field should be present
    expect(find.byType(TextField), findsOneWidget);

    // Send button icon should be present
    expect(find.byIcon(Icons.send_rounded), findsOneWidget);

    // Header should show 'Stokku AI'
    expect(find.text('Stokku AI'), findsOneWidget);
  });

  // ── Test 8: ChatbotProvider state management ──────────────
  testWidgets('ChatbotProvider manages chat state correctly', (tester) async {
    final provider = ChatbotProvider();

    // Initial state: 1 bot message, not typing
    expect(provider.messages.length, equals(1));
    expect(provider.messages.first.sender, equals('bot'));
    expect(provider.isTyping, isFalse);
    expect(provider.hasMessages, isFalse); // only initial message
    expect(provider.selectedModel, equals('gemini-2.5-flash'));

    // Change model
    provider.setModel('gemma-3-27b-it');
    expect(provider.selectedModel, equals('gemma-3-27b-it'));

    // Clear history resets to initial
    provider.clearHistory();
    expect(provider.messages.length, equals(1));
    expect(provider.hasMessages, isFalse);
  });
}
