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
- **Akses Instan:** Halaman utama langsung menampilkan pencarian dan daftar gedung parkir terdekat tanpa memaksa login di awal.
- **Geolokasi:** Gunakan API geolokasi browser. Kirim koordinat (lat/lng) ke backend untuk diolah menggunakan kueri MongoDB `$geoNear` agar gedung terdekat tampil teratas dengan keterangan jarak aktual (misal: 100m, 500m).
- **Transparansi Quota:** Tampilkan total sisa kuota teragregasi secara real-time pada kartu gedung.

### Fase 2: Pemilihan Kapasitas (Zone Selection)
- **Daftar Zona:** Klik gedung mengarah ke pemilihan zona (seperti Basement 1, Area VIP, dll).
- **Indikator Warna Keras:** Warna hijau untuk ketersediaan aman, merah dengan tombol "Pesan" dinonaktifkan (disabled) jika kuota sisa 0.

### Fase 3: Otentikasi Malas (Lazy Auth) & Checkout
- **Input Plat Nomor:** Formulir checkout (berupa modal bottom sheet ringkas) meminta input Plat Nomor Kendaraan terlebih dahulu.
- **Session Hold (Soft-Lock):** Saat checkout dibuka, lakukan soft-lock 1 kuota selama 2 menit lewat backend (kurangi kuota tersedia, tambah reservasi sementara) untuk memberikan waktu pengguna mengetik plat nomor tanpa direbut pengguna lain.
- **Otentikasi Minimal:** Pengguna baru mendaftar hanya menggunakan nomor WhatsApp atau Google OAuth (simulasi diperbolehkan) secara cepat tanpa isian data profil yang panjang.
- **SLA Warning:** Tampilkan teks peringatan kontras tinggi: *"Reservasi hangus otomatis dalam 15 Menit jika Anda belum tiba di lokasi."*
- **Simulasi Pembayaran:** Integrasikan alur pembayaran deposit atau biaya parkir.

### Fase 4: Eksekusi Waktu Nyata (The Active Ticket)
- **Fokus QR Code:** Tiket menampilkan QR Code berukuran besar dengan kontras tinggi di atas latar belakang putih murni.
- **Timer Hitung Mundur:** Tampilkan hitung mundur 15 menit secara real-time. Jika habis, backend mengembalikan status reservasi menjadi kadaluwarsa (kuota kembali tersedia) dan UI tiket menunjukkan status "Kedaluwarsa".
- **Lapor Lapangan Penuh:** Sediakan tombol darurat untuk klaim pengembalian dana (refund) otomatis/semi-otomatis bila saat tiba lokasi fisik ternyata kapasitas penuh karena penyerobotan.

### Fase 5: Validasi Gerbang (Check-In)
- **Verifikasi QR:** Halaman khusus petugas pintu gerbang untuk menscan/memverifikasi QR Code. Cocokkan ID lokasi gerbang dengan reservasi. Jika valid, status berubah menjadi `Occupied` (mengurangi `active_reservations`, menambah `active_occupants`).
