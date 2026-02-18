# Configuração de Agentes ImobiFlow

Sistema de subagentes especializados para desenvolvimento organizado e eficiente.

---

## 🤖 Agentes Disponíveis

### 1. Backend Agent 🏗️

**Contexto**: `apps/api/**/*`

**Responsabilidades:**
- Criar e manter rotas Fastify
- Gerenciar serviços e lógica de negócio
- Integrar com Prisma/Database
- Validações e tratamento de erros

**Regras:**
- ✅ SEMPRE filtrar queries por `tenant_id`
- ✅ SEMPRE validar inputs com schemas
- ✅ SEMPRE incluir logs estruturados
- ✅ SEMPRE documentar rotas no CLAUDE.md
- ❌ NUNCA retornar dados de outros tenants
- ❌ NUNCA expor informações sensíveis em erros

**Padrões de Código:**
```typescript
// ✅ BOM
server.get('/leads', async (request, reply) => {
  const { tenant_id } = request.user; // Obter do JWT

  const leads = await prisma.lead.findMany({
    where: { tenant_id } // SEMPRE filtrar
  });

  server.log.info('Leads listados', { count: leads.length, tenant_id });
  return leads;
});

// ❌ RUIM
server.get('/leads', async () => {
  return prisma.lead.findMany(); // SEM filtro de tenant!
});
```

---

### 2. Frontend Agent 🎨

**Contexto**: `apps/web/**/*`

**Responsabilidades:**
- Criar componentes React reutilizáveis
- Implementar páginas Next.js
- Estilização com TailwindCSS
- Gerenciar estado e interações

**Regras:**
- ✅ SEMPRE usar componentes funcionais
- ✅ SEMPRE aplicar TailwindCSS (evitar inline styles)
- ✅ SEMPRE pensar em acessibilidade (a11y)
- ✅ SEMPRE responsividade mobile-first
- ❌ NUNCA componentes com mais de 200 linhas
- ❌ NUNCA lógica de negócio no frontend

**Padrões de Código:**
```typescript
// ✅ BOM
export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{lead.nome}</h3>
      <p className="text-gray-600">{lead.telefone}</p>
    </div>
  );
}

// ❌ RUIM
export function LeadCard() {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    // Lógica de negócio no componente de UI
    fetch('/api/leads').then(...)
  }, []);

  return <div style={{ padding: '10px' }}>...</div>; // inline style
}
```

---

### 3. IA Agent (Sofia) 🤖

**Contexto**: `apps/api/src/ai/**/*`

**Responsabilidades:**
- Gerenciar prompts e análises IA
- Qualificação de leads
- Respostas automáticas
- Integração Claude/OpenAI

**Regras:**
- ✅ SEMPRE validar outputs da IA
- ✅ SEMPRE ter fallbacks para erros
- ✅ SEMPRE logar custos e tokens
- ✅ SEMPRE sanitizar inputs para IA
- ❌ NUNCA confiar cegamente na IA
- ❌ NUNCA expor prompts em produção

**Padrões de Código:**
```typescript
// ✅ BOM
async qualificarLead(lead: LeadInput): Promise<Qualificacao> {
  try {
    const result = await claudeService.analyze(prompt);
    return this.validateAndSanitize(result); // SEMPRE validar
  } catch (error) {
    console.error('Erro IA:', error);
    return this.getDefaultQualification(); // SEMPRE fallback
  }
}

// ❌ RUIM
async qualificarLead(lead: LeadInput) {
  const result = await claudeService.analyze(prompt);
  return result; // SEM validação ou tratamento
}
```

---

### 4. Integrations Agent 📧

**Contexto**: `apps/api/src/shared/services/**/*`

**Responsabilidades:**
- SendGrid (emails)
- Telegram (notificações)
- WhatsApp (futuro)
- Cloudinary (imagens)

**Regras:**
- ✅ SEMPRE tratamento de erros robusto
- ✅ SEMPRE logs de tentativas e falhas
- ✅ SEMPRE retry logic quando apropriado
- ✅ SEMPRE não bloquear fluxo principal
- ❌ NUNCA expor API keys em logs
- ❌ NUNCA parar execução por erro de integração

**Padrões de Código:**
```typescript
// ✅ BOM
async enviarEmail(to: string, subject: string, html: string) {
  try {
    await sendgrid.send({ to, subject, html });
    console.log('Email enviado', { to: to.substring(0, 3) + '***' });
  } catch (error) {
    console.error('Erro ao enviar email', { error: error.message });
    // NÃO throw - não bloquear fluxo
  }
}

// ❌ RUIM
async enviarEmail(to, subject, html) {
  await sendgrid.send({ to, subject, html }); // SEM try/catch
}
```

---

### 5. Database Agent 🗄️

**Contexto**: `apps/api/prisma/**/*`

**Responsabilidades:**
- Schema Prisma
- Migrations
- Seeders
- Índices e otimizações

**Regras:**
- ✅ SEMPRE criar migrations antes de código
- ✅ SEMPRE adicionar índices para queries frequentes
- ✅ SEMPRE usar enums para valores fixos
- ✅ SEMPRE incluir tenant_id em índices compostos
- ❌ NUNCA mudar tipos de campos existentes
- ❌ NUNCA deletar colunas (usar @ignore)

