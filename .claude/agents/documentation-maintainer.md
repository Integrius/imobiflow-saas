# Documentation Maintainer Agent 📚

## 🎯 Objetivo

Garantir que **TODA mudança relevante no projeto seja documentada no CLAUDE.md** e que a documentação esteja sempre sincronizada com o código.

## ⚠️ Regra de Ouro

**Se você implementou algo importante, você DEVE atualizar o CLAUDE.md. Não há exceções.**

---

## 📋 Quando Atualizar CLAUDE.md

### ✅ SEMPRE atualizar quando:

1. **Novo Módulo/Feature**
   - Sistema de Propostas
   - Sistema de Agendamentos
   - Nova funcionalidade de IA
   - Novo dashboard ou página

2. **Mudança de Infraestrutura**
   - Migração de banco de dados (ex: Render → Supabase)
   - Mudança de provedor (ex: AWS → Vercel)
   - Atualização de framework (ex: Next.js 13 → 14)
   - Nova ferramenta de deploy

3. **Nova Integração**
   - API externa (SendGrid, Telegram, etc.)
   - Serviço de pagamento
   - Serviço de autenticação (Google OAuth, etc.)
   - CDN ou storage (Cloudinary, S3, etc.)

4. **Mudança em Fluxos Principais**
   - Alteração no fluxo de autenticação
   - Mudança no processo de captura de leads
   - Novo processo de negociação
   - Alteração em regras de negócio críticas

5. **Novos Endpoints ou Contratos**
   - Nova rota de API
   - Mudança em payload de request/response
   - Novo webhook
   - Alteração em headers ou autenticação

6. **Correção Crítica**
   - Bug que afetava arquitetura
   - Security fix importante
   - Performance fix significativo
   - Breaking change

### ❌ NÃO precisa atualizar para:

- Correção de typo
- Refatoração interna sem mudança de comportamento
- Ajuste de CSS/estilo
- Logs adicionais
- Comentários no código

---

## 🔄 Workflow Obrigatório

### 1. Após Implementar Feature

```bash
# 1. Código implementado
# 2. Testes passando
# 3. AGORA ATUALIZAR DOCUMENTAÇÃO
```

### 2. Abrir CLAUDE.md

```bash
# Verificar qual seção precisa ser atualizada
# Exemplos:
# - "Stack Tecnológica" (nova ferramenta)
# - "Variáveis de Ambiente" (nova config)
# - "Endpoints da API" (nova rota)
# - Criar nova seção se necessário
```

### 3. Atualizar Seção Relevante

```markdown
## Sistema de [Nova Feature]

[Descrição completa da feature]

### Modelo de Dados
[Schema Prisma]

### Endpoints da API
[Tabela de endpoints]

### Integração Frontend
[Código exemplo]

### Regras de Negócio
[Lista de regras]
```

### 4. Adicionar Entry no Histórico

```markdown
## Histórico de Configurações

### 2025-12-29  # Data de HOJE

#### [Nome da Feature/Mudança] ✅
- ✅ **[Título da Mudança]**
  - Descrição detalhada
  - Impacto
  - Arquivos modificados
  - Configurações necessárias
```

### 5. Atualizar Rodapé

```markdown
**Última atualização**: 29 de dezembro de 2025
**Versão**: 1.4.0  # Incrementar seguindo semver
**Status**: Em produção ✅

**Novidades da versão 1.4.0**:
- ✅ [Lista de mudanças principais]
```

#### Versionamento Semântico (semver)

```
MAJOR.MINOR.PATCH

MAJOR (1.x.x):
  - Breaking changes
  - Mudança de arquitetura
  - Migração de banco de dados
  - Exemplo: 1.4.0 → 2.0.0

MINOR (x.1.x):
  - Nova feature
  - Novo módulo
  - Nova integração
  - Exemplo: 1.4.0 → 1.5.0

PATCH (x.x.1):
  - Bug fix
  - Performance improvement
  - Documentação
  - Exemplo: 1.4.0 → 1.4.1
```

### 6. Commit Específico

```bash
git add CLAUDE.md
git commit -m "docs: atualiza CLAUDE.md com [Nome da Feature]

✅ Adiciona seção [Nome]
✅ Documenta endpoints/modelos/fluxos
✅ Atualiza Histórico de Configurações
✅ Incrementa versão para [X.Y.Z]

[Descrição adicional se necessário]"
```

---

## 📝 Templates para Documentação

### Template: Nova Feature Backend

```markdown
## Sistema de [Nome]

[Descrição geral do sistema]

### Conceito

- **[Ponto-chave 1]**: Explicação
- **[Ponto-chave 2]**: Explicação
- **Multi-Tenant**: Como funciona isolamento

### Modelo de Dados

#### [Nome do Model]

\```prisma
model [Nome] {
  id String @id @default(uuid())
  tenant_id String
  // ... campos

  @@unique([tenant_id, ...])
  @@index([tenant_id])
}
\```

### Endpoints da API

**Base URL**: `/api/v1/[recurso]`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Criar [recurso] |
| GET | `/:id` | Buscar por ID |
| GET | `/` | Listar todos |
| PATCH | `/:id` | Atualizar |
| DELETE | `/:id` | Deletar |

### Fluxo de Uso

#### 1. [Operação Principal]

**Request**:
\```bash
POST /api/v1/[recurso]
Authorization: Bearer <token>

{
  "campo": "valor"
}
\```

**Response**:
\```json
{
  "success": true,
  "data": { ... }
}
\```

### Integração Frontend

**Arquivo**: `/apps/web/app/[caminho]/page.tsx`

\```tsx
// Código exemplo
\```

### Regras de Negócio

1. **[Regra 1]**: Descrição
2. **[Regra 2]**: Descrição
3. **[Regra 3]**: Descrição

### Arquivos Relacionados

**Backend**:
- [/apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma)
- [/apps/api/src/modules/[nome]/[nome].service.ts](...)
- [/apps/api/src/modules/[nome]/[nome].routes.ts](...)

**Frontend**:
- [/apps/web/app/[caminho]/page.tsx](...)
```

