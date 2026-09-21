import axios from 'axios';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: true,
});

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
};

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
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
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh' && originalRequest.url !== '/api/auth/login') {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.token;
        setAuthToken(newToken);
        
        // Dispatch event so Redux can update its state
        window.dispatchEvent(new CustomEvent('auth-token-refreshed', { detail: newToken }));
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAuthToken(null);
        window.dispatchEvent(new Event('auth-unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
