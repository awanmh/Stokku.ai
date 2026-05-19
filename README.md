# stokku.ai — Intelligent Supply Chain & Inventory Ecosystem (Develop Branch)

> **Branch ini berisi progress terbaru dan task assignment untuk setiap anggota tim.**
> Branch `main` tetap berisi README asli project.

---

## 📋 Status Project — 19 Mei 2026

### ✅ Yang Sudah Selesai (oleh Awan)

#### Merge & Integrasi (19 Mei 2026)
- **Merged `feature/chatbot` → `main`**: Integrasi Gemini AI chatbot API (`web/app/api/chat/route.ts`) dengan support multi-model (Gemini 2.5 Flash + Gemma 3 27B), intent detection, inventory context injection dari backend, dan fallback behavior.
- **Merged `mobile-building` → `main`**: Update mobile integration dengan local IP configuration dan pubspec.lock sync.
- **Conflict Resolution**: README.md (keep main original) dan FloatingChatbot.tsx (ambil versi chatbot baru dengan AI integration).

#### Backend (Golang Fiber)
- ✅ Clean Architecture (domain → repository → usecase → delivery)
- ✅ REST API lengkap: Auth (JWT + RBAC), Products, Warehouses, Inventory, Transactions, Dashboard Stats
- ✅ **36 unit tests — ALL PASS** (auth, product, transaction, warehouse usecases)
- ✅ OTP Authentication via Email (branch `feature/otp-login` — by Felix)
- ✅ Redis Distributed Lock untuk transaction safety
- ✅ PostgreSQL + migrations
- ✅ Docker setup

#### Frontend Web (Next.js 15 + Tailwind CSS v4)
- ✅ Enterprise-grade dashboard UI (Stripe/Linear inspired)
- ✅ Dark/Light mode theming dengan CSS Variables
- ✅ Pages: Dashboard Overview, Products, Warehouses, Inventory, Transactions, Settings, Profile
- ✅ AI Forecast page (placeholder — needs Python service)
- ✅ **Floating Chatbot (Stokku AI)** — sekarang terhubung ke Gemini API secara real-time
- ✅ Profile picture upload & change password UI
- ⚠️ ESLint: 9 errors (mostly `no-explicit-any` dan `setState-in-effect`), 10 warnings — **perlu diperbaiki**

#### Mobile (Flutter)
- ✅ Full app structure: Splash → Login → Home → Dashboard → Products → Warehouses → Inventory → Transactions → Scanner → Profile
- ✅ Provider state management
- ✅ Offline-first architecture (Hive + connectivity service)
- ✅ Barcode scanner integration
- ✅ Glassmorphism theme
- ⚠️ Widget test masih default counter test — **perlu diupdate**
- ❌ **Chatbot belum ada di mobile** — perlu ditambahkan

---

## ⚠️ Known Issues & Catatan Penting

### Environment Variables yang Belum Setup Global
| Variable | Lokasi | Status | PIC |
|---|---|---|---|
| `SMTP_EMAIL` + `SMTP_PASSWORD` | `backend/.env` | 🔴 Hanya di laptop Felix | Felix |
| `GEMINI_API_KEY` | `web/.env` | 🔴 Hanya di laptop Aqil | Aqil |
| `GEMINI_DEFAULT_MODEL` | `web/.env` | ✅ Default: `gemini-2.5-flash` | — |

### ESLint Errors yang Harus Diperbaiki
```
web/app/api/chat/route.ts         → no-explicit-any (line 412)
web/app/dashboard/forecast/page.tsx → no-explicit-any, no-unused-vars
web/app/dashboard/profile/page.tsx  → no-explicit-any, no-img-element
web/app/dashboard/settings/page.tsx → no-unused-vars
web/app/dashboard/transactions/page.tsx → no-unused-vars, no-explicit-any
web/app/login/page.tsx              → setState-in-effect
web/components/layout/header.tsx    → no-unused-vars
web/components/theme-provider.tsx   → no-unused-vars, setState-in-effect
```

