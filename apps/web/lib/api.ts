import axios from 'axios';
import { getTenantId } from './tenant';
import { toast } from './toast';

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
  withCredentials: true,  // Envia cookies automaticamente (httpOnly cookies)
});

// Log para debug
if (typeof window !== 'undefined') {
  console.log('🔧 API Cliente configurado:', API_BASE_URL);
}

/**
 * Helper para ler cookie
 */
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

// Interceptor para adicionar token e tenant
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Adicionar token de autenticação do COOKIE DE SESSÃO
    // Token não está mais em localStorage, apenas em cookie
    const token = getCookie('token');
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
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error;

    // 401 - Não autenticado (redirecionar para login)
    if (status === 401) {
      // Limpar cookie e redirecionar
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');

      // Evitar loop infinito se já estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // 403 - Sem permissão
    else if (status === 403) {
      toast.error(message || 'Sem permissão para esta ação.');
    }

    // 404 - Não encontrado (não mostrar toast, deixar página tratar)
    // Permitir que cada página trate 404 de forma específica
    else if (status === 404) {
      // Não mostrar toast global para 404
      // A página específica deve lidar com isso
    }

    // 422 - Validação (erros de formulário)
    else if (status === 422) {
      const validationMessage = message || 'Dados inválidos. Verifique os campos.';
      toast.error(validationMessage);
    }

    // 429 - Rate limit
    else if (status === 429) {
      toast.error('Muitas requisições. Aguarde um momento e tente novamente.');
    }

    // 500+ - Erro do servidor
    else if (status && status >= 500) {
      toast.error(message || 'Erro interno do servidor. Tente novamente em alguns instantes.');
    }

    // Sem resposta (erro de rede)
    else if (!error.response) {
      // Verificar se é erro de timeout
      if (error.code === 'ECONNABORTED') {
        toast.error('Requisição demorou muito. Verifique sua conexão.');
      } else {
        toast.error('Sem conexão com o servidor. Verifique sua internet.');
      }
    }

    // Outros erros (400, etc)
    else if (status) {
      // Mostrar mensagem do servidor se disponível
      if (message) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);
