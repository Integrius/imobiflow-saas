#!/bin/bash
# =============================================================================
# Assistente Validador de Mudanças - ImobiFlow/Integrius
# =============================================================================
# Este script é executado automaticamente como git pre-commit hook.
# Verifica se mudanças significativas no código incluem atualização do CLAUDE.md.
#
# Instalação: cp scripts/validate-changes.sh .git/hooks/pre-commit
# Ou: ln -sf ../../scripts/validate-changes.sh .git/hooks/pre-commit
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Arquivos staged para commit
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Verificar se CLAUDE.md está entre os arquivos modificados
CLAUDE_MD_CHANGED=false
if echo "$STAGED_FILES" | grep -q "^CLAUDE.md$"; then
  CLAUDE_MD_CHANGED=true
fi

# Padrões de arquivos que exigem documentação no CLAUDE.md
SIGNIFICANT_PATTERNS=(
  # Novas rotas/endpoints
  "apps/api/src/modules/.*/.*\.routes\.ts"
  "apps/api/src/modules/.*/.*\.controller\.ts"
  "apps/api/src/modules/.*/.*\.service\.ts"
  # Schema do banco de dados
  "apps/api/prisma/schema\.prisma"
  # Configurações de infraestrutura
  "apps/api/src/server\.ts"
  "apps/web/middleware\.ts"
  "apps/web/next\.config"
  # Novas páginas
  "apps/web/app/.*/page\.tsx"
  # Configurações
  "apps/web/config/.*"
  "apps/api/prisma\.config"
  # Variáveis de ambiente
  "\.env"
)

# Contar mudanças significativas
SIGNIFICANT_CHANGES=0
SIGNIFICANT_FILES=""

for file in $STAGED_FILES; do
  for pattern in "${SIGNIFICANT_PATTERNS[@]}"; do
    if echo "$file" | grep -qE "$pattern"; then
      SIGNIFICANT_CHANGES=$((SIGNIFICANT_CHANGES + 1))
      SIGNIFICANT_FILES="$SIGNIFICANT_FILES\n  - $file"
      break
    fi
  done
done

# Contar total de arquivos de código modificados (excluindo assets, configs menores)
CODE_FILES=$(echo "$STAGED_FILES" | grep -cE '\.(ts|tsx|js|jsx|prisma)$' || true)

# =============================================================================
# Decisão
# =============================================================================

# Se há mudanças significativas mas CLAUDE.md não foi atualizado
if [ "$SIGNIFICANT_CHANGES" -gt 0 ] && [ "$CLAUDE_MD_CHANGED" = false ]; then
  echo ""
  echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║  ⚠️  ASSISTENTE VALIDADOR DE MUDANÇAS - AVISO              ║${NC}"
  echo -e "${YELLOW}╠══════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  Mudanças significativas detectadas SEM atualização do       ║${NC}"
  echo -e "${YELLOW}║  CLAUDE.md!                                                  ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${CYAN}Arquivos significativos modificados ($SIGNIFICANT_CHANGES):${NC}"
  echo -e "$SIGNIFICANT_FILES"
  echo ""
  echo -e "${RED}CLAUDE.md é a fonte de verdade do projeto.${NC}"
  echo -e "${RED}Documente as mudanças antes de commitar.${NC}"
  echo ""
  echo -e "${YELLOW}Para bypass (apenas casos excepcionais): git commit --no-verify${NC}"
  echo ""
  exit 1
fi

# Se muitos arquivos de código foram modificados (>5) sem documentação
if [ "$CODE_FILES" -gt 5 ] && [ "$CLAUDE_MD_CHANGED" = false ]; then
  echo ""
  echo -e "${YELLOW}⚠️  $CODE_FILES arquivos de código modificados sem atualizar CLAUDE.md${NC}"
  echo -e "${YELLOW}   Considere documentar essas mudanças.${NC}"
  echo -e "${YELLOW}   (Este é apenas um aviso - o commit será permitido)${NC}"
  echo ""
  # Aviso não-bloqueante para mudanças menores
fi

# Se CLAUDE.md foi atualizado, dar feedback positivo
if [ "$CLAUDE_MD_CHANGED" = true ]; then
  echo -e "${GREEN}✅ CLAUDE.md atualizado - documentação em dia!${NC}"
fi

exit 0
