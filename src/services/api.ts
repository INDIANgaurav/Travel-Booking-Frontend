import axios from 'axios';
import toast from 'react-hot-toast';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? 'https://travel-go-backend-ozbw.onrender.com'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: true,
});

let currentToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

let isSessionExpiredTriggered = false;

export const triggerSessionExpired = () => {
  if (isSessionExpiredTriggered) return;
  isSessionExpiredTriggered = true;

  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('b2bSearchState');
    localStorage.removeItem('b2bRecentSearches');

    toast.error('Session expired. Please log in again.', { 
      id: 'session-expired-toast',
      duration: 4000 
    });

    window.dispatchEvent(new Event('auth-unauthorized'));

    const pathname = window.location.pathname;
    setTimeout(() => {
      isSessionExpiredTriggered = false;
      if (pathname.startsWith('/admin') || pathname.startsWith('/sub-admin')) {
        window.location.href = '/admin/login';
      } else if (pathname.startsWith('/b2b')) {
        window.location.href = '/b2b/login';
      } else if (pathname.startsWith('/supplier')) {
        window.location.href = '/supplier/login';
      } else {
        window.location.href = '/?login=true';
      }
    }, 600);
  }
};

// Queue mechanism for handling multiple concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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

    // Check if error is 401
    if (error.response && error.response.status === 401) {
      const isAuthUrl = 
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/logout');

      // If refresh itself failed or it's an auth endpoint, trigger logout immediately
      if (isAuthUrl) {
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          triggerSessionExpired();
        }
        (error as any).isHandledAuth = true;
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, wait in queue for new token
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                if (typeof originalRequest.headers.set === 'function') {
                  originalRequest.headers.set('Authorization', `Bearer ${token}`);
                } else {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
              }
              return api(originalRequest);
            })
            .catch((err) => {
              (err as any).isHandledAuth = true;
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {}, { withCredentials: true });
          const newToken = res.data.token;
          setAuthToken(newToken);

          // Dispatch event so Redux / listeners can update state
          window.dispatchEvent(new CustomEvent('auth-token-refreshed', { detail: newToken }));

          processQueue(null, newToken);

          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
          }
          return api(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          triggerSessionExpired();
          (refreshError as any).isHandledAuth = true;
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Already retried and still 401: trigger logout
        triggerSessionExpired();
        (error as any).isHandledAuth = true;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

