# 🚀 Guia de Deploy Passo a Passo - ImobiFlow

Siga este guia exatamente como está escrito. Vou te guiar em cada etapa!

---

## ✅ PASSO 1: Commitar as Alterações

Copie e cole estes comandos no seu terminal, um de cada vez:

### 1.1 - Adicionar todos os arquivos ao Git

```bash
cd /home/hans/imobiflow
git add .
```

**O que isso faz?** Prepara todos os arquivos novos e modificados para serem commitados.

### 1.2 - Fazer o commit

```bash
git commit -m "feat: adiciona configuração para deploy na Vercel

- Adiciona vercel.json com configuração otimizada
- Cria documentação de deploy
- Adiciona scripts de verificação
- Configura build apenas do frontend"
```

**O que isso faz?** Salva as alterações no histórico do Git com uma mensagem descritiva.

### 1.3 - Fazer push para o GitHub

```bash
git push origin main
```

**O que isso faz?** Envia as alterações para o GitHub (ou GitLab/Bitbucket).

**⚠️ IMPORTANTE:** Se você ainda não tem o projeto no GitHub, pule para a seção "CONFIGURAR GITHUB" abaixo.

---

## ✅ PASSO 2: Configurar Conta na Vercel

### 2.1 - Criar conta (se ainda não tem)

1. Acesse: https://vercel.com/signup
2. Clique em "Continue with GitHub" (ou GitLab/Bitbucket)
3. Autorize a Vercel a acessar seus repositórios
4. Complete o cadastro

### 2.2 - Fazer login (se já tem conta)

1. Acesse: https://vercel.com/login
2. Entre com sua conta do GitHub

---

## ✅ PASSO 3: Importar Projeto na Vercel

### 3.1 - Criar novo projeto

1. Na dashboard da Vercel, clique em **"Add New..."** (botão azul no canto superior direito)
2. Selecione **"Project"**
3. Você verá a tela "Import Git Repository"

### 3.2 - Selecionar repositório

1. Encontre o repositório **"imobiflow"** na lista
2. Clique em **"Import"**

**🔍 Não vê o repositório?**
- Clique em "Adjust GitHub App Permissions"
- Autorize acesso ao repositório específico

### 3.3 - Configurar o projeto

Na tela de configuração, preencha assim:

```
┌─────────────────────────────────────────────────────────┐
│ Configure Project                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Project Name:                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ imobiflow                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Framework Preset:                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Next.js                                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Root Directory:                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ./                     (deixe vazio ou "./")        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.4 - Build and Output Settings

**⚠️ IMPORTANTE:** Clique em **"Override"** nas configurações de Build!

Depois preencha assim:

```
┌─────────────────────────────────────────────────────────┐
│ Build and Output Settings                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Build Command:                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ cd apps/web && pnpm install && pnpm run build       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Output Directory:                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ apps/web/.next                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Install Command:                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ pnpm install --filter=web                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ PASSO 4: Configurar Variáveis de Ambiente

**Ainda na mesma tela**, role para baixo até "Environment Variables".

### 4.1 - Adicionar variável

1. Em **"NAME"**, digite:
   ```
   NEXT_PUBLIC_API_URL
   ```

2. Em **"VALUE"**, digite **UMA** destas opções:

   **Opção A - Para testes (SEM backend em produção):**
   ```
   http://localhost:3333
   ```
   ⚠️ **Nota:** Isso vai funcionar apenas no seu computador. Para usar o sistema de verdade, você precisará fazer deploy da API depois.

   **Opção B - Se você JÁ TEM a API em produção:**
   ```
   https://sua-api-url-aqui.com
   ```

3. Em **"Environment"**, selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## ✅ PASSO 5: DEPLOY! 🎉

1. Revise todas as configurações
2. Clique no botão **"Deploy"** (grande, azul)
3. Aguarde o build (normalmente 2-5 minutos)

### 5.1 - Acompanhar o deploy

Você verá uma tela com:
- 🟡 **Building** - Compilando o projeto
- 🟢 **Assigning Domains** - Criando URL
- 🎉 **Success!** - Deploy concluído!

### 5.2 - Quando der sucesso

Você verá:
```
✅ Your deployment is ready!

https://imobiflow-xxxx.vercel.app
```

**Clique no link** para ver seu projeto online! 🎊

---

## ✅ PASSO 6: Testar o Deploy

### 6.1 - Verificar páginas

Teste estas URLs (substitua pelo seu domínio):

- ✅ https://seu-projeto.vercel.app/
- ✅ https://seu-projeto.vercel.app/dashboard
- ✅ https://seu-projeto.vercel.app/imoveis
- ✅ https://seu-projeto.vercel.app/negociacoes
- ✅ https://seu-projeto.vercel.app/corretores
- ✅ https://seu-projeto.vercel.app/leads

### 6.2 - O que esperar

**✅ Vai funcionar:**
- Todas as páginas carregam
- Design e layout corretos
- Navegação entre páginas

**❌ Não vai funcionar (ainda):**
- Chamadas à API (sem backend em produção)
- Login/autenticação
- Cadastro de dados

---

## 🔄 PRÓXIMOS PASSOS (Depois do Deploy)

### Para ter o sistema 100% funcional:

1. **Fazer deploy da API** (backend)
   - Recomendado: Railway.app
   - Alternativas: Render.com, Heroku
   - Tutorial: Consulte `DEPLOY.md` seção "Deploy do Backend"

2. **Atualizar variável de ambiente**
   - Na Vercel: Settings → Environment Variables
   - Editar `NEXT_PUBLIC_API_URL`
   - Colocar URL da API em produção
   - Fazer novo deploy (automático)

3. **Configurar domínio próprio** (opcional)
   - Settings → Domains
   - Adicionar domínio customizado

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Build Failed"

**Causa:** Erro na compilação

**Solução:**
1. Vá em "Deployments" no painel da Vercel
2. Clique no deployment que falhou
3. Veja os logs
4. Copie o erro e me mostre

---

### ❌ "Pages Load Blank"

**Causa:** Variável de ambiente incorreta

**Solução:**
1. Settings → Environment Variables
2. Verifique se `NEXT_PUBLIC_API_URL` está correta
3. Faça um novo deploy: Deployments → Redeploy

---

### ❌ "API Errors in Console"

**Causa:** Backend não está acessível

**Solução:** Isso é esperado se você ainda não fez deploy da API. Por enquanto, ignore.

---

## ✅ CHECKLIST FINAL

Após completar todos os passos, você deve ter:

- [ ] Código commitado no GitHub
- [ ] Projeto importado na Vercel
- [ ] Build configurado corretamente
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy concluído com sucesso
- [ ] Site acessível em https://seu-projeto.vercel.app
- [ ] Todas as páginas carregando

---

## 🎊 PARABÉNS!

Seu frontend está no ar!

**URL do seu projeto:** Você receberá em https://vercel.com/dashboard

**Auto-deploy:** Agora, sempre que você fizer `git push`, a Vercel fará deploy automaticamente!

---

**Precisa de ajuda?** Me chame a qualquer momento! 😊
