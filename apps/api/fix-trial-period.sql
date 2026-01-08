-- Script para corrigir período trial de 30 para 14 dias
-- Atualiza apenas tenants em status TRIAL que ainda não expiraram

UPDATE "Tenant"
SET 
  data_expiracao = created_at + INTERVAL '14 days'
WHERE 
  status = 'TRIAL'
  AND data_expiracao > NOW()
  AND data_expiracao IS NOT NULL;

-- Mostrar resultado
SELECT 
  id,
  nome,
  slug,
  status,
  created_at,
  data_expiracao,
  EXTRACT(DAY FROM (data_expiracao - NOW())) as dias_restantes
FROM "Tenant"
WHERE status = 'TRIAL'
ORDER BY data_expiracao ASC;
