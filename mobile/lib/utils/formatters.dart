import 'package:intl/intl.dart';

/// Number and date formatting helpers for Indonesian locale.
class Formatters {
  Formatters._();

  static String currency(double value) => NumberFormat.currency(
        locale: 'id_ID',
        symbol: 'Rp ',
        decimalDigits: 0,
      ).format(value);

  static String compactCurrency(double value) =>
      NumberFormat.compactCurrency(
        locale: 'id_ID',
        symbol: 'Rp ',
        decimalDigits: 0,
      ).format(value);

  static String number(int value) =>
      NumberFormat.decimalPattern('id_ID').format(value);

  static String date(String iso) {
    try {
      return DateFormat('dd MMM yyyy', 'id_ID').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  static String dateTime(String iso) {
    try {
      return DateFormat('dd MMM yyyy, HH:mm', 'id_ID')
          .format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  static String relativeTime(String iso) {
    try {
      final dt = DateTime.parse(iso);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Baru saja';
      if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
      if (diff.inHours < 24) return '${diff.inHours} jam lalu';
      if (diff.inDays < 7) return '${diff.inDays} hari lalu';
      return date(iso);
    } catch (_) {
      return iso;
    }
  }
}