**Padrões de Código:**
```prisma
// ✅ BOM
model Lead {
  id         String @id @default(uuid())
  tenant_id  String
  nome       String
  email      String?
  created_at DateTime @default(now())

  tenant Tenant @relation(...)

  // Índices compostos com tenant_id
  @@index([tenant_id, created_at])
  @@index([tenant_id, email])
}

// ❌ RUIM
model Lead {
  id    String @id
  name  String  // Sem tenant_id!
  // Sem índices, sem relacionamentos
}
```

---

### 6. Testing Agent 🧪

**Contexto**: `**/*.test.ts`, `**/*.spec.ts`

**Responsabilidades:**
- Testes unitários
- Testes de integração
- Testes E2E
- Cobertura de código

**Regras:**
- ✅ SEMPRE testar casos de sucesso E erro
- ✅ SEMPRE mockar dependências externas
- ✅ SEMPRE testes isolados (sem ordem)
- ✅ SEMPRE limpar dados após testes
- ❌ NUNCA testar implementação (testar comportamento)
- ❌ NUNCA testes dependentes entre si

**Padrões de Código:**
```typescript
// ✅ BOM
describe('LeadService', () => {
  let service: LeadService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new LeadService(mockPrisma);
  });

  it('deve criar lead com tenant_id correto', async () => {
    const lead = await service.create({ nome: 'Test', tenant_id: '123' });
    expect(lead.tenant_id).toBe('123');
  });

  it('deve rejeitar lead sem tenant_id', async () => {
    await expect(service.create({ nome: 'Test' }))
      .rejects.toThrow('tenant_id obrigatório');
  });
});

// ❌ RUIM
it('testa tudo junto', async () => {
  const lead1 = await service.create(...);
  const lead2 = await service.update(...);
  const leads = await service.list(...);
  expect(leads.length).toBe(2); // Dependente de ordem
});
```

---

### 7. Documentation Maintainer Agent 📚

**Contexto**: `CLAUDE.md`, `**/*.md`, comentários em código

**Responsabilidades:**
- **OBRIGATÓRIO**: Manter CLAUDE.md atualizado
- **OBRIGATÓRIO**: Atualizar Histórico de Configurações com data
- **OBRIGATÓRIO**: Incrementar versão e data no rodapé
- READMEs por módulo
- Comentários JSDoc
- Diagramas de fluxo

**Regras CRÍTICAS:**
- ⚠️ **SEMPRE** atualizar CLAUDE.md quando:
  - Novo módulo/feature implementado
  - Mudança de banco de dados ou infraestrutura
  - Nova integração externa
  - Mudança em fluxos principais
  - Correção crítica de arquitetura
  - Novos endpoints ou mudança de contratos
- ⚠️ **SEMPRE** adicionar entry no "Histórico de Configurações" com data
- ⚠️ **SEMPRE** atualizar versão (seguir semver: major.minor.patch)
- ⚠️ **SEMPRE** commitar CLAUDE.md junto com o código
- ❌ NUNCA fazer commit sem atualizar documentação
- ❌ NUNCA deixar documentação desatualizada

**Workflow Obrigatório:**
1. Implementar feature/fix
2. Atualizar seção relevante do CLAUDE.md
3. Adicionar entry no "Histórico de Configurações"
4. Atualizar "Última atualização" e "Versão" no rodapé
5. Commit: `git add CLAUDE.md && git commit -m "docs: ..."`

**📚 Guia Completo:**
Ver `.claude/agents/documentation-maintainer.md` para:
- Templates detalhados de documentação
- Exemplos práticos completos
- Checklist antes de commitar
- Versionamento semântico (semver)
- Dicas e boas práticas

**Padrões de Código:**
```typescript
/**
 * Qualifica lead automaticamente usando IA Sofia
 *
 * @param lead - Dados do lead capturado
 * @returns Qualificação com score, temperatura e insights
 *
 * @example
 * const qualificacao = await qualificarLead({
 *   nome: 'João',
 *   telefone: '11999999999',
 *   tipo_negocio: 'COMPRA',
 *   valor_minimo: 500000
 * });
 *
 * console.log(qualificacao.temperatura); // "QUENTE"
 */
async qualificarLead(lead: LeadInput): Promise<Qualificacao> {
  // ... implementação
}
```

---

## 📋 Workflow de Desenvolvimento

### 1. Planejamento
**Agente Principal** analisa requisito e cria plano

### 2. Database
**Database Agent** cria schema e migrations

### 3. Backend
**Backend Agent** implementa rotas e serviços

### 4. Frontend
**Frontend Agent** cria UI e componentes

### 5. Integrations
**Integrations Agent** conecta serviços externos

### 6. IA
**IA Agent** adiciona funcionalidades inteligentes

### 7. Testing
**Testing Agent** cria testes

### 8. Documentation
**Documentation Agent** atualiza documentação

---

## 🎯 Como Ativar um Agente

Ao fazer uma solicitação, especifique qual agente deve trabalhar:

**Exemplo:**
```
@backend-agent: Crie rota para listar leads qualificados pela Sofia

@frontend-agent: Crie componente para exibir score de leads

@ia-agent: Adicione análise de intenção de compra na qualificação

@database-agent: Adicione campo "motivo_desistencia" no modelo Lead

@design-ui-agent: Reformule landing page com estilo Tech Clean Premium

@seo-agent: Otimize SEO da landing page vivoly.com.br

@ai-bi-agent: Crie dashboard executivo com métricas de conversão

@testing-agent: Crie testes E2E para fluxo de captura

@documentation-agent: Documente novo sistema de agendamentos
```

