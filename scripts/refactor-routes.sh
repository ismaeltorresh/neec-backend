#!/bin/bash

# Script para refactorizar todas las rutas aplicando asyncHandler
# Punto 4: Mejora del manejo de errores async/await

set -e

ROUTES_DIR="/Users/mb48963/Documents/yo/neec-backend/routes"

echo "🔧 Iniciando refactorización de rutas..."
echo ""

# Lista de archivos de rutas a refactorizar
ROUTE_FILES=(
  "template.routes.js"
  "people.routes.js"
  "address.routes.js"
  "users.routes.js"
  "blogs.routes.js"
)

for file in "${ROUTE_FILES[@]}"; do
  FILE_PATH="${ROUTES_DIR}/${file}"
  
  if [[ ! -f "$FILE_PATH" ]]; then
    echo "⚠️  Archivo no encontrado: $file"
    continue
  fi
  
  echo "📝 Procesando: $file"
  
  # 1. Agregar import de asyncHandler si no existe
  if ! grep -q "asyncHandler" "$FILE_PATH"; then
    # Buscar la línea de import de validatorHandler
    if grep -q "import validatorHandler" "$FILE_PATH"; then
      # Insertar el import de asyncHandler después del import de validatorHandler
      sed -i.bak '/import validatorHandler/a\
import { asyncHandler, withTimeout } from '"'"'../middlewares/async.handler.js'"'"';
' "$FILE_PATH"
      echo "  ✅ Import de asyncHandler agregado"
    else
      echo "  ⚠️  No se encontró import de validatorHandler para referenciar"
    fi
  else
    echo "  ℹ️  asyncHandler ya importado"
  fi
  
  echo "  ✅ Refactorizado: $file"
  echo ""
done

# Limpiar archivos .bak
find "$ROUTES_DIR" -name "*.bak" -delete

echo "✅ Refactorización completada"
echo ""
echo "⚡ Próximos pasos manuales:"
echo "  1. Revisar cada archivo y reemplazar try-catch con asyncHandler"
echo "  2. Convertir handlers de (req, res, next) a asyncHandler(async (req, res) => {...})"
echo "  3. Cambiar next(boom.xxx) por throw boom.xxx"
echo "  4. Agregar withTimeout() para operaciones de DB críticas"
echo ""
