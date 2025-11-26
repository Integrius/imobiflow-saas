# Configuração do Banco de Dados PostgreSQL

Este guia explica como configurar o banco de dados PostgreSQL para o ImobiFlow.

## Pré-requisitos

- PostgreSQL 16 ou superior instalado
- acesso ao terminal/linha de comando

## Instalação do PostgreSQL

### Ubuntu/Debian (WSL)

```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar o serviço
sudo service postgresql start

# Verificar status
sudo service postgresql status
```

### macOS (com Homebrew)

```bash
# Instalar PostgreSQL
brew install postgresql@16

# Iniciar o serviço
brew services start postgresql@16
```

### Windows

1. Baixe o instalador em: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Anote a senha do usuário postgres

## Configuração do Banco de Dados

### 1. Criar usuário e banco de dados

```bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# Dentro do psql, executar:
CREATE DATABASE imobiflow;
CREATE USER imobiflow WITH ENCRYPTED PASSWORD 'imobiflow123';
GRANT ALL PRIVILEGES ON DATABASE imobiflow TO imobiflow;
GRANT ALL ON SCHEMA public TO imobiflow;

# Sair do psql
\q
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` já está configurado em `apps/api/.env`:

```env
DATABASE_URL="postgresql://imobiflow:imobiflow123@localhost:5432/imobiflow"
```

**IMPORTANTE:** Em produção, altere a senha para algo seguro!

### 3. Executar migrações do Prisma

```bash
# Na raiz do projeto
cd /home/hans/imobiflow

# Gerar cliente Prisma
pnpm --filter=api run prisma:generate

# Executar migrações
pnpm --filter=api run prisma:migrate

# OU, se as migrações não existirem, criar nova migração
pnpm --filter=api run prisma:migrate:dev
```

### 4. (Opcional) Popular banco com dados de teste

```bash
# Executar seed se existir
pnpm --filter=api run prisma:seed
```

## Verificar Conexão

```bash
# Testar conexão com o banco
psql -U imobiflow -d imobiflow -h localhost -p 5432

# Se conectar com sucesso, você verá:
# imobiflow=>

# Listar tabelas
\dt

# Sair
\q
```

## Comandos Úteis do Prisma

```bash
# Abrir Prisma Studio (interface visual)
pnpm --filter=api run prisma:studio

# Ver status das migrações
pnpm --filter=api run prisma:migrate:status

# Resetar banco de dados (CUIDADO: apaga todos os dados!)
pnpm --filter=api run prisma:migrate:reset

# Criar nova migração
pnpm --filter=api run prisma:migrate:dev --name nome-da-migracao
```

## Estrutura do Banco

O schema do Prisma define as seguintes tabelas principais:

- **users**: Usuários do sistema (admin, gestor, corretor)
- **corretores**: Dados dos corretores imobiliários
- **leads**: Leads e potenciais clientes
- **imoveis**: Catálogo de imóveis
- **proprietarios**: Proprietários dos imóveis
- **negociacoes**: Pipeline de negociações/vendas
- **contratos**: Contratos formalizados
- **visitas**: Agendamento e histórico de visitas

## Troubleshooting

### Erro: "role 'imobiflow' does not exist"

```bash
sudo -u postgres psql
CREATE USER imobiflow WITH ENCRYPTED PASSWORD 'imobiflow123';
\q
```

### Erro: "database 'imobiflow' does not exist"

```bash
sudo -u postgres psql
CREATE DATABASE imobiflow;
GRANT ALL PRIVILEGES ON DATABASE imobiflow TO imobiflow;
\q
```

### Erro: "password authentication failed"

Verifique se a senha no `.env` está correta e corresponde à senha definida no PostgreSQL.

### Serviço PostgreSQL não inicia (WSL)

```bash
# Reiniciar serviço
sudo service postgresql restart

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Backup e Restore

### Fazer backup

```bash
pg_dump -U imobiflow -d imobiflow -h localhost > backup_$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
psql -U imobiflow -d imobiflow -h localhost < backup_20241126.sql
```

## Produção

Para ambiente de produção:

1. **Altere a senha do banco de dados**
2. Use serviços gerenciados como:
   - Supabase (PostgreSQL gerenciado)
   - Railway
   - Neon
   - Amazon RDS
   - Google Cloud SQL

3. Configure SSL para conexão:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

4. Configure backups automáticos
5. Monitore performance e logs
