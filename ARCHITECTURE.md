# ImobiFlow - Arquitetura e Estratégia

## 🏗️ Estratégia de Desenvolvimento

O ImobiFlow possui **duas versões** para atender diferentes perfis de clientes:

### 1️⃣ Single-Tenant (Instância Dedicada)
**Branch:** `single-tenant-stable`
**Tag:** `v1.0.0-single-tenant`

**Público-alvo:**
- Grandes imobiliárias
- Clientes enterprise
- Necessidade de customização
- Requisitos de segurança/compliance

**Características:**
- Uma instância por cliente
- Banco de dados dedicado
- Servidor dedicado
- Domínio próprio
- Possibilidade de customização

**Modelo de Negócio:**
- Licença anual: R$ 3.000 - R$ 10.000/ano
- Implantação: R$ 5.000 - R$ 15.000
- Suporte dedicado

---

### 2️⃣ Multi-Tenant SaaS (Instância Compartilhada)
**Branch:** `main`

**Público-alvo:**
- Pequenas imobiliárias
- Corretores autônomos
- Startups do setor
- Clientes que preferem pay-as-you-go

**Características:**
- Infraestrutura compartilhada
- Isolamento por `tenant_id`
- Subdomínios: `cliente.imobiflow.com`
- Planos escaláveis
- Trial gratuito

**Modelo de Negócio:**
- Básico: R$ 99/mês (até 3 usuários)
- Pro: R$ 299/mês (até 10 usuários)
- Enterprise: R$ 799/mês (ilimitado)

---

## 🚀 Deploy Strategy

### Single-Tenant
```
Cliente A:
  - Database: PostgreSQL dedicado
  - Backend: Render.com (instância dedicada)
  - Frontend: Vercel (projeto dedicado)
  - Domain: clientea.com ou app.clientea.com

Cliente B:
  - Database: PostgreSQL dedicado
  - Backend: Render.com (instância dedicada)
  - Frontend: Vercel (projeto dedicado)
  - Domain: clienteb.com
```

### Multi-Tenant
```
ImobiFlow SaaS:
  - Database: PostgreSQL único (com tenant_id em todas as tabelas)
  - Backend: Render.com (escalável)
  - Frontend: Vercel
  - Domains:
    - app.imobiflow.com (main app)
    - *.imobiflow.com (subdomains por tenant)
```

---

## 📦 Repositórios

- **Atual:** `Integrius/imobiflow-saas` (será multi-tenant)
- **Single-Tenant:** Branch `single-tenant-stable` no mesmo repo

---

## 🔄 Workflow de Desenvolvimento

1. **Novas features comuns** → Desenvolver no `main`
2. **Bug fixes críticos** → Aplicar em ambas versões
3. **Customizações** → Apenas em `single-tenant-stable`
4. **Melhorias SaaS** → Apenas em `main`

---

## 🎯 Estado Atual

**Versão Single-Tenant (v1.0.0):**
- ✅ Autenticação email/senha
- ✅ Login com Google OAuth
- ✅ Dashboard básico
- ⚠️ Módulos não testados (leads, imóveis, negociações)

**Versão Multi-Tenant (v2.0.0):**
- ✅ Tabela Tenants implementada
- ✅ tenant_id adicionado em todas as tabelas
- ✅ Middleware de isolamento implementado
- ✅ Sistema de planos (BASICO, PRO, ENTERPRISE, CUSTOM)
- ✅ Sistema de assinaturas
- ✅ API de gerenciamento de tenants
- ✅ Migration SQL criada e documentada
- ✅ Documentação completa (ver [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md))
- 🚧 Próximos passos:
  1. Atualizar repositories para usar tenant_id
  2. Implementar página de cadastro/onboarding
  3. Integração de pagamentos (Stripe/Mercado Pago)
  4. Testes automatizados de isolamento entre tenants
  5. Dashboard administrativo para gerenciar tenants

---

## 📊 Roadmap

### Q1 2025
- [x] Finalizar refatoração multi-tenant (Schema + Middleware)
- [x] Implementar sistema de planos
- [ ] Atualizar repositories com tenant_id
- [ ] Integrar gateway de pagamento
- [ ] Página de cadastro/onboarding

### Q2 2025
- [ ] Testar funcionalidades core
- [ ] Implementar testes automatizados de isolamento
- [ ] Beta privado
- [ ] Feedback de clientes piloto

### Q3 2025
- [ ] Lançamento público
- [ ] Marketing e aquisição
- [ ] Dashboard administrativo
- [ ] Suporte e iteração

---

Última atualização: 03/12/2025
