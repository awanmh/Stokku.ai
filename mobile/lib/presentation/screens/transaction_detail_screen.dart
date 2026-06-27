import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../data/models/transaction_model.dart';
import '../widgets/glass_card.dart';

class TransactionDetailScreen extends StatelessWidget {
  final TransactionModel tx;

  const TransactionDetailScreen({super.key, required this.tx});

  String _fmtDate(String d) {
    try {
      final date = DateTime.parse(d).toLocal();
      return DateFormat('dd MMM yyyy, HH:mm').format(date);
    } catch (_) {
      return d;
    }
  }

  Widget _buildInfoRow(String label, String value, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: isStatus
                ? Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: (tx.isStockIn
                                ? AppColors.success
                                : AppColors.error)
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: (tx.isStockIn
                                  ? AppColors.success
                                  : AppColors.error)
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        tx.isStockIn ? 'Barang Masuk' : 'Barang Keluar',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: tx.isStockIn
                              ? AppColors.success
                              : AppColors.error,
                        ),
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isIn = tx.isStockIn;
    final Color color = isIn ? AppColors.success : AppColors.error;
    final IconData icon = isIn ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Transaksi'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Header Card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: color, size: 36),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${isIn ? '+' : '-'}${tx.quantity}',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'unit',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: color.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      isIn ? 'Barang Masuk' : 'Barang Keluar',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            
            // Details Card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Informasi Transaksi',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Produk', tx.productName ?? '-'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('SKU', tx.productSku ?? '-'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Gudang', tx.warehouseName ?? '-'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Tipe', '', isStatus: true),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Referensi', tx.reference.isNotEmpty ? tx.reference : '-'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Operator', tx.performerName ?? '-'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Waktu Transaksi', _fmtDate(tx.createdAt)),
                  if (tx.notes.isNotEmpty) ...[
                    const Divider(color: Colors.white10),
                    const Padding(
                      padding: EdgeInsets.only(top: 8, bottom: 4),
                      child: Text(
                        'Catatan',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Text(
                      tx.notes,
                      style: const TextStyle(
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
