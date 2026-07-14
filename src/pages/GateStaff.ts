import api from '../utils/api';

export const renderGateStaff = async (appEl: HTMLElement) => {
  appEl.innerHTML = `
    <div class="p-4 md:p-10 max-w-md mx-auto">
      <h1 class="text-3xl font-extrabold text-[var(--color-on-background)] mb-2">Scanner Gerbang</h1>
      <p class="text-[var(--color-on-surface-variant)] mb-8">Validasi QR Code Pelanggan.</p>
      
      <div class="card mb-6">
        <div class="mb-4">
          <label class="block text-sm font-bold mb-1">Pilih Lokasi Gerbang Ini</label>
          <select id="gate-location" class="input-field"></select>
        </div>
      </div>

      <div class="card">
        <div class="mb-4">
          <label class="block text-sm font-bold mb-1">Token QR / ID Tiket</label>
          <input type="text" id="qr-data" class="input-field font-mono" placeholder="TICKET-..." />
        </div>
        <button id="scan-btn" class="btn-primary w-full text-lg">Simulasi Scan (Check-In)</button>
      </div>

      <div id="scan-result" class="mt-6"></div>
    </div>
  `;

  // Load locations
  try {
    const res = await api.get('/locations');
    const select = document.getElementById('gate-location') as HTMLSelectElement;
    res.data.forEach((loc: any) => {
      const opt = document.createElement('option');
      opt.value = loc._id;
      opt.text = loc.name;
      select.add(opt);
    });
  } catch (err) {
    console.error(err);
  }

  document.getElementById('scan-btn')!.addEventListener('click', async () => {
    const qrData = (document.getElementById('qr-data') as HTMLInputElement).value;
    const gateLocationId = (document.getElementById('gate-location') as HTMLSelectElement).value;
    
    if (!qrData) return alert('Masukkan token QR!');

    const btn = document.getElementById('scan-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Memverifikasi...';

    const resultDiv = document.getElementById('scan-result')!;
    resultDiv.innerHTML = '';

    try {
      const res = await api.post('/gate/check-in', { qrCodeData: qrData, gateLocationId });
      
      resultDiv.innerHTML = `
        <div class="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-center">
          <svg class="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <h2 class="text-xl font-bold">AKSES DIBERIKAN</h2>
          <p class="mt-1">${res.data.message}</p>
        </div>
      `;
      (document.getElementById('qr-data') as HTMLInputElement).value = ''; // clear
    } catch (err: any) {
      resultDiv.innerHTML = `
        <div class="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl text-center">
          <svg class="w-12 h-12 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          <h2 class="text-xl font-bold">AKSES DITOLAK</h2>
          <p class="mt-1">${err.response?.data?.error || 'Terjadi kesalahan sistem'}</p>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.innerText = 'Simulasi Scan (Check-In)';
    }
  });
};
