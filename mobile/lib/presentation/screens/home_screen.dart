import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/sync_provider.dart';
import '../widgets/sync_indicator.dart';
import 'dashboard_screen.dart';
import 'scanner_screen.dart';
import 'inventory_screen.dart';
import 'transactions_screen.dart';
import 'profile_screen.dart';

/// Home shell — bottom navigation with 5 tabs.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final _pages = const [
    DashboardScreen(),
    ScannerScreen(),
    InventoryScreen(),
    TransactionsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final sync = context.watch<SyncProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Column(
        children: [
          // Sync indicator at top
          if (!sync.isOnline || sync.pendingCount > 0)
            SafeArea(
              bottom: false,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: SyncIndicator(
                  isOnline: sync.isOnline,
                  pendingCount: sync.pendingCount,
                  isSyncing: sync.isSyncing,
                  onTap: sync.isOnline ? () => sync.syncNow() : null,
                ),
              ),
            ),
          // Active page
          Expanded(child: _pages[_currentIndex]),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 0.5,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_rounded),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner_rounded),
              label: 'Scan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2_outlined),
              label: 'Inventaris',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.swap_horiz_rounded),
              label: 'Transaksi',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}
