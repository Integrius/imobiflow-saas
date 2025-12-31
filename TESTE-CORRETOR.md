# 🧪 Guia de Teste - Sistema de Permissões de Corretor

## ✅ Corretor de Teste Criado com Sucesso!

Um corretor de teste foi criado para você validar todas as funcionalidades do sistema de permissões.

---

## 🔑 Credenciais de Acesso

### Corretor de Teste

- **URL**: https://vivoly.integrius.com.br/login
- **Email**: `joao.corretor@vivoly.com.br`
- **Senha Temporária**: `corretor123`
- **Tipo**: CORRETOR
- **CRECI**: CRECI-SP 123456
- **ID**: `521a0f4c-0b23-4d20-8a5b-3ac510ff2175`

### Usuário Admin (para comparação)

- **URL**: https://vivoly.integrius.com.br/login
- **Email**: `admin@vivoly.com.br`
- **Senha**: `admin123`
- **Tipo**: ADMIN

---

## 📝 Passo a Passo para Testar

### 1️⃣ Testar Login e Primeiro Acesso

1. Acesse: https://vivoly.integrius.com.br/login

2. Faça login com:
   - **Email**: `joao.corretor@vivoly.com.br`
   - **Senha**: `corretor123`

3. **ESPERADO**: Você será redirecionado automaticamente para `/primeiro-acesso`

4. Na tela de primeiro acesso:
   - Veja a mensagem: "Bem-vindo(a), João Corretor Teste! 👋"
   - Defina uma nova senha (mínimo 6 caracteres)
   - Confirme a senha
   - Observe o indicador de força da senha
   - Clique em "Definir Senha e Continuar"

5. **ESPERADO**: Após definir a senha:
   - Você será redirecionado para `/dashboard`
   - O campo `primeiro_acesso` do usuário será alterado para `false`
   - Novo token JWT será gerado

### 2️⃣ Testar Filtragem de Leads

**Como Corretor:**

1. Acesse o menu "Leads" no dashboard

2. **ESPERADO**:
   - Você verá APENAS leads atribuídos a você (corretor_id = seu ID)
   - Leads de outros corretores NÃO aparecerão
   - Estatísticas mostrarão apenas seus leads

3. Tente acessar um lead específico:
   - Clique em um lead da lista (funcionará)
   - Tente acessar diretamente um lead de outro corretor via URL (receberá erro 403)

**Como Admin (para comparação):**

1. Faça logout e login como `admin@vivoly.com.br`

2. Acesse "Leads"

3. **ESPERADO**:
   - Você verá TODOS os leads do tenant
   - Sem filtro por corretor
   - Estatísticas globais

### 3️⃣ Testar Filtragem de Imóveis

**Como Corretor:**

1. Acesse o menu "Imóveis" no dashboard

2. **ESPERADO**:
   - Você verá APENAS imóveis onde `corretor_id` = seu ID
   - Imóveis de outros corretores NÃO aparecerão

3. Tente criar um novo imóvel:
   - Clique em "Novo Imóvel"
   - **ESPERADO**: Erro 403 Forbidden (apenas ADMIN/GESTOR podem criar)

4. Tente deletar um imóvel:
   - Clique em ações de um imóvel
   - **ESPERADO**: Botão de deletar não aparece ou retorna erro 403

**Como Admin (para comparação):**

1. Faça logout e login como admin

2. Acesse "Imóveis"

3. **ESPERADO**:
   - Você verá TODOS os imóveis
   - Pode criar novos imóveis
   - Pode deletar imóveis

### 4️⃣ Testar Permissões de Edição

**Como Corretor:**

1. Tente editar um lead atribuído a você:
   - **ESPERADO**: Funciona normalmente ✅

2. Tente editar um lead de outro corretor:
   - **ESPERADO**: Erro 403 Forbidden ❌

3. Tente editar um imóvel sob sua responsabilidade:
   - **ESPERADO**: Funciona normalmente ✅

4. Tente editar um imóvel de outro corretor:
   - **ESPERADO**: Erro 403 Forbidden ❌

### 5️⃣ Testar Atribuição de Leads

**Como Corretor:**

1. Tente atribuir um lead para outro corretor:
   - Acesse um lead
   - Procure opção de "Atribuir Corretor"
   - **ESPERADO**: Botão não aparece ou retorna erro 403

**Como Admin:**

1. Faça login como admin

2. Acesse um lead

3. **ESPERADO**:
   - Botão "Atribuir Corretor" disponível
   - Pode atribuir para qualquer corretor
   - Pode reatribuir leads

### 6️⃣ Testar Estatísticas

**Como Corretor:**

1. Acesse o dashboard

2. Observe os cards de estatísticas:
   - Total de Leads
   - Leads Quentes
   - Leads Mornos
   - Leads Frios

3. **ESPERADO**:
   - Estatísticas mostram APENAS seus leads
   - Total = número de leads atribuídos a você

**Como Admin:**

1. Faça login como admin

2. Observe as mesmas estatísticas

3. **ESPERADO**:
   - Estatísticas globais de TODOS os leads do tenant

---

## 🔒 Matriz de Permissões Esperadas

