# 📋 Alterações Necessárias no Schema para Sistema de IA

## Situação Atual vs Necessária

### ❌ O que NÃO existe no schema atual:
1. **Modelo `Message`** - Para armazenar conversas WhatsApp/Telegram
2. **Campos de IA no modelo `Lead`** - Para preferências e análise da IA
3. **Relacionamento Lead ↔ Message**

### ✅ O que JÁ existe e pode ser usado:
- `Lead.telefone` - para identificar o lead
- `Lead.nome` - nome do lead
- `Lead.score` - score do lead (já existe!)
- `Lead.temperatura` - pode mapear para urgência
- `Lead.origem` - já tem `WHATSAPP` como opção
- `Lead.timeline` - pode armazenar histórico de interações

---

## 🔧 Alterações Necessárias

### 1. Adicionar Modelo `Message` (NOVO)

Adicione este modelo **depois do modelo `Lead`** (após linha 270):

```prisma
// ============================================
// MENSAGENS (Sistema IA)
// ============================================

model Message {
  id              String        @id @default(uuid())

  // Multi-tenant
  tenant_id       String

  // Lead relacionado
  lead_id         String
  lead            Lead          @relation(fields: [lead_id], references: [id], onDelete: Cascade)

  // Conteúdo
  content         String        @db.Text
  is_from_lead    Boolean       // true = lead enviou, false = IA respondeu

  // Plataforma
  platform        Platform      @default(WHATSAPP)

  // Status de entrega
  status          MessageStatus @default(SENT)

  // Análise IA (opcional)
  ai_analysis     Json?         // Armazena análise completa da IA
  ai_score_impact Int?          // Impacto no score (-10 a +10)

  // Timestamps
  created_at      DateTime      @default(now())
  delivered_at    DateTime?
  read_at         DateTime?

  @@map("messages")
  @@index([tenant_id])
  @@index([lead_id])
  @@index([created_at])
  @@index([platform])
}

enum Platform {
  WHATSAPP
  TELEGRAM
  WEBCHAT
  SMS
  EMAIL
}

enum MessageStatus {
  PENDING   // Aguardando envio
  SENT      // Enviada
  DELIVERED // Entregue
  READ      // Lida
  FAILED    // Falhou
}
```

### 2. Atualizar Modelo `Lead` (ADICIONAR CAMPOS)

No modelo `Lead` existente (linha 227-270), adicione estes campos **ANTES de `// Timestamps`**:

```prisma
model Lead {
  id                String      @id @default(uuid())

  // ... todos os campos existentes ...

  // ==========================================
  // CAMPOS PARA SISTEMA DE IA (ADICIONAR)
  // ==========================================

  // Preferências do lead identificadas pela IA
  property_type     String?       // tipo de imóvel (apartamento, casa, etc)
  location          String?       // localização desejada
  bedrooms          Int?          // número de quartos desejado
  budget            Decimal?      @db.Decimal(10, 2) // orçamento máximo

  // Análise comportamental da IA
  urgency           UrgencyLevel? // nível de urgência
  sentiment         Sentiment?    // sentimento nas interações
  intent            Intent?       // última intenção detectada

  // Controle IA
  ai_enabled        Boolean       @default(true)  // IA habilitada para este lead?
  escalated_to_broker Boolean     @default(false) // Escalado para corretor?
  escalation_reason String?       @db.Text        // Por que foi escalado?

  // Timestamps
  created_at        DateTime    @default(now())
  updated_at        DateTime    @updatedAt
  ultimo_contato    DateTime?

  // Relacionamentos
  negociacoes       Negociacao[]
  messages          Message[]     // ← ADICIONAR ESTA LINHA

  // ... resto permanece igual ...
}

// Adicionar estes enums no FINAL do arquivo (após linha 594)

enum UrgencyLevel {
  BAIXA
  MEDIA
  ALTA
}

enum Sentiment {
  POSITIVO
  NEUTRO
  NEGATIVO
}

enum Intent {
  INFORMACAO      // Apenas buscando informações
  AGENDAMENTO     // Quer agendar visita
  NEGOCIACAO      // Quer negociar/fazer proposta
  RECLAMACAO      // Está reclamando
  OUTRO           // Outros
}
```

### 3. Atualizar Relacionamento `Tenant` (ADICIONAR)

No modelo `Tenant` (linha 54-63), adicione esta linha no final da seção de relacionamentos:

```prisma
model Tenant {
  // ... campos existentes ...

  // Relacionamentos
  users               User[]
  corretores          Corretor[]
  leads               Lead[]
  proprietarios       Proprietario[]
  imoveis             Imovel[]
  negociacoes         Negociacao[]
  integracoes         Integracao[]
  automacoes          Automacao[]
  assinaturas         Assinatura[]
  messages            Message[]     // ← ADICIONAR ESTA LINHA

  @@map("tenants")
  // ... resto permanece igual ...
}
```

---

## 📝 Resumo das Mudanças

### Novos Modelos:
- ✅ `Message` - Armazena todas as conversas

### Novos Enums:
- ✅ `Platform` - WhatsApp, Telegram, WebChat, etc
- ✅ `MessageStatus` - Status de entrega das mensagens
- ✅ `UrgencyLevel` - Baixa, Média, Alta
- ✅ `Sentiment` - Positivo, Neutro, Negativo
- ✅ `Intent` - Informação, Agendamento, Negociação, etc

