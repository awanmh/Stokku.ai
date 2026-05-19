# Stokku AI — Floating Chatbot Documentation

## 1. Deskripsi Fitur
Stokku AI adalah chatbot berbasis **Floating Action Button (FAB)** yang terintegrasi di seluruh halaman dashboard Stokku.ai. Chatbot ini dapat diakses kapan saja oleh pengguna melalui tombol melayang di pojok kanan bawah layar, tanpa berpindah halaman.

Saat tombol ditekan, sebuah **panel percakapan pop-up** akan muncul dengan animasi slide-up. Panel ini berukuran compact (380×520px) sehingga tidak menutupi seluruh layar dan tidak mengganggu aktivitas utama pengguna.

## 2. Tujuan dan Manfaat dalam Sistem Stokku.ai
Stokku AI berfungsi sebagai **asisten pintar (virtual assistant)** yang membantu pengguna:
- Mendapatkan informasi cepat tentang **stok kritis** tanpa membuka halaman inventaris.
- Menerima **rekomendasi restock** berdasarkan prediksi AI Forecast.
- Mengidentifikasi **dead-stock** (barang tidak terjual dalam 3 bulan).
- Melihat **ringkasan inventaris** secara instan.
- Mengambil keputusan bisnis dengan lebih cepat dan efisien.

### Integrasi API Saat Ini
- **Web chatbot route:** `POST /api/chat` di Next.js web app.
- **Backend AI placeholder:** `GET /api/v1/ai/forecast` dan `GET /api/v1/ai/replenishment` di backend Go.
- **Mode mock dev:** aktifkan `USE_AI_MOCKS=1` untuk membalas chatbot tanpa Gemini key, cocok untuk smoke test dan demo lokal.

## 3. Desain dan Pendekatan UI/UX
### Prinsip Desain
- **Non-intrusive:** Panel chat tidak menutupi seluruh layar; pengguna tetap bisa melihat konten di belakangnya.
- **Aksesibel dari mana saja:** FAB tampil di semua halaman dashboard (Overview, Produk, Gudang, dll.).
- **Konsisten:** Menggunakan design tokens yang sama dengan sistem (warna, border, font).
- **Responsif:** Panel menyesuaikan ukuran layar dengan `max-w-[calc(100vw-2rem)]` dan `max-h-[80vh]`.

### Komponen Visual
| Komponen | Deskripsi |
|---|---|
| **FAB (Floating Action Button)** | Tombol bulat `h-12 w-12` di pojok kanan bawah, ikon berubah antara `MessageSquare` (tutup) dan `X` (buka) dengan animasi rotasi. |
| **Header Panel** | Nama "Stokku AI", indikator status online (titik hijau berkedip), tombol minimize & close. |
| **Area Chat** | Container scrollable dengan auto-scroll ke pesan terbaru. |
| **Bubble Chat** | User (kanan, warna primer) vs Bot (kiri, warna sekunder + border). Avatar kecil di setiap pesan. |
| **Typing Indicator** | Tiga titik yang bounce bergantian menggunakan Framer Motion. |
| **Quick Replies** | Tombol-tombol saran cepat yang muncul saat awal percakapan. |
| **Input Area** | Text input + tombol send, dengan disclaimer di bawahnya. |

### Teknologi
- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 dengan custom design tokens
- **Animasi:** Framer Motion — slide-up panel, fade-in pesan, bounce typing dots, rotasi ikon FAB
- **Komponen UI:** Avatar, Button (dari shadcn/ui-based library)
- **Iconography:** lucide-react (MessageSquare, Bot, User, Send, X, Minus, Sparkles, Loader2)

## 4. Alur Interaksi Pengguna dengan Chatbot
```
┌─────────────────────────────────────────────────┐
│ Pengguna berada di halaman dashboard mana saja  │
└──────────────────┬──────────────────────────────┘
                   ▼
         ┌─────────────────┐
         │ Klik tombol FAB  │ (pojok kanan bawah)
         └────────┬────────┘
                  ▼
     ┌────────────────────────┐
     │ Panel chat muncul      │ (animasi slide-up)
     │ + Pesan sapaan bot     │
     │ + Quick reply buttons  │
     └───────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Pengguna mengetik pesan │ (atau klik quick reply)
    │ → Tekan Enter / Send    │
    └───────────┬─────────────┘
                ▼
     ┌──────────────────────┐
     │ Input dikunci         │
     │ Typing indicator      │ (1-2 detik)
     │ muncul                │
     └──────────┬───────────┘
                ▼
     ┌──────────────────────┐
     │ Bot merespons         │
     │ Auto-scroll ke bawah  │
     │ Input terbuka kembali │
     └──────────┬───────────┘
                ▼
     ┌──────────────────────┐
     │ Ulangi / Tutup panel  │
     │ (klik X, Minimize,    │
     │  atau FAB lagi)       │
     └──────────────────────┘
```

## 5. Kata Kunci Mock Response
| Kata Kunci | Respons Chatbot |
|---|---|
| `stok`, `habis`, `kritis`, `stock` | Daftar produk dengan stok kritis |
| `restock`, `pengadaan`, `rekomendasi`, `beli` | Rekomendasi restock berdasarkan AI Forecast |
| `dead`, `mati`, `lama`, `tidak laku` | Deteksi dead-stock dan saran promo |
| `info`, `inventaris`, `ringkasan`, `summary` | Ringkasan keseluruhan inventaris |
| `halo`, `hai`, `hi` | Sapaan dan panduan fitur |
| `terima kasih`, `makasih`, `thanks` | Respons terima kasih |
| Lainnya | Pesan fallback dengan panduan kata kunci |

