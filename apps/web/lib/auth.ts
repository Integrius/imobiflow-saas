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
    // Armazenar tenant_id (do subdomínio OU da resposta do backend)
    const finalTenantId = tenantId || response.data.user?.tenant_id;
    if (finalTenantId) {
      localStorage.setItem('tenant_id', finalTenantId);
    }

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Também armazenar em cookie para usar no middleware
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // Armazenar tenant_slug em cookie de longa duração (90 dias) para lembrança de último acesso
    if (subdomain) {
      document.cookie = `last_tenant=${subdomain}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `last_login_method=email; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
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
    // Armazenar tenant_id (do subdomínio OU da resposta do backend)
    const finalTenantId = tenantId || response.data.user?.tenant_id;
    if (finalTenantId) {
      localStorage.setItem('tenant_id', finalTenantId);
    }

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Também armazenar em cookie para usar no middleware
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // Armazenar tenant_slug em cookie de longa duração (90 dias) para lembrança de último acesso
    if (subdomain) {
      document.cookie = `last_tenant=${subdomain}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `last_login_method=google; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
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
  localStorage.removeItem('tenant_id');

  // Remover cookies (mantém last_tenant e last_login_method para próximo acesso)
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirecionar para landing page
  window.location.href = '/';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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

/**
 * Buscar último tenant usado
 */
export function getLastTenant(): string | null {
  return getCookie('last_tenant');
}

/**
 * Buscar método de último login (email ou google)
 */
export function getLastLoginMethod(): 'email' | 'google' | null {
  const method = getCookie('last_login_method');
  return method as 'email' | 'google' | null;
}
