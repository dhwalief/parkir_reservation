import api from '../utils/api';
import Navigo from 'navigo';

export const renderActiveTicket = async (router: Navigo, appEl: HTMLElement, ticketId: string) => {
  appEl.innerHTML = `
    <div class="p-4 md:p-10 max-w-xl mx-auto pb-32">
      <button id="back-btn" class="mb-4 text-[var(--color-primary)] font-bold flex items-center gap-1">
        ← Kembali ke Beranda
      </button>
      
      <div id="ticket-loading" class="text-center p-8">
        <p class="text-[var(--color-primary)] font-semibold">Memuat tiket...</p>
      </div>
      
      <div id="ticket-container" class="hidden"></div>
    </div>
  `;

  document.getElementById('back-btn')!.addEventListener('click', () => router.navigate('/'));

  let refreshInterval: any;

  const loadTicket = async () => {
    try {
      const res = await api.get(`/reservations/${ticketId}`);
      const ticket = res.data;
      const container = document.getElementById('ticket-container')!;
      
      document.getElementById('ticket-loading')!.classList.add('hidden');
      container.classList.remove('hidden');

      const isExpired = ticket.status === 'expired' || ticket.status === 'cancelled';
      const isOccupied = ticket.status === 'occupied' || ticket.status === 'completed';
      
      let statusColor = 'text-green-600 bg-green-100';
      let statusText = 'AKTIF';
      if (isExpired) {
        statusColor = 'text-red-600 bg-red-100';
        statusText = 'KADALUWARSA / DIBATALKAN';
      } else if (isOccupied) {
        statusColor = 'text-blue-600 bg-blue-100';
        statusText = 'SEDANG PARKIR (CHECKED IN)';
      }

      container.innerHTML = `
        <div class="card text-center mb-6">
          <div class="inline-block px-3 py-1 rounded-full font-bold text-sm mb-4 ${statusColor}">
            STATUS: ${statusText}
          </div>
          <h2 class="text-3xl font-extrabold mb-1">${ticket.locationId.name}</h2>
          <p class="text-xl font-bold text-[var(--color-primary)] mb-6">${ticket.zoneId.name}</p>
          
          <div class="bg-white p-4 rounded-xl inline-block shadow-md mb-6 border border-gray-100">
             <!-- Fake QR Code purely for visual -->
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrCodeData}" alt="QR Code" class="w-48 h-48 mx-auto" />
             <p class="mt-2 font-mono text-gray-500 text-sm tracking-widest">${ticket.qrCodeData}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg mb-6">
            <div>
              <p class="text-sm text-gray-500">Plat Nomor</p>
              <p class="font-bold uppercase">${ticket.licensePlate}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Pembayaran</p>
              <p class="font-bold text-green-600">LUNAS</p>
            </div>
          </div>
          
          ${!isExpired && !isOccupied ? `
            <div class="bg-red-50 p-4 rounded-lg border border-red-100 text-left">
              <div class="flex justify-between items-center mb-1">
                <p class="text-sm text-red-800 font-bold">Waktu Tersisa</p>
                <p id="sla-timer" class="text-xl font-extrabold text-red-600">--:--</p>
              </div>
              <p class="text-xs text-red-600">Scan QR di gerbang sebelum waktu habis.</p>
            </div>
          ` : ''}
        </div>

        ${!isExpired && !isOccupied ? `
          <button id="report-full-btn" class="w-full py-4 text-red-600 font-bold underline text-center">
            Lapor Lapangan Penuh (Refund)
          </button>
        ` : ''}
      `;

      if (!isExpired && !isOccupied && ticket.reservationExpiresAt) {
        const expiresAt = new Date(ticket.reservationExpiresAt).getTime();
        
        const updateTimer = () => {
          const now = Date.now();
          const diff = Math.floor((expiresAt - now) / 1000);
          
          const timerEl = document.getElementById('sla-timer');
          if (diff <= 0) {
             if (timerEl) timerEl.innerText = "HABIS";
             loadTicket(); // Reload to get expired status
          } else {
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            if (timerEl) timerEl.innerText = `${m}:${s}`;
          }
        };
        
        updateTimer();
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(updateTimer, 1000);
      }

      const reportBtn = document.getElementById('report-full-btn');
      if (reportBtn) {
        reportBtn.addEventListener('click', async () => {
          if (confirm('Yakin ingin membatalkan karena lapangan penuh? Dana akan dikembalikan otomatis.')) {
            try {
              await api.post('/reservations/report-full', { reservationId: ticket._id });
              alert('Laporan berhasil. Dana telah dikembalikan.');
              loadTicket();
            } catch (err) {
              alert('Gagal mengirim laporan.');
            }
          }
        });
      }

    } catch (err) {
       document.getElementById('ticket-loading')!.innerHTML = `<p class="text-[var(--color-error)]">Tiket tidak ditemukan.</p>`;
    }
  };

  loadTicket();
  
  // Also poll backend every 5 seconds just in case staff checked in
  const pollInterval = setInterval(() => {
    if (!document.getElementById('ticket-container')) {
      clearInterval(pollInterval); // user left page
    } else {
      // Background poll
      api.get(`/reservations/${ticketId}`).then(res => {
         const currentStatus = res.data.status;
         // Just a simple heuristic to reload if status changed
         if (currentStatus === 'occupied' || currentStatus === 'completed' || currentStatus === 'expired' || currentStatus === 'cancelled') {
             loadTicket();
         }
      }).catch(() => {});
    }
  }, 5000);
};
