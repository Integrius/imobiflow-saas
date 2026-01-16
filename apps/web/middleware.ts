import { NextRequest, NextResponse } from 'next/server';

// Subdomínios reservados para a plataforma
const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'portal',
  'dashboard',
  'staging',
  'dev',
  'test',
];

// Domínio base da aplicação SaaS
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'integrius.com.br';

// Domínio do marketplace (independente, não é subdomínio)
const MARKETPLACE_DOMAIN = 'vivoly.com.br';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/', '/login', '/register', '/recuperar-senha', '/set-password'];

// Rotas que requerem autenticação
const PROTECTED_ROUTES = [
  '/dashboard',
  '/leads',
  '/imoveis',
  '/negociacoes',
  '/corretores',
  '/proprietarios',
  '/relatorios',
  '/configuracoes',
  '/perfil',
  '/agendamentos',
  '/primeiro-acesso', // Requer autenticação para definir senha
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Rotas públicas que não precisam de validação
  const publicPaths = ['/_next', '/static', '/favicon.ico', '/api/auth'];
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));

  // Permitir acesso direto a recursos estáticos
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar se é rota pública (não precisa de autenticação)
  const isPublicRoute = PUBLIC_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + '/'));

  // Verificar se é rota protegida (precisa de autenticação)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));

  // ============================================
  // 1. VERIFICAR AUTENTICAÇÃO (rotas protegidas)
  // ============================================
  if (isProtectedRoute) {
    // Verificar se tem token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // Sem token: redirecionar para login
      const loginUrl = new URL('/login', request.url);

      // Preservar tenant_id se existir
      const tenantId = url.searchParams.get('tenant_id');
      if (tenantId) {
        loginUrl.searchParams.set('tenant_id', tenantId);
      }

      // Adicionar redirect para voltar após login
      loginUrl.searchParams.set('redirect', url.pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Tem token: continuar com validação de tenant
  }

  // ============================================
  // 2. VERIFICAR MARKETPLACE (vivoly.com.br)
  // ============================================

  // vivoly.com.br é um marketplace INDEPENDENTE (não é subdomínio)
  // SEMPRE mostra landing page do marketplace, sem redirects
  const isMarketplace = hostname === MARKETPLACE_DOMAIN || hostname === `www.${MARKETPLACE_DOMAIN}`;

  if (isMarketplace) {
    // Marketplace independente: sempre permitir acesso
    // Não redireciona para login ou dashboard
    return NextResponse.next();
  }

  // ============================================
  // 3. EXTRAIR E VALIDAR TENANT (todas as rotas)
  // ============================================

  // Extrai o subdomínio
  // Exemplo: vivoly.integrius.com.br → vivoly
  // Exemplo: localhost:3000 → null (desenvolvimento)
  let subdomain: string | null = null;

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Em desenvolvimento, aceita query param tenant_id
    const tenantId = url.searchParams.get('tenant_id');
    if (tenantId) {
      // Em dev, não precisa validar tenant via API
      // O backend vai validar usando X-Tenant-ID header
      const response = NextResponse.next();
      response.headers.set('x-tenant-id', tenantId);
      return response;
    }

    // Se não tem tenant_id em dev e não é rota pública, pode permitir
    // (para desenvolvimento local sem multi-tenant)
    return NextResponse.next();
  } else {
    // Em produção, extrai o subdomínio do hostname

    // Primeiro, verificar se é o domínio base (integrius.com.br ou www.integrius.com.br)
    if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
      subdomain = null;
    } else {
      // Não é o domínio base, então extrai o subdomínio
      const parts = hostname.split('.');

      // Para domínios .com.br (3+ partes), o subdomínio é tudo antes do domínio base
      // Ex: vivoly.integrius.com.br → vivoly
      // Ex: www.integrius.com.br → www (mas já tratado acima)
      if (parts.length >= 3) {
        // Pega o primeiro segmento como subdomínio
        subdomain = parts[0];
      } else {
        subdomain = null;
      }
    }
  }

  // ============================================
  // 4. DOMÍNIO BASE (integrius.com.br) - Landing Page SaaS
  // ============================================

  // integrius.com.br é a landing page do SaaS
  // Objetivo: divulgar, captar leads, cadastrar tenants
  // Tem botão "Entrar" que leva para /login (que pode ter lógica de redirect)
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Está no domínio base (integrius.com.br ou www.integrius.com.br)

    if (isPublicRoute) {
      // Rotas públicas (/, /login, /register): sempre permitir
      return NextResponse.next();
    }

    if (isProtectedRoute) {
      // Tentando acessar rota protegida (ex: /dashboard) sem subdomínio
      // Redirecionar para landing page
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Outras rotas: permitir
    return NextResponse.next();
  }

  // ============================================
  // 5. SUBDOMÍNIOS (vivoly.integrius.com.br, etc.)
  // ============================================

  // Subdomínios são tenants específicos
  // Se tem cookie ativo (30min): vai para dashboard
  // Se não tem cookie: vai para login

  // Se está acessando a raiz (/) com subdomínio
  if (url.pathname === '/') {
    const token = request.cookies.get('token')?.value;

    if (token) {
      // Tem token válido (30 minutos): redirecionar para dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Sem token ou expirado: redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Se está tentando acessar /register via subdomínio, redirecionar para domínio base
  if (url.pathname.startsWith('/register')) {
    const registerUrl = new URL('/register', request.url);
    registerUrl.hostname = BASE_DOMAIN;
    return NextResponse.redirect(registerUrl);
  }

  // NOTA: Não validamos tenant via API aqui para evitar latência extra
  // O backend validará o tenant quando receber as requisições
  // O subdomínio é enviado automaticamente via Host header

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', subdomain);

  return response;
}

// Configuração do matcher - define em quais rotas o middleware será executado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};
