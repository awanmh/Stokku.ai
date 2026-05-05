import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

/// Sync status indicator — shows pending count and sync state.
class SyncIndicator extends StatelessWidget {
  final bool isOnline;
  final int pendingCount;
  final bool isSyncing;
  final VoidCallback? onTap;

  const SyncIndicator({
    super.key,
    required this.isOnline,
    required this.pendingCount,
    this.isSyncing = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (pendingCount == 0 && isOnline) return const SizedBox.shrink();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isOnline
              ? AppColors.warningBg
              : AppColors.errorBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isOnline
                ? AppColors.warning.withOpacity(0.3)
                : AppColors.error.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isSyncing)
              const SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                  strokeWidth: 1.5,
                  color: AppColors.warning,
                ),
              )
            else
              Icon(
                isOnline ? Icons.sync : Icons.cloud_off_rounded,
                size: 14,
                color: isOnline ? AppColors.warning : AppColors.error,
              ),
            const SizedBox(width: 6),
            Text(
              isOnline
                  ? '$pendingCount menunggu sinkronisasi'
                  : 'Mode Offline',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isOnline ? AppColors.warning : AppColors.error,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
