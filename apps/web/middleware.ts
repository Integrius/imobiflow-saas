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

// Domínio base da aplicação (alterar conforme ambiente)
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'integrius.com.br';

// Domínio do marketplace (landing page de produtos)
const MARKETPLACE_DOMAIN = 'vivoly.com.br';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/', '/login', '/register', '/recuperar-senha'];

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

  // Se está acessando o marketplace (vivoly.com.br), SEMPRE mostrar landing page
  // NUNCA redirecionar para login, mesmo que tenha cookie
  const isMarketplace = hostname === MARKETPLACE_DOMAIN || hostname === `www.${MARKETPLACE_DOMAIN}`;

  if (isMarketplace) {
    // Marketplace: sempre permitir acesso, nunca redirecionar
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
    const parts = hostname.split('.');

    // Se tem 3 ou mais partes (subdomain.domain.tld), pega o primeiro
    if (parts.length >= 3) {
      subdomain = parts[0];
    } else if (parts.length === 2) {
      // Se tem apenas 2 partes (domain.tld), é o domínio base
      // Ex: integrius.com.br → sem subdomínio
      subdomain = null;
    }
  }

  // ============================================
  // 4. DOMÍNIO BASE (integrius.com.br)
  // ============================================

  // Se não tem subdomínio ou é um subdomínio reservado (domínio base)
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Está acessando pelo domínio base (integrius.com.br ou www.integrius.com.br)
    // SEMPRE mostra a landing page pública (não redireciona para subdomínio)

    if (isPublicRoute) {
      // Rota pública: permitir acesso direto à landing page
      return NextResponse.next();
    }

    if (isProtectedRoute) {
      // Tentando acessar rota protegida sem estar em subdomínio
      // Redirecionar para landing page (raiz)
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Outras rotas: permitir acesso
    return NextResponse.next();
  }

  // Se tem subdomínio válido (ex: vivoly.integrius.com.br)
  // Usuário está tentando acessar um tenant específico

  // Se está acessando a raiz (/) com subdomínio
  if (url.pathname === '/') {
    const token = request.cookies.get('token')?.value;

    if (token) {
      // Tem token: redirecionar para dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Sem token: redirecionar para login
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
