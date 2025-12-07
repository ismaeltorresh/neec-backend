# Guía de Seguridad

## 🔐 Configuración de Secrets y Variables de Entorno

### Variables de Entorno Requeridas

Este proyecto utiliza variables de entorno para gestionar información sensible y configuración. **NUNCA** commitees el archivo `.env` al repositorio.

### Configuración Inicial

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Completa las variables requeridas en `.env`:

#### Base de Datos (OBLIGATORIO)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña_segura  # ⚠️ CRÍTICO: Usa contraseña fuerte
DB_NAME=neec_dev
```

#### Auth0 (si OAUTH=true)
```env
OAUTH=true
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://tu-tenant.auth0.com/
```

#### Sentry (si SENTRY=true)
```env
SENTRY=true
SENTRY_DSN=https://tu-dsn@sentry.io/proyecto
SENTRY_TRACES_SAMPLE_RATE=0.05
SENTRY_PROFILES_SAMPLE_RATE=0.01
```

#### Documentación (solo producción)
```env
DOCS_TOKEN=genera_un_token_aleatorio_seguro
```

### 🚨 Secrets Críticos

Los siguientes valores **NUNCA** deben estar hardcodeados en el código:

- ✅ `DB_PASSWORD`: Contraseña de base de datos
- ✅ `SENTRY_DSN`: DSN de Sentry
- ✅ `DOCS_TOKEN`: Token de acceso a documentación
- ✅ Cualquier API key o token de servicios externos

### 🔒 Mejores Prácticas

#### 1. Rotación de Secrets
- Cambia las contraseñas periódicamente
- Regenera tokens después de exposure
- Mantén un registro de cambios de secrets (sin los valores)

#### 2. Generación de Tokens Seguros
```bash
# Generar token aleatorio seguro (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# O usando OpenSSL
openssl rand -hex 32
```

#### 3. Validación de Variables
El servidor valida automáticamente las variables críticas al inicio:
- `DB_PASSWORD`: Requerida siempre
- `DB_USER`, `DB_NAME`: Requeridas en producción
- `SENTRY_DSN`: Requerida si `SENTRY=true`

#### 4. Entornos Separados
Usa archivos `.env` diferentes por entorno:
```
.env.development
.env.test
.env.production
```

Configura tu deployment para cargar el correcto.

### 📋 Checklist de Seguridad

Antes de deployar a producción:

- [ ] `.env` está en `.gitignore`
- [ ] No hay secrets hardcodeados en el código
- [ ] Variables de producción configuradas en el servidor
- [ ] `DB_PASSWORD` es una contraseña fuerte (16+ caracteres)
- [ ] `DOCS_TOKEN` es aleatorio y complejo
- [ ] OAuth configurado correctamente (si aplica)
- [ ] Sentry DSN configurado (si aplica)
- [ ] Headers de seguridad habilitados (Helmet)
- [ ] HTTPS configurado en el servidor
- [ ] CORS configurado con whitelist apropiado

### 🔍 Auditoría

Para verificar que no hay secrets expuestos:

```bash
# Buscar posibles secrets en el código
grep -r "password.*=.*['\"]" --include="*.js" .
grep -r "token.*=.*['\"]" --include="*.js" .
grep -r "secret.*=.*['\"]" --include="*.js" .

# Verificar que .env no está trackeado
git check-ignore .env
```

### 🆘 En Caso de Exposición

Si accidentalmente committeas un secret:

1. **Inmediatamente** rota/regenera el secret expuesto
2. Elimina el commit del historial (git rebase/filter-branch)
3. Fuerza push (si es un repo privado pequeño)
4. Notifica al equipo
5. Revisa logs por accesos no autorizados

### 📚 Referencias

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [CIS Controls](https://www.cisecurity.org/controls)

### 🔗 Herramientas Recomendadas

- **git-secrets**: Previene commits de secrets
- **truffleHog**: Escanea repos por secrets
- **dotenv-vault**: Gestión segura de .env
- **1Password/Bitwarden**: Gestores de contraseñas para el equipo
