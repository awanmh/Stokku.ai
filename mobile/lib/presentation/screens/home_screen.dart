import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/sync_provider.dart';
import '../widgets/sync_indicator.dart';
import 'dashboard_screen.dart';
import 'scanner_screen.dart';
import 'inventory_screen.dart';
import 'transactions_screen.dart';
import 'profile_screen.dart';

/// Home shell — bottom navigation with 5 tabs and global chatbot FAB.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  late final _pages = [
    DashboardScreen(onNavigate: (index) => setState(() => _currentIndex = index)),
    const ScannerScreen(),
    const InventoryScreen(),
    const TransactionsScreen(),
    const ProfileScreen(),
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
          // Active page with animated transition
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              switchInCurve: Curves.easeOut,
              switchOutCurve: Curves.easeIn,
              child: KeyedSubtree(
                key: ValueKey(_currentIndex),
                child: _pages[_currentIndex],
              ),
            ),
          ),
        ],
      ),
      // ── Chatbot FAB ─────────────────────────────────────────
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [AppColors.cyan, AppColors.indigo],
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.cyan.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FloatingActionButton(
          heroTag: 'chatbot_fab',
          backgroundColor: Colors.transparent,
          elevation: 0,
          highlightElevation: 0,
          onPressed: () => Navigator.pushNamed(context, '/chatbot'),
          child: const Icon(Icons.auto_awesome, color: Colors.white, size: 22),
        ),
      ).animate().scale(
            begin: const Offset(0, 0),
            end: const Offset(1, 1),
            duration: 400.ms,
            delay: 300.ms,
            curve: Curves.easeOutBack,
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
              label: 'Dasbor',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner_rounded),
              label: 'Pemindai',
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
