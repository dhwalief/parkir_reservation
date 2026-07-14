import api from '../utils/api';
import Navigo from 'navigo';

export const renderDiscovery = async (router: Navigo, appEl: HTMLElement) => {
  appEl.innerHTML = `
    <div class="p-4 md:p-10 max-w-3xl mx-auto">
      <h1 class="text-4xl font-extrabold text-[var(--color-on-background)] mb-2">NyewaParkiran</h1>
      <p class="text-lg text-[var(--color-on-surface-variant)] mb-8">Temukan parkir instan di sekitar Anda.</p>
      
      <div id="loading" class="text-center p-8">
        <p class="text-[var(--color-primary)] font-semibold">Mencari lokasi terdekat...</p>
      </div>
      <div id="locations-container" class="space-y-4 hidden"></div>
    </div>
  `;

  const loadLocations = async (lat?: number, lng?: number) => {
    try {
      const url = lat && lng ? `/locations?lat=${lat}&lng=${lng}` : '/locations';
      const res = await api.get(url);
      const locations = res.data;

      const container = document.getElementById('locations-container')!;
      document.getElementById('loading')!.classList.add('hidden');
      container.classList.remove('hidden');

      if (locations.length === 0) {
        container.innerHTML = `<p class="text-center text-[var(--color-outline)]">Belum ada lokasi parkir terdaftar.</p>`;
        return;
      }

      container.innerHTML = locations.map((loc: any) => {
        const distanceStr = loc.distance ? `<span class="text-sm font-bold text-[var(--color-primary)]">${Math.round(loc.distance)}m dari Anda</span>` : '';
        return `
          <div class="card cursor-pointer hover:bg-[var(--color-surface-dim)] transition-colors" data-id="${loc._id}">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-2xl font-bold text-[var(--color-on-surface)]">${loc.name}</h2>
              ${distanceStr}
            </div>
            <p class="text-sm text-[var(--color-on-surface-variant)] mb-4">${loc.address}</p>
            <div class="flex items-center gap-2">
              <button class="btn-primary w-full text-lg">Pilih Zona Parkir</button>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
          const id = (card as HTMLElement).dataset.id;
          router.navigate(`/location/${id}`);
        });
      });

    } catch (err) {
      console.error(err);
      document.getElementById('loading')!.innerHTML = `<p class="text-[var(--color-error)]">Gagal memuat lokasi.</p>`;
    }
  };

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadLocations(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn("Geolocation denied or error, falling back to all locations", error);
        loadLocations();
      },
      { timeout: 5000 }
    );
  } else {
    loadLocations();
  }
};
