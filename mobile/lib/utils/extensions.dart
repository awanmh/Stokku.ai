import 'package:flutter/material.dart';

/// Convenience extensions.
extension StringX on String {
  /// Capitalize first letter.
  String get capitalized =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';

  /// Convert role slug (e.g. "warehouse_staff") to display text.
  String get roleDisplay => replaceAll('_', ' ').split(' ').map((w) => w.capitalized).join(' ');
}

extension ContextX on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => theme.textTheme;
  ColorScheme get colorScheme => theme.colorScheme;
  bool get isDark => theme.brightness == Brightness.dark;

  void showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade700 : null,
      ),
    );
  }
}
