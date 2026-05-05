import '../../core/network/connectivity_service.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/dashboard_stats_model.dart';
import '../models/stock_model.dart';

/// Dashboard repository — offline-first stats and alerts.
class DashboardRepository {
  final ApiService _api;
  final HiveService _hive;
  final ConnectivityService _connectivity;

  DashboardRepository({
    ApiService? api,
    HiveService? hive,
    ConnectivityService? connectivity,
  })  : _api = api ?? ApiService(),
        _hive = hive ?? HiveService(),
        _connectivity = connectivity ?? ConnectivityService.instance;

  Future<DashboardStatsModel> getStats() async {
    if (_connectivity.isOnline) {
      try {
        final stats = await _api.getDashboardStats();
        await _hive.cacheByKey(
          LocalStorage.dashboardBox,
          'stats',
          stats.toJson(),
        );
        return stats;
      } catch (_) {
        return _cachedStats();
      }
    }
    return _cachedStats();
  }

  Future<List<StockModel>> getLowStockAlerts({int limit = 10}) async {
    if (_connectivity.isOnline) {
      try {
        return await _api.getLowStockAlerts(limit: limit);
      } catch (_) {
        return [];
      }
    }
    return [];
  }

  DashboardStatsModel _cachedStats() {
    final cached = _hive.readByKey(LocalStorage.dashboardBox, 'stats');
    if (cached != null) return DashboardStatsModel.fromJson(cached);
    return const DashboardStatsModel(
      totalProducts: 0,
      totalWarehouses: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      deadStockCount: 0,
      todayTxCount: 0,
    );
  }
}
