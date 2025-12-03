import { api } from './api';

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
  const response = await api.post('/auth/login', data);

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
