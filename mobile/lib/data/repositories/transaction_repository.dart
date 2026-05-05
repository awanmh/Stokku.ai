import 'package:uuid/uuid.dart';
import '../../core/network/connectivity_service.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/transaction_model.dart';

/// Transaction repository — offline-first with sync queue.
///
/// If the device is offline, transactions are queued locally
/// and pushed to the API when connectivity is restored.
class TransactionRepository {
  final ApiService _api;
  final HiveService _hive;
  final ConnectivityService _connectivity;
  static const _uuid = Uuid();

  TransactionRepository({
    ApiService? api,
    HiveService? hive,
    ConnectivityService? connectivity,
  })  : _api = api ?? ApiService(),
        _hive = hive ?? HiveService(),
        _connectivity = connectivity ?? ConnectivityService.instance;

  /// Fetch transaction history.
  Future<({List<TransactionModel> items, int total})> getTransactions({
    String? warehouseId,
    String? productId,
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    if (_connectivity.isOnline) {
      try {
        final result = await _api.getTransactions(
          warehouseId: warehouseId,
          productId: productId,
          type: type,
          limit: limit,
          offset: offset,
        );
        await _hive.cacheList(
          LocalStorage.transactionsBox,
          result.items.map((t) => t.toJson()).toList(),
        );
        return result;
      } catch (_) {
        return _fromCache();
      }
    }
    return _fromCache();
  }

  /// Create a transaction (stock in / stock out).
  /// If offline, queues it for later sync.
  Future<TransactionModel> createTransaction({
    required String warehouseId,
    required String productId,
    required String type,
    required int quantity,
    String reference = '',
    String notes = '',
  }) async {
    if (_connectivity.isOnline) {
      try {
        final tx = await _api.createTransaction(
          warehouseId: warehouseId,
          productId: productId,
          type: type,
          quantity: quantity,
          reference: reference,
          notes: notes,
        );
        await _hive.cacheSingle(LocalStorage.transactionsBox, tx.toJson());
        return tx;
      } catch (_) {
        // API call failed — queue offline
        return _queueOffline(
          warehouseId: warehouseId,
          productId: productId,
          type: type,
          quantity: quantity,
          reference: reference,
          notes: notes,
        );
      }
    }

    return _queueOffline(
      warehouseId: warehouseId,
      productId: productId,
      type: type,
      quantity: quantity,
      reference: reference,
      notes: notes,
    );
  }

  /// Push all pending offline transactions to the API.
  /// Returns the number of successfully synced items.
  Future<int> syncPendingTransactions() async {
    if (!_connectivity.isOnline) return 0;

    final pending = _hive.getPendingTransactions();
    int synced = 0;

    for (final txData in pending) {
      try {
        await _api.createTransaction(
          warehouseId: txData['warehouse_id'] ?? '',
          productId: txData['product_id'] ?? '',
          type: txData['type'] ?? 'stock_in',
          quantity: txData['quantity'] ?? 0,
          reference: txData['reference'] ?? '',
          notes: txData['notes'] ?? '',
        );
        await _hive.removePendingTransaction(txData['id'] ?? '');
        synced++;
      } catch (_) {
        // Skip failed items — will retry next sync cycle
      }
    }

    return synced;
  }

  int get pendingCount => _hive.pendingCount;

  TransactionModel _queueOffline({
    required String warehouseId,
    required String productId,
    required String type,
    required int quantity,
    String reference = '',
    String notes = '',
  }) {
    final tx = TransactionModel(
      id: _uuid.v4(),
      warehouseId: warehouseId,
      productId: productId,
      type: type,
      quantity: quantity,
      reference: reference,
      notes: notes,
      performedBy: '',
      createdAt: DateTime.now().toIso8601String(),
      synced: false,
    );
    _hive.addPendingTransaction(tx.toJson());
    return tx;
  }

  ({List<TransactionModel> items, int total}) _fromCache() {
    final cached = _hive.readAll(LocalStorage.transactionsBox);
    final items = cached.map((e) => TransactionModel.fromJson(e)).toList();
    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return (items: items, total: items.length);
  }
}