| Ação | CORRETOR | GESTOR | ADMIN |
|------|----------|--------|-------|
| Ver próprios leads | ✅ | ✅ | ✅ |
| Ver leads de outros | ❌ | ✅ | ✅ |
| Editar próprios leads | ✅ | ✅ | ✅ |
| Editar leads de outros | ❌ | ✅ | ✅ |
| Deletar leads | ❌ | ✅ | ✅ |
| Atribuir leads | ❌ | ✅ | ✅ |
| Ver próprios imóveis | ✅ | ✅ | ✅ |
| Ver imóveis de outros | ❌ | ✅ | ✅ |
| Editar próprios imóveis | ✅ | ✅ | ✅ |
| Editar imóveis de outros | ❌ | ✅ | ✅ |
| Criar imóveis | ❌ | ✅ | ✅ |
| Deletar imóveis | ❌ | ✅ | ✅ |
| Trocar corretor de imóvel | ❌ | ✅ | ✅ |
| Ver stats globais | ❌ | ✅ | ✅ |
| Ver próprias stats | ✅ | ✅ | ✅ |

---

## 🐛 Checklist de Validação

Marque conforme for testando:

### Backend

- [ ] Login com corretor redireciona para `/primeiro-acesso`
- [ ] Definir senha altera `primeiro_acesso` para `false`
- [ ] Novo token JWT é gerado após definir senha
- [ ] GET `/leads` retorna apenas leads do corretor
- [ ] GET `/leads/:id` retorna 403 para lead de outro corretor
- [ ] PUT `/leads/:id` retorna 403 para lead de outro corretor
- [ ] DELETE `/leads/:id` retorna 403 para corretor
- [ ] POST `/leads/:id/assign` retorna 403 para corretor
- [ ] GET `/imoveis` retorna apenas imóveis do corretor
- [ ] GET `/imoveis/:id` retorna 403 para imóvel de outro corretor
- [ ] PUT `/imoveis/:id` retorna 403 para imóvel de outro corretor
- [ ] POST `/imoveis` retorna 403 para corretor
- [ ] DELETE `/imoveis/:id` retorna 403 para corretor
- [ ] GET `/leads/stats` retorna stats apenas dos leads do corretor

### Frontend

- [ ] Página `/primeiro-acesso` carrega corretamente
- [ ] Formulário de senha funciona
- [ ] Validação de senha (mínimo 6 caracteres)
- [ ] Confirmação de senha obrigatória
- [ ] Indicador de força da senha funciona
- [ ] Redirecionamento para dashboard após definir senha
- [ ] Dashboard mostra apenas leads do corretor
- [ ] Dashboard mostra apenas imóveis do corretor
- [ ] Stats refletem apenas dados do corretor
- [ ] Botões de criar/deletar não aparecem para corretor
- [ ] Mensagens de erro 403 são tratadas adequadamente

---

## 🔧 Comandos Úteis

### Reiniciar Primeiro Acesso do Corretor

Se quiser testar o fluxo de primeiro acesso novamente:

```bash
DATABASE_URL="..." npx tsx ../../resetar-primeiro-acesso.ts
```

### Ver Dados do Corretor no Banco

```bash
DATABASE_URL="..." npx prisma studio
# Navegar: User → Filtrar por email: joao.corretor@vivoly.com.br
```

### Criar Leads de Teste para o Corretor

```bash
# TODO: Criar script para adicionar leads de teste atribuídos ao corretor
```

---

## 📊 Cenários de Teste Avançados

### Cenário 1: Corretor Tenta Acessar Lead de Outro

1. Como admin, crie um lead e atribua para outro corretor
2. Copie o ID do lead
3. Faça login como `joao.corretor@vivoly.com.br`
4. Tente acessar: `/dashboard/leads?id={lead-id}`
5. **ESPERADO**: Erro 403 ou lead não aparece na lista

### Cenário 2: Múltiplos Corretores no Mesmo Tenant

1. Crie outro corretor de teste
2. Atribua leads diferentes para cada um
3. Faça login como cada corretor
4. **ESPERADO**: Cada um vê apenas seus próprios leads

### Cenário 3: Reatribuição de Lead

1. Como admin, atribua um lead para o corretor João
2. João pode ver o lead
3. Como admin, reatribua o lead para outro corretor
4. João não pode mais ver o lead

---

## ❓ Troubleshooting

### Problema: Não consigo fazer login

**Solução**:
```bash
# Verificar se usuário existe
DATABASE_URL="..." npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { email: 'joao.corretor@vivoly.com.br' } })
  .then(console.log)
  .finally(() => prisma.\$disconnect());
"
```

### Problema: Não foi redirecionado para primeiro acesso

**Solução**: Verificar campo `primeiro_acesso` no banco de dados. Deve ser `true`.

### Problema: Vejo leads de outros corretores

**Solução**: Verificar se:
1. O usuário está autenticado corretamente (tipo = CORRETOR)
2. O registro Corretor existe e está vinculado ao User
3. Os logs do backend mostram a filtragem sendo aplicada

---

## 📞 Suporte

Se encontrar algum problema durante os testes, verifique:

1. **Logs do Backend**: `apps/api` (console do Render ou local)
2. **Console do Navegador**: Erros de requisição HTTP
3. **Network Tab**: Verificar status codes (200, 403, etc.)
4. **Database**: Verificar dados via Prisma Studio

---

## ✅ Checklist Final

- [ ] Login com corretor funciona
- [ ] Primeiro acesso funciona
- [ ] Corretor vê apenas seus leads
- [ ] Corretor vê apenas seus imóveis
- [ ] Corretor não pode deletar/criar imóveis
- [ ] Corretor não pode atribuir leads
- [ ] Admin vê tudo sem restrições
- [ ] Stats do corretor refletem apenas seus dados

---

**Data de Criação**: 31 de Dezembro de 2024
**Versão do Sistema**: 1.5.0
**Status**: ✅ Pronto para teste