---

### 8. Design/UI Agent 🎨

**Contexto**: `apps/web/**/*`, design visual, UX/UI

**Responsabilidades:**
- **OBRIGATÓRIO**: Seguir estilo "Tech Clean Premium"
- **OBRIGATÓRIO**: Usar paleta de cores aprovada
- **OBRIGATÓRIO**: Aplicar tipografia consistente
- Design de páginas e layouts
- UX/UI patterns e componentes
- Responsividade mobile-first
- Acessibilidade (a11y)

**Regras CRÍTICAS:**
- ⚠️ **SEMPRE** usar paleta aprovada:
  - Azul profundo: `#0A2540`
  - Verde tech: `#00C48C`
  - Azul neon: `#3B82F6`
  - Background: `#F4F6F8`
- ⚠️ **SEMPRE** fontes aprovadas (Inter, Poppins, Roboto)
- ⚠️ **SEMPRE** mobile-first e responsivo
- ⚠️ **SEMPRE** animações suaves (<0.6s)
- ❌ **NUNCA** cores antigas (#8FD14F verde, #A97E6F marrom)
- ❌ **NUNCA** gradientes excessivos
- ❌ **NUNCA** múltiplas fontes (máx 2)

**Workflow Obrigatório:**
1. Analisar solicitação e objetivo
2. Planejar estrutura e hierarquia
3. Aplicar "Tech Clean Premium"
4. Implementar microinterações
5. Testar responsividade
6. Validar checklist de design

**📚 Guia Completo:**
Ver `.claude/agents/design-ui.md` para:
- Paleta de cores detalhada
- Tipografia e tamanhos
- Layout e espaçamentos
- Botões e CTAs
- Ícones e ilustrações
- Animações permitidas
- Tom de comunicação
- Checklist completo

**Referência de Estilo:**
Ver `docs/estilo_visual_reformulacao_do_site_integruis_com.md`

**Aplicação:**
- ✅ Fase 1: Landing page (aprovação)
- ⏳ Fase 2: Todas as páginas (após aprovação)

---

### 9. SEO Specialist Agent 🔍

**Contexto**: `apps/web/**/*`, meta tags, sitemap, structured data, performance

**Responsabilidades:**
- **OBRIGATÓRIO**: Otimizar todas as páginas para SEO
- **OBRIGATÓRIO**: Implementar meta tags completas
- **OBRIGATÓRIO**: Schema.org/JSON-LD para rich snippets
- **OBRIGATÓRIO**: Sitemap.xml dinâmico e robots.txt
- Performance Web Vitals (LCP, FID, CLS)
- Acessibilidade semântica (HTML5)
- Open Graph e Twitter Cards
- Core Web Vitals optimization

**Regras CRÍTICAS:**
- ⚠️ **SEMPRE** meta tags únicas por página:
  - `<title>`: 50-60 caracteres, palavra-chave principal
  - `<meta name="description">`: 150-160 caracteres, CTA claro
  - `<meta name="keywords">`: 5-10 palavras-chave relevantes
  - Canonical URLs (`<link rel="canonical">`)
- ⚠️ **SEMPRE** structured data (JSON-LD):
  - LocalBusiness para imobiliárias
  - Product para imóveis
  - BreadcrumbList para navegação
  - Organization para empresa
- ⚠️ **SEMPRE** Open Graph completo:
  - og:title, og:description, og:image, og:url, og:type
  - Twitter Cards (summary_large_image)
- ⚠️ **SEMPRE** otimizar performance:
  - Images: WebP, lazy loading, responsive
  - Fonts: preload, font-display: swap
  - CSS/JS: minify, code splitting
  - LCP < 2.5s, FID < 100ms, CLS < 0.1
- ⚠️ **SEMPRE** HTML semântico:
  - `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
  - Headings hierárquicos (H1 único, H2-H6 ordenados)
  - ARIA labels quando necessário
- ❌ **NUNCA** duplicate content
- ❌ **NUNCA** keyword stuffing
- ❌ **NUNCA** hidden text ou cloaking
- ❌ **NUNCA** links quebrados (404)

**Workflow Obrigatório:**
1. **Análise da Página**:
   - Identificar objetivo e público-alvo
   - Pesquisar palavras-chave principais (volume, concorrência)
   - Definir intent (informacional, transacional, navegacional)

2. **Meta Tags e Head**:
   ```tsx
   // ✅ BOM
   import Head from 'next/head'

   export default function ImovelPage({ imovel }) {
     return (
       <>
         <Head>
           {/* Title Tag */}
           <title>{imovel.titulo} - {imovel.bairro}, {imovel.cidade} | Vivoly</title>

           {/* Meta Description */}
           <meta
             name="description"
             content={`${imovel.tipo} com ${imovel.quartos} quartos em ${imovel.bairro}. R$ ${imovel.valor}. Agende uma visita!`}
           />

           {/* Keywords */}
           <meta
             name="keywords"
             content={`${imovel.tipo}, ${imovel.bairro}, ${imovel.cidade}, imóvel ${imovel.tipo_negocio}, imobiliária`}
           />

           {/* Canonical */}
           <link rel="canonical" href={`https://vivoly.com.br/imoveis/${imovel.id}`} />

           {/* Open Graph */}
           <meta property="og:type" content="product" />
           <meta property="og:title" content={imovel.titulo} />
           <meta property="og:description" content={imovel.descricao} />
           <meta property="og:image" content={imovel.fotos[0]} />
           <meta property="og:url" content={`https://vivoly.com.br/imoveis/${imovel.id}`} />
           <meta property="og:site_name" content="Vivoly" />

           {/* Twitter Card */}
           <meta name="twitter:card" content="summary_large_image" />
           <meta name="twitter:title" content={imovel.titulo} />
           <meta name="twitter:description" content={imovel.descricao} />
           <meta name="twitter:image" content={imovel.fotos[0]} />

           {/* Mobile */}
           <meta name="viewport" content="width=device-width, initial-scale=1" />
           <meta name="theme-color" content="#00C48C" />
         </Head>

         {/* Structured Data - JSON-LD */}
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify({
               "@context": "https://schema.org",
               "@type": "Product",
               "name": imovel.titulo,
               "description": imovel.descricao,
               "image": imovel.fotos,
               "offers": {
                 "@type": "Offer",
                 "price": imovel.valor,
                 "priceCurrency": "BRL",
                 "availability": "https://schema.org/InStock"
               },
               "address": {
                 "@type": "PostalAddress",
                 "streetAddress": imovel.endereco,
                 "addressLocality": imovel.cidade,
                 "addressRegion": imovel.estado,
                 "addressCountry": "BR"
               }
             })
           }}
         />

         {/* Conteúdo da página */}
         <main>...</main>
       </>
     )
   }
   ```

3. **HTML Semântico**:
   ```tsx
   // ✅ BOM
   <article itemScope itemType="https://schema.org/Product">
     <header>
       <h1 itemProp="name">{imovel.titulo}</h1>
       <meta itemProp="price" content={imovel.valor} />
     </header>

     <section aria-label="Descrição do imóvel">
       <h2>Sobre o Imóvel</h2>
       <p itemProp="description">{imovel.descricao}</p>
     </section>

     <section aria-label="Características">
       <h2>Características</h2>
       <ul>
         <li>{imovel.quartos} quartos</li>
         <li>{imovel.vagas} vagas</li>
       </ul>
     </section>
   </article>

   // ❌ RUIM
   <div>
     <div className="title">{imovel.titulo}</div>
     <div>{imovel.descricao}</div>
   </div>
   ```

4. **Performance Optimization**:
   ```tsx
   // ✅ BOM - Images
   import Image from 'next/image'

   <Image
     src={imovel.foto}
     alt={`${imovel.tipo} em ${imovel.bairro} - ${imovel.quartos} quartos`}
     width={800}
     height={600}
     loading="lazy"
     placeholder="blur"
     quality={85}
   />

   // ✅ BOM - Fonts
   <link
     rel="preload"
     href="/fonts/inter.woff2"
     as="font"
     type="font/woff2"
     crossOrigin="anonymous"
   />

   // ❌ RUIM
   <img src={imovel.foto} /> {/* Sem lazy loading, sem alt */}
   ```

5. **Sitemap e Robots**:
   ```typescript
   // apps/web/app/sitemap.ts
   export default async function sitemap() {
     const imoveis = await fetchImoveis();

     return [
       {
         url: 'https://vivoly.com.br',
         lastModified: new Date(),
         changeFrequency: 'daily',
         priority: 1,
       },
       {
         url: 'https://vivoly.com.br/imoveis',
         lastModified: new Date(),
         changeFrequency: 'daily',
         priority: 0.9,
       },
       ...imoveis.map((imovel) => ({
         url: `https://vivoly.com.br/imoveis/${imovel.id}`,
         lastModified: imovel.updated_at,
         changeFrequency: 'weekly',
         priority: 0.8,
       })),
     ];
   }

   // apps/web/app/robots.ts
   export default function robots() {
     return {
       rules: {
         userAgent: '*',
         allow: '/',
         disallow: ['/admin/', '/dashboard/', '/api/'],
       },
       sitemap: 'https://vivoly.com.br/sitemap.xml',
     };
   }
   ```

6. **Web Vitals Monitoring**:
   ```typescript
   // apps/web/app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html lang="pt-BR">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

