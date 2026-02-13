# Sistema de Automações do ImobiFlow

## Visão Geral

O ImobiFlow possui um sistema robusto de automações que executam tarefas periódicas para manter o pipeline de vendas otimizado. As automações são divididas em **jobs separados** para melhor organização e controle.

---

## Jobs de Automação

### 1. `automacoes-job.ts` (Execução: A cada hora)

**Cron sugerido:** `0 * * * *` (todo início de hora)

Agrupa automações que precisam de **verificação frequente**:

#### Automações incluídas:

1. **Follow-up automático (3 dias)**
   - Detecta leads QUENTE/MORNO sem resposta há 3 dias
   - Envia WhatsApp automático de reengajamento
   - Registra interação no histórico

2. **Lembrete de visita (24h antes)**
   - Detecta agendamentos confirmados para amanhã
   - Envia WhatsApp para o lead
   - Envia Telegram para o corretor
   - Marca flag `lembrete_24h_enviado`

3. **Lead abandonado (7 dias)**
   - Detecta leads sem resposta há 7+ dias
   - Marca automaticamente como FRIO
   - Notifica corretor via Telegram

4. **Atribuição inteligente por área**
   - Detecta leads sem corretor atribuído
   - Busca corretor com especialização no bairro
   - Atribui automaticamente por performance_score
   - Notifica corretor via Telegram

**Comando manual:**
```bash
cd apps/api
npx tsx src/shared/jobs/automacoes-job.ts
```

**Configuração cron:**
```bash
0 * * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/automacoes-job.ts >> /var/log/automacoes.log 2>&1
```

---

### 2. `temperatura-auto-job.ts` (Execução: Uma vez por dia)

**Cron sugerido:** `0 8 * * *` (8:00 AM todo dia)

Job **separado e especializado** para atualização de temperatura de leads.

#### Por que um job separado?

- ✅ **Campo específico**: Usa `last_interaction_at` (não `updated_at`)
- ✅ **Auditoria completa**: Registra mudanças na timeline do lead
- ✅ **Estatísticas**: Método `getEstatisticas()` para métricas
- ✅ **Notificações formatadas**: HTML com melhor visual no Telegram
- ✅ **Logging detalhado**: Por tenant com resumo consolidado
- ✅ **Evita duplicação**: Não conflita com outras automações

#### Regras de temperatura:

```
QUENTE → [5 dias sem contato] → MORNO
MORNO  → [10 dias sem contato] → FRIO
```

**Comando manual:**
```bash
cd apps/api
npx tsx src/shared/jobs/temperatura-auto-job.ts
```

**Configuração cron:**
```bash
0 8 * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/temperatura-auto-job.ts >> /var/log/temperatura.log 2>&1
```

**Exemplo de notificação Telegram:**
```
⚠️ ALERTA: Lead Esfriando!

👤 Cliente: João Silva
📱 Telefone: +5511999999999

🌡️ Temperatura: 🔥 QUENTE → ⚡ MORNO

⏰ Motivo: Sem contato há 5 dias

━━━━━━━━━━━━━━━━━━━━

💡 Dica da Sofia: Entre em contato o quanto antes!

🤖 Mensagem automática - ImobiFlow
```

---

### 3. `tarefas-lembrete-job.ts` (Execução: Frequente)

**Cron sugerido:** `*/15 * * * *` (a cada 15 minutos)

Envia lembretes de tarefas pendentes para corretores.

**Comando manual:**
```bash
cd apps/api
npx tsx src/shared/jobs/tarefas-lembrete-job.ts
```

---

### 4. `trial-warning-job.ts` (Execução: Diária)

**Cron sugerido:** `0 9 * * *` (9:00 AM todo dia)

Envia email de aviso **5 dias antes** do trial expirar.

**Comando manual:**
```bash
cd apps/api
npx tsx src/shared/jobs/trial-warning-job.ts
```

---

### 5. `trial-warning-2days-job.ts` (Execução: Diária)

**Cron sugerido:** `0 9 * * *` (9:00 AM todo dia)

Envia email de aviso **2 dias antes** do trial expirar (último aviso).

**Comando manual:**
```bash
cd apps/api
npx tsx src/shared/jobs/trial-warning-2days-job.ts
```

---

## Configuração no Servidor

### Opção 1: Crontab Linux

Editar crontab:
```bash
crontab -e
```

