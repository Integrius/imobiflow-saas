# 📦 Como Colocar seu Projeto no GitHub

Se você ainda não tem seu projeto no GitHub, siga este guia.

---

## ✅ OPÇÃO 1: Criar Repositório via Interface do GitHub (Mais Fácil)

### Passo 1: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `imobiflow`
   - **Description:** "Sistema de gestão imobiliária com CRM integrado"
   - **Visibility:** Private ou Public (sua escolha)
   - **⚠️ NÃO** marque "Add a README file"
   - **⚠️ NÃO** marque "Add .gitignore"
   - **⚠️ NÃO** marque "Choose a license"
3. Clique em **"Create repository"**

### Passo 2: Conectar seu projeto local

Você verá uma tela com comandos. **NÃO COPIE ELES!** Use os comandos abaixo:

```bash
cd /home/hans/imobiflow

# Inicializar Git (se ainda não foi)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: setup inicial do projeto ImobiFlow

- Estrutura monorepo com Turborepo
- Frontend Next.js com interface de Imóveis, Negociações, Dashboard e Corretores
- Backend Fastify com Prisma
- Configuração para deploy na Vercel"

# Conectar ao GitHub (SUBSTITUA SEU-USUARIO pelo seu username do GitHub!)
git remote add origin https://github.com/SEU-USUARIO/imobiflow.git

# Enviar código
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANTE:** Na linha do `git remote add origin`, substitua `SEU-USUARIO` pelo seu username do GitHub!

**Exemplo:** Se seu username é `joaosilva`, o comando fica:
```bash
git remote add origin https://github.com/joaosilva/imobiflow.git
```

### Passo 3: Autenticar

Se pedir usuário e senha:

**⚠️ NÃO USE SUA SENHA NORMAL!** O GitHub não aceita mais senha.

Você precisa de um **Personal Access Token (PAT)**:

1. Vá em: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Em "Note", escreva: `imobiflow-deploy`
4. Em "Expiration", escolha: `90 days` (ou mais)
5. Marque apenas: **repo** (isso vai marcar todos os sub-itens)
6. Role até o final e clique em **"Generate token"**
7. **COPIE O TOKEN** (você não vai vê-lo novamente!)
8. Quando o Git pedir senha, **cole o token** (não sua senha)

---

## ✅ OPÇÃO 2: Usar GitHub Desktop (Mais Visual)

### Passo 1: Instalar GitHub Desktop

1. Baixe: https://desktop.github.com/
2. Instale o programa
3. Faça login com sua conta GitHub

### Passo 2: Adicionar projeto

1. File → Add Local Repository
2. Selecione a pasta: `/home/hans/imobiflow`
3. Se disser "not a git repository", clique em "create a repository here"

### Passo 3: Fazer commit

1. Você verá todos os arquivos na lista
2. Em "Summary", escreva: `Setup inicial do projeto`
3. Em "Description", escreva:
   ```
   - Estrutura monorepo com Turborepo
   - Frontend Next.js completo
   - Backend Fastify com Prisma
   - Configuração para deploy na Vercel
   ```
4. Clique em **"Commit to main"**

### Passo 4: Publicar no GitHub

1. Clique em **"Publish repository"** (botão azul no topo)
2. Nome: `imobiflow`
3. Descrição: "Sistema de gestão imobiliária"
4. Escolha Public ou Private
5. Clique em **"Publish Repository"**

Pronto! ✅

---

## ✅ OPÇÃO 3: Usar GitHub CLI (Para Desenvolvedores)

```bash
# Instalar GitHub CLI (se não tiver)
# Ubuntu/Debian:
sudo apt install gh

# Fedora:
sudo dnf install gh

# macOS:
brew install gh

# Login
gh auth login

# Criar repositório e fazer push
cd /home/hans/imobiflow
git init
git add .
git commit -m "feat: setup inicial do projeto ImobiFlow"
gh repo create imobiflow --private --source=. --remote=origin --push
```

---

## ✅ Verificar se Funcionou

Depois de fazer o push, acesse:
```
https://github.com/SEU-USUARIO/imobiflow
```

Você deve ver todos os seus arquivos lá! ✅

---

## 🔒 Configurar .gitignore (Importante!)

O projeto já tem um `.gitignore`, mas verifique se está correto:

```bash
cd /home/hans/imobiflow
cat .gitignore
```

Deve conter pelo menos:
```
node_modules/
.env
.env.local
.next/
dist/
build/
*.log
.DS_Store
coverage/
.turbo/
```

Se não tiver, crie:
```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env*.local
dist/
build/
.next/
*.log
.DS_Store
coverage/
.turbo/
.vscode/
.idea/
*.sqlite
*.db
EOF
```

---

## ⚠️ NUNCA Commite Estes Arquivos

**JAMAIS** adicione ao Git:
- ❌ `.env` ou `.env.local` (senhas, secrets)
- ❌ `node_modules/` (muito pesado)
- ❌ `.next/` (arquivos compilados)
- ❌ Arquivos com senhas ou API keys

**Se você acidentalmente commitou algum arquivo sensível:**

```bash
# Remover arquivo do Git (mas manter no disco)
git rm --cached apps/web/.env.local

# Commit da remoção
git commit -m "chore: remove arquivo sensível"

# Push
git push
```

---

## 📝 Dicas

### Ver status do Git
```bash
git status
```

### Ver diferenças
```bash
git diff
```

### Ver histórico
```bash
git log --oneline -10
```

### Desfazer último commit (antes do push)
```bash
git reset HEAD~1
```

---

## 🆘 Problemas Comuns

### ❌ "fatal: remote origin already exists"

**Solução:**
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/imobiflow.git
```

---

### ❌ "Authentication failed"

**Solução:** Você precisa de um Personal Access Token (veja "Passo 3: Autenticar" acima)

---

### ❌ "Updates were rejected because the remote contains work"

**Solução:**
```bash
git pull origin main --rebase
git push origin main
```

---

## ✅ Próximo Passo

Depois que seu código estiver no GitHub, volte para o **GUIA_DEPLOY_PASSO_A_PASSO.md** e continue do **PASSO 2**!

---

**Precisa de ajuda?** Me chame! 😊
