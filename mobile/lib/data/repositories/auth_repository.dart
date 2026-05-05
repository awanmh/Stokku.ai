import '../../core/network/api_client.dart';
import '../../core/storage/local_storage.dart';
import '../datasources/remote/api_service.dart';
import '../datasources/local/hive_service.dart';
import '../models/user_model.dart';

/// Authentication repository — handles login, token storage, and profile caching.
class AuthRepository {
  final ApiService _api;
  final HiveService _hive;

  AuthRepository({ApiService? api, HiveService? hive})
      : _api = api ?? ApiService(),
        _hive = hive ?? HiveService();

  /// Login with email + password → save JWT + user to local storage.
  Future<UserModel> login(String email, String password) async {
    final response = await _api.login(email, password);

    // Persist token securely
    await ApiClient.saveToken(response.token);

    // Cache user data in Hive for offline access
    await _hive.cacheByKey(
      LocalStorage.userBox,
      'current_user',
      response.user.toJson(),
    );

    return response.user;
  }

  /// Fetch the current user profile from the API (requires valid JWT).
  Future<UserModel> getProfile() async {
    try {
      final user = await _api.getProfile();
      // Update cached copy
      await _hive.cacheByKey(
        LocalStorage.userBox,
        'current_user',
        user.toJson(),
      );
      return user;
    } catch (_) {
      // Fallback to cached user when offline
      final cached = _hive.readByKey(LocalStorage.userBox, 'current_user');
      if (cached != null) return UserModel.fromJson(cached);
      rethrow;
    }
  }

  /// Read cached user (synchronous, for splash screen).
  UserModel? getCachedUser() {
    final cached = _hive.readByKey(LocalStorage.userBox, 'current_user');
    if (cached != null) return UserModel.fromJson(cached);
    return null;
  }

  /// Check if a valid token exists.
  Future<bool> hasToken() async {
    final token = await ApiClient.getToken();
    return token != null && token.isNotEmpty;
  }

  /// Logout — clear token and all cached data.
  Future<void> logout() async {
    await ApiClient.clearToken();
    ApiClient.reset();
    await LocalStorage.clearAll();
  }
}