**Checklist SEO Completo:**
- [ ] **Meta Tags**
  - [ ] Title único (50-60 chars)
  - [ ] Description única (150-160 chars)
  - [ ] Keywords relevantes (5-10)
  - [ ] Canonical URL
  - [ ] Viewport meta
  - [ ] Theme color

- [ ] **Open Graph**
  - [ ] og:type
  - [ ] og:title
  - [ ] og:description
  - [ ] og:image (1200x630px)
  - [ ] og:url
  - [ ] og:site_name

- [ ] **Twitter Cards**
  - [ ] twitter:card
  - [ ] twitter:title
  - [ ] twitter:description
  - [ ] twitter:image

- [ ] **Structured Data**
  - [ ] JSON-LD implementado
  - [ ] Schema apropriado (Product, LocalBusiness, etc)
  - [ ] Validado em schema.org validator

- [ ] **HTML Semântico**
  - [ ] H1 único e descritivo
  - [ ] Hierarquia H2-H6 correta
  - [ ] Tags semânticas (header, nav, main, article, section, footer)
  - [ ] ARIA labels quando necessário

- [ ] **Performance**
  - [ ] Images otimizadas (WebP, lazy loading)
  - [ ] Fonts preloaded
  - [ ] CSS/JS minified
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

- [ ] **Acessibilidade**
  - [ ] Alt text em todas as imagens
  - [ ] Contraste adequado (WCAG AA)
  - [ ] Navegação por teclado
  - [ ] ARIA landmarks

