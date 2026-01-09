# 🔐 Credenciais de Teste - ImobiFlow

**IMPORTANTE:** Todos os usuários abaixo tiveram `primeiro_acesso` resetado para `false` e podem fazer login normalmente.

---

## 🏢 Tenant: Imobiliaria Zacarias
**URL:** https://imobiliariazacarias.integrius.com.br

### 👤 ADMIN - Zacarias Fonseca
- **Email:** ia.hcdoh@gmail.com
- **Senha:** aMBd@1725
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

### 👤 CORRETOR - Paula da Costa Frias
- **Email:** pfrias@vimobi.com.br
- **Senha:** 123456
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

---

## 🏢 Tenant: Vivoly Imobiliária
**URL:** https://vivoly.integrius.com.br

### 👤 ADMIN - Administrador Vivoly
- **Email:** admin@vivoly.com
- **Senha:** admin123
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

### 👤 ADMIN - Administrador
- **Email:** admin@vivoly.com.br
- **Senha:** vivoly2025
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

### 👤 CORRETOR - João Corretor Teste
- **Email:** joao.corretor@vivoly.com.br
- **Senha:** teste123
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

### 👤 CORRETOR - Usuario Teste
- **Email:** teste@vivoly.com.br
- **Senha:** teste123
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

### 👤 CORRETOR - Hans Claudio Dohmann
- **Email:** eu.hansclaudio@gmail.com
- **Senha:** ❌ SEM SENHA (Google OAuth apenas)
- **Status:** ✅ Ativo
- **Google OAuth:** ✅ Disponível

---

## 🏢 Tenant: Testes ImobiFlow
**URL:** https://testes.integrius.com.br

### 👤 ADMIN - Corretor Teste
- **Email:** testecorretor@testes.co.br
- **Senha:** teste123
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

---

## 🏢 Tenant: Teste Deploy Novo
**URL:** https://teste-deploy-novo-999.integrius.com.br

### 👤 ADMIN - Admin Deploy
- **Email:** admin@teste-deploy-novo-999.com
- **Senha:** teste123
- **Status:** ✅ Ativo
- **Primeiro acesso:** ❌ Não

---

## 📝 Notas Importantes

1. **Senhas Marcadas com ⚠️:** Precisam ser verificadas no banco ou resetadas
2. **Google OAuth:** Apenas disponível para tenants autorizados (vivoly, localhost)
3. **Primeiro Acesso:** Todos resetados para permitir login direto ao dashboard
4. **Status:** Todos os usuários estão ativos

## 🔧 Como Resetar Senha de um Usuário

Execute o script de teste de senha para verificar:
```bash
cd apps/api
DATABASE_URL="..." npx tsx src/shared/scripts/test-password.ts
```

---

**Última atualização:** 09/01/2026
**Versão:** 1.6.4
