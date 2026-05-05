/// Transaction model matching backend `domain.TransactionView`.
class TransactionModel {
  final String id;
  final String warehouseId;
  final String productId;
  final String type; // stock_in | stock_out
  final int quantity;
  final String reference;
  final String notes;
  final String performedBy;
  final String createdAt;

  // Joined fields from TransactionView
  final String? productName;
  final String? productSku;
  final String? warehouseName;
  final String? performerName;

  // Offline sync tracking
  final bool synced;

  const TransactionModel({
    required this.id,
    required this.warehouseId,
    required this.productId,
    required this.type,
    required this.quantity,
    required this.reference,
    required this.notes,
    required this.performedBy,
    required this.createdAt,
    this.productName,
    this.productSku,
    this.warehouseName,
    this.performerName,
    this.synced = true,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) =>
      TransactionModel(
        id: json['id'] ?? '',
        warehouseId: json['warehouse_id'] ?? '',
        productId: json['product_id'] ?? '',
        type: json['type'] ?? 'stock_in',
        quantity: json['quantity'] ?? 0,
        reference: json['reference'] ?? '',
        notes: json['notes'] ?? '',
        performedBy: json['performed_by'] ?? '',
        createdAt: json['created_at'] ?? '',
        productName: json['product_name'],
        productSku: json['product_sku'],
        warehouseName: json['warehouse_name'],
        performerName: json['performer_name'],
        synced: json['synced'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'warehouse_id': warehouseId,
        'product_id': productId,
        'type': type,
        'quantity': quantity,
        'reference': reference,
        'notes': notes,
        'performed_by': performedBy,
        'created_at': createdAt,
        'product_name': productName,
        'product_sku': productSku,
        'warehouse_name': warehouseName,
        'performer_name': performerName,
        'synced': synced,
      };

  /// Payload for POST /transactions (only fields the API expects).
  Map<String, dynamic> toCreatePayload() => {
        'warehouse_id': warehouseId,
        'product_id': productId,
        'type': type,
        'quantity': quantity,
        'reference': reference,
        'notes': notes,
      };

  bool get isStockIn => type == 'stock_in';
  bool get isStockOut => type == 'stock_out';
}
