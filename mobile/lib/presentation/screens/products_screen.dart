import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/product_provider.dart';
import '../widgets/glass_card.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});
  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  String _fmtPrice(double v) =>
      NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)
          .format(v);

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<ProductProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Produk'),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Text('${prov.total} item',
                  style: TextStyle(fontSize: 12, color: muted)),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => prov.loadProducts(),
        color: AppColors.cyan,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: TextField(
                  controller: _searchCtrl,
                  style: TextStyle(
                      color: dark ? AppColors.textPrimary : AppColors.textDark),
                  decoration: InputDecoration(
                    hintText: 'Cari nama atau SKU...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              prov.clearSearch();
                            })
                        : null,
                  ),
                  onSubmitted: (v) => prov.loadProducts(search: v),
                ),
              ),
            ),
            if (prov.isLoading)
              const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(color: AppColors.cyan)),
              )
            else if (prov.products.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.category_outlined, size: 56, color: muted),
                      const SizedBox(height: 12),
                      Text('Tidak ada produk',
                          style: TextStyle(color: muted, fontSize: 15, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Text('Tarik ke bawah untuk memuat ulang',
                          style: TextStyle(color: muted, fontSize: 12)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList.builder(
                  itemCount: prov.products.length,
                  itemBuilder: (ctx, i) {
                    final p = prov.products[i];
                    return GlassCard(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.cyan.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.category_rounded,
                                color: AppColors.cyan, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(p.name,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14)),
                                const SizedBox(height: 2),
                                Text('${p.sku} • ${p.category}',
                                    style:
                                        TextStyle(fontSize: 11, color: muted)),
                              ],
                            ),
                          ),
                          Text(_fmtPrice(p.price),
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 13)),
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
    );
  }
}