### Mobile Test Issue
- `mobile/test/widget_test.dart` masih menggunakan default Flutter counter test (`MyApp` + counter increment) — tidak sesuai dengan app (`StokkuApp`).

---

## 🎯 Task Assignment Per Anggota

---

### 👤 Felix Yohanes Sangapta Simamora
**Branch**: `feature/felix-tasks`

#### Task 1: Setup & Dokumentasi OTP Email
- [ ] Buat `.env.shared.example` file yang berisi semua env variables yang dibutuhkan tim (SMTP + Gemini) dengan instruksi jelas
- [ ] Dokumentasikan cara setup Gmail App Password untuk SMTP di `SETUP.md`
- [ ] Pastikan fitur OTP login berfungsi end-to-end (register → kirim OTP → verify → login)

#### Task 2: Fix ESLint Errors — Login & Theme
- [ ] Fix `web/app/login/page.tsx` line 361 — `setState-in-effect` (gunakan `useSyncExternalStore` atau lazy initial state)
- [ ] Fix `web/components/theme-provider.tsx` line 31 — `setState-in-effect` (pindahkan ke initializer atau `useSyncExternalStore`)
- [ ] Fix `web/components/layout/header.tsx` — unused `theme` variable

#### Task 3: Testing — Backend OTP Flow
- [ ] Tambahkan unit test untuk OTP usecase di `backend/internal/usecase/` (minimal: send OTP, verify OTP success, verify OTP expired, verify OTP wrong code)
- [ ] Jalankan `go test ./... -v` dan pastikan semua PASS

#### Task 4: UI/UX Polish — Login Page
- [ ] Redesign login page agar tidak terlihat "AI-generated" — tambahkan ilustrasi/branding Stokku, animasi yang halus
- [ ] Pastikan form validation user-friendly (inline errors, loading states)
- [ ] Test responsive di mobile viewport (375px, 414px)

---

### 👤 Hervin Dwicahya Kusuma
**Branch**: `feature/hervin-tasks`

#### Task 1: Mobile — Chatbot Integration
- [ ] Buat `mobile/lib/presentation/screens/chatbot_screen.dart` atau implementasi sebagai **Floating Action Button (FAB)** seperti di web
- [ ] Connect ke endpoint `POST /api/chat` (melalui web proxy atau langsung ke Gemini API via mobile)
- [ ] Implementasi UI: bubble chat, typing indicator, quick replies, model selector
- [ ] Pastikan chatbot bisa diakses dari semua screen (global FAB di `HomeScreen`)

#### Task 2: Mobile — UI/UX Overhaul
- [ ] Review semua screen mobile — pastikan tidak terlihat "AI-generated"/template
- [ ] Perbaiki glassmorphism agar consistent di semua screen
- [ ] Tambahkan micro-animations (page transitions, button press effects, list item animations)
- [ ] Pastikan semua text menggunakan Bahasa Indonesia yang konsisten

#### Task 3: Mobile — Widget Tests
- [ ] Update `mobile/test/widget_test.dart` — ganti dari counter test ke `StokkuApp` smoke test
- [ ] Tambahkan minimal 5 widget tests:
  - Splash screen renders correctly
  - Login form validation
  - Dashboard stats card renders
  - Product list renders
  - Chatbot FAB appears on home screen

#### Task 4: Mobile — Backend Integration Testing
- [ ] Test semua endpoint dari mobile app dengan backend running (Docker)
- [ ] Verifikasi: Login → Dashboard load stats → View products → Create transaction → Scanner flow
- [ ] Dokumentasikan bugs/issues yang ditemukan di `MOBILE_ISSUES.md`

---

### 👤 Neisyah Nurul Alyazara
**Branch**: `feature/neisyah-tasks`

