import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/warehouse_provider.dart';
import '../widgets/glass_card.dart';

class WarehousesScreen extends StatefulWidget {
  const WarehousesScreen({super.key});
  @override
  State<WarehousesScreen> createState() => _WarehousesScreenState();
}

class _WarehousesScreenState extends State<WarehousesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WarehouseProvider>().loadWarehouses();
    });
  }

  @override
  Widget build(BuildContext context) {
    final wh = context.watch<WarehouseProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => wh.loadWarehouses(),
        color: AppColors.cyan,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Gudang',
                  style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 4),
              Text('Lokasi penyimpanan',
                  style: TextStyle(fontSize: 13, color: muted)),
              const SizedBox(height: 16),
              Expanded(
                child: wh.isLoading
                    ? const Center(
                        child:
                            CircularProgressIndicator(color: AppColors.cyan))
                    : wh.warehouses.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.warehouse_outlined, size: 56, color: muted),
                                const SizedBox(height: 12),
                                Text('Tidak ada gudang',
                                    style: TextStyle(color: muted, fontSize: 15, fontWeight: FontWeight.w500)),
                                const SizedBox(height: 4),
                                Text('Tarik ke bawah untuk memuat ulang',
                                    style: TextStyle(color: muted, fontSize: 12)),
                              ],
                            ),
                          )
                        : ListView.builder(
                            itemCount: wh.warehouses.length,
                            itemBuilder: (ctx, i) {
                              final w = wh.warehouses[i];
                              return GlassCard(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 44, height: 44,
                                      decoration: BoxDecoration(
                                        color:
                                            AppColors.indigo.withValues(alpha: 0.1),
                                        borderRadius:
                                            BorderRadius.circular(12),
                                      ),
                                      child: const Icon(
                                          Icons.warehouse_rounded,
                                          color: AppColors.indigo, size: 22),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(w.name,
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 14)),
                                          const SizedBox(height: 2),
                                          if (w.location.isNotEmpty)
                                            Text('📍 ${w.location}',
                                                style: TextStyle(
                                                    fontSize: 12,
                                                    color: muted)),
                                          if (w.address.isNotEmpty)
                                            Text(w.address,
                                                style: TextStyle(
                                                    fontSize: 11,
                                                    color: muted),
                                                maxLines: 1,
                                                overflow:
                                                    TextOverflow.ellipsis),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: w.isActive
                                            ? AppColors.successBg
                                            : AppColors.errorBg,
                                        borderRadius:
                                            BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        w.isActive ? 'Aktif' : 'Nonaktif',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          color: w.isActive
                                              ? AppColors.success
                                              : AppColors.error,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                                  .animate()
                                  .fadeIn(duration: 300.ms, delay: Duration(milliseconds: i * 60))
                                  .slideX(begin: 0.05, end: 0, duration: 300.ms, delay: Duration(milliseconds: i * 60));
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
