#!/bin/bash

# Script de configuração do banco de dados PostgreSQL para ImobiFlow
# Este script configura o banco de dados, executa migrações e popula dados de teste

set -e  # Parar em caso de erro

echo "=========================================="
echo "  ImobiFlow - Setup do Banco de Dados"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL não está instalado${NC}"
    echo ""
    echo "Por favor, instale o PostgreSQL antes de continuar:"
    echo ""
    echo "  Ubuntu/Debian (WSL):"
    echo "    sudo apt update"
    echo "    sudo apt install postgresql postgresql-contrib"
    echo "    sudo service postgresql start"
    echo ""
    echo "  macOS:"
    echo "    brew install postgresql@16"
    echo "    brew services start postgresql@16"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} PostgreSQL está instalado"

# Verificar se o serviço está rodando
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠${NC}  Serviço PostgreSQL não está rodando"
    echo "Tentando iniciar..."

    if command -v brew &> /dev/null; then
        # macOS
        brew services start postgresql@16
    else
        # Linux/WSL
        sudo service postgresql start
    fi

    sleep 2

    if ! pg_isready -q; then
        echo -e "${RED}❌ Não foi possível iniciar o PostgreSQL${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Serviço PostgreSQL está rodando"

# Verificar se o banco já existe
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='imobiflow'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠${NC}  Banco de dados 'imobiflow' já existe"
    read -p "Deseja recriar o banco (ATENÇÃO: todos os dados serão perdidos)? [s/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "Recriando banco de dados..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS imobiflow;"
        sudo -u postgres psql -c "CREATE DATABASE imobiflow;"
        echo -e "${GREEN}✓${NC} Banco de dados recriado"
    fi
else
    echo "Criando banco de dados 'imobiflow'..."
    sudo -u postgres psql -c "CREATE DATABASE imobiflow;" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Banco de dados criado"
fi

# Verificar se o usuário já existe
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='imobiflow'" 2>/dev/null || echo "")

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${GREEN}✓${NC} Usuário 'imobiflow' já existe"
else
    echo "Criando usuário 'imobiflow'..."
    sudo -u postgres psql -c "CREATE USER imobiflow WITH ENCRYPTED PASSWORD 'imobiflow123';" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Usuário criado"
fi

# Conceder permissões
echo "Configurando permissões..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE imobiflow TO imobiflow;" 2>/dev/null || true
sudo -u postgres psql -d imobiflow -c "GRANT ALL ON SCHEMA public TO imobiflow;" 2>/dev/null || true
sudo -u postgres psql -d imobiflow -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO imobiflow;" 2>/dev/null || true
sudo -u postgres psql -d imobiflow -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO imobiflow;" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Permissões configuradas"

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto ImobiFlow${NC}"
    exit 1
fi

# Gerar Prisma Client
echo ""
echo "Gerando Prisma Client..."
cd apps/api
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma Client gerado"

# Executar migrações
echo ""
echo "Executando migrações do banco de dados..."
npx prisma migrate deploy
echo -e "${GREEN}✓${NC} Migrações executadas"

# Perguntar se deseja popular com dados de teste
echo ""
read -p "Deseja popular o banco com dados de teste? [s/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    if [ -f "prisma/seed.ts" ]; then
        echo "Populando banco de dados..."
        npx prisma db seed
        echo -e "${GREEN}✓${NC} Dados de teste inseridos"
    else
        echo -e "${YELLOW}⚠${NC}  Arquivo de seed não encontrado"
    fi
fi

# Testar conexão
echo ""
echo "Testando conexão com o banco..."
if PGPASSWORD=imobiflow123 psql -U imobiflow -d imobiflow -h localhost -p 5432 -c "\dt" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Conexão bem-sucedida!"
else
    echo -e "${RED}❌ Erro ao conectar ao banco${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "  1. Iniciar o backend:"
echo "     cd apps/api"
echo "     pnpm run dev"
echo ""
echo "  2. Acessar Prisma Studio (interface visual):"
echo "     cd apps/api"
echo "     pnpm run db:studio"
echo ""
echo "Informações de conexão:"
echo "  Host:     localhost"
echo "  Porta:    5432"
echo "  Banco:    imobiflow"
echo "  Usuário:  imobiflow"
echo "  Senha:    imobiflow123"
echo ""
echo "DATABASE_URL:"
echo "  postgresql://imobiflow:imobiflow123@localhost:5432/imobiflow"
echo ""
