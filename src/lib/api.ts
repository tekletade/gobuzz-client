import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

export const leadsApi = {
  create: (data: any) => api.post('/api/leads', data),
  count: () => api.get('/api/leads/count'),
};

export default api;