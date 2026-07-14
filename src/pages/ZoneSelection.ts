import api from '../utils/api';
import Navigo from 'navigo';
import { setupCheckout } from '../components/Checkout';

export const renderZoneSelection = async (router: Navigo, appEl: HTMLElement, locationId: string) => {
  appEl.innerHTML = `
    <div class="p-4 md:p-10 max-w-3xl mx-auto pb-32">
      <button id="back-btn" class="mb-4 text-[var(--color-primary)] font-bold flex items-center gap-1">
        ← Kembali
      </button>
      <h1 class="text-3xl font-extrabold text-[var(--color-on-background)] mb-2">Pilih Zona Parkir</h1>
      <p class="text-[var(--color-on-surface-variant)] mb-8">Pilih area parkir yang tersedia di gedung ini.</p>
      
      <div id="zones-loading" class="text-center p-8">
        <p class="text-[var(--color-primary)] font-semibold">Memuat zona...</p>
      </div>
      <div id="zones-container" class="space-y-4 hidden"></div>
    </div>
    
    <!-- Checkout Bottom Sheet Container -->
    <div id="checkout-container"></div>
  `;

  document.getElementById('back-btn')!.addEventListener('click', () => router.navigate('/'));

  try {
    const res = await api.get(`/locations/${locationId}/zones`);
    const zones = res.data;

    const container = document.getElementById('zones-container')!;
    document.getElementById('zones-loading')!.classList.add('hidden');
    container.classList.remove('hidden');

    if (zones.length === 0) {
      container.innerHTML = `<p class="text-center text-[var(--color-outline)]">Belum ada zona di lokasi ini.</p>`;
      return;
    }

    container.innerHTML = zones.map((zone: any) => {
      const isFull = zone.available_slots <= 0;
      let chipClass = 'chip-green';
      if (isFull) chipClass = 'chip-red';
      else if (zone.available_slots <= 5) chipClass = 'chip-orange';
      
      const statusText = isFull ? 'Penuh' : `${zone.available_slots} Tersisa`;

      return `
        <div class="card">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-2xl font-bold text-[var(--color-on-surface)]">${zone.name}</h2>
            <span class="${chipClass}">${statusText}</span>
          </div>
          <p class="text-lg font-semibold text-[var(--color-on-surface-variant)] mb-4">Rp ${zone.price_per_hour}/jam</p>
          <button 
            class="btn-primary w-full text-lg book-btn" 
            data-zone-id="${zone._id}" 
            data-location-id="${zone.locationId}"
            ${isFull ? 'disabled' : ''}>
            ${isFull ? 'Penuh' : 'Pesan Sekarang'}
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const zoneId = (btn as HTMLElement).dataset.zoneId!;
        const locId = (btn as HTMLElement).dataset.locationId!;
        // Open bottom sheet
        setupCheckout(router, zoneId, locId, document.getElementById('checkout-container')!);
      });
    });

  } catch (err) {
    console.error(err);
    document.getElementById('zones-loading')!.innerHTML = `<p class="text-[var(--color-error)]">Gagal memuat zona.</p>`;
  }
};
