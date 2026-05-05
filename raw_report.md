# Laporan Progress Tim - Stokku.ai
**Nama / Anggota:** Awan MH
**Bagian/Modul yang Dikerjakan:** Infrastructure (Docker), Domain Layer (DDD), & API Delivery (HTTP/Router)

---

## 1. Summary Progress Pengerjaan

Sebagai penanggung jawab arsitektur dasar dan komunikasi API pada sistem **Stokku.ai**, fokus pekerjaan pada fase ini adalah membangun fondasi infrastruktur yang *reproducible*, merancang entitas sistem sesuai konsep *Domain-Driven Design* (DDD), serta mendesain *API gateway routing*.

### ✅ Bagian yang Sudah Dikerjakan (Completed)

#### A. Containerization & Arsitektur Infrastruktur (Docker)
- **Konfigurasi Lingkungan Terisolasi:** Mengimplementasikan orkestrasi container menggunakan `docker-compose.yml` dengan integrasi layanan *full-stack* yang terdiri dari:
  - **Database:** PostgreSQL 16 berjalan dengan *persistent volume* (`postgres_data`) dan skrip automasi migrasi.
  - **Cache:** Redis 7-*alpine* untuk optimasi kapabilitas membaca sistem.
  - **Backend Layer:** *Golang API container* dengan manajemen *environment variables* yang terinjeksi dari file `.env`.
  - **Frontend Layer:** Lingkungan *Next.js container* yang mensinkronisasi URL *proxy rewrite* (*Server-to-Server*) menuju backend port 8080.
- **Service Orchestration Validation:** Mengimplementasikan `healthcheck` layer pada database dan cache (menggunakan `pg_isready` dan `redis-cli ping`) guna menjamin *backend node* tidak berstatus siap (`ready`) hingga dependensi fundamental menyala dengan sempurna (`condition: service_healthy`).

#### B. Perancangan Domain Driven Design (Domain Layer)
- Mendefinisikan entitas utama sistem dan representasi abstraksi kontrak antarmuka di dalam `backend/internal/domain/`.
- **Implementasi Entitas Solid:** Penyusunan struktur objek pada skripting `product.go`, `transaction.go`, `user.go`, dan `warehouse.go`. 
  *Contoh pada `product.go`:* Menyusun struktur `Product` dasar, *Data Transfer Objects* (`CreateProductRequest`, `UpdateProductRequest`), parameter logik filter parametrik (`ProductFilter`), dan abstraksi antarmuka `ProductRepository`. Hal ini menjamin independensi *business logic layer* dan mempermudah testing.

#### C. API Delivery & Middleware System (Delivery)
- **Fast HTTP Routing (Go Fiber):** Menginisialisasi *HTTP Delivery mechanism* yang optimal pada berkas `router.go`.
- **RBAC & Security Guard:** Menyusun arsitektur akses aman berbasis Role-Based Access Control (RBAC) dan otentikasi JWT pada *Group API Router v1*. Pemetaan route terkelompok secara hirarkis meliputi `/auth`, `/users`, `/products`, `/warehouses`, `/transactions`, `/dashboard`, dan placeholder `/ai`.
- **Middleware Integration:** Memasang fungsi global *CORS* (melalui `middleware/cors.go`) serta instrumen log pencatat standar (Logger middleware). Proteksi route direalisasikan menggunakan *custom middleware* `RoleGuard` (misal pembatasan akses tulis pada `/warehouses` dan `/users` yang eksklusif bagi *RoleAdmin* atau delegasi tugas kepada *RoleWarehouseStaff`).

### ⏳ Bagian yang Masih/Belum Dikerjakan (In-Progress & To-Do)
1. **Docker Production Hardening:** Transisi *Dockerfile* backend menuju skema *distroless multi-stage build* untuk memperkecil *image sizes* sistem produksi dan mitigasi *attack surface*.
2. **Delivery Integration Test:** Pembangunan unit dan integrasi tes E2E pada level implementasi fungsi handler spesifik (seperti resolusi data di `transaction_handler.go`).
3. **API Documentation:** Mengeneralisasi dan me-*render* notasi `swaggo/swag` pada level delivery sebagai dokumentasi interaktif untuk tim UI/UX Web.

---

## 2. Screenshot Progress Aplikasi

*(Catatan: Silakan substitusikan teks kotak merah / placeholder di bawah ini dengan gambar screenshot nyata (Screenshot tools/IDE yang Anda gunakan).*

### Screenshot 1: Container Docker Berjalan Sempurna
**Deskripsi:** Layar terminal (atau antarmuka UI Docker Desktop) yang mendemonstrasikan status kesehatan layanan kontainer Postgres, Redis, golang-backend, dan web Next.js berstatus *healthy/running* up to date dengan `docker-compose up`.

> **[SISIPKAN GAMBAR SCREENSHOT DOCKER TEMINAL/DESKTOP DI SINI]**

---

### Screenshot 2: Struktur Code domain/ dan delivery/
**Deskripsi:** Layout *file explorer* di dalam teks editor (VS Code) yang menampilkan rapinya struktur penataan direktori `internal/domain` (menyimpan blueprint entitas) dan `internal/delivery/http` (middleware, handler, dan router) sesuai panduan arsitektur *Clean Architecture*.

> **[SISIPKAN GAMBAR SCREENSHOT VS CODE (IDE) STRUKTUR DIREKTORI DI SINI]**

---

### Screenshot 3: Pengujian Validasi Delivery Endpoint
**Deskripsi:** Screenshot antarmuka perkakas API testing (Postman / Insomnia Otoritatif) yang menunjukkan capaian *status code* 200 OK ketika mengeksekusi testing pada *Public Endpoint* lokal (`GET localhost:8080/health`), mengkonfirmasi kesiapan sistem routing yang dirancang melontarkan respons berbentuk JSON.

> **[SISIPKAN GAMBAR SCREENSHOT POSTMAN / INSOMNIA DI SINI]**

---

*Laporan dihasilkan pada:* 13 April 2026.
