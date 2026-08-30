import api from '../services/api';

export const reportsApi = {
  getFlightSales: async (params?: any) => {
    const response = await api.get('/api/reports/flight-sales', { params });
    return response.data;
  },
  
  getCancellations: async (params?: any) => {
    const response = await api.get('/api/reports/cancellations', { params });
    return response.data;
  },

  getDebitNotes: async (params?: any) => {
    const response = await api.get('/api/reports/debit-notes', { params });
    return response.data;
  },

  getCreditNotes: async (params?: any) => {
    const response = await api.get('/api/reports/credit-notes', { params });
    return response.data;
  },
  
  getAgentActivation: async (params?: any) => {
    const response = await api.get('/api/reports/agent-activation', { params });
    return response.data;
  },
  
  getPgReports: async (params?: any) => {
    const response = await api.get('/api/reports/pg-reports', { params });
    return response.data;
  },
  
  getAgentOutstanding: async (params?: any) => {
    const response = await api.get('/api/reports/agent-outstanding', { params });
    return response.data;
  },
  
  getSupplierMapping: async (params?: any) => {
    const response = await api.get('/api/reports/supplier-mapping', { params });
    return response.data;
  },
  
  getFareQuotes: async (params?: any) => {
    const response = await api.get('/api/reports/fare-quotes', { params });
    return response.data;
  },
  
  getPassengerCalendar: async (params?: any) => {
    const response = await api.get('/api/reports/passenger-calendar', { params });
    return response.data;
  },
  
  getHotelCancellations: async (params?: any) => {
    const response = await api.get('/api/reports/hotel-cancellations', { params });
    return response.data;
  }
};
