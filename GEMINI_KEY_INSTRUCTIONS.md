# Gemini API Key — Pembuatan & Sharing (Instruksi untuk Tim)

Panduan singkat untuk membuat API key baru di Google AI Studio dan membagikan akses dengan aman kepada tim Stokku.

1. Masuk ke Google Cloud / AI Studio dengan akun perusahaan atau akun yang Anda gunakan untuk proyek.
2. Buka menu API Keys / Credentials → Buat API Key baru.
3. Beri nama yang jelas: `stokku-gemini-key-<nama>`.
4. Batasi key: tambahkan restriction berdasarkan IP (opsional) dan layanan `Generative Language API`.
5. Setelah key dibuat, **jangan** membagikan key mentah di Slack/Chat publik.
6. Untuk sharing internal:
   - Upload key ke vault perusahaan (recommended), atau
   - Gunakan secure channel (1Password/Bitwarden/LastPass) dan tandai sebagai "secrets/stokku/gemini".
7. Di setiap environment (web backend), simpan key di environment variable `GEMINI_API_KEY`.
8. Jika perlu memberikan akses ke rekan sementara (mis. Aqil → Hervin), minta mereka membuat key sendiri dan tambahkan ke vault atau buat key baru dan rotasi setelah selesai.

Tips keamanan:
- Rotate key setiap 90 hari.
- Jika key terlanjur tersebar, revoke segera dan buat key baru.
- Jangan commit key ke repo. Gunakan `.env` atau secret manager.

Jika Anda ingin, saya bisa membuat template email atau pesan yang bisa Anda kirimkan ke tim untuk proses sharing.
