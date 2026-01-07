import axios from 'axios';
import { getTenantId } from './tenant';

// URL da API - SIMPLES E DIRETO
// Em produção, sempre usar a URL do Render
// Em desenvolvimento local, detectar automaticamente
const API_BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'))
    ? 'http://localhost:3333/api/v1'  // Desenvolvimento
    : 'https://imobiflow-saas-1.onrender.com/api/v1';  // Produção

// Criar instância do axios com baseURL fixo
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log para debug
if (typeof window !== 'undefined') {
  console.log('🔧 API Cliente configurado:', API_BASE_URL);
}

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
