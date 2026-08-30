import api from '../services/api';

export const settingsApi = {
  // Service Providers
  getServiceProviders: async () => {
    const response = await api.get('/api/settings/providers');
    return response.data;
  },
  createServiceProvider: async (data: any) => {
    const response = await api.post('/api/settings/providers', data);
    return response.data;
  },
  updateServiceProvider: async (id: string, data: any) => {
    const response = await api.put(`/api/settings/providers/${id}`, data);
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await api.get('/api/settings/roles');
    return response.data;
  },
  createRole: async (data: any) => {
    const response = await api.post('/api/settings/roles', data);
    return response.data;
  },
  deleteRole: async (id: string) => {
    const response = await api.delete(`/api/settings/roles/${id}`);
    return response.data;
  },

  // PG Mappings
  getPGMappings: async () => {
    const response = await api.get('/api/settings/pg-mappings');
    return response.data;
  },
  createPGMapping: async (data: any) => {
    const response = await api.post('/api/settings/pg-mappings', data);
    return response.data;
  },
  deletePGMapping: async (id: string) => {
    const response = await api.delete(`/api/settings/pg-mappings/${id}`);
    return response.data;
  },

  // CMS Pages
  getPages: async () => {
    const response = await api.get('/api/settings/pages');
    return response.data;
  },
  getPageByName: async (name: string) => {
    const response = await api.get(`/api/settings/pages/${name}`);
    return response.data;
  },
  savePage: async (data: { pageName: string, headline: string, content: string }) => {
    const response = await api.post('/api/settings/pages', data);
    return response.data;
  },

  // Helpers
  getAgents: async () => {
    const response = await api.get('/api/settings/agents');
    return response.data;
  }
};
