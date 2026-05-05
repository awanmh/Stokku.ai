import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../data/repositories/transaction_repository.dart';

/// Sync provider — monitors connectivity and auto-pushes
/// queued offline transactions when the device comes online.
class SyncProvider extends ChangeNotifier {
  final TransactionRepository _txRepo;
  final ConnectivityService _connectivity;
  StreamSubscription<bool>? _sub;

  bool _isSyncing = false;
  int _pendingCount = 0;
  bool _isOnline = true;

  SyncProvider({
    TransactionRepository? txRepo,
    ConnectivityService? connectivity,
  })  : _txRepo = txRepo ?? TransactionRepository(),
        _connectivity = connectivity ?? ConnectivityService.instance {
    _pendingCount = _txRepo.pendingCount;
    _isOnline = _connectivity.isOnline;
    _sub = _connectivity.onConnectivityChanged.listen(_onConnectivityChanged);
  }

  bool get isSyncing => _isSyncing;
  int get pendingCount => _pendingCount;
  bool get isOnline => _isOnline;

  void _onConnectivityChanged(bool online) {
    _isOnline = online;
    notifyListeners();
    if (online && _pendingCount > 0) {
      syncNow();
    }
  }

  /// Manually trigger a sync.
  Future<void> syncNow() async {
    if (_isSyncing || !_isOnline) return;

    _isSyncing = true;
    notifyListeners();

    final synced = await _txRepo.syncPendingTransactions();
    _pendingCount = _txRepo.pendingCount;

    _isSyncing = false;
    notifyListeners();

    if (synced > 0) {
      debugPrint('SyncProvider: Synced $synced transactions');
    }
  }

  void refreshPendingCount() {
    _pendingCount = _txRepo.pendingCount;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
