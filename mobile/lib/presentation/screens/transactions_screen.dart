import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/transaction_provider.dart';
import '../widgets/glass_card.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});
  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionProvider>().loadTransactions();
    });
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(dt);
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tx = context.watch<TransactionProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final muted = dark ? AppColors.textMuted : AppColors.textDarkSecondary;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => tx.loadTransactions(),
        color: AppColors.cyan,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Transaksi',
                        style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    Text('Riwayat mutasi stok',
                        style: TextStyle(fontSize: 13, color: muted)),
                    if (tx.pendingCount > 0) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.warningBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${tx.pendingCount} transaksi menunggu sinkronisasi',
                          style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.warning),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (tx.isLoading)
              const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(color: AppColors.cyan)),
              )
            else if (tx.transactions.isEmpty)
              SliverFillRemaining(
                child: Center(
                    child: Text('Belum ada transaksi',
                        style: TextStyle(color: muted))),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList.builder(
                  itemCount: tx.transactions.length,
                  itemBuilder: (ctx, i) {
                    final t = tx.transactions[i];
                    final isIn = t.isStockIn;
                    return GlassCard(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: isIn
                                  ? AppColors.successBg
                                  : AppColors.errorBg,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isIn
                                  ? Icons.arrow_downward_rounded
                                  : Icons.arrow_upward_rounded,
                              color:
                                  isIn ? AppColors.success : AppColors.error,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  t.productName ?? 'Unknown Product',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${t.warehouseName ?? ''} • ${_fmtDate(t.createdAt)}',
                                  style:
                                      TextStyle(fontSize: 11, color: muted),
                                ),
                                if (!t.synced)
                                  const Text('⏳ Menunggu sync',
                                      style: TextStyle(
                                          fontSize: 10,
                                          color: AppColors.warning)),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${isIn ? '+' : '-'}${t.quantity}',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                  color: isIn
                                      ? AppColors.success
                                      : AppColors.error,
                                ),
                              ),
                              Text(
                                isIn ? 'Stock In' : 'Stock Out',
                                style: TextStyle(fontSize: 10, color: muted),
                              ),
                            ],
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
