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

export async function login(data: LoginData): Promise<AuthResponse> {
  // Se estiver usando subdomínio, precisamos buscar o tenant_id pelo slug
  const subdomain = getSubdomain();

  if (subdomain) {
    try {
      // Buscar tenant pelo slug do subdomínio
      const tenantResponse = await api.get(`/tenants/slug/${subdomain}`);
      const tenantId = tenantResponse.data.id;

      // Fazer login com o tenant_id correto no header
      const response = await api.post('/auth/login', data, {
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      if (response.data.token) {
        // Armazenar tenant_id também
        localStorage.setItem('tenant_id', tenantId);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Também armazenar em cookie para usar no middleware
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      return response.data;
    } catch (error: any) {
      // Se não encontrar tenant pelo slug, mostrar erro amigável
      if (error.response?.status === 404) {
        throw new Error('Imobiliária não encontrada. Verifique a URL.');
      }
      throw error;
    }
  }

  // Se não tiver subdomínio, fazer login normal (desenvolvimento com query param)
  const response = await api.post('/auth/login', data);

  if (response.data.token) {
    // Armazenar em localStorage (compatibilidade com código existente)
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Também armazenar em cookie para usar no middleware
    // NOTA: Para produção, considere usar httpOnly cookies via backend
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
