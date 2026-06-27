import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../data/models/stock_model.dart';
import '../widgets/glass_card.dart';

class InventoryDetailScreen extends StatelessWidget {
  final StockModel stock;

  const InventoryDetailScreen({super.key, required this.stock});

  String _fmtPrice(double v) =>
      NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)
          .format(v);

  String _fmtDate(String d) {
    try {
      final date = DateTime.parse(d).toLocal();
      return DateFormat('dd MMM yyyy, HH:mm').format(date);
    } catch (_) {
      return d;
    }
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
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
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
                color: isHighlight ? AppColors.cyan : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isLowStock = stock.isLowStock;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Inventaris'),
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
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.inventory_2_rounded,
                        color: AppColors.primary, size: 36),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    stock.productName,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    stock.productSku,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textMuted,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${stock.quantity}',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
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
                      color: (isLowStock ? AppColors.error : AppColors.success)
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: (isLowStock ? AppColors.error : AppColors.success)
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      isLowStock ? 'Stok Rendah' : 'Stok Aman',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isLowStock ? AppColors.error : AppColors.success,
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
                    'Informasi Tambahan',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Lokasi Gudang', stock.warehouseName),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Harga Satuan', _fmtPrice(stock.price)),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Batas Minimum', '${stock.minStock} unit'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Total Nilai Aset', _fmtPrice(stock.totalValue), isHighlight: true),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Update Terakhir', _fmtDate(stock.updatedAt)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
