import axios from 'axios';
import { getTenantId } from './tenant';

// Detectar automaticamente a URL da API baseado no ambiente
// IMPORTANTE: Esta função deve ser executada apenas no cliente (browser)
const getApiUrl = () => {
  // Verificar se está no browser
  if (typeof window === 'undefined') {
    // Durante SSR/build, retornar URL de produção como fallback
    return process.env.NEXT_PUBLIC_API_URL || 'https://imobiflow-saas-1.onrender.com';
  }

  // Se a variável de ambiente estiver definida, usar ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Em produção (Render), usar URL absoluta da API
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://imobiflow-saas-1.onrender.com';
  }

  // Desenvolvimento local
  return 'http://localhost:3333';
};

// Criar instância do axios SEM baseURL definido
// O baseURL será definido dinamicamente no interceptor
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token, tenant e configurar baseURL dinamicamente
api.interceptors.request.use((config) => {
  // Configurar baseURL dinamicamente (apenas no cliente)
  if (typeof window !== 'undefined') {
    const apiUrl = getApiUrl();
    const baseURL = `${apiUrl}/api/v1`;

    // Sobrescrever baseURL apenas se não estiver definido
    if (!config.baseURL) {
      config.baseURL = baseURL;
    }

    // Log para debug (apenas primeira vez)
    if (!api.defaults.baseURL) {
      console.log('🔧 API configurada para:', baseURL);
      api.defaults.baseURL = baseURL; // Salvar para próximas requisições
    }

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
