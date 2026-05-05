import '../../core/network/connectivity_service.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/warehouse_model.dart';

/// Warehouse repository — offline-first read with cache.
class WarehouseRepository {
  final ApiService _api;
  final HiveService _hive;
  final ConnectivityService _connectivity;

  WarehouseRepository({
    ApiService? api,
    HiveService? hive,
    ConnectivityService? connectivity,
  })  : _api = api ?? ApiService(),
        _hive = hive ?? HiveService(),
        _connectivity = connectivity ?? ConnectivityService.instance;

  Future<({List<WarehouseModel> items, int total})> getWarehouses({
    int limit = 50,
    int offset = 0,
  }) async {
    if (_connectivity.isOnline) {
      try {
        final result = await _api.getWarehouses(limit: limit, offset: offset);
        await _hive.cacheList(
          LocalStorage.warehousesBox,
          result.items.map((w) => w.toJson()).toList(),
        );
        return result;
      } catch (_) {
        return _fromCache();
      }
    }
    return _fromCache();
  }

  ({List<WarehouseModel> items, int total}) _fromCache() {
    final cached = _hive.readAll(LocalStorage.warehousesBox);
    final items = cached.map((e) => WarehouseModel.fromJson(e)).toList();
    return (items: items, total: items.length);
  }
}
