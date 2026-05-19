# Template Sharing GEMINI API Key (Aman)

Gunakan template ini untuk menyelesaikan task **Share `GEMINI_API_KEY` ke tim** tanpa membocorkan key ke repo atau chat publik.

## Aturan Wajib

- Jangan commit key ke git.
- Jangan kirim key di grup/chat umum.
- Kirim hanya via secret manager atau DM terenkripsi.
- Setelah onboarding tim selesai, lakukan rotasi key bila perlu.

## Channel yang Direkomendasikan

1. Secret manager tim (1Password/Bitwarden/Vault) — **paling direkomendasikan**
2. DM terenkripsi (sementara)

## Template Pesan (tanpa menempel key di sini)

Salin dan kirim ke tim:

```
Hi tim,

GEMINI_API_KEY untuk Stokku sudah siap.

Lokasi secret:
- <nama secret manager / vault path>
- Secret name: GEMINI_API_KEY

Langkah pakai:
1) Ambil key dari secret manager
2) Simpan di `web/.env`:
   GEMINI_API_KEY=<paste-key>
   GEMINI_DEFAULT_MODEL=gemini-2.5-flash
3) Jalankan ulang web server

Catatan keamanan:
- Jangan upload `.env`
- Jangan share key ke channel publik

Thanks.
```

## Checklist Selesai Task

- [ ] Key sudah disimpan di secret manager
- [ ] Akses sudah diberikan ke anggota tim terkait
- [ ] Tim sudah konfirmasi bisa menjalankan chatbot
- [ ] Tidak ada key yang dikirim di channel publik
