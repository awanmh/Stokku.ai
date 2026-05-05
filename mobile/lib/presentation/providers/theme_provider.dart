import 'package:flutter/material.dart';

/// Theme mode provider — dark / light / system toggle.
class ThemeProvider extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.dark; // Default to dark matching web dashboard

  ThemeMode get mode => _mode;
  bool get isDark => _mode == ThemeMode.dark;

  void setMode(ThemeMode mode) {
    _mode = mode;
    notifyListeners();
  }

  void toggle() {
    _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }
}
