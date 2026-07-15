# NyewaParkiran

NyewaParkiran adalah sistem reservasi lahan parkir berbasis kapasitas wilayah (Zona), bukan berbasis slot fisik. Sistem ini dirancang sebagai solusi perangkat lunak (*software-only*) tanpa memerlukan integrasi perangkat keras (IoT) tambahan di lapangan.

Aplikasi ini mengutamakan **Penemuan Tanpa Gesekan (*Zero-Friction Discovery*)** dan **Otentikasi Malas (*Lazy Auth*)**, di mana pengguna tidak perlu mendaftar akun di awal.

## Fitur

1. **Deteksi Lokasi (*Geolocation*) & Kueri Spasial**
   Menampilkan daftar gedung parkir terdekat secara *real-time* berdasarkan posisi GPS pengguna (menggunakan `$geoNear` MongoDB).
2. **Reservasi Berbasis Kapasitas (Bukan Slot)**
   Pengguna memesan ruang di area tertentu (misal: "Basement 1") tanpa harus memilih nomor lot (A1, A2). Ini mencegah sengketa posisi di lapangan.
3. **Penahanan Sesi (*Session Soft-Lock*)**
   Saat pengguna mulai mengisi formulir pelat nomor, sistem akan "mengunci" 1 kapasitas untuk mereka selama 2 menit. Menghindari tabrakan saat aplikasi ramai (*High Concurrency*).
4. **Otentikasi Malas (*Lazy Auth*)**
   Pengguna langsung membayar. Identifikasi hanya menggunakan Nomor WhatsApp dan Pelat Kendaraan di tahap akhir (*Checkout*).
5. **Scanner Gerbang Web (Petugas)**
   Petugas lapangan melakukan validasi tiket secara *real-time* menggunakan antarmuka web khusus (`/gate`) berbasis `html5-qrcode` yang mengubah gawai petugas menjadi pemindai (*scanner*) yang terintegrasi langsung dengan peladen.
6. **Panel Admin Terpusat**
   Manajemen gedung, kuota, dan harga zona. Terintegrasi dengan Peta Interaktif (Leaflet.js + OpenStreetMap) untuk penetapan koordinat (Latitude & Longitude) gedung dengan akurat.

## Stack

- **Lingkungan:** Node.js, TypeScript
- **Backend:** Express.js, Zod (Validasi)
- **Database:** MongoDB (menggunakan Mongoose dengan transaksi ACID)
- **Frontend:** EJS (Server-Side Rendering)
- **Styling:** Tailwind CSS v4
- **Utilitas Klien:** Axios, Navigo (untuk routing klien tambahan), Leaflet.js (Peta OSM), html5-qrcode (Scanner QR).

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Persyaratan Sistem
- Node.js (versi 18+)
- MongoDB (Lokal atau Atlas)

### 2. Kloning & Instalasi Dependensi
```bash
git clone <url-repo-ini>
cd parkir_reservation
npm install
```

### 3. Variabel Lingkungan (.env)
Buat file `.env` di *root* proyek (sejajar dengan `package.json`) dan isi dengan konfigurasi berikut:
```env
PORT=3000
DB_URL=mongodb://localhost:27017/nyewaparkiran_db
```

### 4. Persiapan Data (Seeding)
Jika Anda menggunakan *database* baru, jalankan skrip *seeder* ini untuk membuat data lokasi *dummy* (terutama koordinat ikonik di Makassar) beserta area parkirnya.
```bash
npm run seed
```

### 5. Menjalankan Server
Jalankan aplikasi dalam mode pengembangan (*development mode*):
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

## Kredensial Admin Demo
Untuk mengakses Dasbor Admin dan halaman Scanner Gerbang, Anda harus masuk ke `http://localhost:3000/admin/login` menggunakan kredensial berikut:

- **Email:** `admin@nyewaparkiran.com`
- **Password:** `admin123`

## Struktur Direktori

```text
├── server/
│   ├── config/      # Konfigurasi Database (Mongoose)
│   ├── models/      # Skema Model MongoDB (Location, Zone, Reservation, User)
│   ├── routes/      # Endpoint API (Admin, Zone, Auth, Reservation) & Pages
│   ├── seed.ts      # Skrip pengisian data awal
│   └── server.ts    # Titik masuk (Entry point) utama Express
├── views/
│   ├── pages/       # File antarmuka pengguna (.ejs)
│   └── partials/    # Komponen frontend yang dapat digunakan kembali (Header, Footer, Modal)
├── public/
│   ├── css/         # File keluaran Tailwind CSS
│   └── js/          # (Opsional) File skrip murni statis
├── tsconfig.json    # Konfigurasi TypeScript peladen
└── tailwind.css     # Konfigurasi input Tailwind v4
```

## Catatan Penting
- Pastikan indeks `2dsphere` pada field `location` di skema `ParkingLocation` berhasil dibuat oleh Mongoose untuk memungkinkan pencarian kueri berdasarkan jarak.
- Setiap operasi yang mengubah kapasitas (menambah reservasi aktif) wajib menggunakan fitur `$inc` atau Transaksi Basis Data yang dikunci untuk mencegah *Race Condition*.
