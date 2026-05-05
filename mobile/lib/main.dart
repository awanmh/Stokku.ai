import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/storage/local_storage.dart';
import 'core/network/connectivity_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize date formatting for intl package
  await initializeDateFormatting('id_ID', null);

  // Lock to portrait mode for warehouse use-case
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Transparent status bar for glassmorphism
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light.copyWith(
    statusBarColor: Colors.transparent,
  ));

  // Initialise local storage (Hive)
  await LocalStorage.init();

  // Initialise connectivity monitor
  await ConnectivityService.instance.init();

  runApp(const StokkuApp());
}
