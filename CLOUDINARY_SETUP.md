# Configuração do Cloudinary para Upload de Fotos

## 1. Criar Conta no Cloudinary

1. Acesse [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Crie uma conta gratuita (25GB de armazenamento + 25GB de bandwidth/mês)
3. Após criar a conta, você será redirecionado para o Dashboard

## 2. Obter Credenciais

No Dashboard do Cloudinary, você encontrará:

- **Cloud Name**: Ex: `vivoly-prod`
- **API Key**: Ex: `123456789012345`
- **API Secret**: Ex: `abcdefghijklmnopqrstuvwxyz123456`

## 3. Configurar Variáveis de Ambiente

### Backend (`apps/api/.env`)

Atualize o arquivo `.env` com suas credenciais:

```env
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

**IMPORTANTE:** Não commite essas credenciais no Git!

## 4. Estrutura de Pastas no Cloudinary

O sistema organiza as fotos automaticamente:

```
vivoly/
  └── {tenant_id}/
      └── imoveis/
          └── {imovel_id}/
              ├── 1234567890-foto1.jpg
              ├── 1234567891-foto2.jpg
              └── ...
```

## 5. Endpoints da API

### Upload de Foto
```
POST /api/v1/imoveis/:id/upload-foto
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: file (FormData)
```

**Validações:**
- Tipos permitidos: JPG, PNG, WebP
- Tamanho máximo: 5MB

### Deletar Foto
```
DELETE /api/v1/imoveis/:id/fotos/:fotoIndex
Authorization: Bearer {token}
```

## 6. Como Usar no Frontend

O componente `ImageUpload` já está criado e pronto para uso. Exemplo:

```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  imovelId={imovel.id}
  fotos={imovel.fotos || []}
  onUploadSuccess={(novaFoto) => {
    // Atualiza o estado local
    setImovel({
      ...imovel,
      fotos: [...(imovel.fotos || []), novaFoto]
    });
  }}
  onDeleteSuccess={(index) => {
    // Remove foto do estado local
    const novasFotos = [...(imovel.fotos || [])];
    novasFotos.splice(index, 1);
    setImovel({
      ...imovel,
      fotos: novasFotos
    });
  }}
/>
```

## 7. Teste o Sistema

1. **Inicie o backend:**
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Inicie o frontend:**
   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Teste o upload:**
   - Acesse um imóvel no dashboard
   - Arraste uma imagem ou clique para selecionar
   - Verifique se a foto aparece na galeria
   - Teste a exclusão de fotos

## 8. Monitoramento

Acesse o Dashboard do Cloudinary para:
- Ver uso de armazenamento
- Monitorar bandwidth
- Ver todas as imagens enviadas
- Gerenciar transformações

## 9. Otimizações Automáticas

O Cloudinary aplica automaticamente:
- ✅ Compressão inteligente (`quality: auto:good`)
- ✅ Formato moderno (WebP quando suportado)
- ✅ CDN global (carregamento rápido em qualquer lugar)
- ✅ Transformações on-the-fly (resize, crop, etc.)

## 10. Custos

### Plano Gratuito:
- 25 GB de armazenamento
- 25 GB de bandwidth por mês
- 25.000 transformações por mês

### Quando Expandir:
Se ultrapassar o plano gratuito, considere:
- **Pay as you go**: $0.001/GB armazenamento + $0.06/GB bandwidth
- **Plus Plan** ($99/mês): 200GB cada

## 11. Segurança

- ✅ Upload requer autenticação (Bearer token)
- ✅ Validação de tipo e tamanho no backend
- ✅ URLs assinadas para controle de acesso (opcional)
- ✅ Organização por tenant (isolamento de dados)

## 12. Próximos Passos

Para integrar o upload na página de cadastro/edição de imóveis, você precisará:

1. Importar o componente ImageUpload
2. Adicionar no formulário de imóveis
3. Gerenciar o estado das fotos
4. Atualizar o array de fotos ao salvar o imóvel

Exemplo de integração está no arquivo `apps/web/app/dashboard/imoveis/page.tsx`.
