import '../../core/network/connectivity_service.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/product_model.dart';

/// Product repository — offline-first read with cache fallback.
class ProductRepository {
  final ApiService _api;
  final HiveService _hive;
  final ConnectivityService _connectivity;

  ProductRepository({
    ApiService? api,
    HiveService? hive,
    ConnectivityService? connectivity,
  })  : _api = api ?? ApiService(),
        _hive = hive ?? HiveService(),
        _connectivity = connectivity ?? ConnectivityService.instance;

  /// Fetch products from API (if online) or Hive cache (if offline).
  Future<({List<ProductModel> items, int total})> getProducts({
    String? search,
    String? category,
    int limit = 20,
    int offset = 0,
  }) async {
    if (_connectivity.isOnline) {
      try {
        final result = await _api.getProducts(
          search: search,
          category: category,
          limit: limit,
          offset: offset,
        );
        // Cache the fetched products
        await _hive.cacheList(
          LocalStorage.productsBox,
          result.items.map((p) => p.toJson()).toList(),
        );
        return result;
      } catch (_) {
        return _fromCache(search);
      }
    }
    return _fromCache(search);
  }

  /// Lookup a product by SKU (for barcode scanning).
  Future<ProductModel?> findBySku(String sku) async {
    if (_connectivity.isOnline) {
      try {
        final result = await _api.getProducts(search: sku, limit: 1);
        if (result.items.isNotEmpty) {
          return result.items.first;
        }
      } catch (_) {
        // Fall through to cache
      }
    }
    // Offline: search cached products
    final cached = _hive.readAll(LocalStorage.productsBox);
    for (final item in cached) {
      if ((item['sku'] as String? ?? '').toLowerCase() == sku.toLowerCase()) {
        return ProductModel.fromJson(item);
      }
    }
    return null;
  }

  Future<ProductModel> getProduct(String id) async {
    if (_connectivity.isOnline) {
      try {
        final product = await _api.getProduct(id);
        await _hive.cacheSingle(LocalStorage.productsBox, product.toJson());
        return product;
      } catch (_) {
        // Fall through
      }
    }
    final cached = _hive.readById(LocalStorage.productsBox, id);
    if (cached != null) return ProductModel.fromJson(cached);
    throw Exception('Product not found in cache');
  }

  ({List<ProductModel> items, int total}) _fromCache(String? search) {
    var cached = _hive.readAll(LocalStorage.productsBox);
    if (search != null && search.isNotEmpty) {
      final q = search.toLowerCase();
      cached = cached.where((item) {
        final name = (item['name'] as String? ?? '').toLowerCase();
        final sku = (item['sku'] as String? ?? '').toLowerCase();
        return name.contains(q) || sku.contains(q);
      }).toList();
    }
    final items = cached.map((e) => ProductModel.fromJson(e)).toList();
    return (items: items, total: items.length);
  }
}