- [ ] **Sitemap & Robots**
  - [ ] sitemap.xml dinâmico
  - [ ] robots.txt configurado
  - [ ] URLs canônicas

**Palavras-chave Principais (ImobiFlow/Vivoly):**
- **Primárias**: gestão imobiliária, CRM imobiliário, sistema imobiliário, software imobiliário
- **Secundárias**: captação de leads, qualificação de leads, imóveis para venda, imóveis para aluguel
- **Long-tail**: sistema de gestão para imobiliária, CRM para corretores de imóveis, plataforma imobiliária com IA
- **Locais**: imobiliária em [cidade], imóveis em [bairro], apartamentos em [região]

**URLs Amigáveis:**
- ✅ `/imoveis/apartamento-2-quartos-jardins-sp`
- ✅ `/imoveis?cidade=sao-paulo&tipo=apartamento`
- ❌ `/imovel?id=123&ref=abc`

**Métricas para Monitorar:**
- Google Search Console: impressões, cliques, CTR, posição
- Google Analytics: tráfego orgânico, bounce rate, conversões
- PageSpeed Insights: Core Web Vitals
- Schema.org Validator: structured data
- Mobile-Friendly Test

---

### 10. AI/BI Specialist Agent 🤖📊

**Contexto**: `apps/api/src/ai/**/*`, `apps/web/app/dashboard/**/*`, analytics, machine learning

**Responsabilidades:**

**🤖 Inteligência Artificial:**
- **OBRIGATÓRIO**: Gerenciar prompts da Sofia (qualificação, sugestões, respostas)
- **OBRIGATÓRIO**: Validar e sanitizar outputs de IA
- **OBRIGATÓRIO**: Implementar fallbacks robustos
- Machine Learning para predições (conversão, churn, LTV)
- Processamento de Linguagem Natural (NLP)
- Análise de sentimento em comunicações
- Recomendações inteligentes (imóveis, leads, ações)

**📊 Business Intelligence:**
- **OBRIGATÓRIO**: Dashboards executivos com métricas-chave
- **OBRIGATÓRIO**: Relatórios gerenciais automatizados
- **OBRIGATÓRIO**: Visualizações de dados (gráficos, charts, KPIs)
- Data analytics e insights acionáveis
- Funis de conversão e análise de pipeline
- Segmentação de leads e clientes
- Previsões e forecasting

**Regras CRÍTICAS - AI:**
- ⚠️ **SEMPRE** validar outputs da IA:
  - Schema validation (Zod/Joi)
  - Sanitização de dados
  - Verificação de completude
- ⚠️ **SEMPRE** ter fallbacks:
  - Qualificação manual se IA falhar
  - Valores default seguros
  - Degradação graceful
- ⚠️ **SEMPRE** logar custos:
  - Tokens consumidos (input/output)
  - Custo por requisição
  - Provider usado (Claude/OpenAI)
- ⚠️ **SEMPRE** prompt engineering:
  - Prompts versionados e testados
  - Few-shot examples
  - Chain-of-thought reasoning
  - System prompts claros
- ⚠️ **SEMPRE** cache inteligente:
  - Cache de análises similares
  - TTL adequado por tipo
  - Invalidação estratégica
- ❌ **NUNCA** expor prompts em produção
- ❌ **NUNCA** confiar cegamente na IA
- ❌ **NUNCA** processar dados sensíveis sem sanitização

**Regras CRÍTICAS - BI:**
- ⚠️ **SEMPRE** KPIs claros e acionáveis:
  - Taxa de conversão (lead → negociação → venda)
  - Tempo médio de fechamento
  - Ticket médio por imóvel
  - ROI por canal de aquisição
  - Churn rate
  - LTV (Lifetime Value)
- ⚠️ **SEMPRE** segmentação estratégica:
  - Leads por temperatura (FRIO/MORNO/QUENTE)
  - Corretores por performance
  - Imóveis por rentabilidade
  - Clientes por valor
- ⚠️ **SEMPRE** visualizações efetivas:
  - Gráficos adequados ao tipo de dado
  - Cores consistentes com brand
  - Labels claros e contextualizados
  - Responsivo e acessível
- ⚠️ **SEMPRE** atualização em tempo real:
  - WebSockets ou Server-Sent Events
  - Polling inteligente
  - Cache com revalidação
- ❌ **NUNCA** métricas de vaidade (sem valor acionável)
- ❌ **NUNCA** gráficos enganosos (eixos manipulados)
- ❌ **NUNCA** dados sem contexto temporal

**Workflow Obrigatório - AI:**

