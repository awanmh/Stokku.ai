import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/stat_card.dart';
import '../widgets/glass_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboard();
    });
  }

  String _fmt(double v) => NumberFormat.compactCurrency(
        locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0,
      ).format(v);

  @override
  Widget build(BuildContext context) {
    final d = context.watch<DashboardProvider>();
    final auth = context.watch<AuthProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => d.loadDashboard(),
        color: AppColors.cyan,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text('Halo, ${auth.user?.name ?? 'User'} 👋',
                  style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 4),
              Text(DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(DateTime.now()),
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 24),

              // Section label
              Text('RINGKASAN', style: TextStyle(fontSize: 10,
                  fontWeight: FontWeight.w700, letterSpacing: 1.5, color: muted)),
              const SizedBox(height: 12),

              if (d.isLoading && d.stats == null)
                const Center(child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: AppColors.cyan),
                ))
              else if (d.stats != null) ...[
                GridView.count(
                  crossAxisCount: 2, shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.3,
                  children: [
                    StatCard(title: 'TOTAL PRODUK', value: '${d.stats!.totalProducts}',
                        icon: Icons.category_rounded, iconColor: AppColors.cyan),
                    StatCard(title: 'GUDANG AKTIF', value: '${d.stats!.totalWarehouses}',
                        icon: Icons.warehouse_rounded, iconColor: AppColors.indigo,
                        iconBgColor: AppColors.indigo.withOpacity(0.1)),
                    StatCard(title: 'NILAI ASET', value: _fmt(d.stats!.totalStockValue),
                        icon: Icons.account_balance_wallet_rounded,
                        iconColor: AppColors.success, iconBgColor: AppColors.successBg),
                    StatCard(title: 'TRANSAKSI HARI INI', value: '${d.stats!.todayTxCount}',
                        icon: Icons.swap_horiz_rounded, iconColor: AppColors.primary,
                        iconBgColor: AppColors.infoBg),
                  ],
                ),
                const SizedBox(height: 24),

                // Alerts
                if (d.stats!.lowStockCount > 0) _alertCard(
                  'Stok Rendah', '${d.stats!.lowStockCount} produk perlu restock',
                  Icons.warning_amber_rounded, AppColors.warning, AppColors.warningBg, dark),
                if (d.stats!.deadStockCount > 0) _alertCard(
                  'Dead Stock', '${d.stats!.deadStockCount} produk tidak bergerak',
                  Icons.dangerous_outlined, AppColors.error, AppColors.errorBg, dark),

                // Low stock list
                if (d.lowStockAlerts.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text('PRODUK STOK RENDAH', style: TextStyle(fontSize: 10,
                      fontWeight: FontWeight.w700, letterSpacing: 1.5, color: muted)),
                  const SizedBox(height: 12),
                  ...d.lowStockAlerts.take(5).map((s) => GlassCard(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(children: [
                      Container(width: 40, height: 40,
                        decoration: BoxDecoration(color: AppColors.warningBg,
                            borderRadius: BorderRadius.circular(10)),
                        child: Center(child: Text('${s.quantity}',
                            style: const TextStyle(color: AppColors.warning,
                                fontWeight: FontWeight.w700, fontSize: 14)))),
                      const SizedBox(width: 12),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.productName, style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 13)),
                          Text('${s.productSku} • ${s.warehouseName}',
                              style: TextStyle(fontSize: 11, color: muted)),
                        ])),
                      Text('Min: ${s.minStock}', style: const TextStyle(
                          fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.w600)),
                    ]),
                  )),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _alertCard(String title, String sub, IconData icon, Color c, Color bg, bool dark) {
    return GlassCard(child: Row(children: [
      Container(padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: c, size: 20)),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        Text(sub, style: TextStyle(fontSize: 12,
            color: dark ? AppColors.textSecondary : AppColors.textDarkSecondary)),
      ])),
      const Icon(Icons.chevron_right, color: AppColors.textMuted),
    ]));
  }
}
