#!/bin/bash

# Script de auditoría de seguridad para NEEC Backend
# Verifica que no haya secrets hardcodeados en el código

set -e

echo "🔍 Auditoría de Seguridad - NEEC Backend"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Verificar que .env está en .gitignore
echo "1. Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env está en .gitignore${NC}"
else
    echo -e "${RED}❌ .env NO está en .gitignore${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar que no hay DSN de Sentry hardcodeado
echo ""
echo "2. Verificando Sentry DSN..."
if grep -r "dsn.*:.*['\"]https://.*@.*sentry\.io" --include="*.js" --exclude-dir=node_modules . 2>/dev/null; then
    echo -e "${RED}❌ DSN de Sentry hardcodeado encontrado${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No se encontró DSN hardcodeado${NC}"
fi

# 3. Verificar que no hay contraseñas hardcodeadas
echo ""
echo "3. Verificando contraseñas hardcodeadas..."
PASSWORDS=$(grep -r "password.*=.*['\"][a-zA-Z0-9]" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v "process.env" | grep -v "DB_PASSWORD" | grep -v ".test.js" || true)
if [ -n "$PASSWORDS" ]; then
    echo -e "${YELLOW}⚠️  Posibles contraseñas encontradas:${NC}"
    echo "$PASSWORDS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No se encontraron contraseñas hardcodeadas${NC}"
fi

# 4. Verificar que no hay tokens hardcodeados
echo ""
echo "4. Verificando tokens hardcodeados..."
TOKENS=$(grep -r "token.*=.*['\"][a-zA-Z0-9]{20,}" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v "process.env" | grep -v ".test.js" || true)
if [ -n "$TOKENS" ]; then
    echo -e "${YELLOW}⚠️  Posibles tokens encontrados:${NC}"
    echo "$TOKENS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No se encontraron tokens hardcodeados${NC}"
fi

# 5. Verificar que .env.example existe
echo ""
echo "5. Verificando .env.example..."
if [ -f .env.example ]; then
    echo -e "${GREEN}✅ .env.example existe${NC}"
else
    echo -e "${RED}❌ .env.example NO existe${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar que las variables críticas están en .env.example
echo ""
echo "6. Verificando variables críticas en .env.example..."
REQUIRED_VARS=("DB_PASSWORD" "SENTRY_DSN" "AUDIENCE" "ISSUER_BASE_URL")
for VAR in "${REQUIRED_VARS[@]}"; do
    if grep -q "$VAR" .env.example 2>/dev/null; then
        echo -e "${GREEN}✅ $VAR documentado${NC}"
    else
        echo -e "${YELLOW}⚠️  $VAR no está documentado${NC}"
    fi
done

# 7. Verificar que process.env se usa correctamente
echo ""
echo "7. Verificando uso de process.env..."
ENV_USAGE=$(grep -r "process\.env\." --include="*.js" --exclude-dir=node_modules . 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}✅ process.env usado $ENV_USAGE veces${NC}"

# 8. Verificar que no hay API keys expuestas
echo ""
echo "8. Verificando API keys..."
API_KEYS=$(grep -rE "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v "process.env" || true)
if [ -n "$API_KEYS" ]; then
    echo -e "${RED}❌ Posibles API keys encontradas:${NC}"
    echo "$API_KEYS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No se encontraron API keys hardcodeadas${NC}"
fi

# 9. Verificar archivos .env no commiteados
echo ""
echo "9. Verificando archivos .env en Git..."
ENV_FILES=$(git ls-files | grep "^\.env$" || true)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ Archivos .env encontrados en Git:${NC}"
    echo "$ENV_FILES"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hay archivos .env en Git${NC}"
fi

# 10. Verificar helmet configurado
echo ""
echo "10. Verificando Helmet..."
if grep -q "helmet()" index.js 2>/dev/null; then
    echo -e "${GREEN}✅ Helmet configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Helmet no encontrado en index.js${NC}"
fi

# Resumen
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Auditoría completada sin errores críticos${NC}"
    exit 0
else
    echo -e "${RED}❌ Auditoría completada con $ERRORS error(es)${NC}"
    exit 1
fi
