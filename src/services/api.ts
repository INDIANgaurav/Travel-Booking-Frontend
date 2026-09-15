import axios from 'axios';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
