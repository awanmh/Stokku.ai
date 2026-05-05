/// Warehouse model matching backend `domain.Warehouse`.
class WarehouseModel {
  final String id;
  final String name;
  final String location;
  final String address;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  const WarehouseModel({
    required this.id,
    required this.name,
    required this.location,
    required this.address,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WarehouseModel.fromJson(Map<String, dynamic> json) => WarehouseModel(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        location: json['location'] ?? '',
        address: json['address'] ?? '',
        isActive: json['is_active'] ?? true,
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'location': location,
        'address': address,
        'is_active': isActive,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };
}
