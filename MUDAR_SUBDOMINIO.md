# 🔄 Guia: Mudar Subdomínio de imobiflow para vivoly

## Mudança Necessária
- **De**: `imobiflow.integrius.com.br`
- **Para**: `vivoly.integrius.com.br`

---

## 📋 Passo 1: Cloudflare DNS

### Adicionar novo registro CNAME para vivoly

1. Acesse: https://dash.cloudflare.com
2. Selecione: **integrius.com.br**
3. Vá em: **DNS** → **Records**
4. Clique em: **Add record**
5. Preencha:

```
┌──────────────────────────────────────────────┐
│ Type:    CNAME                               │
│ Name:    vivoly                              │
│ Target:  imobiflow-web.onrender.com         │
│ Proxy:   🟠 Proxied (ativado)                │
│ TTL:     Auto                                │
└──────────────────────────────────────────────┘
```

6. Clique em **Save**

### Resultado

Você terá 2 registros:
- ✅ `imobiflow` → imobiflow-web.onrender.com (manter por enquanto)
- ✅ `vivoly` → imobiflow-web.onrender.com (novo)

**Opcional**: Depois que tudo estiver funcionando, você pode deletar o registro `imobiflow`.

---

## 📋 Passo 2: Render - Adicionar Domínio

### Adicionar vivoly.integrius.com.br

1. Acesse: https://dashboard.render.com
2. Clique no serviço: **imobiflow-web**
3. Vá em: **Settings** → **Custom Domains**
4. Clique em: **Add Custom Domain**
5. Digite: `vivoly.integrius.com.br`
6. Clique em: **Save**

### Aguardar Validação

- O Render vai verificar o DNS automaticamente (2-10 minutos)
- Status vai mudar para: ✅ **Verified**
- Certificado SSL será gerado automaticamente

### Resultado

Você terá 2 domínios no Render:
- ✅ `imobiflow.integrius.com.br` (antigo, manter por enquanto)
- ✅ `vivoly.integrius.com.br` (novo)

**Opcional**: Depois que tudo estiver funcionando, você pode remover `imobiflow.integrius.com.br`.

---

## 🧪 Passo 3: Testar

### Testar DNS (após 5 minutos)

```bash
# Verificar se DNS está resolvendo
nslookup vivoly.integrius.com.br 8.8.8.8

# Deve retornar IPs do Cloudflare:
# 104.21.x.x
# 172.67.x.x
```

### Testar no Navegador

1. **Landing Page**
   ```
   https://vivoly.integrius.com.br
   ```
   Deve carregar a página com nome "Vivoly"

2. **Página de Registro**
   ```
   https://vivoly.integrius.com.br/register
   ```
   Deve carregar "Crie sua conta no Vivoly"

3. **Página de Login**
   ```
   https://vivoly.integrius.com.br/login
   ```
   Deve carregar a página de login com logo Vivoly

---

## ✅ Checklist

- [ ] Registro CNAME `vivoly` criado no Cloudflare
- [ ] Domínio `vivoly.integrius.com.br` adicionado no Render
- [ ] DNS validado no Render (✅ Verified)
- [ ] SSL gerado automaticamente
- [ ] Testado: https://vivoly.integrius.com.br carrega
- [ ] Testado: https://vivoly.integrius.com.br/register funciona
- [ ] Testado: https://vivoly.integrius.com.br/login funciona

---

## 🔄 Migração Gradual (Recomendado)

### Fase 1: Ambos Funcionando (Agora)
- ✅ `imobiflow.integrius.com.br` → Funciona
- ✅ `vivoly.integrius.com.br` → Funciona (novo)

### Fase 2: Comunicar Mudança (Depois de testar)
- Informar usuários sobre novo endereço
- Manter ambos funcionando por 30 dias

### Fase 3: Redirecionar Antigo (Após 30 dias)
- Configurar redirect de `imobiflow` para `vivoly`
- Ou simplesmente remover o registro antigo

---

## 🚨 Troubleshooting

### Problema: DNS não resolve

**Solução**:
```bash
# Limpar cache DNS
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac

# Verificar propagação
dig vivoly.integrius.com.br
nslookup vivoly.integrius.com.br 8.8.8.8
```

### Problema: Render não valida domínio

**Causas**:
- DNS ainda não propagou (aguardar 5-10 minutos)
- Proxy do Cloudflare está ativo (correto, deve estar)
- Registro está incorreto

**Solução**:
1. Verifique se o registro CNAME está correto no Cloudflare
2. Aguarde mais alguns minutos
3. Tente remover e adicionar novamente no Render

### Problema: Certificado SSL inválido

**Solução**:
- Aguarde 5-15 minutos para o Render gerar o certificado
- Se persistir, verifique se o domínio foi validado corretamente

---

## 📝 Notas

- **Wildcard DNS** (`*.integrius.com.br`) já está configurado e funciona para ambos
- **Tenants** podem usar qualquer subdomínio:
  - `acme.integrius.com.br`
  - `remax.integrius.com.br`
  - etc.
- **Não precisa** alterar as variáveis de ambiente, pois:
  - `NEXT_PUBLIC_BASE_DOMAIN=integrius.com.br` (permanece igual)
  - O sistema usa subdomínios dinâmicos

---

## ✨ Resultado Final

Depois de concluído, você terá:

```
Domínio Principal (Landing Page):
https://vivoly.integrius.com.br

Registro de Tenants:
https://vivoly.integrius.com.br/register

Login:
https://vivoly.integrius.com.br/login

Tenants (Exemplos):
https://acme.integrius.com.br
https://remax.integrius.com.br
https://lopes.integrius.com.br
```

Todos os tenants continuam funcionando normalmente com seus subdomínios!
