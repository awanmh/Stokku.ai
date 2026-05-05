import 'package:flutter/material.dart';
import '../../../data/models/transaction_model.dart';
import '../../../data/repositories/transaction_repository.dart';

/// Transaction state provider with offline-first create.
class TransactionProvider extends ChangeNotifier {
  final TransactionRepository _repo;

  TransactionProvider({TransactionRepository? repo})
      : _repo = repo ?? TransactionRepository();

  List<TransactionModel> _transactions = [];
  int _total = 0;
  bool _isLoading = false;
  bool _isCreating = false;
  String? _error;

  List<TransactionModel> get transactions => _transactions;
  int get total => _total;
  bool get isLoading => _isLoading;
  bool get isCreating => _isCreating;
  String? get error => _error;
  int get pendingCount => _repo.pendingCount;

  Future<void> loadTransactions({
    String? warehouseId,
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _repo.getTransactions(
        warehouseId: warehouseId,
        type: type,
        limit: limit,
        offset: offset,
      );
      _transactions = result.items;
      _total = result.total;
    } catch (e) {
      _error = 'Gagal memuat transaksi';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<TransactionModel?> createTransaction({
    required String warehouseId,
    required String productId,
    required String type,
    required int quantity,
    String reference = '',
    String notes = '',
  }) async {
    _isCreating = true;
    _error = null;
    notifyListeners();

    try {
      final tx = await _repo.createTransaction(
        warehouseId: warehouseId,
        productId: productId,
        type: type,
        quantity: quantity,
        reference: reference,
        notes: notes,
      );
      // Prepend to local list
      _transactions.insert(0, tx);
      _isCreating = false;
      notifyListeners();
      return tx;
    } catch (e) {
      _error = 'Gagal membuat transaksi';
      _isCreating = false;
      notifyListeners();
      return null;
    }
  }
}
