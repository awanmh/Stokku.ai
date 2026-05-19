/// API endpoint constants matching the Golang Fiber backend.
class ApiConstants {
  ApiConstants._();

  // ── Base URL ──────────────────────────────────────────────
  // Change this to your machine's LAN IP when testing on a
  // physical device (e.g. 'http://192.168.1.100:8080').
  static const String baseUrl =
      'http://192.168.142.58:8080'; // Physical device -> host machine IP
  static const String apiPrefix = '/api/v1';

  // ── Auth ──────────────────────────────────────────────────
  static const String login = '$apiPrefix/auth/login';
  static const String register = '$apiPrefix/auth/register';
  static const String profile = '$apiPrefix/auth/profile';

  // ── Users (admin) ─────────────────────────────────────────
  static const String users = '$apiPrefix/users';

  // ── Products ──────────────────────────────────────────────
  static const String products = '$apiPrefix/products';

  // ── Warehouses ────────────────────────────────────────────
  static const String warehouses = '$apiPrefix/warehouses';

  // ── Transactions ──────────────────────────────────────────
  static const String transactions = '$apiPrefix/transactions';

  // ── Inventory (Stock Levels) ──────────────────────────────
  static const String inventory = '$apiPrefix/inventory';

  // ── Dashboard ─────────────────────────────────────────────
  static const String dashboardStats = '$apiPrefix/dashboard/stats';
  static const String lowStockAlerts = '$apiPrefix/dashboard/alerts/low-stock';
  static const String deadStockAlerts =
      '$apiPrefix/dashboard/alerts/dead-stock';

  // ── AI / Forecast ─────────────────────────────────────────
  static const String aiForecast = '$apiPrefix/ai/forecast';
  static const String aiReplenishment = '$apiPrefix/ai/replenishment';

  // ── Chatbot (Next.js web route) ──────────────────────────
  // Update this to the web app host when testing on a device.
  static const String chatbotUrl = 'http://192.168.142.58:3000/api/chat';

  // ── Health ────────────────────────────────────────────────
  static const String health = '/health';
}
