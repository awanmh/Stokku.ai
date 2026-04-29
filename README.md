# Stokku.ai — Advanced Inventory Management System

Stokku.ai adalah platform manajemen inventaris berskala besar yang dilengkapi Next.js (Web Frontend), Golang (API Backend), PostgreSQL (Database), dan Redis (Cache) - dan dijalankan via Docker.

## 🟢 Apa yang Sudah Selesai Dibangun (Phase 1-4)
Selama pengembangan fase 1-4, struktur inti sistem manajemen dan framework sudah 100% stabil untuk produksi, mencakup:

1. **Authentication:** Register, Login, RBAC Roles (Admin, Staff, Viewer) berbasis Bearer token (JWT).
2. **Dashboard & UI Utama:** Panel antarmuka dark-mode support menggunakan Next.js + CSS modern. Alert dashboard otomatis (Low stock, Dead stock).
3. **Inventory Management (CRUD):** 
   - Tambah/Edit/Hapus/Lihat Produk.
   - Perhitugan total nilai produk & *warning alert* jika ada yang melampaui bat# Stokku.ai — Advanced Inventory Management System

Stokku.ai adalah platform manajemen inventaris berskala besar yang dilengkapi Next.js (Web Frontend), Golang (API Backend), PostgreSQL (Database), dan Redis (Cache) - dan dijalankan via Docker.

## 🟢 Apa yang Sudah Selesai Dibangun (Phase 1-5 & UI/UX Fixes)
Selama pengembangan fase terbaru, struktur inti sistem manajemen dan frontend dashboard sudah 100% stabil untuk produksi, mencakup:

1. **Authentication & Session:** Register, Login, RBAC Roles (Admin, Staff, Viewer) berbasis Bearer token (JWT). Dilengkapi deteksi otomatis (auto-logout) jika JWT kedaluwarsa atau user sudah dihapus di database.
2. **Dashboard & Alur Kerja:** Antarmuka Next.js modern yang responsif. Navigasi telah diurutkan sesuai alur logika bisnis: **Produk → Gudang → Inventaris → Transaksi**, dan seluruh antarmuka 100% menggunakan Bahasa Indonesia yang konsisten.
3. **Product Management (Master Data):** 
   - Tambah/Edit/Hapus produk dengan validasi form (bebas dari error *400 Bad Request* akibat input kosong/NaN).
4. **Warehouse Management (Lokasi):** 
   - Pembuatan dan manajemen titik gudang.
   - Telah terintegrasi dengan data real-time: menampilkan **jumlah produk unik** dan **total stok per gudang** dengan detail *expandable*.
5. **Inventory Management (Ketersediaan):** 
   - Gabungan data antara Produk dan Gudang. Menampilkan total nilai aset produk & *badge* peringatan visual (Stok Rendah / Aman).
6. **Transaction Management (Log Mutasi):** 
   - Pencatatan mutasi Stock-In dan Stock-Out yang langsung mempengaruhi kuantitas *Inventory*. 
   - Form telah diperbaiki sehingga bebas dari error UUID kosong maupun isu validasi *Foreign Key*.
7. **API Endpoints Backend:** Seluruh REST API berbasis Golang Fiber telah rampung dan diamankan. Dokumentasi lengkap tersedia di `backend/API_DOCS.md`.

## 🟡 Apa yang Masih Kurang (To-Do Selanjutnya)

1. **Integrasi Flutter Mobile App:** Tim mobile harus mengonsumsi endpoint API dari aplikasi backend ini sebelum aplikasi bisa dirilis untuk pekerja gudang (*warehouse workers*).
2. **Injeksi AI Service / Forecasting:** Route prediksi stok `/ai/forecast` masih berupa *placeholder*. Integrasi dengan *machine learning service* (Python) perlu dikonfigurasi melalui HTTP call atau Message Queue.
3. **Production Deployment:** Setup *environment* untuk *Production* seperti konfigurasi HTTPS, Load Balancer, pengaturan CI/CD, dan pemindahan dari localhost Docker Compose ke Cloud Server asli.

## 🚀 Pembaruan Utama (Frontend Enterprise Redesign)
Sistem web dashboard baru saja mengalami perombakan besar-besaran (Redesign UI/UX) untuk memenuhi standar kelas **Enterprise** (terinspirasi dari Stripe, Linear):
- **Sistem Desain (Tokens):** Migrasi dari warna *hardcoded* ke sistem CSS Variable (Tokens) menggunakan Tailwind CSS v4.
- **Visual Bersih & Stabil:** Keseimbangan antara efek *glassmorphism* modern dan performa serta keterbacaan yang optimal.
- **Komponen Fungsional:** Tabel, Kartu, Tombol, dan Form Input telah dirombak untuk terlihat profesional. Tabel sekarang menggunakan gaya *Stripe-style* (bersih, jarak rapi).
- **Tema (Dark Mode / Light Mode):** Sistem mendukung fitur mode gelap (Dark Mode), mode terang (Light Mode), dan mode sistem secara otomatis.
- **Penambahan Modul Penuh:**
  1. Halaman **Overview Dashboard**: Metrik bisnis, grafik pergerakan stok, dan peringatan *Low Stock*.
  2. Halaman **Products (Master Data)**: Penambahan, pengeditan, dan hapus master data katalog produk.
  3. Halaman **Inventory**: Menampilkan total stok asli per produk per gudang dengan status visual (OK / Low).
  4. Halaman **Warehouses**: Cek dan edit data gudang dengan tata letak Grid Card.
  5. Halaman **Transactions**: *Ledger* lengkap setiap mutasi (Stock In / Stock Out).
  6. Halaman **Settings**: Manajemen *RBAC Role* (Admin, Staff, Viewer) dan pendaftaran pengguna baru.
  7. Halaman **Profile**: Menampilkan detail pengguna dan fitur *Edit Profil* (Ubah Nama).

---

> Silakan baca **SETUP.md** untuk melihat panduan setup di mesin/localhost Anda.
