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
  static const Color primary = Color(0xFF0066CC);       // Action Blue
  static const Color primaryLight = Color(0xFF3385D6);
  static const Color cyan = Color(0xFF0066CC); // Redirected to Action Blue
  static const Color cyanDark = Color(0xFF004C99);
  static const Color indigo = Color(0xFF0066CC);

  // ── Gradients ─────────────────────────────────────────────
  // Removed gradients per luxury design rules. Replaced with solid Action Blue.
  static const Color gradientStart = Color(0xFF0066CC);  
  static const Color gradientEnd = Color(0xFF0066CC);    

  // ── Dark Theme ────────────────────────────────────────────
  static const Color darkBg = Color(0xFF0A0A0A); // Near Black
  static const Color darkSurface = Color(0xFF141414); // Deep Charcoal
  static const Color darkCard = Color(0xFF141414); 
  static const Color darkBorder = Color(0xFF262626); // Minimal contrast
  static const Color darkBorderSubtle = Color(0xFF1A1A1A); 

  // ── Light Theme ───────────────────────────────────────────
  static const Color lightBg = Color(0xFFFFFFFF); // Pure White
  static const Color lightSurface = Color(0xFFF5F5F5); // Soft Parchment equivalent
  static const Color lightCard = Color(0xFFF5F5F5);
  static const Color lightBorder = Color(0xFFE5E5E5);

  // ── Text ──────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFFFFFFF); // For dark mode
  static const Color textSecondary = Color(0xFF999999);
  static const Color textMuted = Color(0xFF666666);
  static const Color textDark = Color(0xFF000000); // For light mode
  static const Color textDarkSecondary = Color(0xFF666666);

  // ── Status (muted / monochrome where possible) ────────────
  static const Color success = Color(0xFFFFFFFF);
  static const Color successBg = Color(0xFF262626);
  static const Color warning = Color(0xFFFFFFFF);
  static const Color warningBg = Color(0xFF262626);
  static const Color error = Color(0xFFFFFFFF);
  static const Color errorBg = Color(0xFF262626);
  static const Color info = Color(0xFF0066CC);
  static const Color infoBg = Color(0xFF0A0A0A);
}
