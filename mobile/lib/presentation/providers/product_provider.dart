import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/repositories/product_repository.dart';

/// Product list state provider.
class ProductProvider extends ChangeNotifier {
  final ProductRepository _repo;

  ProductProvider({ProductRepository? repo})
      : _repo = repo ?? ProductRepository();

  List<ProductModel> _products = [];
  int _total = 0;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';

  List<ProductModel> get products => _products;
  int get total => _total;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  Future<void> loadProducts({String? search, int limit = 20, int offset = 0}) async {
    _isLoading = true;
    _error = null;
    if (search != null) _searchQuery = search;
    notifyListeners();

    try {
      final result = await _repo.getProducts(
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        limit: limit,
        offset: offset,
      );
      _products = result.items;
      _total = result.total;
    } catch (e) {
      _error = 'Gagal memuat produk';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<ProductModel?> findBySku(String sku) async {
    return await _repo.findBySku(sku);
  }

  void clearSearch() {
    _searchQuery = '';
    loadProducts();
  }
}
