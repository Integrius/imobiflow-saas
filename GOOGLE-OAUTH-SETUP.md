# Configuracao Google OAuth - ImobiFlow

## Status Atual

O Google OAuth requer configuracao manual dos dominios autorizados no Google Cloud Console.
Enquanto nao estiver configurado, o login tradicional (email/senha) funciona normalmente.

## Erro Comum: `origin_mismatch` ou `The given origin is not allowed`

Este erro ocorre porque o dominio atual NAO esta autorizado no Google Cloud Console.

## Solucao (5 minutos)

### 1. Acesse Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Localize suas credenciais OAuth 2.0
- Procure pelo Client ID: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
- Clique para editar

### 3. Adicione as URIs autorizadas

IMPORTANTE: Para cada novo tenant (subdominio), voce DEVE adicionar a URL aqui.

#### JavaScript origins (Origens autorizadas)
Adicione TODAS estas URLs:
```
http://localhost:3000
https://integrius.com.br
https://www.integrius.com.br
https://vivoly.integrius.com.br
```

Para CADA novo tenant, adicione:
```
https://{slug-do-tenant}.integrius.com.br
```

Exemplo: Se criar tenant "imobiliaria-abc", adicione:
```
https://imobiliaria-abc.integrius.com.br
```

#### Redirect URIs (URIs de redirecionamento autorizados)
Adicione as mesmas URLs + /login:
```
http://localhost:3000
http://localhost:3000/login
https://integrius.com.br
https://integrius.com.br/login
https://www.integrius.com.br
https://www.integrius.com.br/login
https://vivoly.integrius.com.br
https://vivoly.integrius.com.br/login
```

### 4. Salve as alteracoes

Clique em **SALVAR** no final da pagina.

### 5. Aguarde propagacao (30-60 segundos)

As mudancas podem levar ate 1 minuto para propagar.

## Teste apos configurar

1. Acesse: https://vivoly.integrius.com.br/login
2. Clique em "Continuar com Google"
3. Deve abrir popup do Google sem erro

## Checklist

- [ ] Acessei Google Cloud Console
- [ ] Adicionei origens JavaScript para TODOS os subdominos
- [ ] Adicionei URIs de redirecionamento
- [ ] Salvei as alteracoes
- [ ] Aguardei 1 minuto
- [ ] Testei o login com Google

## IMPORTANTE

1. **Login tradicional SEMPRE funciona** - Se Google OAuth nao estiver configurado, use email/senha
2. **Cada novo tenant precisa ser adicionado** - Wildcard (*.integrius.com.br) NAO e suportado pelo Google
3. **Sem acesso ao Google Cloud Console?** - Crie um novo projeto OAuth ou peca acesso

## Alternativa: Criar novo projeto OAuth

Se nao tiver acesso ao projeto atual:

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Ative a API "Google Identity"
4. Crie novas credenciais OAuth
5. Atualize o Client ID em `apps/web/app/layout.tsx`

## Links Uteis

- Google Cloud Console: https://console.cloud.google.com
- Documentacao OAuth: https://developers.google.com/identity/protocols/oauth2

---

**Client ID atual**: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`

**Ultima atualizacao**: 30 de dezembro de 2025
