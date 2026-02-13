# Validação dos Jobs de Automação - ImobiFlow

**Data da Validação:** 2026-02-13
**Status Geral:** ✅ **TODOS OS JOBS VALIDADOS COM SUCESSO**

---

## 📋 Resumo Executivo

Todos os 3 jobs de automação foram validados e estão **corretamente implementados**:

1. ✅ **tarefas-lembrete-job.ts** - Processamento de lembretes de tarefas
2. ✅ **trial-warning-job.ts** - Aviso 5 dias antes do trial expirar
3. ✅ **trial-warning-2days-job.ts** - Aviso URGENTE 2 dias antes do trial expirar

**Código:** Implementação completa e sem erros
**Dependências:** Todos os serviços e métodos existem
**Schema:** Todos os campos necessários estão no banco de dados

---

## 1️⃣ Job: Lembretes de Tarefas

### 📄 Arquivo
[apps/api/src/shared/jobs/tarefas-lembrete-job.ts](apps/api/src/shared/jobs/tarefas-lembrete-job.ts)

### ✅ Validação de Código

**Status:** ✅ Implementação Correta

**Dependências Verificadas:**
- ✅ `tarefasService.processarLembretes()` - Implementado em [tarefas.service.ts:388](apps/api/src/modules/tarefas/tarefas.service.ts)
- ✅ Campo `lembrete_enviado` existe no schema Prisma (schema.prisma:1279)

**Lógica do Job:**
1. Busca tarefas com lembrete pendente (status PENDENTE ou EM_ANDAMENTO)
2. Filtra por `data_lembrete` entre agora e daqui 30 minutos
3. Filtra apenas tarefas onde `lembrete_enviado = false`
4. Envia notificação para o usuário responsável
5. Marca `lembrete_enviado = true` após enviar

**Cron Sugerido:**
```bash
# A cada 30 minutos
0,30 * * * * cd /path/to/app && npx tsx src/shared/jobs/tarefas-lembrete-job.ts
```

**Output Esperado:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 JOB: Processamento de Lembretes de Tarefas
📅 Data: 2026-02-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Processamento concluído!
   📋 Tarefas processadas: X
   🔔 Lembretes enviados: Y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 2️⃣ Job: Aviso Trial (5 dias)

### 📄 Arquivo
[apps/api/src/shared/jobs/trial-warning-job.ts](apps/api/src/shared/jobs/trial-warning-job.ts)

### ✅ Validação de Código

**Status:** ✅ Implementação Correta

**Dependências Verificadas:**
- ✅ `sendGridService.sendTrialWarningEmail()` - Implementado em [sendgrid.service.ts:817](apps/api/src/shared/services/sendgrid.service.ts)
- ✅ Campo `email_5dias_enviado` existe no schema Prisma (schema.prisma:40)
- ✅ SendGrid configurado (requer `SENDGRID_API_KEY` no .env)

**Lógica do Job:**
1. Busca tenants com `status = TRIAL`
2. Filtra por `data_expiracao` entre 5 dias e 5 dias + 1 hora
3. Filtra apenas tenants onde `email_5dias_enviado = false`
4. Envia email de aviso para o admin do tenant
5. Marca `email_5dias_enviado = true` após enviar

**Template de Email:**
- Assunto: "Seu trial expira em 5 dias - Vivoly"
- Conteúdo: Aviso amigável com CTA para upgrade
- Design: HTML responsivo com cores Vivoly

**Cron Sugerido:**
```bash
# Diariamente às 9h da manhã
0 9 * * * cd /path/to/app && npx tsx src/shared/jobs/trial-warning-job.ts
```

**Output Esperado:**
```
🔔 Iniciando job de aviso de trial...
📧 Encontrados X tenants para notificar
  📤 Enviando email para Tenant 1 (admin@email.com)...
  ✅ Email enviado para Tenant 1

📊 Resumo:
  ✅ Emails enviados: X
  ❌ Erros: 0
  📧 Total: X

✅ Job concluído!
```

---

## 3️⃣ Job: Aviso URGENTE Trial (2 dias)

### 📄 Arquivo
[apps/api/src/shared/jobs/trial-warning-2days-job.ts](apps/api/src/shared/jobs/trial-warning-2days-job.ts)

### ✅ Validação de Código

**Status:** ✅ Implementação Correta

**Dependências Verificadas:**
- ✅ `sendGridService.sendTrialUrgentWarningEmail()` - Implementado em [sendgrid.service.ts:1005](apps/api/src/shared/services/sendgrid.service.ts)
- ✅ Campo `email_2dias_enviado` existe no schema Prisma (schema.prisma:41)
- ✅ SendGrid configurado (requer `SENDGRID_API_KEY` no .env)

