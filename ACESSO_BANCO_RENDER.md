# 🔌 Como Acessar o Banco de Dados no Render

**Problema Atual**: O hostname `dpg-d4kgd33e5dus73f7b480-a` é um hostname **interno** do Render, acessível apenas de dentro da rede do Render.

---

## 🚨 Por Que Não Conseguimos Acessar?

A URL atual no `.env`:
```
DATABASE_URL="postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow"
```

**Problema**: `dpg-d4kgd33e5dus73f7b480-a` é um hostname **privado/interno** que só funciona dentro da infraestrutura do Render.

**Erro obtido**:
```
Error: P1001: Can't reach database server at `dpg-d4kgd33e5dus73f7b480-a:5432`
```

---

## ✅ Solução: Obter a URL Externa

### Opção 1: Via Dashboard do Render (Recomendado)

1. **Acessar o Dashboard do Render**
   - Ir para https://dashboard.render.com
   - Login com suas credenciais

2. **Navegar para o PostgreSQL Database**
   - No menu lateral, clicar em **"PostgreSQL"**
   - Selecionar o banco **"imobiflow"** (ou o nome que você deu)

3. **Obter a Connection String Externa**
   - Na página do banco, procurar por **"Connections"** ou **"External Connection"**
   - Copiar a **"External Database URL"**

   **Formato esperado**:
   ```
   postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a.oregon-postgres.render.com:5432/imobiflow
   ```

   **Note a diferença**:
   - ❌ Interno: `dpg-d4kgd33e5dus73f7b480-a` (não funciona de fora)
   - ✅ Externo: `dpg-d4kgd33e5dus73f7b480-a.oregon-postgres.render.com` (funciona de qualquer lugar)

4. **Atualizar o `.env`**
   ```bash
   # Em /home/hans/imobiflow/apps/api/.env
   DATABASE_URL="postgresql://usuario:senha@dpg-xxx.oregon-postgres.render.com:5432/imobiflow"
   ```

### Opção 2: Via Render CLI

```bash
# Instalar Render CLI (se não tiver)
npm install -g @renderinc/cli

# Fazer login
render login

# Listar databases
render databases list

# Obter informações do banco específico
render database get imobiflow
```

### Opção 3: Testar Conexão Direta

Se você tiver a URL externa correta, teste com:

```bash
# Testar conexão com psql
psql "postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a.oregon-postgres.render.com:5432/imobiflow"

# Ou com Prisma
DATABASE_URL="postgresql://imobiflow:senha@dpg-xxx.oregon-postgres.render.com:5432/imobiflow" npx prisma migrate status
```

---

## 🔒 Considerações de Segurança no Render

### 1. Verificar se Conexões Externas Estão Habilitadas

Por padrão, os bancos PostgreSQL no Render **permitem** conexões externas, mas é bom verificar:

1. Dashboard do Render → PostgreSQL → Seu Banco
2. Verificar se há uma opção **"Allow External Connections"** ou similar
3. Se estiver desabilitada, habilitar

### 2. Whitelist de IPs (Se Configurado)

Alguns planos do Render permitem restringir acesso por IP. Verifique se:
- Não há whitelist configurada, OU
- Seu IP está na whitelist

**Como verificar**:
- Dashboard → PostgreSQL → Security Settings
- Procurar por "IP Whitelist" ou "Allowed IPs"

### 3. Verificar Firewall Local

Certifique-se de que sua rede/firewall local não está bloqueando conexões na porta **5432**:

```bash
# Testar conectividade na porta 5432
nc -zv dpg-d4kgd33e5dus73f7b480-a.oregon-postgres.render.com 5432

# Ou com telnet
telnet dpg-d4kgd33e5dus73f7b480-a.oregon-postgres.render.com 5432
```

---

## 📋 Checklist para Resolver o Problema

- [ ] **1. Obter URL Externa do Render**
  - Acessar dashboard.render.com
  - Copiar "External Database URL"

- [ ] **2. Atualizar `.env`**
  ```bash
  cd /home/hans/imobiflow/apps/api
  # Editar .env com a URL externa correta
  ```

- [ ] **3. Verificar Conexões Externas**
  - Confirmar que "Allow External Connections" está habilitado

- [ ] **4. Testar Conectividade**
  ```bash
  DATABASE_URL="<url-externa>" npx prisma migrate status
  ```

- [ ] **5. Aplicar Migration**
  ```bash
  DATABASE_URL="<url-externa>" npx prisma migrate deploy
  ```

- [ ] **6. Executar Testes**
  ```bash
  DATABASE_URL="<url-externa>" npx tsx scripts/test-tenant-isolation.ts
  ```

---

## 🎯 Próximos Passos Após Obter Acesso

Uma vez que você tenha a URL externa correta e consiga conectar:

### 1. Aplicar Migration
```bash
cd /home/hans/imobiflow/apps/api
DATABASE_URL="<url-externa>" npx prisma migrate deploy
```

### 2. Verificar Tenant Padrão
```bash
DATABASE_URL="<url-externa>" npx prisma studio
# Confirmar que existe tenant com id 'default-tenant-id'
```

### 3. Executar Testes
```bash
DATABASE_URL="<url-externa>" npx tsx scripts/test-tenant-isolation.ts
```

### 4. Atualizar Variáveis de Ambiente no Render

Não esqueça de atualizar a variável de ambiente **no próprio Render**:

1. Dashboard → Seu Web Service → Environment
2. Editar `DATABASE_URL` para usar a URL **interna** (mais rápida de dentro do Render)
3. Apenas localmente você usa a URL externa

**Render Web Service** (interno - mais rápido):
```
DATABASE_URL=postgresql://user:pass@dpg-xxx/db
```

**Desenvolvimento Local** (externo - necessário):
```
DATABASE_URL=postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/db
```

---

## 🆘 Troubleshooting

### Erro: "Connection timeout"
**Causa**: Firewall ou IP bloqueado
**Solução**:
- Verificar whitelist de IPs no Render
- Testar de outra rede (celular, outro Wi-Fi)

### Erro: "Authentication failed"
**Causa**: Senha incorreta
**Solução**:
- Copiar novamente a senha do dashboard do Render
- Verificar se há caracteres especiais que precisam de escape

### Erro: "Database does not exist"
**Causa**: Nome do banco incorreto
**Solução**:
- Verificar o nome exato do banco no dashboard
- Geralmente é o mesmo do slug do projeto

### Erro: "SSL required"
**Causa**: Render requer SSL para conexões externas
**Solução**:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

## 📞 Suporte

Se após seguir todos os passos você ainda não conseguir conectar:

1. **Verificar Status do Render**: https://status.render.com
2. **Documentação Oficial**: https://render.com/docs/databases
3. **Suporte do Render**: https://render.com/support

---

**Criado em**: 03/12/2025
**Última atualização**: 03/12/2025
**Status**: Aguardando URL externa do Render