1. **Prompt Engineering**:
   ```typescript
   // ✅ BOM - Prompt versionado e estruturado
   const SOFIA_QUALIFICATION_PROMPT_V2 = `
   Você é Sofia, assistente de IA especializada em qualificação de leads imobiliários.

   ## TAREFA
   Analise o lead abaixo e forneça:
   1. Score de conversão (0-100)
   2. Temperatura (FRIO/MORNO/QUENTE)
   3. Análise detalhada (poder de compra, urgência, clareza)
   4. Insights acionáveis para o corretor

   ## CRITÉRIOS DE PONTUAÇÃO
   - Orçamento definido: +20 pontos
   - Localização específica: +15 pontos
   - Características detalhadas: +15 pontos
   - Email fornecido: +10 pontos
   - Observações detalhadas: +10 pontos
   - Urgência explícita: +20 pontos

   ## LEAD
   Nome: {nome}
   Telefone: {telefone}
   Email: {email}
   Tipo: {tipo_negocio}
   Imóvel: {tipo_imovel}
   Orçamento: R$ {valor_min} - R$ {valor_max}
   Localização: {cidade}, {estado}, {bairro}
   Observações: {observacoes}

   ## FORMATO DE RESPOSTA (JSON)
   {
     "score": number,
     "temperatura": "FRIO" | "MORNO" | "QUENTE",
     "analise": {
       "poder_compra": "BAIXO" | "MEDIO" | "ALTO",
       "urgencia": "BAIXA" | "MEDIA" | "ALTA",
       "clareza_necessidades": "BAIXA" | "MEDIA" | "ALTA",
       "probabilidade_conversao": number
     },
     "insights": {
       "pontos_fortes": string[],
       "pontos_fracos": string[],
       "recomendacao": string
     }
   }
   `;

   // ❌ RUIM - Prompt genérico e sem estrutura
   const prompt = `Analise este lead: ${JSON.stringify(lead)}`;
   ```

2. **Validação de Output**:
   ```typescript
   import { z } from 'zod';

   // ✅ BOM - Schema Zod para validação
   const QualificacaoSchema = z.object({
     score: z.number().min(0).max(100),
     temperatura: z.enum(['FRIO', 'MORNO', 'QUENTE']),
     analise: z.object({
       poder_compra: z.enum(['BAIXO', 'MEDIO', 'ALTO']),
       urgencia: z.enum(['BAIXA', 'MEDIA', 'ALTA']),
       clareza_necessidades: z.enum(['BAIXA', 'MEDIA', 'ALTA']),
       probabilidade_conversao: z.number().min(0).max(100)
     }),
     insights: z.object({
       pontos_fortes: z.array(z.string()).max(5),
       pontos_fratos: z.array(z.string()).max(5),
       recomendacao: z.string().max(500)
     })
   });

   async function qualificarLead(lead: Lead) {
     try {
       // 1. Gerar prompt
       const prompt = buildPrompt(SOFIA_QUALIFICATION_PROMPT_V2, lead);

       // 2. Chamar IA
       const response = await claudeService.generate(prompt);

       // 3. Parse JSON
       const parsed = JSON.parse(response);

       // 4. Validar schema
       const validated = QualificacaoSchema.parse(parsed);

       // 5. Logar custos
       await logAIUsage({
         model: 'claude-3-haiku',
         tokens_input: response.usage.input_tokens,
         tokens_output: response.usage.output_tokens,
         cost: calculateCost(response.usage)
       });

       return validated;
     } catch (error) {
       console.error('Erro na qualificação IA:', error);

       // 6. Fallback manual
       return getDefaultQualification(lead);
     }
   }

   // ❌ RUIM - Sem validação
   async function qualificarLead(lead: Lead) {
     const response = await ai.generate(prompt);
     return JSON.parse(response); // Pode quebrar!
   }
   ```

3. **Cache Inteligente**:
   ```typescript
   import NodeCache from 'node-cache';

   // ✅ BOM - Cache com TTL estratégico
   const aiCache = new NodeCache({
     stdTTL: 3600, // 1 hora para qualificações
     checkperiod: 600 // Verificar expiração a cada 10min
   });

   async function qualificarComCache(lead: Lead) {
     // Hash único do lead (ignora campos irrelevantes)
     const cacheKey = hashLead(lead);

     // Verificar cache
     const cached = aiCache.get(cacheKey);
     if (cached) {
       console.log('✅ Cache hit - qualificação');
       return cached;
     }

     // Processar com IA
     const result = await qualificarLead(lead);

     // Salvar em cache
     aiCache.set(cacheKey, result);

     return result;
   }

   function hashLead(lead: Lead): string {
     // Apenas campos relevantes para qualificação
     const relevant = {
       tipo_negocio: lead.tipo_negocio,
       tipo_imovel: lead.tipo_imovel_desejado,
       valor_min: Math.floor(lead.valor_minimo / 10000) * 10000, // Arredondar
       valor_max: Math.floor(lead.valor_maximo / 10000) * 10000,
       cidade: lead.municipio,
       quartos: lead.quartos_min
     };

     return crypto.createHash('md5').update(JSON.stringify(relevant)).digest('hex');
   }
   ```

**Workflow Obrigatório - BI:**

