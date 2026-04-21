# Stokku.ai — Advanced Inventory Management System

Stokku.ai adalah platform manajemen inventaris berskala besar yang dilengkapi Next.js (Web Frontend), Golang (API Backend), PostgreSQL (Database), dan Redis (Cache) - dan dijalankan via Docker.

## 🟢 Apa yang Sudah Selesai Dibangun (Phase 1-4)
Selama pengembangan fase 1-4, struktur inti sistem manajemen dan framework sudah 100% stabil untuk produksi, mencakup:

1. **Authentication:** Register, Login, RBAC Roles (Admin, Staff, Viewer) berbasis Bearer token (JWT).
2. **Dashboard & UI Utama:** Panel antarmuka dark-mode support menggunakan Next.js + CSS modern. Alert dashboard otomatis (Low stock, Dead stock).
3. **Inventory Management (CRUD):** 
   - Tambah/Edit/Hapus/Lihat Produk.
   - Perhitugan total nilai produk & *warning alert* jika ada yang melampaui batas minimum.
4. **Warehouse Management (CRUD):** 
   - Konfigurasi berbagai gudang.
   - Pencarian letak fisik (Alamat & Lokasi).
5. **Transaction Management:** Stock-In dan Stock-Out langsung mempengaruhi nilai Inventory dan dicatat per-user.
6. **API Endpoints (Handoff untuk Mobile):** Seluruh REST API CRUD rampung. Format respon distandarisasi dan endpoint aman (`/api/v1/`). Dokumentasi lengkap tersedia di `backend/API_DOCS.md`.

## 🟡 Apa yang Masih Kurang (To-Do Selanjutnya)

1. **Integrasi Flutter Mobile App:** Tim mobile harus mengonsumsi endpoint API ini dari emulator / target API host sebelum bisa dirilis untuk *warehouse workers*. CORS sementara dibuka lebar agar emulator bisa tembus ke PC ini secara lokal.
2. **Injeksi AI Service / Forecasting:** Route `/ai/forecast` masih berupa *placeholder response*. Service ML Python dari sisi Stokku AI perlu dilibatkan (ataupun diintegrasi via RabbitMQ/HTTP call).
3. **Production Deployment:** Konfigurasi HTTPS, load balancer, dan integrasi CI/CD Actions (saat ini sistem dirancang masih sebatas localhost full-stack via Docker Compose).

## 🚀 Pembaruan Utama (Frontend Enterprise Redesign)
Sistem web dashboard baru saja mengalami perombakan besar-besaran (Redesign UI/UX) untuk memenuhi standar kelas **Enterprise** (terinspirasi dari Stripe, Linear):
- **Sistem Desain (Tokens):** Migrasi dari warna *hardcoded* ke sistem CSS Variable (Tokens) menggunakan Tailwind CSS v4.
- **Visual Bersih & Stabil:** Penghapusan efek *glassmorphism*, *blur*, dan bayangan *neon/gaming* yang berlebihan demi performa dan keterbacaan yang optimal.
- **Komponen Fungsional:** Tabel, Kartu, Tombol, dan Form Input telah dirombak untuk terlihat profesional. Tabel sekarang menggunakan gaya *Stripe-style* (bersih, jarak rapi).
- **Penambahan Modul Penuh:**
  1. Halaman **Overview Dashboard**: Metrik bisnis, grafik pergerakan stok, dan peringatan *Low Stock*.
  2. Halaman **Products (Master Data)**: Penambahan, pengeditan, dan hapus master data katalog produk.
  3. Halaman **Inventory**: Menampilkan total stok asli per produk per gudang dengan status visual (OK / Low).
  4. Halaman **Warehouses**: Cek dan edit data gudang dengan tata letak Grid Card.
  5. Halaman **Transactions**: *Ledger* lengkap setiap mutasi (Stock In / Stock Out).
  6. Halaman **Settings**: Manajemen *RBAC Role* (Admin, Staff, Viewer) dan pendaftaran pengguna baru.

---

> Silakan baca **SETUP.md** untuk melihat panduan setup di mesin/localhost Anda.