### Contoh Mode Mock Dev
- Request ke `POST /api/chat` dengan `USE_AI_MOCKS=1` akan mengembalikan jawaban deterministik berbasis intent.
- Mode ini tetap mengambil konteks inventaris dari backend, sehingga cocok untuk testing alur UI tanpa dependency Gemini.

## 6. Hasil Pengujian (QA Testing)

### Pengujian Fungsional
| Test Case | Status | Catatan |
|---|---|---|
| FAB muncul di semua halaman dashboard | ✅ Pass | Dirender di `dashboard/layout.tsx` |
| Klik FAB membuka panel chat | ✅ Pass | Animasi slide-up smooth |
| Klik FAB saat panel terbuka → menutup | ✅ Pass | Ikon berubah dari X ke MessageSquare |
| Klik tombol X/Minimize menutup panel | ✅ Pass | Panel tertutup dengan animasi |
| Kirim pesan via tombol Send | ✅ Pass | Pesan muncul di bubble kanan |
| Kirim pesan via Enter key | ✅ Pass | Same behavior |
| Input kosong tidak bisa dikirim | ✅ Pass | Tombol Send disabled saat input kosong |
| Input hanya spasi tidak bisa dikirim | ✅ Pass | `.trim()` validation |
| Typing indicator muncul saat bot memproses | ✅ Pass | Dots bounce animation |
| Bot merespons setelah delay | ✅ Pass | Random 1-2 detik |
| Auto-scroll ke pesan terbaru | ✅ Pass | Smooth scroll behavior |
| Quick replies muncul di awal | ✅ Pass | Hilang setelah percakapan dimulai |
| Input disabled saat bot mengetik | ✅ Pass | Mencegah spam |

### Pengujian Visual & Responsivitas
| Test Case | Status | Catatan |
|---|---|---|
| Dark mode konsisten | ✅ Pass | Menggunakan design tokens |
| Light mode konsisten | ✅ Pass | Menggunakan design tokens |
| Responsif di desktop (>1024px) | ✅ Pass | Panel 380×520px |
| Responsif di mobile (<640px) | ✅ Pass | `max-w-[calc(100vw-2rem)]` |
| Panel tidak menutupi seluruh layar | ✅ Pass | Ukuran compact |
| TypeScript compilation | ✅ Pass | Zero errors (`tsc --noEmit`) |

## 7. Kendala yang Ditemukan & Solusi

| Kendala | Solusi |
|---|---|
| Pengguna bisa spam pesan saat bot memproses | State `isTyping` → disable input & send button |
| Backend AI belum tersedia untuk chatbot | Implementasi mock response dengan keyword matching |
| Markdown rendering di chat bubble | Membuat fungsi `renderMessageText()` untuk bold text (`**text**`) |
| FAB bisa tertutup oleh elemen lain | Menggunakan `z-50` fixed positioning |
| Mobile butuh akses chat API | Tambahkan CORS di `POST /api/chat` dan preflight `OPTIONS` |

## 8. Kontrak Response Chatbot

### Success Response
```json
{
     "success": true,
     "data": {
          "reply": "Ringkasan jawaban chatbot",
          "model": "gemini-2.5-flash"
     }
}
```

### Error Response
```json
{
     "success": false,
     "message": "Pesan error yang bisa ditampilkan ke user"
}
```

### Catatan Error Handling
- Gunakan pesan ramah untuk network error, timeout, atau rate limit.
- Jika Gemini tidak tersedia, aktifkan `USE_AI_MOCKS=1` untuk demo/testing lokal.

## 9. Evaluasi & Saran Pengembangan Lanjutan

### Prioritas Tinggi
1. **Chat History (Riwayat Percakapan):** Simpan percakapan ke database/localStorage agar pengguna bisa melanjutkan sesi chat yang terputus.
2. **Smart Suggestion / Quick Reply Dinamis:** Tampilkan saran berdasarkan konteks percakapan terakhir, bukan hanya di awal.
3. **Integrasi Backend AI:** Hubungkan dengan endpoint API yang menggunakan LLM (Large Language Model) untuk memahami intent dan konteks secara natural.

### Prioritas Menengah
4. **Analisis Inventory Real-time:** LLM dengan function calling untuk query langsung ke database Stokku.ai dan memberikan jawaban berbasis data aktual.
5. **Notifikasi Insight Penting:** Chatbot secara proaktif menginformasikan stok kritis, overstock, atau anomali saat pengguna membuka panel.
6. **Personalisasi Respons:** Sesuaikan respons berdasarkan peran pengguna (admin vs. staff gudang) dan data bisnis spesifik.

### Prioritas Rendah
7. **Voice Input:** Dukungan input suara untuk mempercepat interaksi.
8. **Export Chat:** Kemampuan mengunduh riwayat percakapan dalam format PDF/CSV.
9. **Multi-language Support:** Dukungan bahasa Inggris selain Bahasa Indonesia.

## 10. Struktur File

```
web/
├── app/dashboard/
│   └── layout.tsx              ← Mounting FloatingChatbot
├── components/
│   ├── chat/
│   │   └── FloatingChatbot.tsx ← Komponen utama chatbot
│   ├── layout/
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   └── ui/
│       ├── avatar.tsx
│       └── button.tsx
```
