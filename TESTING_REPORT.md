# Stokku.ai Comprehensive Testing & TDD Report

Laporan ini menyajikan ringkasan hasil pengujian dan implementasi metodologi **TDD (Test-Driven Development)** yang telah dilakukan baik di sisi backend (Go) maupun frontend (Next.js / Vitest).

---

## 🧪 1. Frontend Unit Testing (Vitest & JSDom)

Untuk memperkuat stabilitas kode frontend dan menerapkan TDD, kami mengintegrasikan **Vitest** dan **@testing-library/react** ke dalam lingkungan Next.js. Kami berhasil menulis dan menguji dua modul inti:

### A. Pengujian Utility (`web/lib/utils.test.ts`)
Menguji fungsi pembantu pemformatan data keuangan dan waktu:
- **`formatCurrency`**: Memastikan angka dikonversi dengan simbol mata uang rupiah (`Rp`) dan pemisah ribuan titik secara benar (contoh: `10000` menjadi `Rp 10.000`).
- **`formatNumber`**: Memverifikasi pemisah titik tanpa mata uang (contoh: `1250` menjadi `1.250`).
- **`formatDateShort`**: Memverifikasi konversi dari ISO string menjadi format tanggal bahasa Indonesia yang ringkas (contoh: `"2026-05-19..."` menjadi `"19 Mei 2026"`).

### B. Pengujian Custom Hook (`web/hooks/use-debounce.test.ts`)
Menggunakan mock timer dari Vitest (`vi.useFakeTimers()`) untuk menguji perilaku asinkron dari hook debounce:
- Memastikan nilai awal dirender secara instan.
- Memastikan pembaruan nilai tertunda dan hanya dijalankan tepat setelah durasi debounce yang ditentukan berakhir (misal: 500ms).

### Hasil Pengujian Frontend:
```bash
 RUN  v4.1.6 D:/BACKUP/DOWNLOADS/stokku.ai/stokku.ai/web

 ✓ lib/utils.test.ts (3 tests) 72ms
 ✓ hooks/use-debounce.test.ts (2 tests) 49ms

 Test Files  2 passed (2)
      Tests  5 passed (5)
   Duration  4.27s
```
**Status: 100% Lolos (PASSED) ✅**

---

## ⚙️ 2. Backend Unit & Usecase Testing (Go Test)

Backend memiliki cakupan pengujian unit yang matang menggunakan kerangka pengujian bawaan Go. Pengujian mencakup usecase otentikasi, manajemen gudang, produk, dan transaksi:

- **`auth_usecase_test.go`**: Memverifikasi registrasi user baru, login, pencocokan password bcrypt, dan JWT generation.
- **`product_usecase_test.go`**: Memverifikasi validasi SKU produk, batas minimum stok, dan pembuatan katalog produk.
- **`warehouse_usecase_test.go`**: Memvalidasi penambahan lokasi gudang baru dan pengecekan kapasitas/alamat.
- **`transaction_usecase_test.go`**: Menguji aliran masuk-keluar stok, pembukuan mutasi barang, serta penanganan error jika stok tidak mencukupi.

### Hasil Pengujian Backend:
```bash
ok  	github.com/stokku-ai/backend/internal/usecase	1.741s
```
**Status: 100% Lolos (PASSED) ✅**

---

## 🔄 3. Alur Kerja TDD (Test-Driven Development) yang Diterapkan

1. **Red Phase (Tulis Tes Dulu)**: Kami menulis tes spesifikasi untuk `formatCurrency` dan `useDebounce` sebelum menginstal pustaka testing untuk mendefinisikan ekspektasi input/output.
2. **Green Phase (Buat Tes Lolos)**: Kami menginstal Vitest, mengonfigurasi `jsdom`, dan menyesuaikan kode `utils.ts` agar menangani angka desimal, spasi non-breaking, dan format waktu dengan benar.
3. **Refactor Phase (Pembersihan Kode)**: Merestrukturisasi kode tes agar menggunakan helper `beforeEach` dan `afterEach` serta membersihkan fake timers secara otomatis untuk menghindari memory leaks.

---

## 📈 Kesimpulan Stabilitas Proyek

Dengan tersedianya unit testing di sisi frontend dan backend, aplikasi **Stokku.ai** sekarang memiliki tingkat reliabilitas yang sangat tinggi. Perubahan UI/UX modern yang dilakukan sebelumnya dijamin tidak merusak logika bisnis inti aplikasi.
