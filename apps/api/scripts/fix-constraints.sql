-- Fix: Remover constraints antigas que não foram removidas pela migration

-- Users: remover constraint global de email
DROP INDEX IF EXISTS users_email_key;

-- Corretores: remover constraint global de creci
DROP INDEX IF EXISTS corretores_creci_key;

-- Proprietarios: remover constraint global de cpf_cnpj
DROP INDEX IF EXISTS proprietarios_cpf_cnpj_key;

-- Imoveis: remover constraint global de codigo
DROP INDEX IF EXISTS imoveis_codigo_key;

-- Negociacoes: remover constraint global de codigo
DROP INDEX IF EXISTS negociacoes_codigo_key;

-- Verificar resultado
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'corretores', 'proprietarios', 'imoveis', 'negociacoes')
  AND indexdef LIKE '%UNIQUE%'
ORDER BY tablename, indexname;