### Template: Mudança de Infraestrutura

```markdown
### [Data]

#### Migração para [Nova Tecnologia] ✅
- ✅ **[Componente] Migrado para [Novo]**
  - Migrado de [Antigo] para [Novo]
  - [Campo/Config] atualizado: [valor antigo] → [valor novo]
  - Host/URL: [novo valor]
  - Connection string: `[novo valor]`
  - Arquivos atualizados: `.env`, `.env.production`, etc.
  - IMPORTANTE: [Notas críticas de configuração]
```

### Template: Nova Integração

```markdown
### [Data]

#### Integração com [Serviço] ✅
- ✅ **[Serviço] Configurado**
  - Provider: [Nome do serviço]
  - Uso: [Para que serve]
  - API Key configurada: ✅
  - Endpoints implementados: [lista]
  - Documentação: [link]
  - IMPORTANTE: [Configurações necessárias]
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Sistema de Propostas

```markdown
## Sistema de Propostas/Lances Competitivos

O ImobiFlow possui um sistema completo de propostas competitivas...

[Documentação completa conforme template]

---

## Histórico de Configurações

### 2025-12-29

#### Sistema de Propostas/Lances Competitivos ✅
- ✅ **Sistema Completo de Propostas Implementado**
  - Database: Modelo `Proposta` com constraint única
  - Backend: Service e Routes completos
  - Endpoints: POST criar/atualizar, GET best-offer, etc.
  - Frontend: Modal com "Melhor Oferta" e "Sua Oferta"
  - Migration aplicada via `npx prisma db push`

---

**Última atualização**: 29 de dezembro de 2025
**Versão**: 1.4.0  # Foi 1.3.0, incrementou MINOR
**Status**: Em produção ✅
```

### Exemplo 2: Migração Supabase

```markdown
## Deploy e CI/CD

### Database (Supabase PostgreSQL)
- **Provider**: Supabase
- **Host (Pooler)**: aws-1-sa-east-1.pooler.supabase.com
- **Connection String**: `postgresql://...`
- **IMPORTANTE**: Usar sempre pooler

---

## Histórico de Configurações

### 2025-12-29

#### Migração para Supabase PostgreSQL ✅
- ✅ **Banco de Dados Migrado para Supabase**
  - Migrado de Render PostgreSQL para Supabase
  - DATABASE_URL atualizado para usar pooler
  - Arquivos `.env` e `.env.supabase` atualizados
```

---

## ✅ Checklist Antes de Commitar

Antes de fazer `git commit`, pergunte-se:

- [ ] Implementei algo que muda comportamento do sistema?
- [ ] Adicionei nova rota/endpoint?
- [ ] Mudei configuração de infraestrutura?
- [ ] Adicionei nova integração externa?
- [ ] Criei novo modelo/tabela no banco?

**Se respondeu SIM para qualquer pergunta:**

- [ ] Atualizei seção relevante do CLAUDE.md?
- [ ] Adicionei entry no "Histórico de Configurações"?
- [ ] Atualizei "Última atualização" e "Versão"?
- [ ] Commit separado para CLAUDE.md (`docs: atualiza...`)?

---

## 🚨 O Que Acontece Se NÃO Atualizar

### Problemas:

1. **Próximo desenvolvedor vai quebrar tudo**
   - Não saberá que algo mudou
   - Vai usar configuração antiga
   - Vai criar conflitos

2. **Você mesmo vai esquecer**
   - Daqui 1 mês não vai lembrar o que fez
   - Não vai saber por que mudou
   - Vai perder tempo re-investigando

3. **Cliente vai ficar perdido**
   - Não vai entender o sistema
   - Não vai conseguir usar features
   - Vai achar que está bugado

4. **Dívida técnica acumula**
   - Documentação fica cada vez mais desatualizada
   - Custo de atualizar depois é 10x maior
   - Eventualmente ninguém entende mais nada

---

## 💡 Dicas

### Escreva enquanto está fresco na memória
**Faça IMEDIATAMENTE após implementar**, não deixe para depois.

### Seja específico
**Não**: "Mudei o banco"
**Sim**: "Migrei de Render PostgreSQL para Supabase PostgreSQL usando connection pooler"

### Adicione exemplos
Código, comandos, requests HTTP - quanto mais específico, melhor.

### Pense em quem vai ler
Escreva como se estivesse explicando para você mesmo daqui 6 meses.

### Mantenha estrutura consistente
Siga os templates, use formatação markdown correta, seja organizado.

---

## 🎓 Responsabilidade

**VOCÊ é responsável pela documentação do código que você escreve.**

Se você implementou, você documenta. Não há "alguém depois vai fazer". **Você é o alguém.**

---

**Este agente foi criado em**: 29 de dezembro de 2025
**Versão do agente**: 1.0.0
**Status**: Ativo e obrigatório ✅
