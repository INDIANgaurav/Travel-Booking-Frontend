import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'B2B_AGENT' | 'B2B_AGENT' | 'AGENT' | 'SUPPLIER_AGENT' | 'SUPPLIER_STAFF' | 'SUPER_ADMIN' | 'SUB_ADMIN' | 'SUPPLIER_PORTAL_ONLY';
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
  isActive?: boolean;
  companyName?: string;
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
  agentBookingMode: 'PERSONAL' | 'MYBIZ';
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

const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  agentBookingMode: (localStorage.getItem('agentBookingMode') as 'PERSONAL' | 'MYBIZ') || 'PERSONAL',
  showAgentOnboarding: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.agentBookingMode = 'PERSONAL';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('agentBookingMode');
    },
    updateProfileData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setAgentBookingMode: (state, action: PayloadAction<'PERSONAL' | 'MYBIZ'>) => {
      state.agentBookingMode = action.payload;
      localStorage.setItem('agentBookingMode', action.payload);
    },
    setShowAgentOnboarding: (state, action: PayloadAction<boolean>) => {
      state.showAgentOnboarding = action.payload;
    }
  },
});

export const { setCredentials, logout, updateProfileData, setAgentBookingMode, setShowAgentOnboarding } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAgentBookingMode = (state: RootState) => state.auth.agentBookingMode;
export const selectShowAgentOnboarding = (state: RootState) => state.auth.showAgentOnboarding;

export default authSlice.reducer;
