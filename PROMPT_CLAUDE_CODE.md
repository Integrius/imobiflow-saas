# 🎯 PROMPT PARA CLAUDE CODE - FINALIZAÇÃO IMOBIFLOW

## 📋 CONTEXTO DO PROJETO

Você está assumindo o desenvolvimento do **ImobiFlow**, uma plataforma SaaS completa para gestão imobiliária. O projeto está em desenvolvimento há 6 chats e enfrentou problemas recorrentes no frontend.

### Documentação Essencial
- `MEMORIAL_DESCRITIVO_IMOBIFLOW.md` - Especificação técnica completa
- `PLANEJAMENTO_IMOBIFLOW.md` - Roadmap e metodologia
- `QUALIDADE_TOTAL_IMOBIFLOW.md` - Regras de qualidade

## ✅ O QUE JÁ ESTÁ PRONTO E FUNCIONANDO

### Backend (100% funcional)
- ✅ Node.js + Fastify + TypeScript
- ✅ PostgreSQL + Prisma ORM
- ✅ Autenticação JWT completa
- ✅ APIs REST completas:
  - `/api/v1/auth` (login, register, refresh)
  - `/api/v1/leads` (CRUD completo + score automático)
  - `/api/v1/corretores` (CRUD completo)
  - `/api/v1/imoveis` (CRUD + geolocalização + upload)
  - `/api/v1/proprietarios` (CRUD completo)
  - `/api/v1/negociacoes` (CRUD + pipeline + comissões)
  - `/api/v1/dashboard` (métricas e KPIs)
- ✅ Validações Zod em todas rotas
- ✅ Testes unitários (cobertura >80%)
- ✅ Backend rodando em `localhost:3333`

### Infraestrutura
- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ GitHub configurado
- ✅ Vercel conectada (deploy automático)

## ❌ PROBLEMAS RECORRENTES NO FRONTEND

### Histórico de Dificuldades (Chats #6, #6-Cont, #6-Cont2, #6-Cont3, #6-Cont4)

1. **Route Groups não funcionaram**
   - Tentamos estrutura `(auth)` e `(dashboard)`
   - Next.js 15 retornava 404 em todas rotas
   - Solução parcial: rotas diretas (`/login`, `/dashboard`, `/leads`)

2. **Token JWT expirando**
   - Usuário faz login, token salvo no localStorage
   - Após algum tempo, requisições retornam 401
   - Não há refresh automático do token

3. **Estrutura de componentes inconsistente**
   - Componentes UI (shadcn) foram modificados múltiplas vezes
   - Alguns componentes deletados e recriados
   - Falta padronização

4. **Formulários sem validação visual adequada**
   - Erros não aparecem claramente
   - Falta feedback de loading
   - Falta mensagens de sucesso/erro (toast)

5. **Layout e navegação incompletos**
   - Falta sidebar persistente
   - Falta header com logout
   - Navegação entre páginas não está clara

## 🎯 O QUE PRECISA SER FEITO

### PRIORIDADE MÁXIMA (Fase 1 - MVP)

#### 1. Corrigir Sistema de Autenticação
- [ ] Implementar refresh automático de token
- [ ] Adicionar interceptor para renovar token antes de expirar
- [ ] Redirecionar para login quando token inválido
- [ ] Adicionar loading state durante autenticação

#### 2. Criar Layout Completo e Funcional
- [ ] Sidebar fixa com navegação:
  - Dashboard
  - Leads
  - Imóveis
  - Corretores
  - Negociações
  - Relatórios
- [ ] Header com:
  - Logo ImobiFlow
  - Nome do usuário logado
  - Botão de logout funcional
- [ ] Layout responsivo (mobile-friendly)

#### 3. Completar Páginas CRUD

**Dashboard (`/dashboard`)**
- [ ] Cards com KPIs (Leads, Imóveis, Negociações, Receita)
- [ ] Gráfico de leads por origem
- [ ] Gráfico de funil de vendas
- [ ] Atividades recentes

**Leads (`/leads`)**
- [ ] ✅ Listagem com tabela (já existe)
- [ ] ✅ Formulário de criação (já existe)
- [ ] Adicionar edição de lead
- [ ] Adicionar exclusão com confirmação
- [ ] Filtros: temperatura, origem, corretor
- [ ] Busca por nome/telefone/email
- [ ] Paginação funcional
- [ ] Badge visual para temperatura (Quente/Morno/Frio)

**Imóveis (`/imoveis`)**
- [ ] Listagem em grid com fotos
- [ ] Formulário multi-step (dados básicos → endereço → fotos)
- [ ] Upload de múltiplas imagens
- [ ] Preview de imagens
- [ ] Filtros: tipo, categoria, faixa de preço
- [ ] Mapa com geolocalização

**Corretores (`/corretores`)**
- [ ] Listagem com performance (leads atribuídos, conversões)
- [ ] Formulário de criação/edição
- [ ] Card de performance individual
- [ ] Ranking de performance

**Negociações (`/negociacoes`)**
- [ ] Pipeline Kanban (drag & drop)
- [ ] Colunas: Contato → Visita → Proposta → Contrato → Fechado
- [ ] Cards com informações do lead + imóvel
- [ ] Modal com detalhes completos
- [ ] Timeline de eventos
- [ ] Cálculo de comissões

#### 4. Sistema de Feedback Visual
- [ ] Toast notifications (sucesso, erro, info)
- [ ] Loading states em botões
- [ ] Skeleton loading em listas
- [ ] Confirmação antes de deletar
- [ ] Mensagens de erro amigáveis

