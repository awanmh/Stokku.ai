import '../../core/network/connectivity_service.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/stock_model.dart';

/// Inventory repository — offline-first stock levels.
class InventoryRepository {
  final ApiService _api;
  final HiveService _hive;
  final ConnectivityService _connectivity;

  InventoryRepository({
    ApiService? api,
    HiveService? hive,
    ConnectivityService? connectivity,
  })  : _api = api ?? ApiService(),
        _hive = hive ?? HiveService(),
        _connectivity = connectivity ?? ConnectivityService.instance;

  Future<({List<StockModel> items, int total})> getInventory({
    String? warehouseId,
    String? search,
    bool? lowStock,
    int limit = 20,
    int offset = 0,
  }) async {
    if (_connectivity.isOnline) {
      try {
        final result = await _api.getInventory(
          warehouseId: warehouseId,
          search: search,
          lowStock: lowStock,
          limit: limit,
          offset: offset,
        );
        await _hive.cacheList(
          LocalStorage.inventoryBox,
          result.items.map((s) => s.toJson()).toList(),
        );
        return result;
      } catch (_) {
        return _fromCache(search, lowStock);
      }
    }
    return _fromCache(search, lowStock);
  }

  ({List<StockModel> items, int total}) _fromCache(
      String? search, bool? lowStock) {
    var cached = _hive.readAll(LocalStorage.inventoryBox);
    if (search != null && search.isNotEmpty) {
      final q = search.toLowerCase();
      cached = cached.where((item) {
        final name = (item['product_name'] as String? ?? '').toLowerCase();
        final sku = (item['product_sku'] as String? ?? '').toLowerCase();
        return name.contains(q) || sku.contains(q);
      }).toList();
    }
    var items = cached.map((e) => StockModel.fromJson(e)).toList();
    if (lowStock == true) {
      items = items.where((s) => s.isLowStock).toList();
    }
    return (items: items, total: items.length);
  }
}
