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

### 7. Documentation Agent 📚

**Contexto**: `**/*.md`, comentários em código

**Responsabilidades:**
- CLAUDE.md atualizado
- READMEs por módulo
- Comentários JSDoc
- Diagramas de fluxo

**Regras:**
- ✅ SEMPRE atualizar CLAUDE.md com novas features
- ✅ SEMPRE documentar decisões arquiteturais
- ✅ SEMPRE exemplos de uso em comentários
- ✅ SEMPRE manter changelog atualizado
- ❌ NUNCA comentários óbvios
- ❌ NUNCA documentação desatualizada

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

@testing-agent: Crie testes E2E para fluxo de captura

@documentation-agent: Documente novo sistema de agendamentos
```

---

## 🔄 Coordenação entre Agentes

### Feature Completa: "Sistema de Favoritos"

1. **@database-agent**: Criar modelo `Favorito`
2. **@backend-agent**: Criar rotas CRUD
3. **@frontend-agent**: Criar botão de favoritar + lista
4. **@integrations-agent**: Enviar email com favoritos
5. **@ia-agent**: Sofia sugere imóveis baseado em favoritos
6. **@testing-agent**: Testes do fluxo completo
7. **@documentation-agent**: Atualizar CLAUDE.md

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

**Última atualização**: 27 de dezembro de 2025