### Campos Adicionados ao Lead:
- ✅ `property_type` - Tipo de imóvel desejado
- ✅ `location` - Localização desejada
- ✅ `bedrooms` - Número de quartos
- ✅ `budget` - Orçamento máximo
- ✅ `urgency` - Nível de urgência
- ✅ `sentiment` - Sentimento geral
- ✅ `intent` - Última intenção detectada
- ✅ `ai_enabled` - Se IA está ativa
- ✅ `escalated_to_broker` - Se foi escalado
- ✅ `escalation_reason` - Motivo do escalonamento
- ✅ `messages` - Relação com mensagens

### Relacionamentos Adicionados:
- ✅ `Lead.messages` → `Message[]`
- ✅ `Message.lead` → `Lead`
- ✅ `Tenant.messages` → `Message[]`

---

## 🚀 Como Aplicar as Mudanças

### Passo 1: Editar o arquivo schema.prisma

Adicione todas as mudanças acima no arquivo:
```
/home/hans/imobiflow/apps/api/prisma/schema.prisma
```

### Passo 2: Criar a Migration

```bash
cd apps/api

# Criar migration
npx prisma migrate dev --name add_ai_messaging_system

# Isso vai:
# 1. Criar a tabela 'messages'
# 2. Adicionar os novos campos na tabela 'leads'
# 3. Criar os novos enums
# 4. Criar os índices necessários
```

### Passo 3: Regenerar o Prisma Client

```bash
npx prisma generate
```

### Passo 4: Verificar no Banco

```bash
npx prisma studio
# Abra no navegador e verifique:
# - Tabela 'messages' existe?
# - Tabela 'leads' tem os novos campos?
```

---

## ⚠️ Observações Importantes

### 1. **Compatibilidade com Dados Existentes**
- Todos os novos campos são **opcionais** (`?`)
- Leads existentes não serão afetados
- Migration é **não-destrutiva**

### 2. **Multi-Tenancy**
- O modelo `Message` inclui `tenant_id`
- Todos os índices necessários estão incluídos
- Segue o mesmo padrão dos outros modelos

### 3. **Performance**
- Índices criados em:
  - `messages.lead_id` (buscar mensagens de um lead)
  - `messages.created_at` (ordenação temporal)
  - `messages.platform` (filtrar por plataforma)
  - `messages.tenant_id` (isolamento por tenant)

### 4. **Enums vs Strings**
- Usei **enums** para campos com valores fixos
- Garante consistência dos dados
- Facilita queries no Prisma

### 5. **JSON Fields**
- `Message.ai_analysis` armazena análise completa em JSON
- Permite flexibilidade sem criar muitos campos
- Exemplo de estrutura:
  ```json
  {
    "urgency": "alta",
    "intent": "agendamento",
    "sentiment": "positivo",
    "preferences": {
      "property_type": "apartamento",
      "bedrooms": 3,
      "budget_max": 800000
    },
    "tags": ["urgente", "apartamento"],
    "score_impact": 8
  }
  ```

---

## 🔄 Mapeamento: Schema Atual → Sistema IA

| Campo Existente | Uso no Sistema IA |
|----------------|-------------------|
| `Lead.telefone` | Identificador único para WhatsApp |
| `Lead.nome` | Nome do lead nas conversas |
| `Lead.score` | Score atualizado pela IA |
| `Lead.temperatura` | Pode ser mapeado para urgência |
| `Lead.origem` | Valor `WHATSAPP` para leads da IA |
| `Lead.timeline` | Pode registrar eventos da IA |
| `Lead.interesse` | Pode armazenar preferências estruturadas |

---

## ✅ Após Aplicar as Mudanças

Você poderá:

1. ✅ Salvar todas as mensagens WhatsApp/Telegram
2. ✅ Armazenar análises da IA por mensagem
3. ✅ Rastrear histórico completo de conversas
4. ✅ Filtrar leads por urgência, sentimento, intenção
5. ✅ Identificar quais leads foram escalados e por quê
6. ✅ Desabilitar IA para leads específicos se necessário
7. ✅ Manter tudo isolado por tenant (multi-tenancy)

---

## 📊 Exemplo de Uso Após Migration

```typescript
// Criar uma mensagem
const message = await prisma.message.create({
  data: {
    tenant_id: "xxx",
    lead_id: "yyy",
    content: "Olá, procuro apartamento de 3 quartos",
    is_from_lead: true,
    platform: "WHATSAPP",
    status: "DELIVERED",
    ai_analysis: {
      urgency: "alta",
      intent: "informacao",
      sentiment: "positivo",
      preferences: {
        property_type: "apartamento",
        bedrooms: 3
      }
    },
    ai_score_impact: 5
  }
});

// Atualizar lead com análise
await prisma.lead.update({
  where: { id: "yyy" },
  data: {
    property_type: "apartamento",
    bedrooms: 3,
    urgency: "ALTA",
    sentiment: "POSITIVO",
    intent: "INFORMACAO",
    score: { increment: 5 }
  }
});

// Buscar conversas de um lead
const conversations = await prisma.message.findMany({
  where: {
    lead_id: "yyy",
    tenant_id: "xxx"
  },
  orderBy: { created_at: 'asc' }
});
```

---

**Criado em:** 18/12/2025
**Versão:** 1.0
**Status:** Pronto para aplicação