1. **KPIs e Métricas**:
   ```typescript
   // ✅ BOM - KPIs bem definidos
   interface DashboardMetrics {
     // Conversão
     taxa_conversao_lead_negociacao: number; // %
     taxa_conversao_negociacao_venda: number; // %
     taxa_conversao_geral: number; // lead → venda %

     // Tempo
     tempo_medio_resposta_lead: number; // minutos
     tempo_medio_fechamento: number; // dias
     tempo_medio_ciclo_venda: number; // dias

     // Financeiro
     ticket_medio: number; // R$
     valor_total_pipeline: number; // R$
     receita_mes: number; // R$
     roi_por_canal: Record<string, number>; // %

     // Performance
     leads_novos_mes: number;
     leads_qualificados_mes: number;
     negociacoes_ativas: number;
     vendas_fechadas_mes: number;

     // Churn e Retenção
     churn_rate: number; // %
     ltv_medio: number; // R$
     cac: number; // Custo de Aquisição de Cliente (R$)
   }

   async function calcularMetricasDashboard(
     tenantId: string,
     periodo: { inicio: Date; fim: Date }
   ): Promise<DashboardMetrics> {
     // Query otimizada com agregações
     const [leads, negociacoes, vendas] = await Promise.all([
       prisma.lead.aggregate({
         where: { tenant_id: tenantId, created_at: { gte: periodo.inicio, lte: periodo.fim } },
         _count: true
       }),
       prisma.negociacao.aggregate({
         where: { tenant_id: tenantId, created_at: { gte: periodo.inicio, lte: periodo.fim } },
         _count: true,
         _avg: { valor_proposta: true }
       }),
       prisma.negociacao.aggregate({
         where: {
           tenant_id: tenantId,
           status: 'FECHADO',
           data_fechamento: { gte: periodo.inicio, lte: periodo.fim }
         },
         _count: true,
         _sum: { valor_final: true }
       })
     ]);

     return {
       taxa_conversao_lead_negociacao: (negociacoes._count / leads._count) * 100,
       taxa_conversao_negociacao_venda: (vendas._count / negociacoes._count) * 100,
       taxa_conversao_geral: (vendas._count / leads._count) * 100,
       // ... calcular demais métricas
     };
   }
   ```

2. **Visualizações com Chart.js / Recharts**:
   ```tsx
   // ✅ BOM - Dashboard com Recharts
   import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer } from 'recharts';

   export function DashboardExecutivo({ metrics }: { metrics: DashboardMetrics }) {
     return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* KPI Cards */}
         <KPICard
           title="Taxa de Conversão"
           value={`${metrics.taxa_conversao_geral.toFixed(1)}%`}
           trend={+5.2}
           icon="📈"
         />

         {/* Funil de Conversão */}
         <div className="col-span-2">
           <h3>Funil de Vendas</h3>
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={funnelData}>
               <Bar dataKey="leads" fill="#00C48C" />
               <Bar dataKey="negociacoes" fill="#3B82F6" />
               <Bar dataKey="vendas" fill="#0A2540" />
             </BarChart>
           </ResponsiveContainer>
         </div>

         {/* Performance por Corretor */}
         <div className="col-span-3">
           <h3>Top Corretores - Último Mês</h3>
           <ResponsiveContainer width="100%" height={400}>
             <BarChart data={corretoresData} layout="horizontal">
               <Bar dataKey="vendas" fill="#00C48C" />
               <Bar dataKey="ticket_medio" fill="#3B82F6" />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>
     );
   }
   ```

3. **Real-time Updates (Server-Sent Events)**:
   ```typescript
   // Backend - apps/api/src/modules/dashboard/dashboard.routes.ts
   server.get('/dashboard/stream', async (request, reply) => {
     reply.raw.setHeader('Content-Type', 'text/event-stream');
     reply.raw.setHeader('Cache-Control', 'no-cache');
     reply.raw.setHeader('Connection', 'keep-alive');

     const tenantId = request.user.tenant_id;

     // Enviar métricas a cada 30 segundos
     const interval = setInterval(async () => {
       const metrics = await calcularMetricasDashboard(tenantId, {
         inicio: startOfMonth(new Date()),
         fim: new Date()
       });

       reply.raw.write(`data: ${JSON.stringify(metrics)}\n\n`);
     }, 30000);

     // Cleanup ao fechar conexão
     request.raw.on('close', () => {
       clearInterval(interval);
     });
   });

   // Frontend - apps/web/hooks/useDashboardMetrics.ts
   export function useDashboardMetrics() {
     const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

     useEffect(() => {
       const eventSource = new EventSource('/api/v1/dashboard/stream');

       eventSource.onmessage = (event) => {
         const data = JSON.parse(event.data);
         setMetrics(data);
       };

       return () => eventSource.close();
     }, []);

     return metrics;
   }
   ```

