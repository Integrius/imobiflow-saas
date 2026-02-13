# Configuração de Build no Render

## ⚠️ AÇÃO NECESSÁRIA: Atualizar Comando de Build

O deploy está falhando porque o `pnpm-lock.yaml` precisa ser atualizado, mas o Render usa `frozen-lockfile` por padrão.

---

## 🔧 Como Resolver

### Opção 1: Atualizar Comando de Build no Render (RECOMENDADO)

**1. Acesse o Dashboard do Render:**
   - https://dashboard.render.com/
   - Selecione o serviço do ImobiFlow

**2. Vá em Settings → Build & Deploy**

**3. Altere o "Build Command" de:**
   ```bash
   pnpm install && pnpm run build
   ```

   **Para:**
   ```bash
   pnpm install --no-frozen-lockfile && pnpm run build
   ```

**4. Clique em "Save Changes"**

**5. Faça um novo deploy manual:**
   - Clique em "Manual Deploy" → "Deploy latest commit"

---

### Opção 2: Usar Script de Build (ALTERNATIVA)

Se preferir usar um script customizado:

**1. No Render Dashboard, altere "Build Command" para:**
   ```bash
   bash build.sh
   ```

**2. O arquivo `build.sh` já está no repositório e faz:**
   - Instala dependências com `--no-frozen-lockfile`
   - Executa o build normalmente

---

## 📋 Por que isso é necessário?

### Problema

Adicionamos `@fastify/cookie` ao `package.json`, mas o `pnpm-lock.yaml` não foi atualizado localmente (pnpm não está instalado no ambiente de desenvolvimento).

### Comportamento do Render

Por padrão, em ambientes CI/CD, o pnpm usa `frozen-lockfile=true`, que impede mudanças no lockfile.

### Erro atual:
```
ERR_PNPM_OUTDATED_LOCKFILE: Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with package.json

Failure reason:
* 1 dependencies were added: @fastify/cookie@^12.1.0
```

### Solução

Usar `--no-frozen-lockfile` permite que o pnpm atualize o lockfile automaticamente durante o deploy.

---

## ✅ Após o Deploy Bem-Sucedido

**IMPORTANTE:** Após o primeiro deploy bem-sucedido com `--no-frozen-lockfile`:

1. O Render terá gerado um `pnpm-lock.yaml` atualizado
2. Você pode (opcionalmente) reverter o comando de build para:
   ```bash
   pnpm install && pnpm run build
   ```
3. E commitar o lockfile atualizado para evitar esse problema no futuro

---

## 🔄 Solução Permanente (Para Evitar Futuras Ocorrências)

### Instalar pnpm localmente no ambiente de desenvolvimento:

```bash
# Instalar pnpm globalmente
npm install -g pnpm@10.22.0

# Ou usar via npx
npx pnpm@10.22.0 install
```

### Sempre que adicionar/remover dependências:

```bash
# Ao invés de editar package.json manualmente
pnpm add @fastify/cookie

# Ao invés de apenas salvar o arquivo
pnpm install
```

Isso garantirá que o `pnpm-lock.yaml` seja atualizado automaticamente.

---

## 📝 Commits Relacionados

- `90ecb05` - Adicionou `@fastify/cookie` ao package.json
- `dd1dfb9` - Tentativa de fix via script de build
- **Próximo:** Configurar Render para usar `--no-frozen-lockfile`

---

## 🆘 Troubleshooting

### Se o deploy continuar falhando:

1. **Verificar se o comando foi salvo corretamente:**
   - Render Dashboard → Settings → Build & Deploy
   - Confirmar que "Build Command" contém `--no-frozen-lockfile`

2. **Limpar cache do Render:**
   - No deploy que falhou, clicar em "Clear build cache & retry"

3. **Verificar logs de build:**
   - Procurar por `ERR_PNPM_OUTDATED_LOCKFILE`
   - Se ainda aparecer, o comando não foi aplicado

4. **Alternativa temporária:**
   - Remover `@fastify/cookie` temporariamente
   - Fazer deploy sem a feature de httpOnly cookies
   - Adicionar de volta depois com lockfile atualizado

---

## 📧 Suporte

Se precisar de ajuda adicional:
- Documentação Render: https://render.com/docs/deploy-node-express-app
- Documentação pnpm: https://pnpm.io/continuous-integration

---

**Status:** ⏳ Aguardando configuração manual no Render Dashboard
**Última atualização:** 2026-02-13
