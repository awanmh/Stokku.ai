import 'package:flutter/material.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../core/network/api_client.dart';

/// Authentication state provider.
///
/// Manages login, logout, profile, and auto-logout on 401.
class AuthProvider extends ChangeNotifier {
  final AuthRepository _repo;

  AuthProvider({AuthRepository? repo}) : _repo = repo ?? AuthRepository() {
    // Wire up 401 auto-logout
    ApiClient.onUnauthorized = _handleUnauthorized;
  }

  UserModel? _user;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;

  /// Check if a valid session exists (splash screen).
  Future<bool> tryAutoLogin() async {
    final hasToken = await _repo.hasToken();
    if (!hasToken) return false;

    try {
      _user = await _repo.getProfile();
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (_) {
      // Try cached user as fallback
      _user = _repo.getCachedUser();
      _isAuthenticated = _user != null;
      notifyListeners();
      return _isAuthenticated;
    }
  }

  /// Login with credentials.
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _repo.login(email, password);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = _extractError(e);
      notifyListeners();
      return false;
    }
  }

  /// Refresh profile from API.
  Future<void> refreshProfile() async {
    try {
      _user = await _repo.getProfile();
      notifyListeners();
    } catch (_) {
      // Keep existing cached user
    }
  }

  /// Logout — clear everything.
  Future<void> logout() async {
    await _repo.logout();
    _user = null;
    _isAuthenticated = false;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> _handleUnauthorized() async {
    await logout();
  }

  String _extractError(dynamic e) {
    if (e.toString().contains('401')) return 'Email atau password salah';
    if (e.toString().contains('SocketException') ||
        e.toString().contains('Connection')) {
      return 'Tidak dapat terhubung ke server';
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}
