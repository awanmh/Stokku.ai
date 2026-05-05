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
        totalProducts: json['total_products'] ?? 0,
        totalWarehouses: json['total_warehouses'] ?? 0,
        totalStockValue: (json['total_stock_value'] ?? 0).toDouble(),
        lowStockCount: json['low_stock_count'] ?? 0,
        deadStockCount: json['dead_stock_count'] ?? 0,
        todayTxCount: json['today_tx_count'] ?? 0,
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
