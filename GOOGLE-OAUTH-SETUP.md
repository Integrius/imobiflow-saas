# 🔧 Configuração Google OAuth - URGENTE

## ❌ Erro Atual: `400: origin_mismatch`

Este erro ocorre porque a URL do Cloudflare (vivoly.integrius.com.br) não está autorizada no Google Cloud Console.

## ✅ Solução (5 minutos)

### 1. Acesse Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Localize suas credenciais OAuth 2.0
- Procure pelo Client ID: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
- Clique para editar

### 3. Adicione as URIs autorizadas

#### JavaScript origins (Origens autorizadas)
Adicione TODAS estas URLs:
```
http://localhost:3000
https://vivoly.integrius.com.br
https://imobiflow.com.br
https://www.imobiflow.com.br
```

#### Redirect URIs (URIs de redirecionamento autorizados)
Adicione TODAS estas URLs:
```
http://localhost:3000
http://localhost:3000/login
https://vivoly.integrius.com.br
https://vivoly.integrius.com.br/login
https://imobiflow.com.br
https://imobiflow.com.br/login
https://www.imobiflow.com.br
https://www.imobiflow.com.br/login
```

### 4. Salve as alterações

Clique em **SALVAR** no final da página.

### 5. Aguarde propagação (30-60 segundos)

As mudanças podem levar até 1 minuto para propagar.

## 🧪 Teste após configurar

1. Acesse: https://vivoly.integrius.com.br/login
2. Clique em "Continuar com Google"
3. Deve abrir popup do Google sem erro

## 📋 Checklist

- [ ] Acessei Google Cloud Console
- [ ] Adicionei origens JavaScript
- [ ] Adicionei URIs de redirecionamento
- [ ] Salvei as alterações
- [ ] Aguardei 1 minuto
- [ ] Testei o login com Google

## ⚠️ IMPORTANTE

Se você não tem acesso ao Google Cloud Console:
1. Precisaremos criar um novo projeto OAuth
2. Ou você precisa pedir acesso a quem criou o projeto

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com
- Documentação OAuth: https://developers.google.com/identity/protocols/oauth2

---

**Client ID atual**: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
