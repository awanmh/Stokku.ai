# CONTRIBUTING GUIDE — stokku.ai

Dokumen ini menjelaskan aturan kontribusi tim untuk menjaga workflow tetap rapi, minim conflict, dan sesuai standar industri.

---

## 1. Total Branch

### Branch Utama
- `main` → versi stabil (production/demo)
- `develop` → integrasi semua fitur

### Branch Feature (per orang)
- `feature/backend-core`
- `feature/ai-forecast`
- `feature/web-dashboard`
- `feature/mobile-scanner`
- `feature/devops-setup`

### Branch Tambahan (jika diperlukan)
- `fix/*` → perbaikan bug
- `hotfix/*` → perbaikan urgent
- `feature/integration-*` → integrasi sistem

👉 Total awal: **7 branch (2 utama + 5 feature)**

---

## 2. Pembagian Role Tim (Rekomendasi PALING IDEAL)

### Setiawan Muhammad — Backend Lead & System Architect
- Golang API (core logic)
- Database design (PostgreSQL)
- Redis locking (anti race condition)
- API contract

Branch:
```

feature/backend-core

```

---

### Muhammad Aqil Mahdi Syarif — AI Engineer
- Demand forecasting
- Model training
- AI API (FastAPI)
- Data preprocessing

Branch:
```

feature/ai-forecast

```

---

### Felix Yohanes Sangapta Simamora — Web Frontend
- Dashboard Next.js
- Analytics & chart
- Role-based UI

Branch:
```

feature/web-dashboard

```

---

### Neisya Nurul Alyazara — Mobile Developer
- Flutter app
- Barcode scanning
- Offline-first sync

Branch:
```

feature/mobile-scanner

```

---

### Hervin Dwicahya Kusuma — DevOps & Integration
- Docker & docker-compose
- Environment setup
- CI/CD
- Integrasi sistem

Branch:
```

feature/devops-setup

````

---

## 3. Flow Kerja Tim

### Step 1: Ambil update terbaru
```bash
git checkout develop
git pull origin develop
````

### Step 2: Buat branch sendiri

```bash
git checkout -b feature/nama-fitur
```

### Step 3: Coding & commit

```bash
git add .
git commit -m "feat: deskripsi fitur"
```

### Step 4: Push ke branch sendiri

```bash
git push origin feature/nama-fitur
```

### Step 5: Buat Pull Request (PR)

* Dari: `feature/...`
* Ke: `develop`

### Step 6: Review & Merge

* Setelah disetujui → merge ke `develop`

### Step 7: Update semua anggota

```bash
git checkout develop
git pull origin develop
```

---

## 4. Integration Phase (PENTING)

Setelah semua fitur utama selesai:

### Buat branch integrasi

```bash
git checkout develop
git checkout -b feature/integration-system
```

### Tujuan:

* Menggabungkan semua service
* Testing end-to-end
* Debug antar sistem

### Penanggung jawab:

* DevOps (Hervin)
* Backend Lead (Setiawan)

---

## 5. Cara Pull & Push yang Benar

### Saat mulai kerja

```bash
git checkout develop
git pull origin develop
git checkout feature/nama-fitur
git merge develop
```

---

### Saat selesai kerja

```bash
git add .
git commit -m "feat: perubahan"
git push origin feature/nama-fitur
```

---

### Penting:

* HANYA push ke branch sendiri
* JANGAN push langsung ke `develop` atau `main`

---

## 6. Aturan Wajib (BIAR GAK CHAOS)

### DILARANG:

* Push langsung ke `main`
* Push langsung ke `develop` tanpa PR
* Edit file di luar tanggung jawab tanpa koordinasi
* Force push sembarangan

---

### WAJIB:

* Gunakan branch masing-masing
* Selalu pull sebelum mulai kerja
* Gunakan Pull Request (PR)
* Commit dengan pesan jelas:

  * `feat:` → fitur baru
  * `fix:` → bug
  * `chore:` → config

---

## Cara Buat Pull Request (PR)

### Kondisi awal

Kamu sudah:

* kerja di branch sendiri
* sudah commit
* sudah push

Contoh:

```bash
git push origin feature/mobile-scanner
```

---

### 1. Buka GitHub Repository

* Masuk ke repo kalian di GitHub
* Biasanya langsung muncul tombol:

**“Compare & pull request”**

Klik itu ✅

---

### 2. Isi Pull Request

Di halaman PR:

### Pastikan:

* **Base branch**: `develop`
* **Compare branch**: `feature/nama-fitur`

---

### Isi:

#### Title:

```
feat: add mobile barcode scanner
```

#### Description:

```
Menambahkan fitur scanning barcode di mobile app:
- Scan barang masuk & keluar
- Integrasi ke backend API
- Handling offline mode (basic)
```

---

### 3. Submit PR

Klik:
**Create Pull Request**

---

### 4. Review (Opsional tapi bagus)

* Minta teman review
* Bisa comment / approve

---

### 5. Merge PR

Kalau sudah oke:

Klik:
**Merge Pull Request**

lalu:
**Confirm Merge**

---

### 6. (Optional) Delete Branch

Klik:
**Delete branch**

 biar repo tetap bersih

---

### 7. Semua tim update

Setelah merge:

```bash
git checkout develop
git pull origin develop
```

---

### Visual Flow Singkat

```text
feature/mobile-scanner
        ↓ push
GitHub
        ↓ PR
develop
        ↓ merge
Semua orang pull
```
---

### Best Practice:

* Satu orang fokus satu domain
* Komunikasi sebelum ubah bagian orang lain
* Test sebelum PR

---

## PENUTUP

Dengan mengikuti aturan ini:

* ✅ Minim conflict
* ✅ Workflow rapi
* ✅ Setara standar industri