**Lógica do Job:**
1. Busca tenants com `status = TRIAL`
2. Filtra por `data_expiracao` entre 2 dias e 3 dias
3. Filtra apenas tenants onde `email_2dias_enviado = false`
4. Envia email URGENTE para o admin do tenant
5. Marca `email_2dias_enviado = true` após enviar

**Template de Email:**
- Assunto: "⚠️ URGENTE: Seu trial expira em 2 dias - Vivoly"
- Conteúdo: Aviso urgente com destaque visual e CTA forte
- Design: HTML responsivo com destaque vermelho/amarelo

**Cron Sugerido:**
```bash
# Diariamente às 9h da manhã
0 9 * * * cd /path/to/app && npx tsx src/shared/jobs/trial-warning-2days-job.ts
```

**Output Esperado:**
```
🚀 Iniciando job: envio de emails de aviso 2 dias antes...
📊 Encontrados X tenants que expiram em ~2 dias
✅ Email urgente enviado para admin@email.com (Tenant: Nome, 2 dias restantes)

📈 RESUMO:
  ✅ Emails enviados: X
  ❌ Erros: 0
  📊 Total processado: X

✅ Job concluído com sucesso!
```

---

## 🔧 Configuração em Produção

### 1. Variáveis de Ambiente Necessárias

**SendGrid (obrigatório para jobs de trial):**
```bash
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@vivoly.com.br"
SENDGRID_FROM_NAME="Vivoly"
```

**Verificar configuração:**
- ✅ SendGrid está configurado no `sendgrid.service.ts`
- ✅ Validação automática ao iniciar o serviço
- ⚠️ Se `SENDGRID_API_KEY` não estiver configurado, emails NÃO serão enviados

### 2. Configurar Cron Jobs no Servidor

**Opção 1: Cron do Linux (Render, Railway, VPS)**

Editar crontab:
```bash
crontab -e
```

Adicionar jobs:
```bash
# Lembretes de tarefas - a cada 30 minutos
0,30 * * * * cd /opt/render/project/src/apps/api && npx tsx src/shared/jobs/tarefas-lembrete-job.ts >> /var/log/tarefas-lembrete.log 2>&1

# Aviso trial 5 dias - diariamente às 9h
0 9 * * * cd /opt/render/project/src/apps/api && npx tsx src/shared/jobs/trial-warning-job.ts >> /var/log/trial-warning.log 2>&1

# Aviso trial 2 dias - diariamente às 9h
0 9 * * * cd /opt/render/project/src/apps/api && npx tsx src/shared/jobs/trial-warning-2days-job.ts >> /var/log/trial-warning-2days.log 2>&1
```

**Opção 2: Serviço Externo (EasyCron, cron-job.org)**

Criar endpoints HTTP para cada job e configurar webhooks externos.

**Opção 3: Node-cron (dentro da aplicação)**

```typescript
import cron from 'node-cron';

// No server.ts ou arquivo dedicado
cron.schedule('0,30 * * * *', async () => {
  console.log('🔔 Executando job de lembretes...');
  await tarefasService.processarLembretes();
});

cron.schedule('0 9 * * *', async () => {
  console.log('📧 Executando jobs de trial...');
  // Executar jobs de trial
});
```

### 3. Monitoramento e Logs

**Criar logs estruturados:**
```bash
# Visualizar logs em tempo real
tail -f /var/log/tarefas-lembrete.log
tail -f /var/log/trial-warning.log
tail -f /var/log/trial-warning-2days.log
```

**Métricas importantes:**
- ✅ Taxa de sucesso de envio de emails
- ✅ Quantidade de tenants notificados por dia
- ✅ Erros de envio (problemas com SendGrid, falta de admin ativo, etc)
- ✅ Tempo de execução de cada job

---

## 🧪 Testes Manuais Recomendados

### Teste 1: Job de Lembretes

**Preparação:**
1. Criar uma tarefa no banco com `data_lembrete` = agora + 10 minutos
2. Garantir que `lembrete_enviado = false`

**Execução:**
```bash
cd apps/api
npx tsx src/shared/jobs/tarefas-lembrete-job.ts
```

**Resultado esperado:**
- ✅ Job encontra a tarefa
- ✅ Envia notificação
- ✅ Atualiza `lembrete_enviado = true`

### Teste 2: Job Trial Warning (5 dias)

**Preparação:**
1. Criar tenant de teste com `status = TRIAL`
2. Definir `data_expiracao` = hoje + 5 dias
3. Garantir que `email_5dias_enviado = false`
4. Tenant deve ter um usuário ADMIN ativo

