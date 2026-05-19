# Mobile Chatbot Handoff (Aqil → Hervin)

Dokumen ini merangkum status integrasi chatbot untuk mobile dan langkah lanjutan yang perlu dilanjutkan di branch mobile.

## Status Saat Ini

- Endpoint chatbot web sudah tersedia di `POST /api/chat`.
- CORS untuk route chatbot sudah diaktifkan (`POST`, `OPTIONS`).
- Fallback model sudah ditingkatkan: jika model non-default gagal, sistem retry ke `GEMINI_DEFAULT_MODEL`.
- Mock mode tersedia untuk pengembangan: set `USE_AI_MOCKS=1` di web environment.
- Mobile sudah punya integrasi awal:
  - `mobile/lib/core/network/chatbot_service.dart`
  - `mobile/lib/presentation/widgets/chatbot_fab.dart`
  - `mobile/lib/presentation/screens/home_screen.dart` (global FAB)

## Konfigurasi untuk Testing Mobile

1. Pastikan backend berjalan.
2. Jalankan web app (`/api/chat`) di host yang bisa diakses device Android/iOS.
3. Update `ApiConstants.chatbotUrl` di mobile agar menunjuk ke host web route chatbot.
4. Untuk test tanpa Gemini key, aktifkan mock mode di web:
   - `USE_AI_MOCKS=1`

## Kontrak Request / Response (Ringkas)

Request:

```json
{
  "message": "cek stok kritis hari ini",
  "model": "gemini-2.5-flash"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "reply": "...",
    "model": "gemini-2.5-flash"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "..."
}
```

## Yang Sudah Diverifikasi

- Intent smoke test di `/api/chat` (mock mode): inventory-summary, low-stock, forecast, replenishment, general.
- Model switching/fallback:
  - Model invalid → fallback ke `gemini-2.5-flash` terverifikasi.
  - Gemma gagal di provider → fallback ke default model terverifikasi.

## Next Steps untuk Hervin

- Ganti bottom-sheet chat prototype menjadi UI final sesuai design mobile.
- Tambahkan model selector di UI mobile (Flash/Gemma).
- Tambahkan retry button dan error-state per status (429, timeout, server error).
- Tambahkan widget tests untuk chatbot FAB dan basic send/receive flow.
