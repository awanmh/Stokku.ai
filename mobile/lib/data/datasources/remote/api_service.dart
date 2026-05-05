import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../models/user_model.dart';
import '../../models/product_model.dart';
import '../../models/warehouse_model.dart';
import '../../models/transaction_model.dart';
import '../../models/stock_model.dart';
import '../../models/dashboard_stats_model.dart';

/// Remote data source — wraps every backend endpoint.
///
/// All methods unwrap the `{ success, data, message, meta }`
/// envelope and return only the inner `data` payload.
class ApiService {
  final Dio _dio = ApiClient.instance;

  // ════════════════════════════════════════════════════════════
  //  AUTH
  // ════════════════════════════════════════════════════════════

  Future<AuthResponse> login(String email, String password) async {
    final res = await _dio.post(ApiConstants.login, data: {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(_unwrap(res));
  }

  Future<AuthResponse> register({
    required String email,
    required String name,
    required String password,
    String role = 'warehouse_staff',
  }) async {
    final res = await _dio.post(ApiConstants.register, data: {
      'email': email,
      'name': name,
      'password': password,
      'role': role,
    });
    return AuthResponse.fromJson(_unwrap(res));
  }

  Future<UserModel> getProfile() async {
    final res = await _dio.get(ApiConstants.profile);
    return UserModel.fromJson(_unwrap(res));
  }

  // ════════════════════════════════════════════════════════════
  //  PRODUCTS
  // ════════════════════════════════════════════════════════════

  Future<({List<ProductModel> items, int total})> getProducts({
    String? search,
    String? category,
    int limit = 20,
    int offset = 0,
  }) async {
    final res = await _dio.get(ApiConstants.products, queryParameters: {
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category.isNotEmpty) 'category': category,
      'limit': limit,
      'offset': offset,
    });
    final data = _unwrapList(res);
    final items = data.map((e) => ProductModel.fromJson(e)).toList();
    final total = _extractTotal(res);
    return (items: items, total: total);
  }

  Future<ProductModel> getProduct(String id) async {
    final res = await _dio.get('${ApiConstants.products}/$id');
    return ProductModel.fromJson(_unwrap(res));
  }

  // ════════════════════════════════════════════════════════════
  //  WAREHOUSES
  // ════════════════════════════════════════════════════════════

  Future<({List<WarehouseModel> items, int total})> getWarehouses({
    int limit = 50,
    int offset = 0,
  }) async {
    final res = await _dio.get(ApiConstants.warehouses, queryParameters: {
      'limit': limit,
      'offset': offset,
    });
    final data = _unwrapList(res);
    final items = data.map((e) => WarehouseModel.fromJson(e)).toList();
    final total = _extractTotal(res);
    return (items: items, total: total);
  }

  // ════════════════════════════════════════════════════════════
  //  TRANSACTIONS
  // ════════════════════════════════════════════════════════════

  Future<({List<TransactionModel> items, int total})> getTransactions({
    String? warehouseId,
    String? productId,
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    final res = await _dio.get(ApiConstants.transactions, queryParameters: {
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (productId != null) 'product_id': productId,
      if (type != null) 'type': type,
      'limit': limit,
      'offset': offset,
    });
    final data = _unwrapList(res);
    final items = data.map((e) => TransactionModel.fromJson(e)).toList();
    final total = _extractTotal(res);
    return (items: items, total: total);
  }

  Future<TransactionModel> createTransaction({
    required String warehouseId,
    required String productId,
    required String type,
    required int quantity,
    String reference = '',
    String notes = '',
  }) async {
    final res = await _dio.post(ApiConstants.transactions, data: {
      'warehouse_id': warehouseId,
      'product_id': productId,
      'type': type,
      'quantity': quantity,
      'reference': reference,
      'notes': notes,
    });
    return TransactionModel.fromJson(_unwrap(res));
  }

  // ════════════════════════════════════════════════════════════
  //  INVENTORY
  // ════════════════════════════════════════════════════════════

  Future<({List<StockModel> items, int total})> getInventory({
    String? warehouseId,
    String? search,
    bool? lowStock,
    int limit = 20,
    int offset = 0,
  }) async {
    final res = await _dio.get(ApiConstants.inventory, queryParameters: {
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (search != null && search.isNotEmpty) 'search': search,
      if (lowStock == true) 'low_stock': true,
      'limit': limit,
      'offset': offset,
    });
    final data = _unwrapList(res);
    final items = data.map((e) => StockModel.fromJson(e)).toList();
    final total = _extractTotal(res);
    return (items: items, total: total);
  }

  // ════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ════════════════════════════════════════════════════════════

  Future<DashboardStatsModel> getDashboardStats() async {
    final res = await _dio.get(ApiConstants.dashboardStats);
    return DashboardStatsModel.fromJson(_unwrap(res));
  }

  Future<List<StockModel>> getLowStockAlerts({int limit = 10}) async {
    final res = await _dio.get(ApiConstants.lowStockAlerts, queryParameters: {
      'limit': limit,
    });
    return _unwrapList(res).map((e) => StockModel.fromJson(e)).toList();
  }

  Future<List<StockModel>> getDeadStockAlerts({int limit = 10}) async {
    final res = await _dio.get(ApiConstants.deadStockAlerts, queryParameters: {
      'limit': limit,
    });
    return _unwrapList(res).map((e) => StockModel.fromJson(e)).toList();
  }

  // ════════════════════════════════════════════════════════════
  //  HEALTH
  // ════════════════════════════════════════════════════════════

  Future<bool> healthCheck() async {
    try {
      final res = await _dio.get(ApiConstants.health);
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════

  /// Unwrap the standard `{ success, data }` envelope.
  Map<String, dynamic> _unwrap(Response res) {
    final body = res.data as Map<String, dynamic>;
    if (body['success'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        message: body['message'] ?? 'Unknown API error',
      );
    }
    return body['data'] as Map<String, dynamic>? ?? {};
  }

  /// Unwrap for list responses.
  List<Map<String, dynamic>> _unwrapList(Response res) {
    final body = res.data as Map<String, dynamic>;
    if (body['success'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        message: body['message'] ?? 'Unknown API error',
      );
    }
    final data = body['data'];
    if (data == null) return [];
    return (data as List).cast<Map<String, dynamic>>();
  }

  /// Extract total count from meta for pagination.
  int _extractTotal(Response res) {
    final body = res.data as Map<String, dynamic>;
    final meta = body['meta'] as Map<String, dynamic>?;
    return meta?['total'] ?? 0;
  }
}
