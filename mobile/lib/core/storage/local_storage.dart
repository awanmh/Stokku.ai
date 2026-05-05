import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Centralised local-storage initialisation and access.
///
/// Uses **Hive** for offline data caching and
/// **flutter_secure_storage** for sensitive values (JWT).
class LocalStorage {
  LocalStorage._();

  static const _secureStorage = FlutterSecureStorage();

  // ── Hive box names ────────────────────────────────────────
  static const String productsBox = 'products';
  static const String warehousesBox = 'warehouses';
  static const String inventoryBox = 'inventory';
  static const String transactionsBox = 'transactions';
  static const String pendingSyncBox = 'pending_sync';
  static const String dashboardBox = 'dashboard';
  static const String userBox = 'user';

  /// Call once in `main()` before `runApp`.
  static Future<void> init() async {
    await Hive.initFlutter();

    // Open all boxes
    await Future.wait([
      Hive.openBox(productsBox),
      Hive.openBox(warehousesBox),
      Hive.openBox(inventoryBox),
      Hive.openBox(transactionsBox),
      Hive.openBox(pendingSyncBox),
      Hive.openBox(dashboardBox),
      Hive.openBox(userBox),
    ]);
  }

  // ── Generic Hive helpers ──────────────────────────────────
  static Box getBox(String name) => Hive.box(name);

  static Future<void> putAll(
      String boxName, Map<String, dynamic> entries) async {
    final box = Hive.box(boxName);
    await box.putAll(entries);
  }

  static Future<void> clearBox(String boxName) async {
    final box = Hive.box(boxName);
    await box.clear();
  }

  // ── Secure storage helpers ────────────────────────────────
  static Future<void> saveSecure(String key, String value) =>
      _secureStorage.write(key: key, value: value);

  static Future<String?> readSecure(String key) =>
      _secureStorage.read(key: key);

  static Future<void> deleteSecure(String key) =>
      _secureStorage.delete(key: key);

  static Future<void> clearSecure() => _secureStorage.deleteAll();

  /// Wipe everything (logout).
  static Future<void> clearAll() async {
    await Future.wait([
      clearBox(productsBox),
      clearBox(warehousesBox),
      clearBox(inventoryBox),
      clearBox(transactionsBox),
      clearBox(pendingSyncBox),
      clearBox(dashboardBox),
      clearBox(userBox),
      clearSecure(),
    ]);
  }
}
