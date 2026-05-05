# Stokku Assistant Chatbot Documentation

## 1. Fitur yang Telah Dibuat
- **Antarmuka Chat (Chat Interface):** Halaman responsif yang dirancang menyerupai aplikasi perpesanan modern. 
- **Auto-scroll:** Tampilan otomatis bergulir ke pesan terbaru ketika ada pesan baru dari pengguna maupun *chatbot*.
- **Pembedaan Pesan (Chat Bubbles):** Warna, penempatan, dan avatar yang berbeda untuk membedakan antara pesan pengguna (user) dan *chatbot* (Stokku Assistant).
- **Indikator Typing:** Animasi *loading dots* untuk memberikan umpan balik visual bahwa *chatbot* sedang "berpikir" dan memproses jawaban.
- **Dukungan Enter-key & Validasi:** Pengguna dapat mengirim pesan menggunakan tombol Enter. Sistem juga mencegah pengiriman pesan kosong.
- **Konsistensi Tema:** Terintegrasi penuh dengan sistem *light/dark mode* yang ada di Stokku.ai.

## 2. Tujuan dan Fungsi Chatbot dalam Sistem Stokku.ai
Stokku Assistant berfungsi sebagai **asisten pintar (virtual assistant)** bagi manajer dan staf gudang. Tujuannya adalah mempermudah pengguna mendapatkan *insights* terkait data inventaris tanpa harus membuka banyak halaman secara manual. Fitur ini dirancang untuk:
- Memberikan informasi cepat tentang level stok produk.
- Menyarankan tindakan pengadaan (*restock*).
- Mengidentifikasi barang yang lambat terjual (*dead-stock*).

## 3. Teknologi & Pendekatan yang Digunakan
- **Frontend Framework:** Next.js (App Router) dengan React.
- **Styling:** Tailwind CSS untuk tata letak yang responsif dan konsisten.
- **UI Components:** Menggunakan komponen kustom bawaan (shadcn/ui-based) seperti `Card`, `Input`, `Button`, dan `Avatar`.
- **Iconography:** `lucide-react` untuk ikon-ikon antarmuka yang bersih.
- **Animasi:** `framer-motion` untuk memberikan transisi kemunculan *bubble chat* yang halus (micro-animations), memberikan kesan *premium*.

## 4. Alur Kerja Sistem Chat
1. **Inisialisasi:** Saat halaman dimuat, *chatbot* mengirimkan pesan sapaan pertama.
2. **Input:** Pengguna mengetik pertanyaan pada *textbox*.
3. **Pengiriman:** Pengguna menekan *Send* atau menekan Enter. Pesan pengguna ditambahkan ke *state* `messages`.
4. **Proses (Simulasi):** Input dikunci sesaat, dan animasi *typing* (`Loader2` atau *dots*) muncul.
5. **Respons:** Berdasarkan kata kunci (seperti *stok*, *restock*, *dead*), sistem (saat ini *mock data*) menghasilkan jawaban, yang kemudian ditambahkan ke *state* `messages` setelah jeda simulasi `setTimeout`.
6. **Selesai:** Area pesan bergulir ke bawah, input kembali terbuka untuk pertanyaan selanjutnya.

## 5. Hasil Pengujian (Testing QA)
- [x] **Pengiriman & Penerimaan Pesan:** Berjalan normal tanpa error. Tombol Enter berfungsi dengan baik.
- [x] **Tampilan Pesan:** Pembedaan antara *User* (kanan, warna primer) dan *Bot* (kiri, warna sekunder) terlihat jelas dan estetis.
- [x] **Indikator Loading:** *Typing dots* muncul dengan animasi *bounce* yang mulus sebelum pesan balasan muncul.
- [x] **Responsivitas Layar:** *Input bar sticky* di bawah dan *chat area* menyesuaikan tinggi layar secara fleksibel, baik di desktop maupun mobile.
- [x] **Dark/Light Mode:** Komponen membaca *design token* (seperti `bg-background`, `text-foreground`) dengan sempurna.
- [x] **Validasi Input:** Tombol *send* nonaktif jika input hanya berisi spasi atau kosong. Tidak ada pesan kosong yang terkirim.

## 6. Kendala yang Ditemukan & Solusi
- **Kendala:** Pengguna bisa terus menekan Enter atau tombol *Send* berkali-kali saat bot sedang merespons (menimbulkan pesan *spam*).
- **Solusi:** Menambahkan parameter *state* `isTyping`. Jika bernilai `true`, *input field* dan tombol *send* akan masuk ke status `disabled`.
- **Kendala:** Respons *backend* AI yang sesungguhnya belum tersedia.
- **Solusi:** Membuat fungsi `generateBotResponse(userInput)` di frontend yang melakukan pengecekan teks (*string matching*) sementara sebagai *mock response*.

## 7. Evaluasi & Saran Pengembangan Fitur Lanjutan
Meskipun simulasi saat ini berjalan baik secara UI/UX, untuk membuat asisten ini benar-benar "pintar", disarankan pengembangan berikut:
1. **Chat History (Riwayat Percakapan):** Menyimpan percakapan ke dalam *database* (misalnya PostgreSQL yang sudah ada) sehingga pengguna dapat melanjutkan konteks obrolan yang terputus.
2. **Quick Reply / Auto Suggestion:** Menampilkan *chip button* berisi pertanyaan umum (misal: *"Cek stok kritis"*) di atas *textbox* agar mempercepat interaksi.
3. **Integrasi AI/NLP Canggih:** Mengganti logika *string matching* (`generateBotResponse`) dengan *endpoint API backend* yang memanggil model LLM (Large Language Model) untuk memahami konteks dan maksud (*intent*) secara alami.
4. **Data Real-time:** LLM harus diberikan kemampuan pemanggilan fungsi (*function calling*) untuk melakukan kueri ke *database* Stokku.ai secara *real-time* sebelum menjawab pengguna.
5. **Notifikasi Insight:** *Chatbot* dapat secara proaktif mengirim pesan saat pengguna membuka halaman jika ada stok yang baru saja mencapai batas kritis (tanpa harus ditanya lebih dulu).
