-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'GESTOR', 'CORRETOR');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('SITE', 'PORTAL', 'WHATSAPP', 'TELEFONE', 'INDICACAO', 'REDES_SOCIAIS', 'EVENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Temperatura" AS ENUM ('QUENTE', 'MORNO', 'FRIO');

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('FISICA', 'JURIDICA');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('APARTAMENTO', 'CASA', 'TERRENO', 'COMERCIAL', 'RURAL', 'CHACARA', 'SOBRADO', 'COBERTURA', 'LOFT', 'KITNET');

-- CreateEnum
CREATE TYPE "CategoriaImovel" AS ENUM ('VENDA', 'LOCACAO', 'TEMPORADA');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'INATIVO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StatusNegociacao" AS ENUM ('CONTATO', 'VISITA_AGENDADA', 'VISITA_REALIZADA', 'PROPOSTA', 'ANALISE_CREDITO', 'CONTRATO', 'FECHADO', 'PERDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PortalIntegracao" AS ENUM ('ZAP_IMOVEIS', 'VIVA_REAL', 'OLX', 'IMOVELWEB', 'CHAVES_NA_MAO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatusIntegracao" AS ENUM ('ATIVO', 'INATIVO', 'ERRO', 'MANUTENCAO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo" "UserType" NOT NULL DEFAULT 'CORRETOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ultimo_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "creci" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "foto_url" TEXT,
    "especializacoes" TEXT[],
    "meta_mensal" DECIMAL(10,2),
    "meta_anual" DECIMAL(10,2),
    "comissao_padrao" DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    "performance_score" INTEGER NOT NULL DEFAULT 0,
    "disponibilidade" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corretores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "origem" "OrigemLead" NOT NULL,
    "temperatura" "Temperatura" NOT NULL DEFAULT 'FRIO',
    "score" INTEGER NOT NULL DEFAULT 0,
    "interesse" JSONB NOT NULL,
    "observacoes" TEXT,
    "timeline" JSONB[],
    "corretor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ultimo_contato" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proprietarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "tipo_pessoa" "TipoPessoa" NOT NULL DEFAULT 'FISICA',
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "telefone_secundario" TEXT,
    "contato" JSONB,
    "forma_pagamento" TEXT NOT NULL DEFAULT 'PIX',
    "percentual_comissao" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "banco" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proprietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoImovel" NOT NULL,
    "categoria" "CategoriaImovel" NOT NULL,
    "status" "StatusImovel" NOT NULL DEFAULT 'DISPONIVEL',
    "endereco" JSONB NOT NULL,
    "caracteristicas" JSONB NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "diferenciais" TEXT[],
    "fotos" TEXT[],
    "video_url" TEXT,
    "tour_360_url" TEXT,
    "documentos" TEXT[],
    "preco" DECIMAL(10,2) NOT NULL,
    "condominio" DECIMAL(10,2),
    "iptu" DECIMAL(10,2),
    "ultima_validacao" TIMESTAMP(3),
    "validado_por" TEXT,
    "proprietario_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "publicado_em" TIMESTAMP(3),

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negociacoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "corretor_id" TEXT NOT NULL,
    "status" "StatusNegociacao" NOT NULL DEFAULT 'CONTATO',
    "valor_proposta" DECIMAL(10,2),
    "valor_aprovado" DECIMAL(10,2),
    "condicoes" JSONB,
    "comissoes" JSONB[],
    "valor_comissao" DECIMAL(10,2),
    "documentos" TEXT[],
    "contrato_url" TEXT,
    "timeline" JSONB[],
    "data_proposta" TIMESTAMP(3),
    "data_contrato" TIMESTAMP(3),
    "data_fechamento" TIMESTAMP(3),
    "motivo_perda" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negociacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integracoes" (
    "id" TEXT NOT NULL,
    "portal" "PortalIntegracao" NOT NULL,
    "status" "StatusIntegracao" NOT NULL DEFAULT 'INATIVO',
    "configuracao" JSONB NOT NULL,
    "ultima_sync" TIMESTAMP(3),
    "proxima_sync" TIMESTAMP(3),
    "intervalo_sync" INTEGER NOT NULL DEFAULT 60,
    "logs" JSONB[],
    "total_sucesso" INTEGER NOT NULL DEFAULT 0,
    "total_erro" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "trigger" TEXT NOT NULL,
    "condicoes" JSONB[],
    "acoes" JSONB[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "execucoes" JSONB[],
    "total_execucoes" INTEGER NOT NULL DEFAULT 0,
    "ultima_execucao" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_user_id_key" ON "corretores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_creci_key" ON "corretores"("creci");

-- CreateIndex
CREATE INDEX "leads_corretor_id_idx" ON "leads"("corretor_id");

-- CreateIndex
CREATE INDEX "leads_origem_idx" ON "leads"("origem");

-- CreateIndex
CREATE INDEX "leads_temperatura_idx" ON "leads"("temperatura");

-- CreateIndex
CREATE INDEX "leads_score_idx" ON "leads"("score");

-- CreateIndex
CREATE UNIQUE INDEX "proprietarios_cpf_cnpj_key" ON "proprietarios"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "imoveis_codigo_key" ON "imoveis"("codigo");

-- CreateIndex
CREATE INDEX "imoveis_tipo_idx" ON "imoveis"("tipo");

-- CreateIndex
CREATE INDEX "imoveis_categoria_idx" ON "imoveis"("categoria");

-- CreateIndex
CREATE INDEX "imoveis_status_idx" ON "imoveis"("status");

-- CreateIndex
CREATE INDEX "imoveis_proprietario_id_idx" ON "imoveis"("proprietario_id");

-- CreateIndex
CREATE UNIQUE INDEX "negociacoes_codigo_key" ON "negociacoes"("codigo");

-- CreateIndex
CREATE INDEX "negociacoes_lead_id_idx" ON "negociacoes"("lead_id");

-- CreateIndex
CREATE INDEX "negociacoes_imovel_id_idx" ON "negociacoes"("imovel_id");

-- CreateIndex
CREATE INDEX "negociacoes_corretor_id_idx" ON "negociacoes"("corretor_id");

-- CreateIndex
CREATE INDEX "negociacoes_status_idx" ON "negociacoes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "integracoes_portal_key" ON "integracoes"("portal");

-- AddForeignKey
ALTER TABLE "corretores" ADD CONSTRAINT "corretores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_corretor_id_fkey" FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_corretor_id_fkey" FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
