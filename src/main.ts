import './style.css';
import Navigo from 'navigo';
import { renderDiscovery } from './pages/Discovery';
import { renderZoneSelection } from './pages/ZoneSelection';
import { renderActiveTicket } from './pages/ActiveTicket';
import { renderGateStaff } from './pages/GateStaff';

const router = new Navigo('/');
const app = document.getElementById('app')!;

const wrapLayout = (renderPage: (appEl: HTMLElement) => void) => {
  return () => {
    app.innerHTML = `
      <div id="page-content" class="min-h-screen pb-16"></div>
      
      <!-- Simple Bottom Navbar for Demo Navigation -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 text-sm font-semibold text-gray-500 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40">
         <a href="/" data-navigo class="flex flex-col items-center hover:text-blue-600">Beranda</a>
         <a href="/gate" data-navigo class="flex flex-col items-center hover:text-blue-600">Staff Gerbang</a>
      </div>
    `;
    const content = document.getElementById('page-content')!;
    renderPage(content);
    router.updatePageLinks();
  };
};

router
  .on('/', wrapLayout((el) => renderDiscovery(router, el)))
  .on('/location/:id', (match) => {
     if (match?.data?.id) wrapLayout((el) => renderZoneSelection(router, el, match.data!.id))();
  })
  .on('/ticket/:id', (match) => {
     if (match?.data?.id) wrapLayout((el) => renderActiveTicket(router, el, match.data!.id))();
  })
  .on('/gate', wrapLayout((el) => renderGateStaff(el)))
  .resolve();
