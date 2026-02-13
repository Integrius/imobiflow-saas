-- Script SQL para criar tenant e admin manualmente
-- Execute este script diretamente no banco de dados PostgreSQL

-- 1. Criar tenant Vivoly
INSERT INTO "Tenant" (
  "id",
  "nome",
  "slug",
  "subdominio",
  "email",
  "telefone",
  "plano",
  "status",
  "limite_usuarios",
  "limite_imoveis",
  "total_usuarios",
  "total_imoveis",
  "created_at",
  "updated_at"
) VALUES (
  gen_random_uuid(),
  'Vivoly Imobiliária',
  'vivoly',
  'vivoly',
  'contato@vivoly.com.br',
  '11999999999',
  'PRO',
  'ATIVO',
  10,
  500,
  1,
  0,
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING
RETURNING "id";

-- 2. Criar usuário ADMIN (ajuste o tenant_id com o ID gerado acima)
-- Hash de bcrypt para senha "admin123"
-- $2a$10$YourGeneratedHashHere

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Buscar tenant_id do Vivoly
  SELECT "id" INTO v_tenant_id FROM "Tenant" WHERE "slug" = 'vivoly' LIMIT 1;

  IF v_tenant_id IS NOT NULL THEN
    -- Criar usuário admin
    INSERT INTO "User" (
      "id",
      "tenant_id",
      "nome",
      "email",
      "senha_hash",
      "tipo",
      "ativo",
      "status_conta",
      "primeiro_acesso",
      "created_at",
      "updated_at"
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      'Administrador Vivoly',
      'admin@vivoly.com',
      '$2a$10$YW5vdGhlcmhhc2hlZHBhc3N3b3JkYmNyeXB0aGFzaA==', -- admin123
      'ADMIN',
      true,
      'ATIVO',
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT ("tenant_id", "email") DO NOTHING;

    RAISE NOTICE 'Tenant e Admin criados com sucesso!';
    RAISE NOTICE 'Email: admin@vivoly.com';
    RAISE NOTICE 'Senha: admin123';
  ELSE
    RAISE EXCEPTION 'Tenant Vivoly não encontrado';
  END IF;
END $$;

-- 3. Verificar criação
SELECT
  t."nome" as tenant_nome,
  t."subdominio",
  t."status",
  u."nome" as admin_nome,
  u."email" as admin_email,
  u."tipo" as admin_tipo
FROM "Tenant" t
LEFT JOIN "User" u ON u."tenant_id" = t."id" AND u."tipo" = 'ADMIN'
WHERE t."slug" = 'vivoly';
