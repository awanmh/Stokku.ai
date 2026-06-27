/// Dashboard statistics matching backend `domain.DashboardStats`.
class DashboardStatsModel {
  final int totalProducts;
  final int totalWarehouses;
  final double totalStockValue;
  final int lowStockCount;
  final int deadStockCount;
  final int todayTxCount;

  const DashboardStatsModel({
    required this.totalProducts,
    required this.totalWarehouses,
    required this.totalStockValue,
    required this.lowStockCount,
    required this.deadStockCount,
    required this.todayTxCount,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) =>
      DashboardStatsModel(
        totalProducts: int.tryParse(json['total_products']?.toString() ?? '0') ?? 0,
        totalWarehouses: int.tryParse(json['total_warehouses']?.toString() ?? '0') ?? 0,
        totalStockValue: double.tryParse(json['total_stock_value']?.toString() ?? '0') ?? 0.0,
        lowStockCount: int.tryParse(json['low_stock_count']?.toString() ?? '0') ?? 0,
        deadStockCount: int.tryParse(json['dead_stock_count']?.toString() ?? '0') ?? 0,
        todayTxCount: int.tryParse(json['today_tx_count']?.toString() ?? '0') ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'total_products': totalProducts,
        'total_warehouses': totalWarehouses,
        'total_stock_value': totalStockValue,
        'low_stock_count': lowStockCount,
        'dead_stock_count': deadStockCount,
        'today_tx_count': todayTxCount,
      };
}