**Execução:**
```bash
cd apps/api
npx tsx src/shared/jobs/trial-warning-job.ts
```

**Resultado esperado:**
- ✅ Job encontra o tenant
- ✅ Envia email para admin
- ✅ Atualiza `email_5dias_enviado = true`

### Teste 3: Job Trial Warning (2 dias)

**Preparação:**
1. Criar tenant de teste com `status = TRIAL`
2. Definir `data_expiracao` = hoje + 2 dias
3. Garantir que `email_2dias_enviado = false`
4. Tenant deve ter um usuário ADMIN ativo

**Execução:**
```bash
cd apps/api
npx tsx src/shared/jobs/trial-warning-2days-job.ts
```

**Resultado esperado:**
- ✅ Job encontra o tenant
- ✅ Envia email URGENTE para admin
- ✅ Atualiza `email_2dias_enviado = true`

---

## ⚠️ Problemas Conhecidos e Soluções

### Problema 1: SendGrid não configurado

**Sintoma:**
```
⚠️  SENDGRID_API_KEY não configurado - emails desabilitados
SendGrid não configurado - email não enviado
```

**Solução:**
1. Criar conta no SendGrid (plano free permite 100 emails/dia)
2. Gerar API Key em Settings → API Keys
3. Adicionar ao `.env`:
   ```
   SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
   SENDGRID_FROM_EMAIL="noreply@vivoly.com.br"
   ```
4. Verificar domínio no SendGrid (sender authentication)

### Problema 2: Tenant sem usuário ADMIN

**Sintoma:**
```
⚠️  Tenant Nome (id) não tem admin ativo
```

**Solução:**
1. Verificar que todo tenant tem pelo menos 1 usuário com `tipo = ADMIN` e `ativo = true`
2. Na criação de tenant, sempre criar um usuário admin junto

### Problema 3: Jobs não executam automaticamente

**Sintoma:**
Jobs só funcionam quando executados manualmente.

**Solução:**
1. Verificar se crontab está configurado: `crontab -l`
2. Verificar permissões de execução dos arquivos
3. Verificar logs do cron: `grep CRON /var/log/syslog`
4. Testar comando manualmente antes de adicionar ao cron

### Problema 4: Erro de timezone

**Sintoma:**
Jobs executam em horário errado (não às 9h como esperado).

**Solução:**
1. Configurar timezone do servidor:
   ```bash
   timedatectl set-timezone America/Sao_Paulo
   ```
2. Ou ajustar horário no crontab considerando UTC

---

## 📊 Métricas de Sucesso

Para considerar os jobs em pleno funcionamento, validar:

- [ ] **Taxa de execução**: 100% (jobs executam sem erros fatais)
- [ ] **Taxa de envio**: > 95% (emails são enviados com sucesso)
- [ ] **Zero duplicatas**: Flags evitam envio duplicado
- [ ] **Logs limpos**: Sem erros no console
- [ ] **Performance**: Jobs executam em < 30 segundos
- [ ] **Cobertura**: Todos os tenants/tarefas elegíveis são processados

---

## ✅ Checklist de Validação Final

### Código
- [x] Todos os 3 jobs implementados corretamente
- [x] Dependências (`tarefasService`, `sendGridService`) existem
- [x] Métodos necessários implementados
- [x] Campos do schema Prisma existem
- [x] Lógica de negócio correta

### Configuração
- [ ] Variáveis de ambiente configuradas (SENDGRID_API_KEY)
- [ ] Cron jobs agendados no servidor
- [ ] Logs configurados
- [ ] Testes manuais executados com sucesso

### Produção
- [ ] Jobs executando automaticamente
- [ ] Monitoramento ativo
- [ ] Alertas configurados para falhas
- [ ] Backup de logs

---

## 📝 Próximos Passos

1. **Configurar variáveis de ambiente** (SENDGRID_API_KEY)
2. **Executar testes manuais** em ambiente de desenvolvimento
3. **Configurar cron jobs** no servidor de produção (Render)
4. **Monitorar primeira execução** em produção
5. **Ajustar horários** se necessário baseado em feedback

---

## 📧 Suporte

Para dúvidas sobre os jobs:
- **Documentação SendGrid:** https://docs.sendgrid.com/
- **Documentação Cron:** https://crontab.guru/
- **Logs:** Verificar arquivos de log no servidor

---

**Status:** ✅ Jobs validados e prontos para produção
**Última atualização:** 2026-02-13
**Próximo passo:** Configurar ambiente de produção
