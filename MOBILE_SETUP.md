# Stokku.ai — Mobile App Setup Guide

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.16+)
- Android Studio / VS Code with Flutter plugin
- Android Emulator or physical device

## Quick Start

### 1. Initialize Flutter Project Scaffold

Since the `lib/` source code is already written, you need to generate the
platform-specific scaffolding (android/, ios/, etc.):

```bash
cd mobile

# Generate the Flutter project scaffold around existing code
flutter create --project-name stokku_mobile --org ai.stokku .
```

> This will create the `android/`, `ios/`, `test/`, and other platform
> directories without overwriting `lib/`, `pubspec.yaml`, or `analysis_options.yaml`.

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Configure API Base URL

Edit `lib/core/constants/api_constants.dart`:

```dart
// For Android Emulator → host machine:
static const String baseUrl = 'http://10.0.2.2:8080';

// For physical device (use your LAN IP):
static const String baseUrl = 'http://192.168.x.x:8080';
```

### 4. Run the App

```bash
# Make sure the backend is running first!
# cd backend && go run cmd/api/main.go

flutter run
```

### 5. Login Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@stokku.ai   | password   |

---

## Camera Permissions (Barcode Scanner)

### Android
Already configured in `android/app/src/main/AndroidManifest.xml`:
- `CAMERA` — barcode scanning
- `INTERNET` — API calls
- `ACCESS_NETWORK_STATE` — offline detection

### iOS
Add to `ios/Runner/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Stokku.ai membutuhkan akses kamera untuk scan barcode produk</string>
```

---

## Architecture Overview

```
lib/
├── main.dart              → Entry point (init Hive, connectivity)
├── app.dart               → MaterialApp + Providers + Routes
├── core/                  → Infrastructure (API, theme, storage)
├── data/
│   ├── models/            → 6 models matching backend structs
│   ├── datasources/       → Remote (Dio) + Local (Hive)
│   └── repositories/      → Offline-first business logic
├── presentation/
│   ├── providers/         → 8 ChangeNotifier state holders
│   ├── screens/           → 10 screens
│   └── widgets/           → Reusable glass cards, stat cards
└── utils/                 → Formatters, extensions
```

## Offline-First Flow

1. User creates a transaction (stock in/out)
2. If **online** → POST to API → save to Hive (synced=true)
3. If **offline** → save to Hive pending queue (synced=false)
4. When connectivity restores → `SyncProvider` auto-pushes pending items
5. Sync indicator shows status in UI

## Key Features

- ✅ JWT Authentication with auto-logout on 401
- ✅ Barcode Scanner (continuous mode via `mobile_scanner`)
- ✅ Offline-first transactions with sync queue
- ✅ Dark/Light theme matching web dashboard
- ✅ Dashboard stats with low-stock alerts
- ✅ Products, Inventory, Warehouses, Transactions views
- ✅ Profile page with theme toggle and sync status