#### Task 1: Web UI/UX — Dashboard & Tables
- [ ] Redesign Dashboard Overview page — tambahkan chart yang lebih informatif, animasi counter-up untuk stats
- [ ] Perbaiki tabel di semua halaman (Products, Inventory, Transactions, Warehouses) — pastikan sorting, pagination, dan search konsisten
- [ ] Tambahkan empty states yang menarik (ilustrasi + CTA) saat data kosong
- [ ] Review semua modal forms — pastikan validasi inline, loading state, dan success feedback ada

#### Task 2: Web UI/UX — Profile & Settings
- [ ] Polish halaman Profile — fix `<img>` element (ganti ke `next/image`), tambahkan avatar upload preview
- [ ] Polish halaman Settings — fix unused imports, tambahkan konfirmasi saat delete/deactivate user
- [ ] Tambahkan breadcrumb navigation di semua halaman dashboard

#### Task 3: Fix ESLint Errors — Dashboard Pages
- [ ] Fix `web/app/dashboard/forecast/page.tsx` — `no-explicit-any` dan `no-unused-vars`
- [ ] Fix `web/app/dashboard/profile/page.tsx` — `no-explicit-any` dan ganti `<img>` ke `<Image />`
- [ ] Fix `web/app/dashboard/settings/page.tsx` — unused `SettingsIcon`
- [ ] Fix `web/app/dashboard/transactions/page.tsx` — unused `Badge`, `Calendar`, dan `no-explicit-any`

#### Task 4: Web — Responsive Testing
- [ ] Test semua halaman di viewport: 1920px (desktop), 1366px (laptop), 768px (tablet), 375px (mobile)
- [ ] Fix layout breaks yang ditemukan
- [ ] Dokumentasikan hasil testing di `WEB_RESPONSIVE_TEST.md`

---

### 👤 Muhammad Aqil Mahdi Syarif
**Branch**: `feature/aqil-tasks`

#### Task 1: Chatbot AI Enhancement
- [ ] Share `GEMINI_API_KEY` ke tim (buat key baru via Google AI Studio jika perlu, jangan share personal key)
- [ ] Test chatbot end-to-end: semua intent (inventory-summary, low-stock, dead-stock, replenishment, forecast, product-search, warehouse-search, general)
- [ ] Fix `no-explicit-any` di `web/app/api/chat/route.ts` line 412 — ganti `any` ke proper type
- [ ] Tambahkan error handling yang lebih user-friendly di chatbot UI (network error, timeout, rate limit)

#### Task 2: Chatbot — Mobile API Support
- [ ] Pastikan endpoint `/api/chat` accessible dari mobile (CORS handling jika perlu)
- [ ] Buat dokumentasi API chatbot di `CHATBOT_API.md` — request/response format, supported models, rate limits
- [ ] Coordinate dengan Hervin untuk integrasi chatbot di mobile

#### Task 3: AI Forecast Integration
- [ ] Review dan test halaman AI Forecast (`web/app/dashboard/forecast/page.tsx`)
- [ ] Jika Python AI service belum ready, buat mock response di backend untuk `/api/v1/ai/forecast` dan `/api/v1/ai/replenishment`
- [ ] Pastikan chatbot bisa menjawab pertanyaan forecast dengan data yang akurat

#### Task 4: Testing & Documentation
- [ ] Jalankan full integration test: Web chatbot → Backend API → Database
- [ ] Update `chatbot_documentation.md` dengan hasil testing terbaru
- [ ] Test model switching (Gemini Flash ↔ Gemma 3 27B) dan pastikan fallback behavior bekerja

---

## 📊 Test Results Summary (19 Mei 2026)

