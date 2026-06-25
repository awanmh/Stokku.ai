<div align="center">
  <h1>🚀 Stokku.ai</h1>
  <p><b>Intelligent Supply Chain & Inventory Ecosystem</b></p>
  <p>Sistem manajemen inventaris tingkat <i>enterprise</i> yang memadukan keandalan arsitektur modern dengan kecerdasan buatan (Generative AI), dirancang untuk efisiensi, skalabilitas, dan pengalaman pengguna premium tanpa kompromi.</p>

  [![Golang](https://img.shields.io/badge/Go-1.24-00ADD8?style=flat-square&logo=go)](https://go.dev/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=flat-square&logo=flutter)](https://flutter.dev/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)
  [![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
</div>

---

## 🌟 Memperkenalkan Stokku.ai

**Stokku.ai** bukanlah sekadar aplikasi pencatatan stok biasa. Ini adalah sebuah ekosistem holistik yang dirancang untuk memberikan kendali penuh atas rantai pasok Anda dengan antarmuka yang elegan dan asisten AI terintegrasi. 

Dibangun dengan filosofi bahwa *"setiap piksel harus memiliki makna"*, Stokku.ai menawarkan pengalaman yang responsif, visualisasi data yang mewah, serta keandalan performa *backend* yang mampu menangani transaksi tingkat tinggi dengan mekanisme *Distributed Locking*.

### ✨ Fitur Utama

- 🧠 **Asisten Stokku AI (Real-time Generative AI)**  
  Mengintegrasikan Google Gemini 2.5 Flash / Gemma 3. Berinteraksi dengan inventaris Anda melalui bahasa natural. Tanyakan *“Berapa stok produk yang menipis?”* atau *“Beri saya ringkasan transaksi hari ini”*, dan AI akan menjawab berdasarkan konteks data langsung dari *database* Anda.
  
- 📱 **Ekosistem Lintas Platform (Web & Mobile)**  
  Kelola gudang Anda melalui *Dashboard Web* yang elegan terinspirasi dari standar desain Arc dan Linear, atau pantau operasional dari lapangan menggunakan *Aplikasi Mobile* berkinerja tinggi yang dilengkapi *Barcode Scanner* dan arsitektur *Offline-first*.

- 📊 **Visualisasi Data Premium & Laporan Otomatis**  
  Analisis pergerakan produk dengan grafik metrik yang interaktif. Cetak laporan operasional secara instan dalam format PDF yang rapi atau lembar kerja Excel langsung dari perangkat Anda.

- 🛡️ **Keamanan Kelas Enterprise (RBAC & OTP)**  
  Dilengkapi autentikasi melalui surel OTP (One-Time Password) dan *Role-Based Access Control* (RBAC). Hak akses sistem (Admin, Manajer, Staf) direstriksi secara ketat mulai dari level *middleware routing API* hingga perenderan *UI Frontend*.

---

## 🏗️ Arsitektur Sistem

Stokku.ai memanfaatkan **Clean Architecture** pada *backend* untuk memastikan skalabilitas dan isolasi bisnis logik.

```mermaid
graph TD
    %% Styling
    classDef client fill:#000,stroke:#333,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef proxy fill:#2496ED,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef backend fill:#00ADD8,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef db fill:#4169E1,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef cache fill:#DC382D,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef ai fill:#8E75B2,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;

    %% Nodes
    Mobile[📱 Flutter Mobile App<br><i>(Offline-First Hive)</i>]:::client
    Web[💻 Next.js Web Dashboard<br><i>(React 19, Tailwind v4)</i>]:::client
    Proxy[🌐 Next.js API Proxy / SSR]:::proxy
    Backend[⚙️ Golang Fiber API<br><i>(Clean Architecture)</i>]:::backend
    Postgres[(🗄️ PostgreSQL 16<br><i>Primary DB</i>)]:::db
    Redis[(⚡ Redis 7<br><i>Cache & Mutex Lock</i>)]:::cache
    Gemini{🤖 Google Gemini API}:::ai

    %% Connections
    Mobile -->|REST API| Backend
    Mobile -->|REST API| Proxy
    Web -->|Internal Calls| Proxy
    Proxy -->|Rewrites /api/chat| Gemini
    Proxy -->|Rewrites /api/v1/*| Backend
    Backend -->|Read/Write| Postgres
    Backend -->|Distributed Lock / OTP| Redis
```

### 🧩 Tech Stack

| Domain | Teknologi | Deskripsi |
|---|---|---|
| **Backend** | Go 1.24, Fiber v2, pgx | Menggunakan *Clean Architecture* (Domain/Repo/Usecase/Delivery). Cepat, memori efisien. |
| **Frontend** | Next.js 15, Tailwind v4, Recharts | Arsitektur *App Router*, UI/UX premium *glassmorphism*, responsif. |
| **Mobile** | Flutter, Provider, Hive, Dio | Performa *native-like*, *Barcode Scanner*, manajemen state *Provider*. |
| **Database** | PostgreSQL 16 | Relasional, kuat, menjamin integritas referensial. |
| **Cache/Lock** | Redis 7 | Mengunci transaksi (*mutex*) untuk mencegah manipulasi stok ganda (*race condition*). |
| **AI** | Google Gemini API | Menginjeksi konteks gudang secara dinamis (*Prompt Engineering*) untuk chat cerdas. |
| **DevOps** | Docker, GitHub Actions | Orkestrasi 4-*container* dengan `docker-compose`, pengujian CI otomatis via GitHub Actions. |

---

## 🚦 Alur Kerja Operasional (Flow)

1. **Autentikasi (OTP & Roles)**
   Pengguna mendaftar dan memverifikasi identitas melalui kode OTP yang dikirim via surel. Setelah masuk, token JWT memuat peran (*Role*) pengguna (Mis: `Admin` dapat menghapus produk, `Staff` hanya dapat menyesuaikan stok masuk/keluar).
2. **Manajemen Produk & Gudang**
   Inventaris diregistrasikan berdasarkan SKU yang unik ke dalam gudang-gudang fisik maupun digital. Sistem melacak ambang batas persediaan minimum (*Low Stock Threshold*).
3. **Transaksi Barang (In/Out)**
   Saat persediaan masuk atau keluar, sistem mengunci baris produk via Redis (*Distributed Lock*) memastikannya tidak mengalami kebocoran stok atau *race condition* walau diakses bersamaan oleh 1000 kurir di *mobile app*.
4. **Analitik & Intervensi AI**
   Di Dasbor, metrik vital dipantau via grafik (*Recharts*). Pengguna dapat memanggil *Stokku AI* yang melayang di pojok layar, yang secara dinamis telah disuntik (*injected*) dengan kondisi data inventaris saat itu juga untuk memberi saran dan laporan lisan.

---

## 🚀 Panduan Memulai (Quick Start)

Kami telah membungkus (Dockerized) keseluruhan ekosistem sehingga Anda dapat meluncurkannya dengan satu langkah sederhana.

### Prasyarat
- Docker Engine & Docker Compose (v2.x)
- Port `3000` (Web), `8080` (API), `5432` (DB), `6379` (Redis) harus tersedia/bebas.

### Langkah Instalasi

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/awanmh/Stokku.ai.git
   cd Stokku.ai
   ```

2. **Atur Variabel Lingkungan**
   Sistem telah memiliki nilai konfigurasi *default* di `docker/docker-compose.yml`, namun untuk fitur AI dan Surel beroperasi penuh, salin *template* `.env.shared.example` ke dalam repositori sesuai kebutuhan layanan (*Backend* dan *Web*).
   *Pastikan Anda menempatkan `GEMINI_API_KEY` pada folder Web.*

3. **Jalankan Peladen (Docker Compose)**
   ```bash
   cd docker
   docker compose up --build -d
   ```
   > 💡 *Perintah ini akan secara otomatis menarik citra dasar, melakukan proses kompilasi kode Go dan Next.js, membuat basis data, serta meluncurkan 4 kontainer yang saling terhubung dalam hitungan menit.*

4. **Akses Ekosistem**
   - 🌐 **Web Dashboard**: Buka browser ke `http://localhost:3000`
   - ⚙️ **Backend API**: Berjalan di `http://localhost:8080`

### 📱 Mengompilasi Mobile App (Opsional)
Jika Anda ingin meluncurkan versi aplikasinya di piranti Android/iOS, pastikan Anda telah memasang SDK Flutter.
```bash
cd mobile
flutter pub get
flutter run
```
> *(Atur API Host Address ke `10.0.2.2:8080` jika menggunakan Android Emulator, atau alamat IP lokal komputer peladen Anda jika menggunakan perangkat fisik).*

---

## 🤝 Berkontribusi
Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan standar penulisan kode, konvensi *commit*, dan kerangka kerja *Pull Request*. Repositori memprioritaskan metode *Branching*: Semua fitur diimplementasikan di cabangnya masing-masing sebelum dilebur (Merge) ke `develop` dan akhirnya dirilis ke `main`.

---
<div align="center">
<i>Crafted with precision for modern enterprises.</i><br>
<b>Stokku.ai Team © 2026</b>
</div>
