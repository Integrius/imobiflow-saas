import axios from 'axios';
import { getTenantId } from './tenant';

// Detectar automaticamente a URL da API baseado no ambiente
const getApiUrl = () => {
  // Se a variável de ambiente estiver definida, usar ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Em produção (Render), usar URL absoluta da API
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://imobiflow-saas-1.onrender.com';
  }

  // Desenvolvimento local
  return 'http://localhost:3333';
};

const API_URL = getApiUrl();

console.log('🔧 API configurada para:', API_URL);

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token e tenant
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Adicionar token de autenticação
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar tenant_id (desenvolvimento)
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // Em produção, o backend extrai do subdomínio do Host header
    // que já é enviado automaticamente pelo navegador
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
