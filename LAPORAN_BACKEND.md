# Laporan Teknis Backend Stokku.ai

Dokumen ini berisi penjelasan struktural dan operasional dari arsitektur backend Stokku.ai yang dibangun menggunakan bahasa pemrograman Golang. Pembahasan difokuskan pada tiga komponen / _layer_ utama pembangun aplikasi: **cmd**, **config**, dan **usecase**. 

---

## 1. Komponen `cmd` (Entrypoint Aplikasi)
**Lokasi Direktori:** `backend/cmd/api/main.go`

Komponen `cmd` adalah titik awal (entrypoint) utama yang dieksekusi saat aplikasi backend *Stokku.ai* dijalankan. File ini bertanggung jawab penuh sebagai **Dependency Injector** dan **Server Bootstrap**.

**Tugas Utama:**
1. **Memuat Konfigurasi:** Memanggil fungsi `config.Load()` untuk membaca _environment variables_ (seperti `DB_HOST`, `JWT_SECRET`, dan `SERVER_PORT`).
2. **Inisialisasi Infrastruktur (Database & Cache):**
   - Membangun *connection pool* ke database PostgreSQL (`database.NewPostgresPool`).
   - Melakukan koneksi ke Redis (`cache.NewRedisClient`) yang digunakan untuk mekanisme _locking_ transaksi.
3. **Penyusunan Dependency Injection:**
   - Menyuntikkan infrastruktur ke layer **Repository** (seperti `UserRepo`, `ProductRepo`, dsb).
   - Menyuntikkan Repository ke layer **Usecase** (pusat logika bisnis).
   - Menyuntikkan Usecase ke layer **Handler** (pengendali HTTP / Endpoints).
4. **Setup Web Framework Server:**
   - Menginisialisasi *Go Fiber* sebagai _web framework_ berkinerja tinggi.
   - Memasangkan rute (mendaftarkan `deliveryhttp.SetupRouter()`) dengan kumpulan *handler* yang sudah dirangkai.
5. **Graceful Shutdown:** Mengaktifkan mekanisme intersepsi sinyal OS (`SIGINT`, `SIGTERM`) agar server dapat dimatikan dengan aman tanpa memutuskan proses / transaksi di tengah jalan secara paksa.

---

## 2. Komponen `config` (Manajemen Konfigurasi)
**Lokasi Direktori:** `backend/internal/config/config.go`

Berfungsi sebagai _System Registry_ di mana semua kredensial, parameter konektivitas, dan pengaturan server diabstraksikan menjadi Struct Go yang bersifat _Type-Safe_ (sehingga aman dari kesalahan ketik di *runtime* yang dalam).

**Struktur Data Config:**
- **ServerConfig:** Menyimpan konfigurasi Port HTTP (default `8080`) dan mode lingkungan (seperti *development* atau *production*).
- **DatabaseConfig:** Mengontrol konektivitas PostgreSQL (Host, Port, User, Password, dsb) beserta skrip otomatis pembuatan parameter `DSN (Data Source Name)` untuk memudahkan koneksi driver.
- **RedisConfig:** Menyimpan pengaturan alamat host Redis untuk cache / _locking_ sistem transaksi gudang stok terbatas.
- **JWTConfig:** Mengandung rahasia `Secret` algoritma _signature_ token HMAC dan masa kadaluarsa (Expiration) sesi _login_.

**Cara Kerja (`Load()`):**
Fungsi `Load()` memanfaatkan *library* `godotenv` untuk memuat file `.env`. Agar tangguh, sistem ini juga menyediakan *fallback value* otomatis jika _environment variable_ tertentu lupa dituliskan di dalam server, misalnya jika `JWT_EXPIRATION_HOURS` kosong, maka aplikasi langsung melindungi sistem dengan menerapkan masa kedaluwarsa bawaan selama `24 jam`.

---

## 3. Komponen `usecase` (Logika Bisnis Area)
**Lokasi Direktori:** `backend/internal/usecase/*.go`

Lapisan `usecase` (sering juga disebut *Service layer* pada arsitektur lain) adalah otak atau "Business Logic" paling inti dari Stokku.ai. Layer ini beroperasi dengan mematuhi pola _Clean Architecture_; di mana Usecase tidak tahu-menahu apakah aplikasi diakses via HTTP, gRPC, ataupun CLI. Ia hanya menggerakkan layer **Repository** dengan aturan dan persyaratan bisnis yang mengikat. 

Modul usecase dalam backend ini mencakup:

### a. `AuthUsecase`
- **Tugas:** Menangani registrasi (hash password berbasis fungsi _bcrypt Cost_), manajemen login (otentikasi & pengecekan blokir/status Nonaktif), dan pembangkitan sertifikat Token masuk (*JWT Generation*).
- **Aturan Tambahan:** Secara otomatis mengenakan tipe peran `viewer` (hak terbatas) jika _Role_ pada pendaftaran tidak dilampirkan oleh pengguna anonimus.

### b. `ProductUsecase` & `WarehouseUsecase`
- **Tugas:** Master Data Management yang mewadahi proses CRUD standar (Tambah, Baca, Ubah, Hapus).
- **Validasi Bisnis:** Pada `ProductUsecase`, terdapat validasi khusus di mana Kode `SKU` tidak boleh berduplikasi karena hal tersebut merupakan acuan scan _Barcode_ gudang.

### c. `TransactionUsecase` (High Priority Logic)
- **Tugas:** Inti mekanisme pencatatan riwayat (Stock-in / Stock-out) dan modifikasi angka inventaris absolut di suatu gudang.
- **Algoritme Mutasi Lanjutan:** 
  - Melakukan validasi logis penolakan jika operator mencoba mengeluarkan jumlah barang masuk lebih besar (Stock-out) daripada saldo real-time (`stock.Quantity < req.Quantity`).
  - **Distributed Locking:** Untuk menghindari *"Race Conditions"* (situasi di mana 2 kasir menjual barang sisa terakhir secara bersamaan), modul ini menyewa Lock (pintu gembok per-produk) kepada komponen Redis selama 10 detik. Jika stok barang tersebut sedang diedit staff lain, proses ini aman ditolak agar perhitungannya tidak menjadi cacat (Minus / Undefined).

### d. `DashboardUsecase`
- **Tugas:** Mengompilasi data besar menjadi ringkasan presentasi untuk antarmuka grafik depan pengguna.
- **Cakupan Agregasi:** Menghitung total nilai modal uang stok barang, mengeluarkan peringatan stok sekarat / menipis (`LowStock`), dan menganalisa algoritme penentuan barang _Dead Stock_ (Barang usang / tidak dikirim-kirim keluar masuk atau tidak laku selama lebih dari `90 hari`).
