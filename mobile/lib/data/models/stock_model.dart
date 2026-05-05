/// Stock / Inventory model matching backend `domain.StockView`.
class StockModel {
  final String id;
  final String warehouseId;
  final String productId;
  final int quantity;
  final String updatedAt;

  // Joined fields
  final String productName;
  final String productSku;
  final String warehouseName;
  final double price;
  final int minStock;
  final double totalValue;

  const StockModel({
    required this.id,
    required this.warehouseId,
    required this.productId,
    required this.quantity,
    required this.updatedAt,
    required this.productName,
    required this.productSku,
    required this.warehouseName,
    required this.price,
    required this.minStock,
    required this.totalValue,
  });

  factory StockModel.fromJson(Map<String, dynamic> json) => StockModel(
        id: json['id'] ?? '',
        warehouseId: json['warehouse_id'] ?? '',
        productId: json['product_id'] ?? '',
        quantity: json['quantity'] ?? 0,
        updatedAt: json['updated_at'] ?? '',
        productName: json['product_name'] ?? '',
        productSku: json['product_sku'] ?? '',
        warehouseName: json['warehouse_name'] ?? '',
        price: (json['price'] ?? 0).toDouble(),
        minStock: json['min_stock'] ?? 0,
        totalValue: (json['total_value'] ?? 0).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'warehouse_id': warehouseId,
        'product_id': productId,
        'quantity': quantity,
        'updated_at': updatedAt,
        'product_name': productName,
        'product_sku': productSku,
        'warehouse_name': warehouseName,
        'price': price,
        'min_stock': minStock,
        'total_value': totalValue,
      };

  bool get isLowStock => quantity <= minStock && minStock > 0;
  bool get isHealthy => !isLowStock;
}
