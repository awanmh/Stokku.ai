import 'dart:ui';

/// Color palette matching the Stokku.ai web dashboard's
/// premium glassmorphism design system.
///
/// Web reference: globals.css HSL variables
///   --primary:   hsl(215 80% 48%)
///   --bg-deep:   hsl(222 47% 4%)  → #03060d
///   --cyan:      #22d3ee
class AppColors {
  AppColors._();

  // ── Brand ─────────────────────────────────────────────────
  static const Color primary = Color(0xFF1570EF);       // hsl(215 80% 48%)
  static const Color primaryLight = Color(0xFF53B1FD);
  static const Color cyan = Color(0xFF22D3EE);
  static const Color cyanDark = Color(0xFF06B6D4);
  static const Color indigo = Color(0xFF6366F1);

  // ── Gradients ─────────────────────────────────────────────
  static const Color gradientStart = Color(0xFF22D3EE);  // cyan-400
  static const Color gradientEnd = Color(0xFF818CF8);    // indigo-400

  // ── Dark Theme ────────────────────────────────────────────
  static const Color darkBg = Color(0xFF03060D);
  static const Color darkSurface = Color(0xFF0A0F1C);
  static const Color darkCard = Color(0xFF0F1629);
  static const Color darkBorder = Color(0x1AFFFFFF);     // white/10
  static const Color darkBorderSubtle = Color(0x0DFFFFFF); // white/5

  // ── Light Theme ───────────────────────────────────────────
  static const Color lightBg = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF1F5F9);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // ── Text ──────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textDark = Color(0xFF0F172A);
  static const Color textDarkSecondary = Color(0xFF475569);

  // ── Status ────────────────────────────────────────────────
  static const Color success = Color(0xFF22C55E);
  static const Color successBg = Color(0x1A22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0x1AF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBg = Color(0x1AEF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBg = Color(0x1A3B82F6);
}
