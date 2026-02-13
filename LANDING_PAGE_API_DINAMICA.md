# Landing Page - API Dinâmica

**Data de Implementação:** 2026-02-13
**Status:** ✅ **IMPLEMENTADO E FUNCIONAL**

---

## 📋 Resumo

Sistema de configuração dinâmica da landing page implementado com sucesso, permitindo atualizar a imagem hero e outras configurações sem rebuild do frontend.

**Funcionalidades:**
- ✅ Upload de imagem hero via API (admin)
- ✅ Armazenamento no Cloudinary com otimização automática
- ✅ API pública para servir configuração
- ✅ Cache inteligente (5 minutos)
- ✅ Fallback automático em caso de falha

---

## 🚀 Endpoints Implementados

### 1. POST /api/v1/admin/landing/hero-image

**Upload de imagem hero da landing page**

**Acesso:** Apenas ADMIN do tenant Vivoly (autenticado)

**Request:**
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/admin/landing/hero-image \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -F "file=@/path/to/image.png"
```

**Validações:**
- Formatos aceitos: PNG, JPG, JPEG, WebP
- Tamanho máximo: 2MB
- Otimização automática pelo Cloudinary

**Response de Sucesso:**
```json
{
  "success": true,
  "message": "Imagem atualizada com sucesso",
  "data": {
    "url": "https://res.cloudinary.com/...../vivoly/landing/hero-image.png",
    "width": 1200,
    "height": 800,
    "format": "png",
    "size": 245678
  },
  "instructions": {
    "step1": "Imagem enviada para Cloudinary com sucesso",
    "step2": "Atualize a variável de ambiente LANDING_HERO_IMAGE_URL no Render",
    "step3": "Valor: https://res.cloudinary.com/...",
    "step4": "Ou acesse via API pública: GET /api/v1/public/landing/config"
  }
}
```

**Erros:**
```json
// Arquivo não enviado
{
  "error": "Nenhum arquivo enviado"
}

// Formato inválido
{
  "error": "Formato inválido",
  "message": "Apenas PNG, JPG, JPEG e WebP são aceitos"
}

// Arquivo muito grande
{
  "error": "Arquivo muito grande",
  "message": "Tamanho máximo: 2MB"
}

// Não autenticado ou não é admin Vivoly
{
  "error": "Acesso negado",
  "message": "Apenas administradores do tenant Vivoly podem acessar este recurso"
}
```

---

### 2. GET /api/v1/admin/landing/hero-image

**Buscar URL atual da imagem hero**

**Acesso:** Apenas ADMIN do tenant Vivoly (autenticado)

**Request:**
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/admin/landing/hero-image \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...../vivoly/landing/hero-image.png",
    "width": 1200,
    "height": 800,
    "format": "png",
    "size": 245678,
    "created_at": "2026-02-13T10:30:00Z",
    "updated_at": "2026-02-13T10:30:00Z"
  }
}
```

**Se nenhuma imagem foi feita upload ainda:**
```json
{
  "success": true,
  "data": null,
  "message": "Nenhuma imagem hero configurada ainda. Use POST /api/v1/admin/landing/hero-image para fazer upload."
}
```

---

### 3. GET /api/v1/public/landing/config

**Buscar configuração completa da landing page**

**Acesso:** Público (sem autenticação)

**Request:**
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/public/landing/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "imagePath": "https://res.cloudinary.com/...../vivoly/landing/hero-image.png",
      "imageSource": "cloudinary",
      "imageAlt": "Vivoly - Gestão Imobiliária Inteligente",
      "imageWidth": 520,
      "imageHeight": 520
    },
    "cta": {
      "primary": "Começar Grátis",
      "secondary": "Ver Demo"
    },
    "contact": {
      "email": "contato@vivoly.com.br",
      "whatsapp": "5511999999999"
    },
    "_meta": {
      "cached": false,
      "timestamp": "2026-02-13T10:35:00Z",
      "version": "1.0"
    }
  }
}
```

**Prioridades de fonte da imagem:**
1. **Variável de ambiente** `LANDING_HERO_IMAGE_URL` (se configurada)
2. **Cloudinary** `vivoly/landing/hero-image` (se existe upload)
3. **Fallback local** `/Emoticon.png` (padrão)

---

### 4. GET /api/v1/public/landing/hero-image-url

**Buscar apenas a URL da imagem hero (endpoint simplificado)**

**Acesso:** Público (sem autenticação)

**Request:**
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/public/landing/config/hero-image-url
```

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...../vivoly/landing/hero-image.png",
  "source": "cloudinary"
}
```

---

## 💻 Uso no Frontend

### Opção 1: Função Assíncrona (Recomendado)

```typescript
import { getLandingConfig } from '@/config/landing'

