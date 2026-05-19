# Chatbot API — Stokku.ai

Dokumentasi singkat untuk integrasi Chatbot (`/api/chat`) dan AI endpoints pendukung (`/api/v1/ai/*`). Ditujukan untuk pengembang web & mobile.

## Ringkasan Endpoint

- `POST /api/chat` — route Next.js (web) yang meneruskan permintaan ke Gemini (server-side). Mobile disarankan memanggil endpoint ini (tidak perlu API key di client).
- `GET /api/v1/ai/forecast` — (backend) memberikan data forecast untuk produk/gudang (digunakan sebagai konteks oleh chatbot).
- `GET /api/v1/ai/replenishment` — (backend) memberikan saran replenishment.

---

## POST /api/chat

URL: `/api/chat`

Auth: optional — server membaca cookie `token` bila tersedia (untuk konteks user). Mobile clients should include session cookie or call via backend proxy.

Request JSON (example):

{
  "message": "stok beras pulen habis di gudang A",
  "messages": [{ "role": "user", "content": "stok beras" }],
  "model": "gemini-2.5-flash"
}

Rules:
- `message` OR `messages` harus diisi.
- `model` optional; jika tidak valid akan pakai default (`gemini-2.5-flash`).

Success Response (200):

{
  "success": true,
  "data": {
    "reply": "Ringkasan ...",
    "model": "gemini-2.5-flash"
  }
}

Errors:
- 400 — pesan kosong atau request invalid.
- 500 — server misconfiguration (mis. `GEMINI_API_KEY` tidak terpasang).
- 502 — kegagalan panggilan ke Gemini (payload/timeout).

Behavior & Notes:
- Server menambahkan konteks inventaris dari backend (`/api/v1/dashboard/stats`, alerts, dsb.) sebelum memanggil model.
- Jika model `gemma-*` digunakan, server menyisipkan `system` message berbeda.
- Jika model menolak developer instruction, server mencoba fallback ke default model dan mengembalikan pesan error/fallback.
- Rate-limiting: batasi permintaan per IP/akun (disarankan 1-2 req/s, burst 5).

Client example (mobile) — fetch:

```javascript
fetch('https://your-web-host/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'cek stok gula' }),
  credentials: 'include' // jika pakai cookie session
})
.then(r => r.json())
```

---

## GET /api/v1/ai/forecast

URL: `/api/v1/ai/forecast?product_id={id}&warehouse_id={id}`

Purpose: memberikan data forecast terstruktur (dipakai untuk konteks chatbot dan halaman AI Forecast).

Response example:

{
  "success": true,
  "data": {
    "product_id": "abc",
    "warehouse_id": "wh-1",
    "forecast": [ { "date": "2026-06-01", "predicted_demand": 120, "confidence": 0.82 } ],
    "recommendation": "Tambahkan 200 unit dalam 14 hari",
    "status": "ok"
  }
}

If service not ready: return `success: false` or a 204/404 with helpful message. For development, you can mock this endpoint with static JSON.

---

## GET /api/v1/ai/replenishment

URL: `/api/v1/ai/replenishment?limit=10`

Response example:

{
  "success": true,
  "data": {
    "suggestions": [
      { "product_name": "Gula", "product_sku":"SKU123", "current_stock": 5, "recommended_order": 100, "estimated_stockout": "2026-05-25", "priority": "high" }
    ],
    "status": "ok"
  }
}

---

## Supported Models & Fallback

- Supported (example): `gemini-2.5-flash`, `gemma-3-27b` (nama model sesuai setting `GEMINI_DEFAULT_MODEL` / `CHAT_MODEL_OPTIONS`).
- Fallback: jika model menolak developer instruction, server mencoba `GEMINI_DEFAULT_MODEL` dan mengembalikan respons fallback.

---

## Error Handling & Timeouts

- Set client timeout ~30s. Server harus menangani 5xx dari Gemini dan mengembalikan pesan yang ramah: "Terjadi gangguan pada layanan AI. Coba lagi nanti."
- Untuk rate limit exceeded, kembalikan 429.

---

## CORS & Mobile Access

- `POST /api/chat` berjalan di Next.js (web). Mobile apps can either:
  - Call backend API directly (recommended) — ensure backend exposes the same chatbot proxy, or
  - Call the web `/api/chat` with proper CORS and credentials. If you choose this, enable CORS on the web host for the mobile app origin or use the backend as proxy.

## Testing & Mocking (development)

- Untuk pengembangan lokal, buat mock routes returning the example `forecast`/`replenishment` JSON di backend.
- Example mock payload for `/api/v1/ai/forecast` is included above. Mobile/web devs can use these to validate UI flows.

---

## Quick checklist for integrator (Aqil → Hervin)

- [ ] Pastikan `GEMINI_API_KEY` hanya disimpan server-side.
- [ ] Share instructions untuk membuat key baru (tidak membagikan key pribadi).
- [ ] Sediakan sample fetch snippet untuk mobile (see above).
- [ ] Siapkan mock endpoints jika Python AI service belum tersedia.

---

File ini dibuat untuk membantu integrasi cepat. Jika mau, saya bisa tambahkan cURL examples, Postman collection snippet, dan draft `mock` handler di backend.
