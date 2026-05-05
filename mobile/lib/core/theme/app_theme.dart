import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Stokku.ai design system — premium dark & light themes
/// matching the web dashboard's glassmorphism aesthetic.
class AppTheme {
  AppTheme._();

  // ── Dark Theme ────────────────────────────────────────────
  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.darkBg,
        primaryColor: AppColors.primary,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          secondary: AppColors.cyan,
          surface: AppColors.darkSurface,
          error: AppColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: AppColors.textPrimary,
          onError: Colors.white,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.darkBg,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.outfit(
            color: AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          iconTheme: const IconThemeData(color: AppColors.textPrimary),
        ),
        cardTheme: CardThemeData(
          color: AppColors.darkCard,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.darkBorder),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.darkCard,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.darkBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.darkBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.cyan, width: 1.5),
          ),
          hintStyle: const TextStyle(color: AppColors.textMuted),
          labelStyle: const TextStyle(color: AppColors.textSecondary),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.cyan,
            textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.darkSurface,
          selectedItemColor: AppColors.cyan,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        dividerColor: AppColors.darkBorder,
        textTheme: _buildTextTheme(Brightness.dark),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppColors.darkCard,
          contentTextStyle: GoogleFonts.inter(color: AppColors.textPrimary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );

  // ── Light Theme ───────────────────────────────────────────
  static ThemeData get light => ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: AppColors.lightBg,
        primaryColor: AppColors.primary,
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.cyanDark,
          surface: AppColors.lightSurface,
          error: AppColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: AppColors.textDark,
          onError: Colors.white,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.lightSurface,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.outfit(
            color: AppColors.textDark,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          iconTheme: const IconThemeData(color: AppColors.textDark),
        ),
        cardTheme: CardThemeData(
          color: AppColors.lightSurface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.lightBorder),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.lightCard,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.lightBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.lightBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide:
                const BorderSide(color: AppColors.cyanDark, width: 1.5),
          ),
          hintStyle: const TextStyle(color: AppColors.textMuted),
          labelStyle: const TextStyle(color: AppColors.textDarkSecondary),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.lightSurface,
          selectedItemColor: AppColors.cyanDark,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        dividerColor: AppColors.lightBorder,
        textTheme: _buildTextTheme(Brightness.light),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppColors.lightSurface,
          contentTextStyle: GoogleFonts.inter(color: AppColors.textDark),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );

  // ── Typography ────────────────────────────────────────────
  static TextTheme _buildTextTheme(Brightness brightness) {
    final bool isDark = brightness == Brightness.dark;
    final Color primary = isDark ? AppColors.textPrimary : AppColors.textDark;
    final Color secondary =
        isDark ? AppColors.textSecondary : AppColors.textDarkSecondary;

    return TextTheme(
      displayLarge: GoogleFonts.outfit(
          fontSize: 32, fontWeight: FontWeight.w700, color: primary),
      displayMedium: GoogleFonts.outfit(
          fontSize: 28, fontWeight: FontWeight.w700, color: primary),
      displaySmall: GoogleFonts.outfit(
          fontSize: 24, fontWeight: FontWeight.w600, color: primary),
      headlineMedium: GoogleFonts.outfit(
          fontSize: 20, fontWeight: FontWeight.w600, color: primary),
      headlineSmall: GoogleFonts.outfit(
          fontSize: 18, fontWeight: FontWeight.w600, color: primary),
      titleLarge: GoogleFonts.inter(
          fontSize: 16, fontWeight: FontWeight.w600, color: primary),
      titleMedium: GoogleFonts.inter(
          fontSize: 14, fontWeight: FontWeight.w600, color: primary),
      titleSmall: GoogleFonts.inter(
          fontSize: 12, fontWeight: FontWeight.w500, color: secondary),
      bodyLarge: GoogleFonts.inter(
          fontSize: 16, fontWeight: FontWeight.w400, color: primary),
      bodyMedium: GoogleFonts.inter(
          fontSize: 14, fontWeight: FontWeight.w400, color: primary),
      bodySmall: GoogleFonts.inter(
          fontSize: 12, fontWeight: FontWeight.w400, color: secondary),
      labelLarge: GoogleFonts.inter(
          fontSize: 14, fontWeight: FontWeight.w600, color: primary),
      labelSmall: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: secondary,
          letterSpacing: 1.5),
    );
  }
}