### Backend (Go) — ✅ ALL PASS
```
=== RUN   TestLogin_Success                --- PASS
=== RUN   TestLogin_WrongPassword           --- PASS
=== RUN   TestLogin_UserNotFound            --- PASS
=== RUN   TestLogin_DeactivatedUser         --- PASS
=== RUN   TestRegister_Success              --- PASS
=== RUN   TestRegister_DuplicateEmail       --- PASS
=== RUN   TestRegister_DefaultRole          --- PASS
=== RUN   TestGetProfile_Success            --- PASS
=== RUN   TestGetProfile_NotFound           --- PASS
=== RUN   TestCreateProduct_Success         --- PASS
=== RUN   TestCreateProduct_DuplicateSKU    --- PASS
=== RUN   TestCreateProduct_RepoError       --- PASS
=== RUN   TestGetProductByID_Success        --- PASS
=== RUN   TestGetProductByID_NotFound       --- PASS
=== RUN   TestGetAllProducts_Success        --- PASS
=== RUN   TestGetAllProducts_DefaultLimit   --- PASS
=== RUN   TestUpdateProduct_Success         --- PASS
=== RUN   TestUpdateProduct_NotFound        --- PASS
=== RUN   TestUpdateProduct_PartialUpdate   --- PASS
=== RUN   TestDeleteProduct_Success         --- PASS
=== RUN   TestDeleteProduct_NotFound        --- PASS
=== RUN   TestStockIn_Success               --- PASS
=== RUN   TestStockOut_Success              --- PASS
=== RUN   TestStockOut_InsufficientStock    --- PASS
=== RUN   TestStockOut_LockConflict         --- PASS
=== RUN   TestStockIn_LockError             --- PASS
=== RUN   TestCreateWarehouse_Success       --- PASS
=== RUN   TestCreateWarehouse_RepoError     --- PASS
=== RUN   TestGetWarehouseByID_Success      --- PASS
=== RUN   TestGetWarehouseByID_NotFound     --- PASS
=== RUN   TestGetAllWarehouses_Success      --- PASS
=== RUN   TestGetAllWarehouses_DefaultLimit --- PASS
=== RUN   TestUpdateWarehouse_Success       --- PASS
=== RUN   TestUpdateWarehouse_NotFound      --- PASS
=== RUN   TestUpdateWarehouse_DeactivateWarehouse --- PASS
=== RUN   TestDeleteWarehouse_Success       --- PASS
=== RUN   TestDeleteWarehouse_NotFound      --- PASS

TOTAL: 36 tests | 36 passed | 0 failed
```

### Frontend (ESLint) — ⚠️ 9 Errors, 10 Warnings
- Errors mostly: `no-explicit-any`, `setState-in-effect`
- Warnings mostly: `no-unused-vars`, `no-img-element`
- **Distributed ke task Felix, Neisyah, dan Aqil**

### Mobile (Flutter) — ⚠️ Test Belum Valid
- Widget test masih default counter — **assigned ke Hervin**

---

## 🔀 Branch Strategy

```
main ──────────────────────── (stable, README asli)
  └── develop ─────────────── (branch ini, task tracking)
       ├── feature/felix-tasks
       ├── feature/hervin-tasks
       ├── feature/neisyah-tasks
       └── feature/aqil-tasks
```

### Workflow
1. Setiap anggota **checkout dari `develop`** → buat branch masing-masing
2. Kerjakan task, commit dengan message yang jelas
3. Push ke branch masing-masing
4. Buat **Pull Request ke `develop`**
5. Setelah semua task selesai dan di-review, **merge `develop` → `main`**

---

## 🕐 Timeline

| Milestone | Target | PIC |
|---|---|---|
| Environment setup & key sharing | 20 Mei 2026 | Felix, Aqil |
| ESLint fixes complete | 21 Mei 2026 | Felix, Neisyah, Aqil |
| Mobile chatbot MVP | 23 Mei 2026 | Hervin, Aqil |
| UI/UX polish complete | 25 Mei 2026 | Neisyah, Hervin |
| Mobile integration tested | 25 Mei 2026 | Hervin |
| All tests passing | 26 Mei 2026 | ALL |
| Final merge to main | 26 Mei 2026 | Awan |

---

> **Note**: Jika ada pertanyaan atau blocker, langsung hubungi Awan (Project Lead).
> Pastikan commit message mengikuti format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