Adicionar todas as automações:
```bash
# ImobiFlow - Automações a cada hora
0 * * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/automacoes-job.ts >> /var/log/automacoes.log 2>&1

# ImobiFlow - Temperatura diária (8:00 AM)
0 8 * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/temperatura-auto-job.ts >> /var/log/temperatura.log 2>&1

# ImobiFlow - Lembretes de tarefas (a cada 15 min)
*/15 * * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/tarefas-lembrete-job.ts >> /var/log/tarefas.log 2>&1

# ImobiFlow - Avisos de trial (9:00 AM)
0 9 * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/trial-warning-job.ts >> /var/log/trial-5d.log 2>&1
0 9 * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/trial-warning-2days-job.ts >> /var/log/trial-2d.log 2>&1
```

### Opção 2: node-cron (Interno)

Criar arquivo `src/shared/jobs/scheduler.ts`:
```typescript
import cron from 'node-cron';

// A cada hora
cron.schedule('0 * * * *', async () => {
  console.log('Executando automações...');
  await import('./automacoes-job');
});

// Diariamente às 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Executando atualização de temperatura...');
  await import('./temperatura-auto-job');
});
```

### Opção 3: Serviços Externos

- **EasyCron**: https://www.easycron.com/
- **cron-job.org**: https://cron-job.org/
- **AWS EventBridge**: Ideal para produção em AWS

---

## Monitoramento

### Logs

Cada job registra execução em arquivos separados:
```
/var/log/
├── automacoes.log       # Automações horárias
├── temperatura.log      # Temperatura diária
├── tarefas.log          # Lembretes de tarefas
├── trial-5d.log         # Avisos 5 dias
└── trial-2d.log         # Avisos 2 dias
```

### Exit Codes

- `0`: Sucesso (cron não alertará)
- `1`: Falha (cron enviará email de erro)

### Alertas de Falha

Configurar email de falha no crontab:
```bash
MAILTO=devops@vivoly.com.br

0 * * * * cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/automacoes-job.ts
```

---

## Testes

### Teste individual de cada job:

```bash
# Automações
cd apps/api && npx tsx src/shared/jobs/automacoes-job.ts

# Temperatura
cd apps/api && npx tsx src/shared/jobs/temperatura-auto-job.ts

# Tarefas
cd apps/api && npx tsx src/shared/jobs/tarefas-lembrete-job.ts

# Trial (5 dias)
cd apps/api && npx tsx src/shared/jobs/trial-warning-job.ts

# Trial (2 dias)
cd apps/api && npx tsx src/shared/jobs/trial-warning-2days-job.ts
```

### Validar cron syntax:

```bash
# Instalar cron-validator
npm install -g cron-validator

# Validar expressão
cron-validator "0 * * * *"
```

---

## Troubleshooting

### Job não está executando

1. **Verificar crontab:**
   ```bash
   crontab -l
   ```

2. **Verificar logs do cron:**
   ```bash
   grep CRON /var/log/syslog
   ```

3. **Testar manualmente:**
   ```bash
   cd /var/www/imobiflow/apps/api && npx tsx src/shared/jobs/automacoes-job.ts
   ```

### Notificações não chegam

1. **Verificar variáveis de ambiente:**
   ```bash
   # Telegram
   echo $TELEGRAM_BOT_TOKEN

   # Twilio WhatsApp
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   ```

2. **Verificar WhatsAppConfig no banco:**
   ```sql
   SELECT tenant_id, is_active, twilio_phone_number
   FROM whatsapp_configs
   WHERE is_active = true;
   ```

---

## Performance

### Métricas esperadas:

| Job | Tenants | Leads/tenant | Tempo médio | Notificações |
|-----|---------|--------------|-------------|--------------|
| automacoes-job | 50 | 500 | ~2 min | ~10-20 |
| temperatura-auto | 50 | 500 | ~5 min | ~5-10 |
| tarefas-lembrete | 50 | 100 tarefas | ~30 seg | ~5-10 |
| trial-warning | 50 | - | ~10 seg | 0-5 |

### Otimizações futuras:

- [ ] Processar tenants em paralelo (com concurrency limit)
- [ ] Queue para notificações (Bull/BullMQ)
- [ ] Cache de configurações de WhatsApp
- [ ] Batch updates no banco de dados

---

## Histórico de Mudanças

### 2025-02-13
- **BREAKING**: Removida Automação #2 (Temperatura) do `automacoes-job.ts`
- **MOTIVO**: Duplicação com `temperatura-auto-job.ts`
- **IMPACTO**: Usar `temperatura-auto-job.ts` separadamente (execução diária)
- **MIGRAÇÃO**: Adicionar `temperatura-auto-job.ts` ao cron diário

---

## Contato

Para dúvidas sobre automações, contate o time de desenvolvimento:
- Email: dev@vivoly.com.br
- Slack: #imobiflow-dev
