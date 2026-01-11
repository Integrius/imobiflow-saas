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

// Função getTenantIdBySubdomain removida (não utilizada após remoção do Google OAuth)

export async function login(data: LoginData): Promise<AuthResponse> {
  // Se estiver usando subdomínio, precisamos buscar o tenant_id pelo slug
  const subdomain = getSubdomain();
  let tenantId: string | null = null;

  // TEMPORÁRIO: Validação desabilitada até deploy do endpoint
  // TODO: Reabilitar após deploy do endpoint /tenants/by-subdomain/:subdomain
  /*
  if (subdomain) {
    try {
      tenantId = await getTenantIdBySubdomain(subdomain);

      if (!tenantId) {
        throw new Error(`A imobiliária "${subdomain}" não foi encontrada. Verifique se digitou o endereço corretamente.`);
      }
    } catch (error: any) {
      console.error('Erro ao buscar tenant por subdomínio:', subdomain, error);
      if (error.response?.status === 404) {
        throw new Error(`A imobiliária "${subdomain}" não foi encontrada. Verifique se digitou o endereço corretamente.`);
      }
      throw new Error('Erro ao conectar com o servidor. Tente novamente.');
    }
  }
  */

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
    // Armazenar tenant_id (do subdomínio OU da resposta do backend)
    const finalTenantId = tenantId || response.data.user?.tenant_id;
    if (finalTenantId) {
      localStorage.setItem('tenant_id', finalTenantId);
    }

    // IMPORTANTE: Não armazena token em localStorage para evitar sessões persistentes
    // Token só existe em cookie de sessão que expira ao fechar navegador
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Cookie de SESSÃO (sem max-age): expira automaticamente ao fechar navegador
    // Isso garante que cada acesso ao tenant exige novo login
    // Ideal para empresas pequenas com computadores compartilhados
    document.cookie = `token=${response.data.token}; path=/; SameSite=Lax; Secure`;

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

  // Remover de localStorage (token não está mais no localStorage, mas removemos user e tenant_id)
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');

  // Remover TODOS os cookies (incluindo token e last_tenant)
  // Isso garante que usuários administrativos sempre caiam na landing page após logout
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'last_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirecionar para landing page
  window.location.href = '/';
}

/**
 * Obter token de autenticação do cookie de sessão
 * Token agora está APENAS em cookie (não em localStorage)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie('token');
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