#### 5. Validações e UX
- [ ] Validação em tempo real nos formulários
- [ ] Máscaras de input (telefone, CPF, CEP, moeda)
- [ ] Mensagens de erro claras abaixo dos campos
- [ ] Desabilitar botão durante submit
- [ ] Limpar formulário após sucesso

## 🛠️ DIRETRIZES TÉCNICAS

### Stack Atual
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **State:** Zustand (pouco usado) + React Query (preferencial)
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **Backend:** API em `localhost:3333`

### Estrutura de Diretórios Atual
```
apps/web/src/
├── app/
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── leads/page.tsx
│   ├── corretores/page.tsx
│   ├── imoveis/page.tsx
│   └── negociacoes/page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   ├── leads/
│   ├── corretores/
│   ├── imoveis/
│   └── negociacoes/
├── lib/
│   └── api/
│       ├── client.ts
│       ├── auth.ts
│       ├── leads.ts
│       ├── corretores.ts
│       ├── imoveis.ts
│       ├── negociacoes.ts
│       └── dashboard.ts
└── hooks/
    ├── use-leads.ts
    ├── use-corretores.ts
    ├── use-imoveis.ts
    ├── use-negociacoes.ts
    └── use-dashboard.ts
```

### Padrões a Seguir

**1. API Calls (React Query)**
```typescript
// hooks/use-leads.ts
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadDTO) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar lead')
    }
  })
}
```

**2. Formulários (React Hook Form + Zod)**
```typescript
const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

**3. Autenticação (Interceptor com Refresh)**
```typescript
// lib/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentar refresh
      const refreshed = await refreshToken()
      if (refreshed) {
        // Retry request original
        return apiClient.request(error.config)
      }
      // Se falhar, redirecionar para login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**4. Layout Compartilhado**
```typescript
// app/layout.tsx (layout global)
// app/dashboard/layout.tsx (layout com sidebar apenas para rotas /dashboard/*)
```

## 🚨 REGRAS CRÍTICAS

1. **NÃO recrie componentes shadcn/ui do zero** - Use os existentes
2. **NÃO use route groups** - Rotas diretas apenas
3. **SEMPRE use React Query** para chamadas API
4. **SEMPRE adicione loading/error states**
5. **SEMPRE valide formulários com Zod**
6. **SEMPRE adicione toast feedback**
7. **TESTE cada funcionalidade antes de avançar**

## 📊 CRITÉRIOS DE SUCESSO

### Funcionalidades Mínimas (MVP)
- [ ] Login/Logout funcionando
- [ ] Dashboard com métricas carregando
- [ ] CRUD completo de Leads (criar, listar, editar, deletar)
- [ ] CRUD completo de Imóveis
- [ ] CRUD completo de Corretores
- [ ] Pipeline Kanban de Negociações funcionando
- [ ] Token refresh automático
- [ ] Layout responsivo
- [ ] Feedback visual em todas ações

### Qualidade
- [ ] Zero erros no console
- [ ] Zero warnings TypeScript
- [ ] Todas rotas funcionando
- [ ] Todas validações funcionando
- [ ] Performance: tempo de carregamento < 2s

## 🎬 PLANO DE EXECUÇÃO SUGERIDO

### Fase 1: Fundação (2-3h)
1. Corrigir sistema de autenticação com refresh token
2. Criar layout global com sidebar e header
3. Garantir navegação entre páginas funcionando

### Fase 2: CRUDs Completos (3-4h)
4. Finalizar página de Leads (editar, deletar, filtros)
5. Finalizar página de Imóveis (upload, formulário completo)
6. Finalizar página de Corretores
7. Adicionar sistema de toast em todos CRUDs

### Fase 3: Features Avançadas (2-3h)
8. Implementar Dashboard com gráficos
9. Implementar Pipeline Kanban de Negociações
10. Adicionar filtros e buscas em todas listas

### Fase 4: Polimento (1-2h)
11. Responsividade mobile
12. Loading states e skeleton screens
13. Validações e máscaras de input
14. Testes finais de todas funcionalidades

## 📞 COMO PROCEDER

1. **Leia os arquivos de documentação** (MEMORIAL, PLANEJAMENTO, QUALIDADE_TOTAL)
2. **Analise o código atual** em `apps/web/src/`
3. **Identifique gaps** entre o que existe e o que precisa
4. **Crie um plano de ação detalhado**
5. **Execute fase por fase**
6. **Teste cada funcionalidade antes de avançar**
7. **Commite progressivamente** (não espere tudo pronto)

## 💡 DICAS IMPORTANTES

- Use `pnpm dev` para rodar frontend em `localhost:3000`
- Backend já está rodando em `localhost:3333`
- Use Postman/Insomnia para testar APIs se necessário
- Consulte `apps/api/src/modules/` para ver exatamente o que cada API retorna
- shadcn/ui tem [documentação completa](https://ui.shadcn.com/)
- Se tiver dúvidas sobre tipos, veja `apps/api/prisma/schema.prisma`

## 🎯 META FINAL

**Um MVP 100% funcional onde:**
- Usuário faz login
- Navega pelo sistema sem erros
- Cria/edita/deleta Leads, Imóveis, Corretores
- Visualiza Pipeline de Negociações
- Vê métricas no Dashboard
- Recebe feedback claro de todas ações
- Interface bonita e responsiva

---

**Boa sorte! Você consegue! 🚀**

*Qualquer dúvida, consulte a documentação ou pergunte.*
