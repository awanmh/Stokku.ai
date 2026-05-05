import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

/// Dio HTTP client with JWT interceptor and automatic 401 handling.
///
/// Usage:
///   final dio = ApiClient.instance;
///   final response = await dio.get(ApiConstants.products);
class ApiClient {
  ApiClient._();

  static Dio? _dio;
  static const _storage = FlutterSecureStorage();

  /// Callback set by [AuthProvider] so the network layer can
  /// trigger a logout when a 401 is received.
  static Future<void> Function()? onUnauthorized;

  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // ── Request Interceptor: inject JWT ──────────────────────
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired or invalid — clear & redirect to login
            await _storage.delete(key: 'jwt_token');
            onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );

    return dio;
  }

  // ── Token helpers ─────────────────────────────────────────
  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<String?> getToken() async {
    return _storage.read(key: 'jwt_token');
  }

  static Future<void> clearToken() async {
    await _storage.delete(key: 'jwt_token');
  }

  /// Reset the Dio singleton (e.g. after logout).
  static void reset() {
    _dio?.close();
    _dio = null;
  }
}
