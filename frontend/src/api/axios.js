import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 🔥 FIX: jangan paksa JSON kalau kirim FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 PENTING BANGET
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // biar otomatis multipart
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;