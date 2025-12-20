# 🏢 Multi-Tenancy - ImobiFlow SaaS

**Data**: 2025-12-20
**Status**: ✅ Implementado e Funcional

---

## 🎯 Resumo Executivo

O ImobiFlow é uma **aplicação SaaS Multi-Tenant**, onde:

- ✅ **Uma única aplicação** serve múltiplos clientes (imobiliárias)
- ✅ **Cada cliente (tenant)** tem dados **completamente isolados**
- ✅ **Cada imobiliária** conecta seu próprio WhatsApp Business
- ✅ **Sofia (IA)** pode ser personalizada por cliente
- ✅ **Segurança total** - impossível acessar dados de outros tenants

---

## 🏗️ Arquitetura

```
ImobiFlow SaaS (Uma Aplicação)
│
├─ Tenant 1: Imobiliária ABC
│  ├─ WhatsApp: (11) 98888-8888
│  ├─ Leads: 150
│  ├─ Imóveis: 80
│  ├─ Corretores: 5
│  └─ Sofia personalizada
│
├─ Tenant 2: Imobiliária XYZ
│  ├─ WhatsApp: (21) 97777-7777
│  ├─ Leads: 200
│  ├─ Imóveis: 120
│  ├─ Corretores: 8
│  └─ Sofia personalizada
│
└─ Tenant 3: Imóveis Prime
   ├─ WhatsApp: (48) 96666-6666
   ├─ Leads: 50
   ├─ Imóveis: 30
   ├─ Corretores: 3
   └─ Sofia personalizada
```

**Cada tenant totalmente isolado e independente!**

---

## 🔒 Como Funciona o Isolamento?

### 1. **Banco de Dados - Campo `tenant_id`**

Todas as tabelas têm um campo `tenant_id`:

```typescript
model Lead {
  id        String   @id @default(uuid())
  tenant_id String   // ← Chave do isolamento!
  tenant    Tenant   @relation(...)

  nome      String
  telefone  String
  score     Int

  @@index([tenant_id])
}
```

### 2. **Token JWT com `tenantId`**

Ao fazer login, você recebe um token JWT:

```json
{
  "userId": "abc-123",
  "tenantId": "tenant-xyz",  // ← Identifica sua imobiliária
  "email": "joao@imobiliariaABC.com"
}
```

### 3. **Filtro Automático em TODAS as Queries**

Todas as consultas ao banco são automaticamente filtradas:

```typescript
// Sistema adiciona automaticamente:
const leads = await prisma.lead.findMany({
  where: {
    tenant_id: tenantId  // ← Sempre filtrado!
  }
})
```

---

## ❓ Perguntas Frequentes

### 1. **Preciso de um número WhatsApp novo?**

**NÃO!** Use seu número comercial atual. Conecte via QR Code (igual WhatsApp Web).

### 2. **Meus dados ficam misturados com outros clientes?**

**JAMAIS!** Isolamento 100% garantido. Você NUNCA vê dados de outras imobiliárias.

### 3. **A Sofia é compartilhada?**

**NÃO!** Cada tenant tem sua própria "instância" da Sofia, com personalização exclusiva.

### 4. **Como sei que estou vendo apenas meus dados?**

O sistema usa seu token JWT que contém `tenant_id`. Todas as queries são filtradas automaticamente.

### 5. **O que acontece se eu apagar minha conta?**

Todos os seus dados são deletados (cascade delete). Outros tenants não são afetados.

---

## 🎯 Benefícios do Multi-Tenancy

| Benefício | Descrição |
|-----------|-----------|
| **Custo Reduzido** | Uma infraestrutura serve todos os clientes |
| **Manutenção Simples** | Uma atualização beneficia todos |
| **Escalabilidade** | Adicionar novos clientes é instantâneo |
| **Isolamento Total** | Segurança e privacidade garantidas |
| **Personalização** | Cada cliente configura como quiser |

---

## 📊 Isolamento em Todas as Camadas

```
┌─────────────────────────────────────┐
│  🗄️  Banco de Dados (tenant_id)     │
├─────────────────────────────────────┤
│  🔌  API / Backend (JWT filter)     │
├─────────────────────────────────────┤
│  🎨  Frontend / UI (token-based)    │
├─────────────────────────────────────┤
│  🤖  IA / Sofia (contexto isolado)  │
├─────────────────────────────────────┤
│  📱  WhatsApp (número próprio)      │
└─────────────────────────────────────┘
```

---

## ✅ Garantias de Segurança

- ✅ **Impossível** acessar dados de outro tenant
- ✅ **Autenticação** via JWT com `tenantId` embutido
- ✅ **Filtro automático** em todas as consultas
- ✅ **Cascade delete** ao remover tenant
- ✅ **LGPD compliant** - dados isolados por cliente
- ✅ **Backup automático** no PostgreSQL (Render)

---

## 🚀 Como Funciona na Prática

### Cadastro de Novo Cliente:

1. Cliente se cadastra em `https://integrius.com.br/register`
2. Sistema cria novo `tenant_id` único
3. Cliente recebe credenciais de acesso
4. Faz login e acessa dashboard vazio
5. Conecta WhatsApp via QR Code
6. Sofia começa a funcionar automaticamente!

### Durante Operação:

```
Cliente manda mensagem WhatsApp
    ↓
Sistema identifica: WhatsApp X = Tenant Y
    ↓
Processa mensagem com contexto do Tenant Y
    ↓
Sofia responde usando dados APENAS do Tenant Y
    ↓
Salva tudo no banco com tenant_id = Y
```

---

## 📚 Documentação Relacionada

- [guia-multitenancy.html](./guia-multitenancy.html) - Versão HTML interativa
- [BI-EXPLICACAO-COMPLETA.md](./BI-EXPLICACAO-COMPLETA.md) - Como funciona o BI
- [IA-GUIA-USO.md](./IA-GUIA-USO.md) - Como usar a Sofia
- [WHATSAPP-INTEGRACAO.md](./WHATSAPP-INTEGRACAO.md) - Integração WhatsApp

---

## 🎯 Conclusão

**Multi-Tenancy** = Cada cliente tem sua própria "empresa virtual" dentro do ImobiFlow.

- 🏢 Estrutura própria
- 📞 WhatsApp próprio
- 🤖 Sofia personalizada
- 📊 Dashboard exclusivo
- 🔒 Segurança total

**É como ter seu próprio sistema exclusivo, mas com custo de SaaS!** 🚀

---

**Última Atualização**: 2025-12-20
**Versão**: 1.0
**Plataforma**: Render (Backend + Frontend)
