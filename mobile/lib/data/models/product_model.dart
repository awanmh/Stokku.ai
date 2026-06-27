/// Product model matching backend `domain.Product`.
class ProductModel {
  final String id;
  final String sku;
  final String name;
  final String description;
  final String category;
  final String unit;
  final double price;
  final int minStock;
  final int maxStock;
  final String? imageUrl;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  const ProductModel({
    required this.id,
    required this.sku,
    required this.name,
    required this.description,
    required this.category,
    required this.unit,
    required this.price,
    required this.minStock,
    required this.maxStock,
    this.imageUrl,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) => ProductModel(
        id: json['id'] ?? '',
        sku: json['sku'] ?? '',
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        category: json['category'] ?? '',
        unit: json['unit'] ?? 'pcs',
        price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
        minStock: int.tryParse(json['min_stock']?.toString() ?? '0') ?? 0,
        maxStock: int.tryParse(json['max_stock']?.toString() ?? '0') ?? 0,
        imageUrl: json['image_url'],
        isActive: json['is_active'] ?? true,
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'sku': sku,
        'name': name,
        'description': description,
        'category': category,
        'unit': unit,
        'price': price,
        'min_stock': minStock,
        'max_stock': maxStock,
        'image_url': imageUrl,
        'is_active': isActive,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };
}
