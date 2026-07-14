import api from '../utils/api';
import Navigo from 'navigo';

export const setupCheckout = async (router: Navigo, zoneId: string, locationId: string, containerEl: HTMLElement) => {
  containerEl.innerHTML = `
    <div id="sheet-backdrop" class="bottom-sheet-backdrop"></div>
    <div id="bottom-sheet" class="bottom-sheet">
      <div id="sheet-content">
        <h2 class="text-2xl font-bold mb-4">Mengamankan Kuota...</h2>
      </div>
    </div>
  `;

  const sheet = document.getElementById('bottom-sheet')!;
  const backdrop = document.getElementById('sheet-backdrop')!;
  const content = document.getElementById('sheet-content')!;

  // Open animations
  requestAnimationFrame(() => {
    sheet.classList.add('open');
    backdrop.classList.add('open');
  });

  const closeSheet = () => {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    setTimeout(() => containerEl.innerHTML = '', 300);
  };

  backdrop.addEventListener('click', closeSheet);

  let reservationId: string | null = null;
  let holdExpiresAt: Date | null = null;
  let timerInterval: any;

  try {
    // Phase 3: Soft lock
    const res = await api.post('/reservations/hold', { zoneId, locationId });
    reservationId = res.data.reservationId;
    holdExpiresAt = new Date(res.data.holdExpiresAt);

    const renderCheckoutForm = () => {
      content.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Checkout Parkir</h2>
          <span id="hold-timer" class="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-sm">02:00</span>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-bold mb-1">Plat Nomor Kendaraan</label>
          <input type="text" id="license-plate" class="input-field uppercase" placeholder="B 1234 ABC" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-bold mb-1">Nomor WhatsApp (Login Cepat)</label>
          <input type="tel" id="phone-number" class="input-field" placeholder="08123456789" />
        </div>

        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-6 text-sm font-semibold">
          ⚠️ Reservasi hangus otomatis dalam 15 Menit jika Anda belum tiba di lokasi.
        </div>

        <button id="pay-btn" class="btn-primary w-full text-lg bg-green-600">Simulasi Bayar & Pesan (Rp 10.000)</button>
      `;

      // Timer update
      timerInterval = setInterval(() => {
        if (!holdExpiresAt) return;
        const diff = Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000);
        if (diff <= 0) {
          clearInterval(timerInterval);
          content.innerHTML = `<h2 class="text-xl font-bold text-red-600">Waktu habis! Kuota dilepas.</h2><button id="close-btn" class="btn-primary mt-4 w-full">Tutup</button>`;
          document.getElementById('close-btn')?.addEventListener('click', closeSheet);
          return;
        }
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('hold-timer');
        if (timerEl) timerEl.innerText = `${m}:${s}`;
      }, 1000);

      document.getElementById('pay-btn')!.addEventListener('click', async () => {
        const licensePlate = (document.getElementById('license-plate') as HTMLInputElement).value;
        const phoneNumber = (document.getElementById('phone-number') as HTMLInputElement).value;
        
        if (!licensePlate || !phoneNumber) {
          alert('Plat nomor dan WhatsApp harus diisi!');
          return;
        }

        const btn = document.getElementById('pay-btn') as HTMLButtonElement;
        btn.disabled = true;
        btn.innerText = 'Memproses...';

        try {
          await api.post('/reservations/confirm', { reservationId, licensePlate, phoneNumber });
          clearInterval(timerInterval);
          closeSheet();
          router.navigate(`/ticket/${reservationId}`);
        } catch (err: any) {
          alert(err.response?.data?.error || 'Terjadi kesalahan saat konfirmasi.');
          btn.disabled = false;
          btn.innerText = 'Simulasi Bayar & Pesan (Rp 10.000)';
        }
      });
    };

    renderCheckoutForm();

  } catch (err: any) {
    content.innerHTML = `
      <h2 class="text-xl font-bold text-red-600 mb-2">Gagal Mengamankan Kuota</h2>
      <p class="mb-4">${err.response?.data?.error || 'Zona penuh.'}</p>
      <button id="close-err" class="btn-primary w-full">Tutup</button>
    `;
    document.getElementById('close-err')!.addEventListener('click', closeSheet);
  }
};
