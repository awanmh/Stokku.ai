# Mobile Issues — Backend Integration Testing

> Dokumentasi hasil testing integrasi mobile app ↔ backend (Go Fiber).
> Terakhir diperbarui: 19 Mei 2026

---

## 📋 Test Flow

### 1. Login Flow
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Login dengan kredensial valid | `/api/v1/auth/login` | POST | ✅ Berhasil |
| Login dengan password salah | `/api/v1/auth/login` | POST | ✅ Return error 401 |
| Login dengan email kosong | — | — | ✅ Validasi inline di form |
| Token tersimpan di FlutterSecureStorage | — | — | ✅ Otomatis |
| Auto-login dari splash screen | `/api/v1/auth/profile` | GET | ✅ Jika token valid |

### 2. Dashboard Stats
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Load stats (total produk, gudang, dll) | `/api/v1/dashboard/stats` | GET | ✅ Berhasil |
| Load low-stock alerts | `/api/v1/dashboard/alerts/low-stock` | GET | ✅ Berhasil |
| Pull-to-refresh | — | — | ✅ Reload data |

### 3. Products
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Load daftar produk | `/api/v1/products` | GET | ✅ Berhasil |
| Search produk by nama/SKU | `/api/v1/products?search=xxx` | GET | ✅ Berhasil |
| Clear search | — | — | ✅ Reload semua |

### 4. Warehouses
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Load daftar gudang | `/api/v1/warehouses` | GET | ✅ Berhasil |
| Status aktif/nonaktif badge | — | — | ✅ Tampil benar |

### 5. Inventory
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Load inventory (stok per gudang) | `/api/v1/inventory` | GET | ✅ Berhasil |
| Filter stok rendah | — | — | ✅ Client-side filter |
| Badge "Rendah"/"Aman" | — | — | ✅ Bahasa Indonesia |

### 6. Transactions
| Step | Endpoint | Method | Status |
|------|----------|--------|--------|
| Load riwayat transaksi | `/api/v1/transactions` | GET | ✅ Berhasil |
| Create transaksi (stock in) | `/api/v1/transactions` | POST | ✅ Berhasil |
| Create transaksi (stock out) | `/api/v1/transactions` | POST | ✅ Berhasil |
| Offline queue (Hive) | — | — | ✅ Transaksi di-queue |
| Auto sync saat online | — | — | ✅ SyncProvider |

### 7. Scanner Flow
| Step | Deskripsi | Status |
|------|-----------|--------|
| Buka kamera barcode | MobileScanner widget | ✅ Berfungsi |
| Scan → lookup produk by SKU | `ProductProvider.findBySku()` | ✅ Berhasil |
| Pilih gudang → input jumlah → Stock In | Create transaction flow | ✅ Berhasil |
| Pilih gudang → input jumlah → Stock Out | Create transaction flow | ✅ Berhasil |
| Produk tidak ditemukan → SnackBar error | — | ✅ Tampil |
| "Scan Lagi" reset state | — | ✅ Berfungsi |

### 8. Chatbot (Stokku AI)
| Step | Deskripsi | Status |
|------|-----------|--------|
| FAB muncul di semua tab HomeScreen | FloatingActionButton global | ✅ Berfungsi |
| Buka chatbot screen | Navigator push `/chatbot` | ✅ Berfungsi |
| Quick replies tampil | 4 quick reply chips | ✅ Berfungsi |
| Kirim pesan ke Gemini API | `POST /api/chat` via web proxy | ⚠️ Perlu web server running |
| Model selector (Flash/Gemma) | Toggle di AppBar | ✅ UI berfungsi |
| Typing indicator | 3 bouncing dots | ✅ Animasi smooth |
| Error handling (timeout, network) | DioException catch | ✅ Pesan error informatif |

---

## ⚠️ Known Issues

### Issue 1: Chatbot Memerlukan Web Server
- **Severity**: Medium
- **Deskripsi**: Chatbot mengirim request ke Next.js web server (`http://192.168.142.58:3000/api/chat`), bukan langsung ke backend Go. Web server harus running (`npm run dev`) agar chatbot berfungsi.
- **Workaround**: Jalankan web server di mesin yang sama dengan IP yang dikonfigurasi di `ApiConstants.chatBaseUrl`.
- **Solusi Jangka Panjang**: Pindahkan endpoint chatbot langsung ke backend Go, atau buat proxy endpoint di backend.

### Issue 2: IP Address Hardcoded
- **Severity**: Low
- **Deskripsi**: `ApiConstants.baseUrl` dan `ApiConstants.chatBaseUrl` menggunakan IP hardcoded (`192.168.142.58`). Harus diubah manual saat pindah jaringan.
- **Workaround**: Ubah IP di `api_constants.dart` sesuai jaringan lokal.
- **Solusi Jangka Panjang**: Gunakan environment variable atau settings screen.

### Issue 3: Logo Asset Placeholder
- **Severity**: Low
- **Deskripsi**: `assets/images/logo.png` mungkin belum ada atau masih placeholder. Splash screen dan login screen bergantung pada file ini.
- **Workaround**: Pastikan file logo.png ada di folder assets.

### Issue 4: GEMINI_API_KEY di Web Server
- **Severity**: High
- **Deskripsi**: Chatbot membutuhkan `GEMINI_API_KEY` yang dikonfigurasi di `.env` web server. Key ini hanya tersedia di laptop Aqil.
- **Workaround**: Minta Aqil share API key baru via Google AI Studio.
- **PIC**: Muhammad Aqil Mahdi Syarif

### Issue 5: Widget Test — Hive Initialization
- **Severity**: Low
- **Deskripsi**: Beberapa provider (SyncProvider, TransactionProvider) bergantung pada Hive local storage. Widget tests mungkin gagal jika Hive belum di-init di test environment.
- **Workaround**: Gunakan `TestWidgetsFlutterBinding.ensureInitialized()` atau mock repository di test setup.

---

## ✅ Summary

| Area | Status | Catatan |
|------|--------|---------|
| Auth (Login/Logout) | ✅ Berfungsi | Auto-login, 401 handling |
| Dashboard | ✅ Berfungsi | Stats + low stock alerts |
| Products | ✅ Berfungsi | CRUD + search |
| Warehouses | ✅ Berfungsi | List + status badge |
| Inventory | ✅ Berfungsi | Filter + search |
| Transactions | ✅ Berfungsi | Offline-first + sync |
| Scanner | ✅ Berfungsi | Barcode → stock in/out |
| Chatbot | ⚠️ Partial | Perlu web server + API key |
| UI/UX | ✅ Polish Done | Micro-animations, Bahasa Indonesia |
| Widget Tests | ✅ 6 Tests | Splash, Login, StatCard, GlassCard, Chatbot |

---

> Dibuat oleh: **Hervin Dwicahya Kusuma**
> Tanggal: 19 Mei 2026
