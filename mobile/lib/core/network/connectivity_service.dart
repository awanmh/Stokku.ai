import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Reactive connectivity monitor.
///
/// Provides a [Stream<bool>] that emits `true` when online
/// and `false` when offline. Also exposes a synchronous
/// [isOnline] getter for one-shot checks.
class ConnectivityService {
  ConnectivityService._();
  static final ConnectivityService _instance = ConnectivityService._();
  static ConnectivityService get instance => _instance;

  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  bool _isOnline = true;
  bool get isOnline => _isOnline;
  Stream<bool> get onConnectivityChanged => _controller.stream;

  /// Call once during app initialisation.
  Future<void> init() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = _mapResult(result);
    _connectivity.onConnectivityChanged.listen((result) {
      _isOnline = _mapResult(result);
      _controller.add(_isOnline);
    });
  }

  bool _mapResult(List<ConnectivityResult> result) {
    return result.any((r) =>
        r == ConnectivityResult.wifi ||
        r == ConnectivityResult.mobile ||
        r == ConnectivityResult.ethernet);
  }

  void dispose() {
    _controller.close();
  }
}
