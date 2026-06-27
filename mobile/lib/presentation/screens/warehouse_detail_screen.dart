import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../data/models/warehouse_model.dart';
import '../widgets/glass_card.dart';

class WarehouseDetailScreen extends StatelessWidget {
  final WarehouseModel warehouse;

  const WarehouseDetailScreen({super.key, required this.warehouse});

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
                        color: (value == 'Aktif'
                                ? AppColors.success
                                : AppColors.textMuted)
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: (value == 'Aktif'
                                  ? AppColors.success
                                  : AppColors.textMuted)
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        value,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: value == 'Aktif'
                              ? AppColors.success
                              : AppColors.textMuted,
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Gudang'),
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
                      color: AppColors.cyan.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.business_rounded,
                        color: AppColors.cyan, size: 36),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    warehouse.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_on, color: AppColors.textMuted, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        warehouse.location,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
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
                    'Informasi Gudang',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Lokasi / Kota', warehouse.location.isNotEmpty ? warehouse.location : '—'),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Status', warehouse.isActive ? 'Aktif' : 'Nonaktif', isStatus: true),
                  const Divider(color: Colors.white10),
                  _buildInfoRow('Terdaftar', _fmtDate(warehouse.createdAt)),
                  if (warehouse.address.isNotEmpty) ...[
                    const Divider(color: Colors.white10),
                    const Padding(
                      padding: EdgeInsets.only(top: 8, bottom: 4),
                      child: Text(
                        'Alamat Lengkap',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Text(
                      warehouse.address,
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