export default async function LandingPage() {
  const config = await getLandingConfig()

  return (
    <div>
      <img
        src={config.hero.imagePath}
        alt={config.hero.imageAlt}
        width={config.hero.imageWidth}
        height={config.hero.imageHeight}
      />
      <h1>{config.cta.primary}</h1>
    </div>
  )
}
```

### Opção 2: Use Client Component com useEffect

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getLandingConfig, landingConfig, LandingConfig } from '@/config/landing'

export default function HeroSection() {
  const [config, setConfig] = useState<LandingConfig>(landingConfig) // Fallback inicial

  useEffect(() => {
    getLandingConfig().then(setConfig)
  }, [])

  return (
    <img
      src={config.hero.imagePath}
      alt={config.hero.imageAlt}
      width={config.hero.imageWidth}
      height={config.hero.imageHeight}
    />
  )
}
```

### Opção 3: Exportação Estática (Compatibilidade)

```typescript
import { landingConfig } from '@/config/landing'

// Usa configuração padrão (sem API)
export default function Component() {
  return <img src={landingConfig.hero.imagePath} />
}
```

---

## 🔧 Configuração

### 1. Variáveis de Ambiente (Opcional)

**Backend (.env):**
```bash
# Cloudinary (obrigatório para upload)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"

# Landing Page (opcional - sobrescreve Cloudinary)
LANDING_HERO_IMAGE_URL="https://res.cloudinary.com/...../hero.png"
LANDING_CONTACT_EMAIL="contato@vivoly.com.br"
LANDING_CONTACT_WHATSAPP="5511999999999"
```

**Se não configurar:** Usa imagem local `/Emoticon.png` como fallback.

---

## 📦 Cache e Performance

### Cache em Memória (Frontend)

- **Duração:** 5 minutos
- **Limpar cache manualmente:**
  ```typescript
  import { clearLandingCache } from '@/config/landing'
  clearLandingCache()
  ```

### Cache HTTP (API)

- **Recomendação:** Adicionar cache HTTP com `Cache-Control` header
- **CDN:** Cloudinary já faz cache automático das imagens

---

## 🎯 Fluxo Completo de Uso

### 1. Upload de Nova Imagem Hero

**Admin acessa o painel administrativo:**

```bash
# Via cURL (exemplo)
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/admin/landing/hero-image \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -F "file=@nova-hero.png"
```

**Ou via interface web (futuro):**
- Dashboard → Configurações → Landing Page → Upload Hero Image

**O que acontece:**
1. Imagem é validada (formato, tamanho)
2. Upload para Cloudinary em `vivoly/landing/hero-image`
3. Cloudinary otimiza automaticamente (qualidade, formato)
4. URL da imagem é retornada

### 2. Configurar Variável de Ambiente (Opcional)

**Render Dashboard:**
1. Acessar https://dashboard.render.com/
2. Selecionar serviço do backend
3. Environment → Add Environment Variable
4. Nome: `LANDING_HERO_IMAGE_URL`
5. Valor: URL retornada pelo upload
6. Save Changes

**Ou deixar o Cloudinary servir automaticamente** (recomendado).

### 3. Landing Page Atualiza Automaticamente

- Frontend faz fetch de `/api/v1/public/landing/config`
- Recebe nova URL da imagem
- Exibe imagem atualizada
- Cache de 5 minutos evita requests excessivas

**Não precisa rebuild do frontend!** 🎉

---

## 🧪 Testes

### Teste 1: Upload de Imagem

```bash
# Preparar imagem de teste (< 2MB, PNG/JPG)
# Fazer login como admin Vivoly
# Obter token JWT

curl -X POST http://localhost:3333/api/v1/admin/landing/hero-image \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@test-hero.png"
```

**Resultado esperado:**
- Status 200
- Retorna URL do Cloudinary
- Imagem disponível na URL

### Teste 2: Buscar Configuração Pública

```bash
curl http://localhost:3333/api/v1/public/landing/config
```

