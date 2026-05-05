import 'package:flutter/material.dart';
import '../../../data/models/warehouse_model.dart';
import '../../../data/repositories/warehouse_repository.dart';

class WarehouseProvider extends ChangeNotifier {
  final WarehouseRepository _repo;

  WarehouseProvider({WarehouseRepository? repo})
      : _repo = repo ?? WarehouseRepository();

  List<WarehouseModel> _warehouses = [];
  int _total = 0;
  bool _isLoading = false;
  String? _error;

  List<WarehouseModel> get warehouses => _warehouses;
  int get total => _total;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadWarehouses() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _repo.getWarehouses();
      _warehouses = result.items;
      _total = result.total;
    } catch (e) {
      _error = 'Gagal memuat gudang';
    }

    _isLoading = false;
    notifyListeners();
  }
}
