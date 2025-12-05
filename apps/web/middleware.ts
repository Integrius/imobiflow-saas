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
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'imobiflow.com.br';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Rotas públicas que não precisam de tenant
  const publicPaths = ['/', '/login', '/register', '/api/auth', '/_next', '/static', '/favicon.ico'];
  const isPublicPath = publicPaths.some(path => url.pathname === path || url.pathname.startsWith(path));

  // Se for rota pública, permite acesso direto
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Extrai o subdomínio
  // Exemplo: acme.imobiflow.com.br → acme
  // Exemplo: localhost:3000 → null (desenvolvimento)
  let subdomain: string | null = null;

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Em desenvolvimento, usa o tenant do localStorage via header ou query
    subdomain = request.headers.get('x-tenant-slug') || url.searchParams.get('tenant') || null;
  } else {
    // Em produção, extrai o subdomínio do hostname
    const parts = hostname.split('.');

    // Se tem 3 ou mais partes (subdomain.domain.tld), pega o primeiro
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  // Se não tem subdomínio ou é um subdomínio reservado, redireciona para página inicial
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Busca o tenant pelo subdomínio
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const tenantResponse = await fetch(`${apiUrl}/api/tenants/by-subdomain/${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!tenantResponse.ok) {
      // Tenant não encontrado
      return NextResponse.redirect(new URL('/tenant-not-found', request.url));
    }

    const tenant = await tenantResponse.json();

    // Injeta o tenant_id no header para as próximas requisições
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenant.id);
    response.headers.set('x-tenant-slug', tenant.slug);
    response.headers.set('x-tenant-nome', tenant.nome);

    return response;
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return NextResponse.redirect(new URL('/tenant-not-found', request.url));
  }
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
