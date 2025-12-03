-- CreateEnum
CREATE TYPE "PlanoTenant" AS ENUM ('BASICO', 'PRO', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatusTenant" AS ENUM ('TRIAL', 'ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Periodicidade" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('PENDENTE', 'ATIVA', 'CANCELADA', 'SUSPENSA', 'VENCIDA');

-- CreateTable: Tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subdominio" TEXT,
    "dominio_custom" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "logo_url" TEXT,
    "cores_tema" JSONB,
    "configuracoes" JSONB,
    "plano" "PlanoTenant" NOT NULL DEFAULT 'BASICO',
    "status" "StatusTenant" NOT NULL DEFAULT 'TRIAL',
    "data_expiracao" TIMESTAMP(3),
    "limite_usuarios" INTEGER NOT NULL DEFAULT 3,
    "limite_imoveis" INTEGER NOT NULL DEFAULT 100,
    "limite_storage_mb" INTEGER NOT NULL DEFAULT 1000,
    "total_usuarios" INTEGER NOT NULL DEFAULT 0,
    "total_imoveis" INTEGER NOT NULL DEFAULT 0,
    "storage_usado_mb" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Assinaturas
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plano" "PlanoTenant" NOT NULL,
    "valor_mensal" DECIMAL(10,2) NOT NULL,
    "valor_anual" DECIMAL(10,2),
    "periodicidade" "Periodicidade" NOT NULL DEFAULT 'MENSAL',
    "status" "StatusAssinatura" NOT NULL DEFAULT 'PENDENTE',
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "proxima_cobranca" TIMESTAMP(3),
    "gateway" TEXT,
    "gateway_id" TEXT,
    "metodo_pagamento" TEXT,
    "historico" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- Drop existing unique constraints (IF EXISTS para evitar erros)
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "corretores" DROP CONSTRAINT IF EXISTS "corretores_creci_key";
ALTER TABLE "proprietarios" DROP CONSTRAINT IF EXISTS "proprietarios_cpf_cnpj_key";
ALTER TABLE "imoveis" DROP CONSTRAINT IF EXISTS "imoveis_codigo_key";
ALTER TABLE "negociacoes" DROP CONSTRAINT IF EXISTS "negociacoes_codigo_key";
ALTER TABLE "integracoes" DROP CONSTRAINT IF EXISTS "integracoes_portal_key";

-- Add tenant_id to existing tables
ALTER TABLE "users" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "corretores" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "leads" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "proprietarios" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "imoveis" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "negociacoes" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "integracoes" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "automacoes" ADD COLUMN "tenant_id" TEXT;

-- Create a default tenant for existing data
INSERT INTO "tenants" ("id", "nome", "slug", "email", "plano", "status", "created_at", "updated_at")
VALUES ('default-tenant-id', 'Tenant Padrão', 'default', 'admin@imobiflow.com', 'ENTERPRISE', 'ATIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update existing records to use default tenant
UPDATE "users" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "corretores" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "leads" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "proprietarios" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "imoveis" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "negociacoes" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "integracoes" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;
UPDATE "automacoes" SET "tenant_id" = 'default-tenant-id' WHERE "tenant_id" IS NULL;

-- Make tenant_id NOT NULL
ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "corretores" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "leads" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "proprietarios" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "imoveis" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "negociacoes" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "integracoes" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "automacoes" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Add Foreign Key Constraints
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corretores" ADD CONSTRAINT "corretores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "proprietarios" ADD CONSTRAINT "proprietarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "integracoes" ADD CONSTRAINT "integracoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automacoes" ADD CONSTRAINT "automacoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique indexes with tenant_id
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_subdominio_key" ON "tenants"("subdominio");
CREATE UNIQUE INDEX "tenants_dominio_custom_key" ON "tenants"("dominio_custom");
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");
CREATE UNIQUE INDEX "corretores_tenant_id_creci_key" ON "corretores"("tenant_id", "creci");
CREATE UNIQUE INDEX "proprietarios_tenant_id_cpf_cnpj_key" ON "proprietarios"("tenant_id", "cpf_cnpj");
CREATE UNIQUE INDEX "imoveis_tenant_id_codigo_key" ON "imoveis"("tenant_id", "codigo");
CREATE UNIQUE INDEX "negociacoes_tenant_id_codigo_key" ON "negociacoes"("tenant_id", "codigo");
CREATE UNIQUE INDEX "integracoes_tenant_id_portal_key" ON "integracoes"("tenant_id", "portal");

-- Create indexes for performance
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "tenants_plano_idx" ON "tenants"("plano");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");
CREATE INDEX "assinaturas_tenant_id_idx" ON "assinaturas"("tenant_id");
CREATE INDEX "assinaturas_status_idx" ON "assinaturas"("status");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "corretores_tenant_id_idx" ON "corretores"("tenant_id");
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");
CREATE INDEX "proprietarios_tenant_id_idx" ON "proprietarios"("tenant_id");
CREATE INDEX "imoveis_tenant_id_idx" ON "imoveis"("tenant_id");
CREATE INDEX "negociacoes_tenant_id_idx" ON "negociacoes"("tenant_id");
CREATE INDEX "integracoes_tenant_id_idx" ON "integracoes"("tenant_id");
CREATE INDEX "automacoes_tenant_id_idx" ON "automacoes"("tenant_id");
