import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/inventory_provider.dart';
import '../widgets/glass_card.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});
  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InventoryProvider>().loadInventory();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final inv = context.watch<InventoryProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => inv.loadInventory(),
        color: AppColors.cyan,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Inventaris',
                        style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    Text('Stok per gudang',
                        style: TextStyle(fontSize: 13, color: muted)),
                    const SizedBox(height: 16),

                    // Search bar
                    TextField(
                      controller: _searchCtrl,
                      style: TextStyle(
                          color: dark ? AppColors.textPrimary : AppColors.textDark),
                      decoration: InputDecoration(
                        hintText: 'Cari produk / SKU...',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        suffixIcon: _searchCtrl.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close, size: 18),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  inv.loadInventory(search: '');
                                })
                            : null,
                      ),
                      onSubmitted: (v) => inv.loadInventory(search: v),
                    ),
                    const SizedBox(height: 12),

                    // Filter chip
                    Row(children: [
                      FilterChip(
                        label: const Text('Stok Rendah'),
                        selected: inv.lowStockOnly,
                        selectedColor: AppColors.warningBg,
                        checkmarkColor: AppColors.warning,
                        onSelected: (_) => inv.toggleLowStockFilter(),
                      ),
                      const Spacer(),
                      Text('${inv.stocks.length} item',
                          style: TextStyle(fontSize: 12, color: muted)),
                    ]),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),

            if (inv.isLoading)
              const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(color: AppColors.cyan)),
              )
            else if (inv.stocks.isEmpty)
              SliverFillRemaining(
                child: Center(
                    child: Text('Tidak ada data inventaris',
                        style: TextStyle(color: muted))),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList.builder(
                  itemCount: inv.stocks.length,
                  itemBuilder: (ctx, i) {
                    final s = inv.stocks[i];
                    return GlassCard(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          // Quantity badge
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: s.isLowStock
                                  ? AppColors.warningBg
                                  : AppColors.successBg,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                                child: Text('${s.quantity}',
                                    style: TextStyle(
                                      color: s.isLowStock
                                          ? AppColors.warning
                                          : AppColors.success,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15,
                                    ))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s.productName,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14)),
                                const SizedBox(height: 2),
                                Text('${s.productSku} • ${s.warehouseName}',
                                    style:
                                        TextStyle(fontSize: 11, color: muted)),
                              ],
                            ),
                          ),
                          // Status badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: s.isLowStock
                                  ? AppColors.warningBg
                                  : AppColors.successBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              s.isLowStock ? 'Low' : 'OK',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: s.isLowStock
                                    ? AppColors.warning
                                    : AppColors.success,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
