# ✅ Checklist de Deploy - ImobiFlow

Use este checklist para garantir que tudo está pronto para deploy.

## 📋 Pré-Deploy

- [ ] Todas as alterações foram commitadas
- [ ] Build local funciona sem erros
- [ ] Testes passando (se aplicável)
- [ ] Variáveis de ambiente documentadas em `.env.example`
- [ ] README atualizado

## 🔧 Configuração

- [ ] `vercel.json` criado na raiz
- [ ] `.vercelignore` configurado
- [ ] Package manager definido (`pnpm`)
- [ ] Output directory correto (`apps/web/.next`)

## 🌐 Repositório Git

- [ ] Código está no GitHub/GitLab/Bitbucket
- [ ] Branch principal está atualizada
- [ ] `.gitignore` configurado corretamente
- [ ] Sem arquivos sensíveis commitados (`.env`, secrets)

## 🚀 Vercel Setup

### Configuração do Projeto

- [ ] Projeto importado na Vercel
- [ ] Framework: Next.js
- [ ] Build Command: `pnpm run build --filter=web`
- [ ] Output Directory: `apps/web/.next`
- [ ] Install Command: `pnpm install`
- [ ] Node Version: 18.x ou superior

### Variáveis de Ambiente

- [ ] `NEXT_PUBLIC_API_URL` configurada
- [ ] Variáveis separadas por ambiente (Production, Preview, Development)

### Domínio

- [ ] Domínio da Vercel funcionando (imobiflow.vercel.app)
- [ ] Domínio customizado configurado (opcional)
- [ ] DNS configurado (se domínio próprio)
- [ ] HTTPS habilitado

## 🔙 Backend/API

- [ ] Backend deployado em produção
- [ ] Banco de dados PostgreSQL configurado
- [ ] Migrations executadas
- [ ] CORS configurado para aceitar domínio do frontend
- [ ] URL da API atualizada no frontend

### Opções de Deploy Backend

Escolha uma plataforma:
- [ ] Railway (https://railway.app)
- [ ] Render (https://render.com)
- [ ] Heroku (https://heroku.com)
- [ ] DigitalOcean App Platform
- [ ] AWS/Azure/GCP

## 🧪 Testes Pós-Deploy

### Funcionalidade

- [ ] Homepage carrega corretamente
- [ ] Rotas principais funcionando:
  - [ ] `/dashboard`
  - [ ] `/imoveis`
  - [ ] `/negociacoes`
  - [ ] `/corretores`
  - [ ] `/leads`
- [ ] API requests funcionando
- [ ] Autenticação funcional (quando implementada)

### Performance

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Images otimizadas

### SEO (Opcional)

- [ ] Meta tags configuradas
- [ ] Sitemap gerado
- [ ] robots.txt configurado
- [ ] Open Graph tags

## 🔒 Segurança

- [ ] Environment variables não expostas no cliente
- [ ] HTTPS funcionando
- [ ] Headers de segurança configurados
- [ ] CORS configurado corretamente
- [ ] Rate limiting na API (recomendado)

## 📊 Monitoramento

- [ ] Vercel Analytics habilitado
- [ ] Error tracking configurado (Sentry, opcional)
- [ ] Logs acessíveis
- [ ] Alertas configurados para erros críticos

## 📝 Documentação

- [ ] README atualizado com instruções
- [ ] DEPLOY.md revisado
- [ ] Variáveis de ambiente documentadas
- [ ] Credenciais de acesso organizadas

## 🎉 Go Live

- [ ] Deploy em produção realizado
- [ ] Domínio acessível
- [ ] Equipe notificada
- [ ] Stakeholders informados
- [ ] Backup do banco de dados configurado

## 🔄 Pós-Deploy

- [ ] Monitorar logs por 24h
- [ ] Verificar métricas de performance
- [ ] Coletar feedback inicial
- [ ] Documentar problemas encontrados
- [ ] Planejar próximas features

---

## 🆘 Em Caso de Problemas

1. **Build falha na Vercel**
   - Verificar logs de build
   - Testar build localmente
   - Verificar versão do Node.js

2. **API não responde**
   - Verificar URL da API
   - Testar endpoint diretamente
   - Verificar CORS

3. **Páginas em branco**
   - Abrir console do navegador
   - Verificar erros JavaScript
   - Verificar se API está respondendo

4. **Performance ruim**
   - Habilitar Next.js Image optimization
   - Verificar bundle size
   - Implementar lazy loading

## 📞 Suporte

- Vercel Status: https://vercel-status.com
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Última Verificação:** ___/___/______

**Deploy Realizado por:** _________________

**Status:** [ ] Pendente [ ] Em Progresso [ ] Concluído ✅
