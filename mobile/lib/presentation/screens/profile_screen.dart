import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/sync_provider.dart';
import '../widgets/glass_card.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = context.watch<ThemeProvider>();
    final sync = context.watch<SyncProvider>();
    final user = auth.user;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Profil', style: Theme.of(context).textTheme.headlineMedium)
                .animate()
                .fadeIn(duration: 400.ms),
            const SizedBox(height: 24),

            // Avatar card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.cyan, AppColors.indigo],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(
                        (user?.name ?? 'U').substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? '-',
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 18)),
                        const SizedBox(height: 2),
                        Text(user?.email ?? '-',
                            style: TextStyle(fontSize: 13, color: muted)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.cyan.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            user?.role.toUpperCase().replaceAll('_', ' ') ??
                                '',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.cyan,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 100.ms)
                .slideY(begin: 0.05, end: 0, duration: 400.ms, delay: 100.ms),
            const SizedBox(height: 24),

            // Settings section
            Text('PENGATURAN',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                    color: muted)),
            const SizedBox(height: 12),

            // Theme toggle
            GlassCard(
              child: Row(
                children: [
                  const Icon(Icons.dark_mode_rounded,
                      color: AppColors.indigo, size: 20),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Text('Mode Gelap',
                        style: TextStyle(
                            fontWeight: FontWeight.w500, fontSize: 14)),
                  ),
                  Switch.adaptive(
                    value: theme.isDark,
                    activeColor: AppColors.cyan,
                    onChanged: (_) => theme.toggle(),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 200.ms)
                .slideY(begin: 0.05, end: 0, duration: 400.ms, delay: 200.ms),

            // Sync info
            GlassCard(
              onTap: sync.isOnline && sync.pendingCount > 0
                  ? () => sync.syncNow()
                  : null,
              child: Row(
                children: [
                  Icon(
                    sync.isOnline
                        ? Icons.cloud_done_rounded
                        : Icons.cloud_off_rounded,
                    color:
                        sync.isOnline ? AppColors.success : AppColors.error,
                    size: 20,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sync.isOnline ? 'Online' : 'Offline',
                          style: const TextStyle(
                              fontWeight: FontWeight.w500, fontSize: 14),
                        ),
                        if (sync.pendingCount > 0)
                          Text(
                            '${sync.pendingCount} item menunggu sinkronisasi',
                            style: TextStyle(fontSize: 11, color: muted),
                          ),
                      ],
                    ),
                  ),
                  if (sync.isSyncing)
                    const SizedBox(
                      width: 18, height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.cyan),
                    ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 300.ms)
                .slideY(begin: 0.05, end: 0, duration: 400.ms, delay: 300.ms),

            const SizedBox(height: 32),

            // Logout
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text('Keluar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.error.withOpacity(0.1),
                  foregroundColor: AppColors.error,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                        color: AppColors.error.withOpacity(0.2)),
                  ),
                ),
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacementNamed('/login');
                  }
                },
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 400.ms),
            const SizedBox(height: 20),
            Center(
              child: Text('stokku.ai v1.0.0',
                  style: TextStyle(fontSize: 11, color: muted)),
            ),
          ],
        ),
      ),
    );
  }
}
