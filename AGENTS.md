# Project Context: NyewaParkiran
- **Type**: Fullstack TypeScript Monorepo (Vite/Client + Express/Server)
- **Architecture**: Capacity-Based Quota System (Software-Only, NO IoT/hardware sensors). 
- **Core Rule**: Users book a quota in a "Zone" (e.g., Floor 1), NOT a specific slot (e.g., A-01).

# Tech Stack
- Frontend: TypeScript, Vite, Tailwind CSS v4, Navigo (Client-side routing), Axios
- Backend: Node.js, Express, Mongoose (MongoDB), Zod (Validation), tsx

# Agent Directives & Strict Constraints

## 1. Architectural Boundaries (CRITICAL)
- **NO Interactive Maps or Specific Slots:** Do not generate UI or Database models for specific parking spaces (like Slot A1, A2). The UI must use a Card-Based Zone Selection (e.g., "Zone A - 12 Quotas Left").
- **Validation Checkpoint:** Emphasize that check-in/validation happens at the main gate via QR Code scanning, modifying the `active_occupants` vs `active_reservations`.

## 2. Database Connection & Stability (STRICT)
- **URI Configuration:** Meticulously validate the MongoDB Connection String/URI (`DB_URL`). Do not make assumptions about the URI format. Ensure all parsing of the connection string handles authentication credentials and ports flawlessly before attempting to connect.
- **Graceful Shutdown & Exit Handling:** The Express server and Mongoose connection must not abruptly fail or enter an error loop upon exit. Implement explicit `process.on('SIGINT')` and `process.on('SIGTERM')` listeners to close database connections gracefully. 
- **Error Trapping:** If the database connection drops or fails to initialize, catch the error explicitly and log a clear diagnostic message. Do not let the service exit with a raw, unhandled exception.

## 3. Transactions & Concurrency
- **ACID Transactions:** Any updates to `ParkingZone` capacities (`active_reservations`, `active_occupants`) MUST be wrapped in Mongoose/MongoDB ACID Transactions (`session.startTransaction()`). 
- **Race Condition Prevention:** Never calculate available quotas in application memory and then save. Use MongoDB atomic operators (`$inc`, `$dec`) or handle the math strictly within a locked transaction block.

## 4. Frontend Construction (Tailwind v4 & Navigo)
- **Styling:** Use Tailwind CSS v4 utility classes. Rely on color indicators for real-time quota feedback (e.g., `text-green-600` for high availability, `text-red-500` for zero availability with disabled buttons).
- **Routing:** Use `Navigo` for all client-side navigation. Ensure routes are properly resolved and do not cause full page reloads.

## 5. Code Quality
- Provide objective, production-ready TypeScript code.
- Always use Zod for validating incoming HTTP request payloads in Express before touching the database.

## 6. User Flow & Core Features

### Fase 1: Penemuan Tanpa Gesekan (Zero-Friction Discovery)
Pengguna tidak boleh dihalangi oleh layar login atau onboarding yang panjang saat pertama kali membuka aplikasi.
- **Akses Instan:** Pengguna membuka web aplikasi dan langsung dihadapkan pada layar pencarian.
- **Deteksi Geolokasi:** Sistem secara otomatis meminta izin lokasi dan menggunakan kueri `$geoNear` di backend untuk menampilkan daftar gedung/lokasi parkir terdekat (diurutkan berdasarkan jarak aktual, misal: 100m, 500m).
- **Transparansi Kapasitas Global:** Setiap kartu lokasi langsung menampilkan agregasi total sisa kuota (misal: "Gedung A - 45 Kuota Tersisa").

### Fase 2: Pemilihan Kapasitas (Zone Selection)
Setelah pengguna memilih satu gedung/lokasi fisik:
- **Daftar Zona:** Layar menampilkan pilihan zona di dalam gedung tersebut (misal: Basement 1, Area VIP, Parkir Terbuka).
- **Indikator Warna Keras:** Ketersediaan ditampilkan dengan visual utilitas murni. Hijau untuk aman, Merah dengan tombol mati (disabled) jika zona tersebut berkapasitas 0.
- **Tindakan Cepat:** Pengguna memilih zona yang tersedia dengan satu ketukan pada tombol "Pesan".

### Fase 3: Otentikasi Malas (Lazy Auth) & Checkout
Ini adalah titik kritis. Mengubah pengunjung acak menjadi pengguna terdaftar harus dilakukan tepat sebelum mereka membayar, bukan sebelumnya.
- **Input Minimal:** Halaman checkout (berupa bottom sheet modal yang ringkas) hanya meminta Plat Nomor Kendaraan.
- **Penahanan Sesi (Session Hold):** Saat checkout dibuka, backend Node.js untuk sementara "mengunci sementara" (soft-lock) 1 kuota selama 2 menit agar tidak direbut orang lain saat pengguna sedang mengetik.
- **Gerbang Otentikasi (Lazy Login):** Jika ini pengguna baru, mereka hanya diminta memasukkan Nomor WhatsApp atau Akun Google (OAuth) untuk konfirmasi pesanan. Hindari pengisian formulir pendaftaran (Nama, Tanggal Lahir, dll) yang memakan waktu.
- **Peringatan SLA:** Teks peringatan yang sangat mencolok muncul: *"Reservasi hangus otomatis dalam 15 Menit jika Anda belum tiba di lokasi."*
- **Pembayaran:** Konfirmasi pembayaran atau deposit (terintegrasi payment gateway).

### Fase 4: Eksekusi Waktu Nyata (The Active Ticket)
Setelah pembayaran berhasil, antarmuka berubah menjadi instrumen utilitas.
- **Fokus Penuh pada QR:** Layar didominasi oleh QR Code kontras tinggi dengan latar belakang putih murni.
- **Hitung Mundur Agresif:** Timer 15 menit berjalan secara real-time di atas layar. Jika timer habis, status reservasi di database otomatis beralih ke Available kembali, dan UI tiket berubah menjadi "Kedaluwarsa".
- **Tombol Darurat (Anomaly Handling):** Terdapat tombol yang mudah dijangkau bertuliskan "Lapor Lapangan Penuh". Jika pengguna tiba dan ternyata secara fisik tidak ada tempat kosong (karena penyerobotan), mereka bisa menekan tombol ini untuk mengklaim pengembalian dana (refund otomatis) setelah divalidasi admin.

### Fase 5: Validasi di Gerbang (Check-In)
- **Pemindaian Cepat:** Pengguna menunjukkan QR ke petugas atau pemindai di gerbang gedung.
- **Verifikasi Validitas:** Backend memeriksa kecocokan `location_id` (atau `locationId`) QR dengan lokasi petugas. Jika cocok, status berubah menjadi `Occupied` (atau `occupied`). Jika salah gerbang, sistem menolak.
- **Siklus Selesai:** Palang terbuka, dan pengguna dipersilakan mencari ruang kosong mana saja di zona yang telah mereka pesan.

