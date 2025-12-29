import { api } from './api';
import { getSubdomain } from './tenant';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

/**
 * Helper para buscar tenant_id pelo slug do subdomínio
 */
async function getTenantIdBySubdomain(subdomain: string): Promise<string | null> {
  try {
    const tenantResponse = await api.get(`/tenants/slug/${subdomain}`);
    return tenantResponse.data.id;
  } catch (error) {
    console.error('Erro ao buscar tenant por slug:', error);
    return null;
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  // Se estiver usando subdomínio, precisamos buscar o tenant_id pelo slug
  const subdomain = getSubdomain();
  let tenantId: string | null = null;

  if (subdomain) {
    tenantId = await getTenantIdBySubdomain(subdomain);

    if (!tenantId) {
      throw new Error('Imobiliária não encontrada. Verifique a URL.');
    }
  }

  // Fazer login com ou sem tenant_id
  const config = tenantId ? {
    headers: {
      'X-Tenant-ID': tenantId
    }
  } : undefined;

  const response = await api.post('/auth/login', data, config);

  if (response.data.token) {
    // Armazenar tenant_id se disponível
    if (tenantId) {
      localStorage.setItem('tenant_id', tenantId);
    }

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Também armazenar em cookie para usar no middleware
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  return response.data;
}

/**
 * Login com Google OAuth
 */
export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  // Se estiver usando subdomínio, buscar tenant_id primeiro
  const subdomain = getSubdomain();
  let tenantId: string | null = null;

  if (subdomain) {
    tenantId = await getTenantIdBySubdomain(subdomain);

    if (!tenantId) {
      throw new Error('Imobiliária não encontrada. Verifique a URL.');
    }
  }

  // Fazer login Google com ou sem tenant_id
  const config = tenantId ? {
    headers: {
      'X-Tenant-ID': tenantId
    }
  } : undefined;

  const response = await api.post('/auth/google', { credential }, config);

  if (response.data.token) {
    // Armazenar tenant_id se disponível
    if (tenantId) {
      localStorage.setItem('tenant_id', tenantId);
    }

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Também armazenar em cookie para usar no middleware
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export function logout() {
  // Remover de localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Remover cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirecionar para login
  window.location.href = '/login';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
