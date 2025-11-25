# ImobiFlow 🏢

Sistema completo de gestão imobiliária com CRM integrado para imobiliárias.

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (Componentes)
- **React Query** (State management)
- **React Hook Form** + **Zod** (Formulários e validação)
- **Recharts** (Gráficos)
- **DnD Kit** (Drag and drop)

### Backend
- **Fastify** (Framework HTTP)
- **Prisma** (ORM)
- **PostgreSQL** (Banco de dados)
- **TypeScript**

### Monorepo
- **Turborepo** (Build system)
- **PNPM** (Package manager)

## 📦 Estrutura do Projeto

```
imobiflow/
├── apps/
│   ├── api/          # Backend (Fastify + Prisma)
│   └── web/          # Frontend (Next.js)
├── packages/         # Pacotes compartilhados
├── scripts/          # Scripts utilitários
└── docs/             # Documentação
```

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1 - Concluída

1. **Interface de Imóveis**
   - Listagem com filtros avançados
   - CRUD completo
   - Página de detalhes
   - Upload de informações e características

2. **Interface de Negociações (Kanban)**
   - Board com 9 status
   - Drag-and-drop de cards
   - Timeline de eventos
   - Modal de detalhes
   - Formulário de criação

3. **Dashboard com Gráficos**
   - Funil de conversão
   - Evolução temporal
   - Top corretores
   - Distribuição de leads

### ✅ Fase 2 - Em Andamento

4. **Interface de Corretores** ✅
   - Listagem com filtros
   - CRUD completo
   - Página de perfil com estatísticas
   - Gestão de especializações
   - Metas e comissões

5. **Interface de Proprietários** (Próximo)
6. **Integrações com Portais** (Planejado)
7. **Sistema de Automações** (Planejado)

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- PNPM 8+
- PostgreSQL 14+

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd imobiflow

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Rodar migrations do banco
cd apps/api
pnpm prisma migrate dev

# Voltar para raiz
cd ../..
```

### Executar em Desenvolvimento

```bash
# Rodar todos os apps (frontend + backend)
pnpm dev

# Ou rodar individualmente
pnpm dev --filter=web    # Frontend em http://localhost:3000
pnpm dev --filter=api    # Backend em http://localhost:3333
```

### Build

```bash
# Build de todos os apps
pnpm build

# Build individual
pnpm build --filter=web
pnpm build --filter=api
```

### Testes

```bash
# Rodar todos os testes
pnpm test

# Testes com coverage
pnpm test:coverage
```

## 🌐 Deploy

### Deploy do Frontend (Vercel)

O projeto está configurado para deploy automático na Vercel.

**Quick Start:**

1. Faça push do código para o GitHub
2. Importe o projeto na Vercel: https://vercel.com/new
3. Configure a variável de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL da sua API

**Documentação completa:** Veja [DEPLOY_QUICKSTART.md](./DEPLOY_QUICKSTART.md)

### Deploy do Backend

Recomendações para deploy da API:
- **Railway** (https://railway.app) - Recomendado
- **Render** (https://render.com)
- **Heroku** (https://heroku.com)

## 📚 Documentação

- [Guia de Deploy](./DEPLOY.md) - Guia completo de deployment
- [Quick Start Deploy](./DEPLOY_QUICKSTART.md) - Guia rápido
- [API Documentation](./apps/api/README.md) - Documentação da API
- [Frontend Documentation](./apps/web/README.md) - Documentação do frontend

## 🔧 Configuração

### Variáveis de Ambiente

**Frontend (apps/web/.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

**Backend (apps/api/.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/imobiflow
PORT=3333
JWT_SECRET=seu-secret-aqui
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Convenções de Código

- **Commits**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- **TypeScript**: Strict mode habilitado
- **Linting**: ESLint + Prettier
- **Code Style**: Airbnb Style Guide

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Desenvolvido com ❤️ por [Seu Nome/Empresa]

## 📞 Suporte

- Issues: [GitHub Issues](https://github.com/seu-usuario/imobiflow/issues)
- Email: contato@imobiflow.com

---

**Status do Projeto:** 🟢 Em Desenvolvimento Ativo

**Última Atualização:** Novembro 2024
