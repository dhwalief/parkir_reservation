import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Proxy will be setup in vite.config.ts if needed, or we just rely on concurrently mounting them together on same host if not cors.
  // Wait, concurrently runs them on different ports! 
  // Client is on Vite default (5173), Server is on 3000.
});

// So let's point to server absolute url in dev
api.defaults.baseURL = 'http://localhost:3000/api';

export default api;