4. **Machine Learning - Predição de Conversão**:
   ```typescript
   // ✅ BOM - ML simples com regressão logística
   import * as tf from '@tensorflow/tfjs-node';

   interface LeadFeatures {
     tem_email: number; // 0 ou 1
     tem_orcamento: number; // 0 ou 1
     score_sofia: number; // 0-100
     tempo_resposta_minutos: number;
     interacoes_count: number;
     temperatura: number; // 0=FRIO, 1=MORNO, 2=QUENTE
   }

   class ConversaoPredictor {
     private model: tf.LayersModel | null = null;

     async train(historico: Array<{ lead: LeadFeatures; converteu: boolean }>) {
       // 1. Preparar dados
       const X = historico.map(h => Object.values(h.lead));
       const y = historico.map(h => h.converteu ? 1 : 0);

       // 2. Criar modelo
       this.model = tf.sequential({
         layers: [
           tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
           tf.layers.dropout({ rate: 0.2 }),
           tf.layers.dense({ units: 8, activation: 'relu' }),
           tf.layers.dense({ units: 1, activation: 'sigmoid' })
         ]
       });

       // 3. Compilar
       this.model.compile({
         optimizer: 'adam',
         loss: 'binaryCrossentropy',
         metrics: ['accuracy']
       });

       // 4. Treinar
       await this.model.fit(tf.tensor2d(X), tf.tensor1d(y), {
         epochs: 50,
         validationSplit: 0.2,
         callbacks: {
           onEpochEnd: (epoch, logs) => {
             console.log(`Epoch ${epoch}: loss=${logs?.loss}, acc=${logs?.acc}`);
           }
         }
       });
     }

     async predict(lead: LeadFeatures): Promise<number> {
       if (!this.model) throw new Error('Modelo não treinado');

       const input = tf.tensor2d([Object.values(lead)]);
       const prediction = this.model.predict(input) as tf.Tensor;
       const probability = (await prediction.data())[0];

       return probability * 100; // Converter para percentual
     }
   }
   ```

**Bibliotecas Recomendadas:**

**AI:**
- `@anthropic-ai/sdk` - Claude API
- `openai` - OpenAI API
- `zod` - Schema validation
- `langchain` - Framework para LLMs
- `@tensorflow/tfjs-node` - Machine Learning

**BI:**
- `recharts` - Gráficos React
- `chart.js` - Visualizações
- `d3` - Visualizações avançadas
- `date-fns` - Manipulação de datas
- `numeral` - Formatação de números

**Checklist Completo:**

**AI:**
- [ ] Prompts versionados e documentados
- [ ] Validação de schema (Zod)
- [ ] Fallbacks implementados
- [ ] Logs de custo e tokens
- [ ] Cache inteligente
- [ ] Rate limiting
- [ ] Timeout handling
- [ ] Error tracking

**BI:**
- [ ] KPIs definidos e calculados
- [ ] Dashboards responsivos
- [ ] Gráficos adequados ao tipo de dado
- [ ] Cores consistentes (Tech Clean Premium)
- [ ] Atualização em tempo real
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Filtros e segmentação
- [ ] Performance otimizada (agregações SQL)

**Métricas para Monitorar:**
- Taxa de acerto da IA (precision, recall, F1-score)
- Custo por análise (tokens consumidos)
- Tempo de resposta (p50, p95, p99)
- Taxa de fallback (quando IA falha)
- Satisfação do usuário com insights
- ROI das recomendações da IA

---

## 🔄 Coordenação entre Agentes

### Feature Completa: "Sistema de Favoritos"

1. **@database-agent**: Criar modelo `Favorito`
2. **@backend-agent**: Criar rotas CRUD
3. **@frontend-agent**: Criar botão de favoritar + lista (código)
4. **@design-ui-agent**: Design visual do botão e lista (estilo)
5. **@seo-agent**: Otimizar meta tags, structured data, sitemap
6. **@ai-bi-agent**: ML para recomendar imóveis baseado em favoritos
7. **@integrations-agent**: Enviar email com favoritos
8. **@testing-agent**: Testes do fluxo completo
9. **@documentation-agent**: Atualizar CLAUDE.md

---

## ⚠️ Princípios Gerais (Todos os Agentes)

1. **Segurança First**: Sempre validar, sempre filtrar por tenant_id
2. **Logs Estruturados**: Sempre logar operações importantes
3. **Error Handling**: Sempre tratar erros, sempre fallbacks
4. **Performance**: Índices, queries otimizadas, caching
5. **Código Limpo**: Funções pequenas, nomes claros, sem duplicação
6. **Testes**: Tudo que pode quebrar deve ter teste
7. **Documentação**: Código auto-explicativo + docs atualizadas

---

**Última atualização**: 17 de fevereiro de 2026
**Versão**: 2.1.0

---

## 🔒 Assistente Validador de Mudanças (Automático)

O projeto possui um sistema automatizado de validação em 3 camadas:

### Camada 1: Git Pre-commit Hook
- **Arquivo**: `scripts/validate-changes.sh` (symlink em `.git/hooks/pre-commit`)
- **Função**: Bloqueia commits que modificam arquivos significativos sem atualizar CLAUDE.md
- **Arquivos monitorados**: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `schema.prisma`, `server.ts`, `middleware.ts`, `page.tsx`, `.env`
- **Bypass**: `git commit --no-verify` (apenas casos excepcionais)

### Camada 2: Claude Code Hook
- **Arquivo**: `.claude/settings.json`
- **Função**: Lembra o assistente de verificar CLAUDE.md antes de cada commit

### Camada 3: Regras no CLAUDE.md e MEMORY.md
- **CLAUDE.md**: Seção "REGRAS OBRIGATÓRIAS DE WORKFLOW" no topo
- **MEMORY.md**: Regra fundamental persistente entre sessões

**Todas as tarefas devem ser delegadas a assistentes especialistas quando possível.**
