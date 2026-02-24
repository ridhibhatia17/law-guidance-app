import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`; // Append /api to baseURL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred. Please try again.';
    console.error('API Error:', message, error.response?.status); // Log status for debugging
    return Promise.reject({ message, status: error.response?.status });
  }
);

// API functions
export const analyzeContractBreach = async (situation, contractType) => {
  return await api.post('/analyze-breach', { situation, contractType });
};

export const findCaseType = async (problemType, situation) => {
  return await api.post('/find-case-type', { problemType, situation });
};

export const getCaseDetails = async (problemType, caseType) => {
  return await api.post('/get-case-details', { problemType, caseType });
};

export default api;