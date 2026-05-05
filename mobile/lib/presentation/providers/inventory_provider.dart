import 'package:flutter/material.dart';
import '../../../data/models/stock_model.dart';
import '../../../data/repositories/inventory_repository.dart';

class InventoryProvider extends ChangeNotifier {
  final InventoryRepository _repo;

  InventoryProvider({InventoryRepository? repo})
      : _repo = repo ?? InventoryRepository();

  List<StockModel> _stocks = [];
  int _total = 0;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  bool _lowStockOnly = false;

  List<StockModel> get stocks => _stocks;
  int get total => _total;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get lowStockOnly => _lowStockOnly;

  Future<void> loadInventory({
    String? warehouseId,
    String? search,
    bool? lowStock,
    int limit = 20,
    int offset = 0,
  }) async {
    _isLoading = true;
    _error = null;
    if (search != null) _searchQuery = search;
    if (lowStock != null) _lowStockOnly = lowStock;
    notifyListeners();

    try {
      final result = await _repo.getInventory(
        warehouseId: warehouseId,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        lowStock: _lowStockOnly ? true : null,
        limit: limit,
        offset: offset,
      );
      _stocks = result.items;
      _total = result.total;
    } catch (e) {
      _error = 'Gagal memuat inventaris';
    }

    _isLoading = false;
    notifyListeners();
  }

  void toggleLowStockFilter() {
    _lowStockOnly = !_lowStockOnly;
    loadInventory();
  }
}
