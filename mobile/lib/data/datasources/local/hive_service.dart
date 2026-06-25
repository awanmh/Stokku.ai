import 'dart:convert';
import '../../../core/storage/local_storage.dart';

/// Local data source for offline caching via Hive.
///
/// Stores JSON maps keyed by entity ID for quick lookups.
class HiveService {
  // ── Generic CRUD ──────────────────────────────────────────

  /// Save a list of items keyed by their `id` field.
  Future<void> cacheList(String boxName, List<Map<String, dynamic>> items) async {
    final box = LocalStorage.getBox(boxName);
    final entries = <String, dynamic>{};
    for (final item in items) {
      final id = item['id'] as String? ?? '';
      if (id.isNotEmpty) {
        entries[id] = jsonEncode(item);
      }
    }
    await box.putAll(entries);
  }

  /// Save a single item keyed by its `id`.
  Future<void> cacheSingle(String boxName, Map<String, dynamic> item) async {
    final box = LocalStorage.getBox(boxName);
    final id = item['id'] as String? ?? '';
    if (id.isNotEmpty) {
      await box.put(id, jsonEncode(item));
    }
  }

  /// Save with a custom key (e.g. 'stats' for dashboard).
  Future<void> cacheByKey(String boxName, String key, Map<String, dynamic> data) async {
    final box = LocalStorage.getBox(boxName);
    await box.put(key, jsonEncode(data));
  }

  /// Read all items from a box as decoded JSON maps.
  List<Map<String, dynamic>> readAll(String boxName) {
    final box = LocalStorage.getBox(boxName);
    return box.values.map((raw) {
      if (raw is String) {
        return jsonDecode(raw) as Map<String, dynamic>;
      }
      return <String, dynamic>{};
    }).toList();
  }

  /// Read a single item by ID.
  Map<String, dynamic>? readById(String boxName, String id) {
    final box = LocalStorage.getBox(boxName);
    final raw = box.get(id);
    if (raw is String) {
      return jsonDecode(raw) as Map<String, dynamic>;
    }
    return null;
  }

  /// Read by custom key.
  Map<String, dynamic>? readByKey(String boxName, String key) {
    final box = LocalStorage.getBox(boxName);
    final raw = box.get(key);
    if (raw is String) {
      return jsonDecode(raw) as Map<String, dynamic>;
    }
    return null;
  }

  /// Delete a single item by ID.
  Future<void> deleteById(String boxName, String id) async {
    final box = LocalStorage.getBox(boxName);
    await box.delete(id);
  }

  /// Clear all data in a box.
  Future<void> clearBox(String boxName) async {
    final box = LocalStorage.getBox(boxName);
    await box.clear();
  }

  // ── Pending Sync Queue ────────────────────────────────────

  /// Add a transaction to the sync queue (offline-created).
  Future<void> addPendingTransaction(Map<String, dynamic> tx) async {
    final box = LocalStorage.getBox(LocalStorage.pendingSyncBox);
    final id = tx['id'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString();
    await box.put(id, jsonEncode(tx));
  }

  /// Get all pending (unsynced) transactions.
  List<Map<String, dynamic>> getPendingTransactions() {
    return readAll(LocalStorage.pendingSyncBox);
  }

  /// Remove a synced transaction from the queue.
  Future<void> removePendingTransaction(String id) async {
    await deleteById(LocalStorage.pendingSyncBox, id);
  }

  /// Number of items waiting to sync.
  int get pendingCount {
    final box = LocalStorage.getBox(LocalStorage.pendingSyncBox);
    return box.length;
  }
}
