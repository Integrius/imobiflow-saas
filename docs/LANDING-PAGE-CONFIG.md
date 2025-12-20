# Configuração da Landing Page

## Visão Geral

A landing page do Imobiflow é a página inicial do sistema, exibida para visitantes não autenticados. Ela apresenta os recursos do produto, planos de preço e call-to-actions para cadastro/login.

## Estrutura Atual

### Página Principal
- **Localização**: [apps/web/app/page.tsx](../apps/web/app/page.tsx)
- **Configuração**: [apps/web/config/landing.ts](../apps/web/config/landing.ts)

### Seções da Landing Page

1. **Hero Section** (Topo)
   - Logo Vivoly
   - Botões "Entrar" e "Começar Grátis"
   - Headline com destaque
   - Imagem principal (configurável)
   - Cards de estatísticas flutuantes

2. **Features** (Recursos)
   - 6 cards informativos:
     - Gestão de Leads
     - Catálogo de Imóveis
     - Controle de Negociações
     - Relatórios e Análises
     - Gestão de Corretores
     - Segurança Total

3. **Como Funciona**
   - 3 passos simples
   - Fluxo de onboarding

4. **Pricing** (Planos)
   - Básico (R$ 97/mês)
   - Profissional (R$ 197/mês) - Destaque
   - Enterprise (R$ 397/mês)

5. **Integrações**
   - Portais imobiliários
   - ZAP, Viva Real, OLX, etc.

6. **Contact** (Contato)
   - Email configurável
   - WhatsApp configurável

7. **Footer**
   - Links institucionais
   - Copyright

---

## 🎨 Como Substituir a Imagem Principal (Emoticon.png)

### Método Atual (Manual)

#### Passo 1: Preparar Nova Imagem

```bash
# Formatos aceitos: PNG, JPG, WEBP
# Tamanho recomendado: 400x400px (quadrado)
# Peso máximo: 500KB
# Fundo: Transparente (PNG) recomendado
```

#### Passo 2: Substituir o Arquivo

```bash
# Navegar até o diretório public
cd apps/web/public/

# Fazer backup da imagem atual
cp Emoticon.png Emoticon-backup.png

# Substituir pela nova imagem
# Opção 1: Manter o nome Emoticon.png
cp /caminho/da/nova-imagem.png Emoticon.png

# Opção 2: Usar novo nome e atualizar configuração
cp /caminho/da/nova-imagem.png MinhaNova.png
```

#### Passo 3: Atualizar Configuração (se mudou o nome)

Edite o arquivo [apps/web/config/landing.ts](../apps/web/config/landing.ts):

```typescript
export const landingConfig: LandingConfig = {
  hero: {
    imagePath: '/MinhaNova.png',  // ← Atualizar aqui
    imageAlt: 'Nova descrição da imagem',
    imageWidth: 400,  // Ajustar se necessário
    imageHeight: 400, // Ajustar se necessário
  },
  // ...
};
```

#### Passo 4: Rebuild do Frontend

```bash
# Navegar para o diretório web
cd apps/web

# Rebuild
npm run build

# Fazer deploy (Render vai detectar automaticamente)
git add .
git commit -m "feat: atualiza imagem principal da landing page"
git push origin main
```

#### Passo 5: Verificar

Acesse a landing page em:
- **Local**: http://localhost:3000
- **Produção**: https://imobiflow-web.onrender.com

---

## 🚀 Futuro: Dashboard Administrativo

### Planejamento para Upload Dinâmico

Futuramente, será possível substituir a imagem diretamente pelo dashboard sem precisar fazer rebuild:

#### Endpoint Planejado

```
POST /api/v1/admin/landing/hero-image
Content-Type: multipart/form-data

{
  "image": <file>
}
```

#### Fluxo Futuro

1. **Upload via Dashboard**
   - Admin faz login
   - Acessa "Configurações → Landing Page"
   - Faz upload da nova imagem
   - Preview em tempo real
   - Confirma substituição

2. **Processamento Backend**
   - Validação (formato, tamanho, dimensões)
   - Otimização automática (compressão, resize)
   - Versionamento (mantém backup da anterior)
   - Atualização do CDN/cache
   - Atualização da configuração

3. **Aplicação Imediata**
   - Sem necessidade de rebuild
   - Invalidação de cache
   - Imagem atualizada instantaneamente

#### Tabela de Configurações (Futuro)

```sql
CREATE TABLE landing_config (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),

  -- Hero
  hero_image_url TEXT NOT NULL,
  hero_image_alt TEXT,
  hero_cta_primary TEXT DEFAULT 'Começar Grátis',
  hero_cta_secondary TEXT DEFAULT 'Ver Demo',

  -- Contato
  contact_email TEXT DEFAULT 'contato@vivoly.com.br',
  contact_whatsapp TEXT DEFAULT '5511999999999',

  -- Metadados
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📝 Checklist de Implementação Futura

- [ ] Criar tabela `landing_config` no schema Prisma
- [ ] Endpoint `POST /api/v1/admin/landing/hero-image`
- [ ] Endpoint `GET /api/v1/admin/landing/config`
- [ ] Endpoint `PATCH /api/v1/admin/landing/config`
- [ ] Serviço de upload de imagens (Cloudinary ou S3)
- [ ] Validação e otimização de imagens
- [ ] Interface no dashboard:
  - [ ] Tela de configuração
  - [ ] Upload com preview
  - [ ] Histórico de versões
- [ ] Cache invalidation
- [ ] Testes automatizados

---

## 🎯 Configurações Atuais

### Imagem Hero

```typescript
{
  imagePath: '/Emoticon.png',
  imageAlt: 'Vivoly - Gestão Imobiliária Inteligente',
  imageWidth: 400,
  imageHeight: 400,
}
```

### CTAs

```typescript
{
  primary: 'Começar Grátis',
  secondary: 'Ver Demo',
}
```

### Contato

```typescript
{
  email: 'contato@vivoly.com.br',
  whatsapp: '5511999999999',
}
```

---

## 📌 Notas Importantes

1. **Imagem Atual**: `/Emoticon.png` (69KB, formato PNG)
2. **Otimização**: Next.js otimiza automaticamente as imagens via `next/image`
3. **Responsividade**: A imagem é oculta em mobile (`hidden md:block`)
4. **Performance**: Imagem carregada com prioridade (`priority`)
5. **Efeito Visual**: Hover com scale (1.05) e drop-shadow

---

## 🔧 Troubleshooting

### Imagem não aparece após substituição

```bash
# 1. Verificar se o arquivo existe
ls -lh apps/web/public/Emoticon.png

# 2. Verificar permissões
chmod 644 apps/web/public/Emoticon.png

# 3. Limpar cache do Next.js
rm -rf apps/web/.next

# 4. Rebuild
cd apps/web && npm run build
```

### Erro de build "Image optimization"

```bash
# Verificar formato da imagem
file apps/web/public/Emoticon.png

# Converter para formato suportado se necessário
convert image.jpg -background none Emoticon.png
```

---

**Última atualização**: 2025-12-20
**Responsável**: Sistema Imobiflow
**Próxima revisão**: Implementação do dashboard administrativo
