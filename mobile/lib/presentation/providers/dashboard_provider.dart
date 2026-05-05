import 'package:flutter/material.dart';
import '../../../data/models/dashboard_stats_model.dart';
import '../../../data/models/stock_model.dart';
import '../../../data/repositories/dashboard_repository.dart';

/// Dashboard overview state provider.
class DashboardProvider extends ChangeNotifier {
  final DashboardRepository _repo;

  DashboardProvider({DashboardRepository? repo})
      : _repo = repo ?? DashboardRepository();

  DashboardStatsModel? _stats;
  List<StockModel> _lowStockAlerts = [];
  bool _isLoading = false;
  String? _error;

  DashboardStatsModel? get stats => _stats;
  List<StockModel> get lowStockAlerts => _lowStockAlerts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _repo.getStats(),
        _repo.getLowStockAlerts(),
      ]);
      _stats = results[0] as DashboardStatsModel;
      _lowStockAlerts = results[1] as List<StockModel>;
    } catch (e) {
      _error = 'Gagal memuat dashboard';
    }

    _isLoading = false;
    notifyListeners();
  }
}
