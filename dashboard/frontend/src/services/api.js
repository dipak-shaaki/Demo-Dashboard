import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getPremiumByProvince: (fiscalYear) => api.get('/dashboard/premium-by-province', { params: { fiscalYear } }),
};

// Premium API
export const premiumAPI = {
  getCurrentFY: () => api.get('/premium/current-fy'),
  getComparative: (startDate, endDate) => api.get('/premium/comparative', { params: { startDate, endDate } }),
  getProvinceTrend: (fiscalYear) => api.get('/premium/province-trend', { params: { fiscalYear } }),
};

// Agents API
export const agentsAPI = {
  getGrowthRate: () => api.get('/agents/growth-rate'),
  getTop20: (year) => api.get('/agents/top-20', { params: { year } }),
  getStatusList: (status) => api.get('/agents/status-list', { params: { status } }),
  getPassiveToActive: () => api.get('/agents/passive-to-active'),
};

// Renewals API
export const renewalsAPI = {
  getYearlyComparison: () => api.get('/renewals/yearly-comparison'),
};

// Policies API
export const policiesAPI = {
  getLapseLoan: () => api.get('/policies/lapse-loan'),
  getSurrender: () => api.get('/policies/surrender'),
  getMaturing: () => api.get('/policies/maturing'),
};

// Claims API
export const claimsAPI = {
  getDeathClaimRatio: () => api.get('/claims/death-claim-ratio'),
  getDetails: () => api.get('/claims/details'),
};

// Investments API
export const investmentsAPI = {
  getFDSummary: () => api.get('/investments/fd-summary'),
  getByProvince: () => api.get('/investments/by-province'),
};

export default api;
