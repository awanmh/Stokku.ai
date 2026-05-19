# Stokku.ai — Advanced Inventory Management System

Stokku.ai adalah platform manajemen inventaris berskala besar yang dilengkapi Next.js (Web Frontend), Golang (API Backend), PostgreSQL (Database), dan Redis (Cache) - dan dijalankan via Docker.

---

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

---

## 🚀 Pembaruan Utama UI/UX (Enterprise Dashboard & TDD Integration)

Dashboard utama Stokku.ai baru saja menerima perombakan besar untuk memenuhi standar kelas **Enterprise**:

### 1. Dashboard Overview Redesign
- **Staggered Entrance Animation**: Efek transisi masuk kartu KPI berurutan yang indah dengan `framer-motion`.
- **Counter-Up Animation**: Angka metrik bisnis secara otomatis beranimasi naik saat halaman dimuat.
- **Advanced Data Analytics**: Integrasi Area Chart (aktivitas stok bulanan) dan Donut Chart (distribusi kategori barang) menggunakan **Recharts**.
- **Real-time Alerting**: Bagian Low Stock & Recent Transactions yang interaktif.

### 2. Standardisasi Tabel & Debounced Search
- **Client-Side Sorting**: Kolom tabel pada rute Products, Inventory, dan Transactions dapat diurutkan secara real-time dengan indikator panah aktif (`ArrowUp` / `ArrowDown`).
- **Debounced Real-time Filter**: Pencarian real-time pada master produk, transaksi, dan gudang menggunakan debounce `useDebounce` hook 400ms untuk performa tinggi.
- **Aesthetic Enhancements**: Baris tabel bergaris belang (*Zebra stripes*) untuk keterbacaan tinggi dan efek hover highlight.

### 3. Komponen EmptyState & Form Modals Polish
- **Reusable `EmptyState`**: Komponen visual kosong yang interaktif dengan dekorasi pulse rings dan tombol ajakan aksi (CTA).
- **Standardized Form Validation**: Semua error validasi form pada modal telah distandardisasi menggunakan warna design token semantic `text-destructive`.

### 4. Navigasi & Kontrol Tambahan (Task 2)
- **Auto-generated Breadcrumbs**: Navigasi breadcrumb otomatis berbasis pathname URL (`Dashboard ➔ Produk`) yang ramping dengan support responsif.
- **System Configuration**: Panel pengaturan premium di halaman settings untuk Backup Database, Peringatan Email, dan Mode Pemeliharaan.
- **Danger Zone**: Kartu pengaturan berisolasi merah khusus untuk instruksi tingkat tinggi yang sensitif.

---

## 🧪 5. Unit Testing & TDD (Test-Driven Development)
Kami telah menerapkan metodologi TDD untuk menjamin reliabilitas penuh aplikasi:
- **Frontend (Vitest & JSDom)**: Unit test lengkap untuk utilitas pemformatan (`web/lib/utils.test.ts`) dan asinkron custom hook (`web/hooks/use-debounce.test.ts`). **5/5 tes lolos dengan sukses!**
- **Backend (Go Test)**: Seluruh usecase core service (Auth, Products, Warehouses, Transactions) teruji penuh dan **100% lulus**.
- Baca laporan pengujian selengkapnya di [TESTING_REPORT.md](TESTING_REPORT.md).

---

## 📱 6. Verifikasi Responsivitas Seluler
Aplikasi telah dioptimalkan dan diuji di semua perangkat (ponsel, tablet, desktop):
- Hamburger menu menggantikan sidebar pada ukuran tablet ke bawah.
- Modal input beralih ke overlay layar penuh (full-screen) di perangkat seluler agar keyboard virtual tidak mengganggu area pandang.
- Baca laporan responsivitas selengkapnya di [WEB_RESPONSIVE_TEST.md](WEB_RESPONSIVE_TEST.md).

---

## 🤖 Chatbot (AI Integration)
Proyek ini menyertakan integrasi chatbot sederhana yang memanfaatkan Google Generative Language API (Gemini / Gemma) melalui route server-side Next.js:
- Location: `web/app/api/chat/route.ts`
- Models: `gemini-2.5-flash` dan `gemma-3-27b-it`.

---

> Silakan baca **SETUP.md** untuk melihat panduan setup di mesin/localhost Anda.
