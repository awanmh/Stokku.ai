# Setup Lokal Stokku.ai

Dokumen ini berisi panduan untuk menjalankan environment Stokku.ai (Backend API, Frontend Web, PostgreSQL, Redis) secara lokal menggunakan Docker Compose.

## 1. Persiapan Environment Variables
Agar docker dan database dapat berjalan, buat file konfigurasi `.env`. 
Sistem menyediakan file contoh yaitu `.env.example` di dalam masing-masing service (termasuk folder `docker/`).
Namun untuk memudahkan, skrip otomatis akan menyalin (copy) dari `.env.example`.

## 2. Start Services dengan Docker
Pastikan **Docker Desktop** (atau daemon docker) Anda **SUDAH BERJALAN**.

Buka terminal/PowerShell di *root project*, lalu:
```bash
cd docker
./start.sh
```
*(Catatan: Jika memakai cmd biasa, bisa jalankan `docker-compose up -d` langsung dari dalam folder docker).*

Port yang akan digunakan secara default (berdasarkan modifikasi terakhir karena Hyper-V reserve):
- **Web Frontend**: 3001
- **Backend API**: 8081
- **Postgres**: 5433
- **Redis**: 6379

## 3. Run Database Migrations
Tabel database harus dibuat sebelum backend siap digunakan. Jalankan command ini untuk injeksi skema SQL awal:

**Windows PowerShell:**
```powershell
Get-Content ../backend/migrations/000001_init.up.sql | docker exec -i stokku-postgres psql -U postgres -d stokku
```

**Git Bash / MacOS / Linux:**
```bash
docker exec -i stokku-postgres psql -U postgres -d stokku < ../backend/migrations/000001_init.up.sql
```

## 4. Akun Admin Default
Sistem secara otomatis membuat satu akun admin dari file migrasi awal. Gunakan kredensial ini untuk login dan mulai mengetes aplikasinya.
- **Email:** `admin@stokku.ai`
- **Password:** `admin123`

## 5. Mengakses Aplikasi
Buka url berikut di browser Anda:
**http://localhost:3001**

Anda akan diarahkan ke halaman login. Masukkan email dan password di atas lalu tekan enter.
Selamat mencoba!