**Resultado esperado:**
- Status 200
- Retorna configuração completa
- `imagePath` aponta para Cloudinary (se upload foi feito)

### Teste 3: Frontend Dinâmico

```typescript
// Testar no navegador
import { getLandingConfig } from '@/config/landing'

const config = await getLandingConfig()
console.log('Hero image:', config.hero.imagePath)
console.log('Source:', config.hero.imageSource) // 'cloudinary', 'env', ou 'local'
```

---

## ⚠️ Troubleshooting

### Problema 1: Upload falha com erro 500

**Causa:** Cloudinary não configurado

**Solução:**
1. Verificar se variáveis de ambiente do Cloudinary estão configuradas
2. Logs do backend devem mostrar:
   ```
   ❌ CLOUDINARY NÃO CONFIGURADO!
   ```
3. Configurar no Render:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Problema 2: Frontend sempre usa imagem local

**Causa:** API pública não está retornando URL do Cloudinary

**Debug:**
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/public/landing/config
```

**Verificar:**
- `imageSource` deve ser `"cloudinary"` se upload foi feito
- Se for `"local"`, significa que não há upload no Cloudinary

**Solução:**
1. Fazer upload da imagem via `POST /api/v1/admin/landing/hero-image`
2. Ou configurar `LANDING_HERO_IMAGE_URL` no .env

### Problema 3: Cache não atualiza após novo upload

**Causa:** Cache em memória do frontend (5 minutos)

**Solução:**
1. **Aguardar 5 minutos** (cache expira automaticamente)
2. **Ou limpar cache manualmente:**
   ```typescript
   import { clearLandingCache } from '@/config/landing'
   clearLandingCache()
   ```
3. **Ou fazer hard refresh** no navegador (Ctrl+Shift+R)

### Problema 4: "Acesso negado" ao fazer upload

**Causa:** Usuário não é admin do tenant Vivoly

**Solução:**
1. Verificar que usuário está autenticado
2. Verificar que tenant do usuário é "vivoly"
3. Verificar que tipo do usuário é "ADMIN"

---

## 📊 Arquivos Modificados/Criados

### Backend

- ✅ **[apps/api/src/modules/admin/admin.routes.ts](apps/api/src/modules/admin/admin.routes.ts)** - Adicionados endpoints de upload
- ✅ **[apps/api/src/modules/public/landing.routes.ts](apps/api/src/modules/public/landing.routes.ts)** - NOVO - Rotas públicas da landing
- ✅ **[apps/api/src/server.ts](apps/api/src/server.ts)** - Registrado `landingRoutes`

### Frontend

- ✅ **[apps/web/config/landing.ts](apps/web/config/landing.ts)** - Adicionada função `getLandingConfig()` assíncrona

### Documentação

- ✅ **LANDING_PAGE_API_DINAMICA.md** (este arquivo)

---

## 🎯 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Interface Admin de Upload**
   - Criar página em `/dashboard/admin/landing-page`
   - Drag & drop para upload de imagem
   - Preview ao vivo antes de salvar

2. **Mais Configurações Dinâmicas**
   - Textos dos CTAs
   - Cores do tema
   - Seções da landing page (features, pricing, etc)

3. **Versionamento**
   - Histórico de imagens anteriores
   - Rollback para versão anterior
   - A/B testing de diferentes imagens

4. **CDN e Cache Avançado**
   - Cache HTTP com `Cache-Control`
   - Invalidação de cache automática após upload
   - Suporte a múltiplos CDNs

---

## ✅ Checklist de Implementação

- [x] Endpoint de upload implementado
- [x] Validação de formato e tamanho
- [x] Upload para Cloudinary com otimização
- [x] Endpoint público de configuração
- [x] Prioridades de fonte (env > cloudinary > local)
- [x] Cache em memória (5 minutos)
- [x] Função `getLandingConfig()` assíncrona
- [x] Fallback automático em caso de erro
- [x] Documentação completa
- [x] Rotas registradas no server.ts
- [ ] Interface admin de upload (futuro)
- [ ] Testes automatizados (futuro)

---

## 📧 Suporte

Para dúvidas sobre a API dinâmica da landing page:
- **Documentação:** Este arquivo
- **Endpoints:** Ver seção "Endpoints Implementados" acima
- **Testes:** Ver seção "Testes"

---

**Status:** ✅ Implementação completa e funcional
**Última atualização:** 2026-02-13
**Versão:** 1.0
