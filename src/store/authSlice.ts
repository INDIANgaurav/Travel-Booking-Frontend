import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { setAuthToken } from '../services/api';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  role?: string;
  isApproved?: boolean;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string;
  dob?: string;
  passportNumber?: string;
  passportExpiry?: string;
  issuingCountry?: string;
  panNumber?: string;
  department?: string;
  agentStatus?: string;
  companyName?: string;
  displayOnProfileIcon?: string;
  isActive?: boolean;
  agencyCode?: string;
  agencyId?: string;
  walletBalance?: number;
  balance?: number;
  address?: string;
  city?: string;
  state?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  showAgentOnboarding: boolean;
}

// Load initial state from local storage
const loadUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

const loadTokenFromStorage = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (e) {
    return null;
  }
};

const initialUser = loadUserFromStorage();
const initialToken = loadTokenFromStorage();

if (initialToken) {
  setAuthToken(initialToken);
}

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!(initialUser && initialToken),
  showAgentOnboarding: false,
};

export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    const api = (await import('../services/api')).default;
    await api.post('/api/auth/logout');
  } catch (e) {
    // Ignore server error on logout
  } finally {
    dispatch(authSlice.actions.logout());
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      const refreshToken = action.payload.refreshToken || (action.payload.user as any)?.refreshToken;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAuthToken(action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.removeItem('b2bSearchState');
    },
    updateToken: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string } | string>
    ) => {
      const token = typeof action.payload === 'string' ? action.payload : action.payload.token;
      const refreshToken = typeof action.payload === 'string' ? undefined : action.payload.refreshToken;
      state.token = token;
      state.isAuthenticated = true;
      setAuthToken(token);
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('b2bSearchState');
      localStorage.removeItem('b2bRecentSearches');
    },
    updateProfileData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    setShowAgentOnboarding: (state, action: PayloadAction<boolean>) => {
      state.showAgentOnboarding = action.payload;
    }
  },
});

export const { setCredentials, updateToken, logout, updateProfileData, setShowAgentOnboarding } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectShowAgentOnboarding = (state: RootState) => state.auth.showAgentOnboarding;

export default authSlice.reducer;
