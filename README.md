# stokku.ai — Intelligent Supply Chain & Inventory Ecosystem

*"Empowering Supply Chains with Predictive AI and Real-Time Visibility."*

stokku.ai adalah platform manajemen inventaris dan rantai pasok end-to-end berbasis AI yang dirancang untuk membantu bisnis mengurangi kerugian akibat kesalahan stok, dead-stock, dan keputusan pengadaan yang tidak akurat.

---

## Problem Statement

Banyak bisnis retail dan logistik menghadapi masalah:

- ❌ Selisih antara stok fisik dan sistem ("stok ghaib")
- ❌ Dead-stock (barang tidak laku, modal tertahan)
- ❌ Overstock / Understock karena prediksi manual
- ❌ Proses gudang lambat dan tidak real-time

---

## Solution

stokku.ai menghadirkan solusi terintegrasi:

- Web Dashboard → monitoring & analytics
- Mobile App → scanning & operasional gudang
- AI Engine → prediksi demand & rekomendasi stok

---

## System Architecture

```text
[Mobile App: Flutter] ↔️  [Golang Core API]  ↔️ [Web Dashboard: Next.js]
                               ↓  ↑
                       [Redis Distributed Lock]
                               ↓  ↑
                         [PostgreSQL DB]
                               ↑  ↓
                [Python AI Service (Forecasting)]

````

---

## Tech Stack

### Frontend Web
- Next.js 15
- Tailwind CSS
- Shadcn/UI

### Mobile App
- Flutter (Dart)
- Local DB (Hive / SQLite)

### Backend Core
- Golang (Fiber)
- Clean Architecture

### AI Service
- Python (FastAPI)
- Scikit-learn / Prophet

### Database & Cache
- PostgreSQL (ACID compliance)
- Redis (distributed locking)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)

---

## Key Features

### AI Features
- Demand Forecasting (30 hari ke depan)
- Dead-Stock Detection
- Smart Auto-Replenishment (auto draft PO)

### Mobile Features
- Offline-first scanning
- Auto sync ketika online
- Continuous barcode scanning

### Web Dashboard
- Multi-warehouse monitoring
- Asset valuation (real-time)
- Role-based access control (RBAC)

---

## Engineering Highlights

- High-performance backend dengan Golang
- Redis Distributed Lock untuk mencegah race condition
- Offline-first synchronization system (mobile)
- Microservices architecture (AI service terpisah)
- Scalable system design (production-ready)

---

## Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/your-username/stokku-ai.git
cd stokku-ai
````

### 2. Setup Environment

Ikuti panduan:
👉 `SETUP_ENV.md`

### 3. Jalankan dengan Docker

```bash
docker-compose up --build
```

---

## Project Structure

```
stokku-ai/
├── backend/        # Golang API
├── ai-service/     # Python AI service
├── web/            # Next.js dashboard
├── mobile/         # Flutter app
├── docker/         # Docker configs
```

---

## Workflow

1. User scan barang dari mobile app
2. Data dikirim ke backend Golang
3. Backend validasi & simpan ke PostgreSQL
4. Redis menghindari double stock update
5. AI service memproses data untuk forecasting
6. Web dashboard menampilkan insight

---

## Testing

```bash
# Backend
go test ./...

# AI Service
pytest

# Web
npm run test
```

---

## Future Improvements

* Real-time streaming (Kafka / NATS)
* Advanced ML model (LSTM / Deep Learning)
* Multi-tenant SaaS system
* Integration dengan ERP eksternal

---

---

## Mobile Building Status

### Apa yang Sudah Selesai Dibangun
- ✅ **Arsitektur Dasar**: Implementasi Clean Architecture (Data, Domain, Presentation).
- ✅ **Autentikasi**: Login & Register terintegrasi dengan JWT backend.
- ✅ **Dashboard Mobile**: Ringkasan statistik (Total Produk, Nilai Aset, Transaksi Hari Ini) secara real-time.
- ✅ **Manajemen Inventaris**: List produk, pencarian produk, dan filter berdasarkan gudang.
- ✅ **Barcode Scanner**: Integrasi kamera untuk scan SKU produk secara cepat.
- ✅ **Sistem Transaksi**: Alur Stock In dan Stock Out langsung dari hasil scan.
- ✅ **Offline-First**: Implementasi Hive storage untuk caching data.
- ✅ **Auto-Sync Engine**: Mekanisme sinkronisasi otomatis transaksi offline saat perangkat kembali online.
- ✅ **Desain Premium**: UI Glassmorphism yang konsisten dengan versi web dashboard.

### Apa yang Masih Kurang (To-Do Selanjutnya)
- 🛠️ **Push Notifications**: Notifikasi real-time saat stok mencapai batas minimum (Low Stock).
- 🛠️ **Edit Profile**: Fitur untuk mengubah data diri dan foto profil langsung dari aplikasi.
- 🛠️ **Advanced Analytics**: Grafik forecasting demand sederhana di versi mobile.
- 🛠️ **Multi-Language Support**: Dukungan bahasa Inggris selain bahasa Indonesia.

### Pembaruan Utama
- 🔄 **Integrasi API**: Penyesuaian seluruh endpoint dengan backend Golang Fiber.
- 🎨 **Logo & Branding**: Sinkronisasi logo dengan versi web dan pembaruan launcher icon aplikasi.
- 🛠️ **Rendering Stability**: Perbaikan crash pada emulator dengan menonaktifkan Impeller rendering (GLES).
- 📅 **Locale Initialization**: Perbaikan bug `LocaleDataException` untuk format tanggal Indonesia.

---

## Author

- Setiawan Muhammad
- Muhammad Aqil Mahdi Syarif
- Felix Yohanes Sangapta Simamora
- Neisya Nurul Alyazara
- Hervin Dwicahya Kusuma

---

## Why This Project Matters

stokku.ai bukan sekadar project akademik, tetapi simulasi sistem nyata yang:

* Menyelesaikan masalah bisnis kritikal
* Mengintegrasikan AI dalam decision making
* Menggunakan arsitektur scalable
* Siap dikembangkan menjadi produk SaaS

---

## License

MIT License
