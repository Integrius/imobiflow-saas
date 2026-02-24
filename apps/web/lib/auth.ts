import { api } from './api';
import { getSubdomain } from './tenant';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  primeiro_acesso?: boolean;
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
 * Lista de emails administrativos que sempre devem ver a landing page
 * (não são redirecionados automaticamente)
 */
const ADMIN_EMAILS = [
  'admin@vivoly.com.br',
  'admin@integrius.com.br',
  'ia.hcdoh@gmail.com'
];

/**
 * Verifica se o usuário logado é administrativo
 */
export function isAdminUser(): boolean {
  if (typeof window === 'undefined') return false;

  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return ADMIN_EMAILS.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Busca o tenant_id pelo subdomínio via API
 */
async function getTenantIdBySubdomain(subdomain: string): Promise<string | null> {
  try {
    const response = await api.get(`/tenants/by-subdomain/${subdomain}`);
    return response.data?.id || null;
  } catch {
    return null;
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  // Se estiver usando subdomínio, precisamos buscar o tenant_id pelo slug
  const subdomain = getSubdomain();
  let tenantId: string | null = null;

  if (subdomain) {
    try {
      const response = await api.get(`/tenants/by-subdomain/${subdomain}`);
      tenantId = response.data?.id || null;

      if (!tenantId) {
        throw new Error(`A imobiliária "${subdomain}" não foi encontrada. Verifique se digitou o endereço corretamente.`);
      }
    } catch (error: any) {
      console.error('Erro ao buscar tenant por subdomínio:', subdomain, error);
      if (error.response?.status === 404) {
        throw new Error(`A imobiliária "${subdomain}" não foi encontrada. Verifique se digitou o endereço corretamente.`);
      }
      if (error.response?.status === 403) {
        throw new Error('Esta imobiliária está temporariamente indisponível. Entre em contato com o suporte.');
      }
      if (error.message?.includes('não foi encontrada') || error.message?.includes('indisponível')) {
        throw error;
      }
      throw new Error('Erro ao conectar com o servidor. Tente novamente.');
    }
  }

  // IMPORTANTE: Limpar tenant_id antigo do localStorage antes de fazer login
  // Isso previne que o interceptor do axios envie um tenant_id antigo
  // de um login anterior em outro tenant
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tenant_id');
  }

  // Fazer login com ou sem tenant_id
  // Se não há subdomínio, o backend deve retornar o tenant do usuário
  const config = tenantId ? {
    headers: {
      'X-Tenant-ID': tenantId
    }
  } : undefined;

  const response = await api.post('/auth/login', data, config);

  if (response.data.token) {
    // Armazenar token em localStorage (para getToken() e axios interceptor)
    localStorage.setItem('token', response.data.token);

    // Setar token como cookie de sessão (sem max-age/expires = destruído ao fechar o browser)
    document.cookie = `token=${response.data.token}; path=/; SameSite=Lax`;

    // Armazenar tenant_id (do subdomínio OU da resposta do backend)
    const finalTenantId = tenantId || response.data.user?.tenant_id;
    if (finalTenantId) {
      localStorage.setItem('tenant_id', finalTenantId);
    }

    // Armazenar dados do usuário em localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Armazenar tenant_slug em cookie de longa duração (90 dias) para lembrança de último acesso
    if (subdomain) {
      document.cookie = `last_tenant=${subdomain}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  return response.data;
}

// Google OAuth desabilitado (removido por questões de segurança)

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function logout() {
  try {
    // Registrar logout no backend (log de atividade)
    await api.post('/auth/logout').catch(err => {
      // Se falhar, apenas loga mas não impede o logout
      console.error('Erro ao registrar logout:', err);
    });
  } catch (error) {
    // Ignora erro de logout no backend
    console.error('Erro ao fazer logout no backend:', error);
  }

  // Remover de localStorage (token, user e tenant_id)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');

  // ✅ SEGURANÇA: Cookie httpOnly é limpo automaticamente pelo backend
  // Limpeza manual abaixo é apenas fallback para compatibilidade
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'last_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirecionar para landing page
  window.location.href = '/';
}

/**
 * Obter token de autenticação
 * Verifica localStorage (principal) e cookie (fallback)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || getCookie('token');
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

// Função getLastLoginMethod removida (Google OAuth desabilitado)

/**
 * Verificar se usuário precisa definir senha no primeiro acesso
 */
export function needsPasswordSetup(): boolean {
  if (typeof window === 'undefined') return false;

  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return user.primeiro_acesso === true;
  } catch {
    return false;
  }
}
