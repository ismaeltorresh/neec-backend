# NEEC Backend

> Backend API REST para la aplicación NEEC construido con Node.js, Express.js y MariaDB/MySQL

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![ES Modules](https://img.shields.io/badge/ES-Modules-F7DF1E?logo=javascript&logoColor=black)](https://nodejs.org/api/esm.html)
[![Tests](https://img.shields.io/badge/Tests-12%2F12_passing-success?logo=jest)](https://jestjs.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> **✨ Últimas mejoras:** Sistema de logging centralizado, validación segura con `parseIntSafe`, async error handling con 12 tests, y ES Modules migration completa.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints API](#-endpoints-api)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Generador de Servicios](#-generador-de-servicios)
- [Documentación API](#-documentación-api)
- [Logging y Utilidades](#-logging-y-utilidades)
- [Monitoreo y Observabilidad](#-monitoreo-y-observabilidad)
- [Mejoras Recientes](#-mejoras-recientes-diciembre-2025)
- [Contribución](#-contribución)

---

## 📖 Descripción

NEEC Backend es una API REST construida siguiendo los principios de **arquitectura en capas** (Layered Architecture), diseñada para proporcionar servicios seguros, escalables y de alto rendimiento. El proyecto implementa las mejores prácticas de la industria basadas en estándares OWASP, CIS y NIST.

### Características Principales

- ✅ **Arquitectura en Capas**: Separación clara entre Routes, Controllers, Services y Repositories
- ✅ **Validación Robusta**: Validación de entrada con Joi + utilidades de parsing seguro
- ✅ **Logging Centralizado**: Sistema de logging estructurado con 6 niveles (info, warn, error, debug, db, perf)
- ✅ **Async/Await Error Handling**: Middleware asyncHandler, withTimeout, withRetry con 12 tests
- ✅ **Seguridad Hardening**: Helmet, CORS, sanitización de inputs, gestión segura de errores
- ✅ **Autenticación OAuth 2.0**: Integración con Auth0 (JWT Bearer tokens)
- ✅ **Multi-DataSource**: Soporte para SQL, NoSQL, mock y fake data
- ✅ **Paginación Avanzada**: Sistema de paginación con filtros, búsqueda y ordenamiento
- ✅ **Monitoreo Sentry**: Tracking de errores y profiling en producción
- ✅ **Testing**: Suite de tests con Jest y Supertest
- ✅ **Documentación OpenAPI**: Especificación OpenAPI 3.0+ con Swagger UI
- ✅ **Generador de Servicios**: CLI para scaffold automático de nuevos endpoints

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas** estricta para garantizar la separación de responsabilidades:

```
┌─────────────────────────────────────────┐
│         HTTP Layer (Express)            │
│  ┌──────────────────────────────────┐   │
│  │   Middlewares (Auth, CORS,       │   │
│  │   Helmet, Validation, Error)     │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│      Routes/Controllers Layer           │
│  • Manejo de req/res HTTP               │
│  • Validación de entrada (Joi)          │
│  • Llamada a servicios                  │
│  • Respuestas HTTP estandarizadas       │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         Services Layer                  │
│  • Lógica de negocio pura               │
│  • Agnóstico al protocolo HTTP          │
│  • Orquestación de múltiples repos      │
│  • Manejo de errores tipados (Boom)     │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│      Repository/DAO Layer               │
│  • Abstracción de la capa de datos      │
│  • Queries SQL (Sequelize)              │
│  • Operaciones CRUD                     │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         Database (MariaDB/MySQL)        │
└─────────────────────────────────────────┘
```

### Principios de Diseño

1. **Separation of Concerns**: Cada capa tiene una responsabilidad única y bien definida
2. **Dependency Injection**: Las capas superiores dependen de interfaces, no de implementaciones
3. **Error Boundaries**: Manejo centralizado de errores con @hapi/boom
4. **Input Validation**: Toda entrada de usuario es validada con Joi antes de procesarse
5. **Security by Default**: Helmet, CORS, rate limiting, y sanitización de inputs

---

## 🛠️ Tecnologías

### Core
- **Runtime**: Node.js v20 LTS+
- **Framework**: Express.js 4.19
- **Lenguaje**: JavaScript ES6+ (ESM)

### Base de Datos
- **ORM**: Sequelize 6.37
- **DBMS**: MariaDB / MySQL

### Seguridad
- **Autenticación**: express-oauth2-jwt-bearer (Auth0)
- **Validación**: Joi 17.13
- **Hardening**: Helmet 8.0
- **Error Handling**: @hapi/boom 10.0

### Desarrollo y Testing
- **Testing**: Jest 29.7, Supertest 6.3
- **Linting**: ESLint 9.8 + Prettier
- **Build**: Webpack 5.95
- **Dev Server**: Nodemon 3.1

### Monitoreo
- **APM**: Sentry (Node + Profiling)
- **Logging**: Sistema centralizado con timestamps, contexto JSON y niveles (utils/logger.js)
- **Validation**: Utilidades de parsing seguro (parseIntSafe, validatePagination)

### Documentación
- **Spec**: OpenAPI 3.0 (YAML)
- **UI**: Swagger UI Express 4.6

---

## 📦 Requisitos Previos

- **Node.js**: v20 LTS o superior
- **npm**: v9 o superior
- **MariaDB/MySQL**: 10.x / 8.x
- **Git**: Para clonar el repositorio

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ismaeltorresh/neec-backend.git
cd neec-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales (ver sección [Configuración](#-configuración))

### 4. Configurar la base de datos

Ejecuta el script SQL para crear el esquema:

```bash
# Conecta a tu servidor MariaDB/MySQL y ejecuta:
mysql -u root -p < db/database.sql
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# === APPLICATION ===
NODE_ENV=development           # development | production | test
PORT=8008

# === DATABASE ===
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_seguro
DB_NAME=neec_dev

# === OAUTH 2.0 (Auth0) ===
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://dev-oww130dxq3575ipw.us.auth0.com/

# === SECURITY ===
BODY_LIMIT=100kb              # Límite de payload para prevenir DoS
DOCS_TOKEN=token_secreto      # Token para acceder a /docs en producción

# === SENTRY (Opcional) ===
SENTRY_TRACES_SAMPLE_RATE=0.05    # 5% en producción
SENTRY_PROFILES_SAMPLE_RATE=0.01  # 1% en producción
```

### Configuración por Entorno

El proyecto tiene 3 archivos de configuración en `environments/`:

- `environments.development.js` - Desarrollo local
- `environments.production.js` - Producción
- `environments.test` - Testing

Estos se cargan automáticamente según `NODE_ENV`.

---

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo con hot-reload
npm run dev
```

### Producción

```bash
# Construir bundle optimizado
npm run build

# Iniciar servidor en modo producción
npm start

# O iniciar desde el bundle (webpack)
npm run prod
```

### Testing

```bash
# Ejecutar todos los tests con Jest
npm test
```

### Seguridad

```bash
# Auditoría de seguridad (verifica secrets hardcodeados, .gitignore, etc.)
npm run security:audit
```

### Linting

```bash
# Ejecutar ESLint
npm run lint
```

### Documentación

```bash
# Servir documentación OpenAPI en http://localhost:8080
npm run docs
```

---

## 📁 Estructura del Proyecto

```
neec-backend/
├── config/
│   └── database.js            # Configuración de conexión DB (deprecated)
├── db/
│   ├── connection.js          # Instancia Sequelize + pool config
│   ├── database.sql           # Schema SQL para MariaDB
│   └── sqlSchema.js           # Definición de modelos (opcional)
├── docs/
│   ├── openapi.yaml           # Especificación OpenAPI básica
│   └── openapi-full.yaml      # Especificación OpenAPI completa
├── environments/
│   ├── index.js               # Loader de entornos
│   ├── environments.development.js
│   ├── environments.production.js
│   └── environments.test
├── middlewares/
│   ├── async.handler.js       # Async/await error handling wrapper
│   ├── error.handler.js       # Error handling centralizado
│   ├── perf.handler.js        # Timeout middleware
│   └── validator.handler.js   # Validación con Joi
├── routes/
│   ├── index.js               # Router principal (monta todos los endpoints)
│   ├── products.routes.js     # CRUD de productos
│   ├── people.routes.js       # CRUD de personas
│   ├── address.routes.js      # CRUD de direcciones
│   ├── blogs.routes.js        # CRUD de blogs
│   ├── users.routes.js        # CRUD de usuarios
│   ├── template.routes.js     # Template para nuevos servicios
│   └── *.routes.test.js       # Tests de integración
├── schemas/
│   ├── products.schema.js     # Validación Joi para productos
│   ├── people.schema.js
│   ├── address.schema.js
│   ├── blogs.schema.js
│   ├── users.schema.js
│   └── template.schema.js
├── test/
│   ├── endpoint.test.sh       # Script de testing de endpoints
│   ├── endpointData.test.json
│   ├── fakedata.json          # Datos mock para testing
│   ├── nosqlMock.test.js
│   └── sqlPagination.test.js
├── tools/
│   └── serve-docs.js          # Servidor standalone para docs
├── utils/
│   ├── logger.js              # Sistema de logging centralizado (6 niveles)
│   ├── nosqlMock.js           # Mock de operaciones NoSQL
│   ├── pagination.js          # Utilidades de paginación SQL
│   ├── response.js            # Helpers de respuestas HTTP
│   └── validation.js          # Utilidades de validación segura (parseIntSafe, validatePagination)
├── .editorconfig              # Configuración de editor
├── .env.example               # Template de variables de entorno
├── .eslintrc.json             # Configuración ESLint
├── .gitignore
├── createservice.js           # 🔧 CLI para generar nuevos servicios
├── index.js                   # 🚀 Entry point de la aplicación
├── instrument.js              # Inicialización de Sentry
├── package.json
├── README.md
└── webpack.config.js          # Configuración de build
```

---

## 🌐 Endpoints API

Todos los endpoints están montados bajo el prefijo `/api/v1`.

### Endpoints Disponibles

| Recurso      | Path                  | Descripción              |
|--------------|-----------------------|--------------------------|
| **Root**     | `GET /`               | Welcome message          |
| **Info**     | `GET /api`            | Información de la API    |
| **Docs**     | `GET /docs`           | Swagger UI (OpenAPI)     |
| **Products** | `/api/v1/products`    | CRUD de productos        |
| **People**   | `/api/v1/people`      | CRUD de personas         |
| **Address**  | `/api/v1/address`     | CRUD de direcciones      |
| **Blogs**    | `/api/v1/blogs`       | CRUD de blogs            |
| **Users**    | `/api/v1/users`       | CRUD de usuarios         |
| **Template** | `/api/v1/template`    | Template de referencia   |

### Ejemplo: Products Endpoints

```
GET    /api/v1/products         # Listar productos (paginado)
GET    /api/v1/products/:id     # Obtener un producto
POST   /api/v1/products         # Crear producto
PATCH  /api/v1/products/:id     # Actualizar producto
DELETE /api/v1/products/:id     # Eliminar producto
GET    /api/v1/products/schema  # Ver schema de validación (dev only)
```

### Query Parameters (GET /api/v1/products)

```bash
# Paginación
?page=1&pageSize=10

# Filtros
?brand=Nike&categoryId=123e4567-e89b-12d3-a456-426614174000

# Búsqueda
?q=laptop

# Ordenamiento
?sortBy=price&sortDir=ASC

# DataSource
?dataSource=sql         # sql | nosql | both | fake
?recordStatus=true      # Mostrar solo registros activos
```

### Ejemplo de Respuesta

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "brand": "Nike",
      "code": "NK-AIR-001",
      "sumary": "Nike Air Max 2024",
      "price": 129.99,
      "stock": 50,
      "recordStatus": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:45:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

---

## 🔒 Seguridad

El proyecto implementa múltiples capas de seguridad siguiendo las recomendaciones de **OWASP**, **CIS** y **NIST**:

### 1. Validación y Sanitización (OWASP Top 10)

- ✅ **Input Validation**: Todo input es validado con **Joi** antes de procesarse
- ✅ **SQL Injection Prevention**: Uso de queries parametrizadas (Sequelize)
- ✅ **NoSQL Injection Prevention**: Sanitización de operadores MongoDB (`$gt`, `$ne`, etc.)
- ✅ **Schema Stripping**: Campos desconocidos son eliminados automáticamente

### 2. Autenticación y Autorización

- ✅ **OAuth 2.0**: Integración con Auth0 vía JWT Bearer tokens
- ✅ **JWT Validation**: Validación de firma, audience e issuer
- ✅ **Token Expiration**: Todos los tokens incluyen `exp` (expiration)

### 3. Criptografía (NIST SP 800)

- ✅ **Password Hashing**: Usar `bcrypt` (>=10 rounds) o `Argon2` (implementar en capa de servicio)
- ✅ **Secrets Management**: Variables de entorno vía `.env`, NUNCA hardcodeadas
- ✅ **Strong Algorithms**: JWT con HS256 mínimo, RS256 preferido
- ✅ **Sentry DSN**: Movido a variable de entorno `SENTRY_DSN`
- ✅ **Security Audit**: Script automatizado (`npm run security:audit`)

#### Gestión de Secrets

**CRÍTICO**: Este proyecto maneja información sensible mediante variables de entorno:

```bash
# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

**Variables sensibles requeridas:**
- `DB_PASSWORD`: Contraseña de base de datos
- `SENTRY_DSN`: DSN de Sentry (si `SENTRY=true`)
- `DOCS_TOKEN`: Token de acceso a documentación (producción)

**Ver guía completa**: [`docs/SECURITY.md`](docs/SECURITY.md)

**Auditoría de seguridad:**
```bash
npm run security:audit
```

### 4. Hardening de Express

- ✅ **Helmet**: Configuración de headers de seguridad HTTP
- ✅ **CORS**: Whitelist de origins permitidos
- ✅ **X-Powered-By**: Deshabilitado para evitar información disclosure
- ✅ **Body Limit**: Límite de 100KB en payloads para prevenir DoS
- ✅ **Compression**: Respuestas comprimidas con gzip

### 5. Manejo Seguro de Errores

- ✅ **Error Sanitization**: En producción, NO se expone stack traces
- ✅ **Generic 5xx Messages**: Errores del servidor retornan mensajes genéricos
- ✅ **Structured Logging**: Logs estructurados sin datos sensibles
- ✅ **Sentry Integration**: Tracking de errores 5xx en producción

### 6. Headers HTTP Seguros

Helmet configura automáticamente:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `X-XSS-Protection`

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test products.routes.test.js
```

### Tipos de Tests

1. **Unit Tests**: Test de funciones y utilidades aisladas
2. **Integration Tests**: Test de endpoints completos con Supertest
3. **E2E Tests**: Script bash para testing de endpoints reales

### Ejemplo de Test

```javascript
// routes/products.routes.test.js
const request = require('supertest');
const express = require('express');
const productsRoutes = require('./products.routes');

describe('GET /api/v1/products', () => {
  it('should return paginated products', async () => {
    const response = await request(app)
      .get('/api/v1/products?dataSource=fake&recordStatus=true')
      .expect(200);
    
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta).toHaveProperty('total');
  });
});
```

### Testing E2E con Shell Script

```bash
cd test
sh endpoint.test.sh
```

---

## 🔧 Generador de Servicios

El proyecto incluye un **CLI interactivo** para generar automáticamente nuevos servicios CRUD completos.

### Uso

```bash
node createservice.js
```

El script te pedirá el nombre del servicio (ej: `orders`) y generará:

1. ✅ `schemas/orders.schema.js` - Schema de validación Joi
2. ✅ `routes/orders.routes.js` - Rutas CRUD completas
3. ✅ `routes/orders.routes.test.js` - Tests de integración
4. ✅ Actualiza `routes/index.js` - Monta el nuevo endpoint automáticamente

### Ejemplo

```bash
$ node createservice.js
Ingrese el nombre del servicio: orders
Servicio orders creado exitosamente.
```

Ahora tendrás disponible:
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `POST /api/v1/orders`
- `PATCH /api/v1/orders/:id`
- `DELETE /api/v1/orders/:id`

---

## 📚 Documentación API

### Swagger UI

La documentación interactiva OpenAPI está disponible en:

```
http://localhost:8008/docs
```

**Protección en Producción:**
- En `development`: Acceso libre
- En `production`: Requiere header `X-DOCS-TOKEN` o query param `?docsToken=<token>`

### Alternativa: Servidor Standalone

Si `swagger-ui-express` no está instalado:

```bash
npm run docs
# Abre http://localhost:8080
```

### Archivos de Especificación

- `docs/openapi.yaml` - Especificación básica
- `docs/openapi-full.yaml` - Especificación completa con todos los schemas

---

## 📋 Logging y Utilidades

### Sistema de Logging Centralizado

El proyecto incluye un sistema de logging estructurado en `utils/logger.js` que reemplaza todas las llamadas a `console.log/warn/error` por logging con contexto y niveles.

**Características:**
- ✅ 6 niveles de logging (info, warn, error, debug, db, perf)
- ✅ Timestamps automáticos en formato ISO 8601
- ✅ Contexto JSON estructurado
- ✅ Filtrado por ambiente (debug solo en development)
- ✅ Preparado para integración con APM (Datadog, Loggly)

**Uso:**

```javascript
import logger from './utils/logger.js';

// Información general
logger.info('Server started', { port: 8008, env: 'development' });

// Advertencias
logger.warn('API rate limit approaching', { endpoint: '/api/v1/products', usage: '85%' });

// Errores críticos
logger.error('Database connection failed', {
  message: error.message,
  stack: error.stack,
  host: 'localhost'
});

// Debug (solo development)
logger.debug('Request payload', { body: req.body });

// Operaciones de base de datos
logger.db('Query executed successfully', { table: 'products', rows: 150 });

// Performance y timeouts
logger.perf('Request exceeded timeout', { path: '/api/v1/products', duration: '5200ms' });
```

**Formato de salida:**
```
[2025-12-07T19:56:12.190Z] [ERROR] Database connection failed | {"message":"Connection timeout","host":"localhost"}
```

### Utilidades de Validación

El módulo `utils/validation.js` proporciona funciones de validación y parsing seguro:

#### 1. parseIntSafe(value, defaultValue, min, max)

Parsea números enteros de forma segura con validación de rangos:

```javascript
import { parseIntSafe } from './utils/validation.js';

// Parsing básico
const page = parseIntSafe(req.query.page, 1);  // default: 1

// Con validación de rangos
const pageSize = parseIntSafe(req.query.pageSize, 10, 1, 100);
// Si pageSize < 1 → retorna 1
// Si pageSize > 100 → retorna 100
// Si pageSize es NaN → retorna 10
```

#### 2. validatePagination(inputData)

Wrapper para validar parámetros de paginación:

```javascript
import { validatePagination } from './utils/validation.js';

const { page, pageSize } = validatePagination(req.query);
// page: 1-10000 (default: 1)
// pageSize: 1-100 (default: 10)
```

#### 3. sanitizeString(str, maxLength)

Limpia y trunca strings de forma segura:

```javascript
import { sanitizeString } from './utils/validation.js';

const cleanName = sanitizeString(userInput, 255);
// Elimina espacios, limita longitud a 255 caracteres
```

#### 4. validateEnum(value, allowedValues, defaultValue)

Valida que un valor esté en una lista permitida:

```javascript
import { validateEnum } from './utils/validation.js';

const dataSource = validateEnum(
  req.query.dataSource,
  ['sql', 'nosql', 'both', 'fake'],
  'sql'
);
```

### Async Handler Middleware

El middleware `middlewares/async.handler.js` proporciona 3 utilidades para manejo robusto de operaciones asíncronas:

#### 1. asyncHandler(fn)

Wrapper que elimina la necesidad de try-catch en rutas:

```javascript
import { asyncHandler } from './middlewares/async.handler.js';

router.get('/', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
  // Los errores son capturados automáticamente
}));
```

#### 2. withTimeout(promise, timeout)

Añade timeout a operaciones async:

```javascript
import { withTimeout } from './middlewares/async.handler.js';

const result = await withTimeout(
  slowDatabaseQuery(),
  5000  // timeout en 5 segundos
);
```

#### 3. withRetry(fn, options)

Reintentos automáticos con backoff exponencial:

```javascript
import { withRetry } from './middlewares/async.handler.js';

const data = await withRetry(
  async () => await externalAPICall(),
  { 
    maxRetries: 3,
    initialDelay: 100,
    backoffMultiplier: 2
  }
);
```

**Tests:** 12/12 tests passing en `middlewares/async.handler.test.js`

---

## 📊 Monitoreo y Observabilidad

### Sentry Integration

El proyecto está integrado con **Sentry** para:
- ✅ Error tracking en tiempo real
- ✅ Performance monitoring (APM)
- ✅ Profiling de Node.js
- ✅ Contexto enriquecido (request, user, tags)

**Configuración:**

```javascript
// instrument.js
Sentry.init({
  dsn: "tu_dsn_aqui",
  tracesSampleRate: 0.05,     // 5% en producción
  profilesSampleRate: 0.01,   // 1% en producción
});
```

### Logging Estructurado

Todos los logs utilizan el sistema centralizado `utils/logger.js` con contexto estructurado:

```javascript
// Ejemplo de log de error con contexto
logger.error('Database connection failed', {
  timestamp: '2024-12-01T10:30:00.000Z',
  method: 'GET',
  path: '/api/v1/products',
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  statusCode: 500
});
```

**Ver más:** [Sección Logging y Utilidades](#-logging-y-utilidades)

### Health Check Endpoints

```bash
# Welcome endpoint (verifica que el servidor responde)
GET /

# API info
GET /api
```

---

## 🤝 Contribución

### Workflow

1. Fork el repositorio
2. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Código

- **Indentación**: 2 espacios
- **Quotes**: Single quotes `'`
- **Semicolons**: Obligatorios `;`
- **Variables**: `const` por defecto, `let` solo si reasignación
- **Funciones**: Arrow functions para callbacks
- **Naming**:
  - Variables/Funciones: `camelCase`
  - Clases: `PascalCase`
  - Constantes globales: `UPPER_SNAKE_CASE`
  - Archivos: `kebab-case.js`

### Pre-commit Checklist

- [ ] Tests pasan: `npm test`
- [ ] Linter pasa: `npm run lint`
- [ ] Documentación actualizada si aplica
- [ ] Variables sensibles en `.env` (no hardcodeadas)

---

## 📝 Licencia

ISC © [@ismaeltorresh](https://github.com/ismaeltorresh)

---

## 🚀 Mejoras Recientes (Diciembre 2025)

### ✅ Refactorización Completada

El proyecto ha sido refactorizado siguiendo las mejores prácticas de Node.js y los estándares de la industria:

#### 1️⃣ **ES Modules Migration** (29 archivos)
- ✅ Migración completa de CommonJS (`require`) a ES Modules (`import/export`)
- ✅ Actualización de `package.json` con `"type": "module"`
- ✅ Configuración de Jest para ES Modules
- ✅ 100% de compatibilidad con Node.js 20+

#### 2️⃣ **Sistema de Logging Centralizado** (7 archivos)
- ✅ Nuevo módulo `utils/logger.js` con 6 niveles de logging
- ✅ Timestamps automáticos en formato ISO 8601
- ✅ Contexto JSON estructurado para mejor debugging
- ✅ Filtrado por ambiente (debug solo en development)
- ✅ Reemplazo de ~15 llamadas a `console.log/warn/error`

#### 3️⃣ **Validación Segura** (6 rutas refactorizadas)
- ✅ Nuevo módulo `utils/validation.js`
- ✅ `parseIntSafe()`: Parsing seguro con validación de rangos
- ✅ `validatePagination()`: Wrapper para paginación consistente
- ✅ 34 ocurrencias de `parseInt()` eliminadas
- ✅ Prevención de NaN y valores fuera de rango

#### 4️⃣ **Async/Await Error Handling** (Nuevo middleware)
- ✅ `asyncHandler()`: Elimina try-catch en rutas
- ✅ `withTimeout()`: Timeouts automáticos para operaciones async
- ✅ `withRetry()`: Reintentos con backoff exponencial
- ✅ 12/12 tests passing en `async.handler.test.js`

#### 5️⃣ **Hardening de Seguridad**
- ✅ Variables sensibles movidas a `.env` (Sentry DSN, DB credentials)
- ✅ Script de auditoría de seguridad (`npm run security:audit`)
- ✅ Documentación de seguridad en `docs/SECURITY.md`
- ✅ Validación de variables de entorno en startup

#### 6️⃣ **Calidad de Código**
- ✅ Eliminación de variables globales mutables
- ✅ Manejo de errores con contexto estructurado
- ✅ Validación de ambiente en startup (fail-fast)

### 📚 Documentación

Documentación detallada disponible en:
- `docs/REFACTORING-POINTS-12-20.md` - Logging y validación
- `docs/PUNTO4_IMPLEMENTACION_COMPLETA.md` - Async error handling
- `docs/SECURITY.md` - Guía de seguridad

---

## 👨‍💻 Autor

**Ismael Torres**
- GitHub: [@ismaeltorresh](https://github.com/ismaeltorresh)
- Repository: [neec-backend](https://github.com/ismaeltorresh/neec-backend)

---

## 🙏 Agradecimientos

- Express.js community
- Sequelize team
- Auth0 documentation
- OWASP Security Guidelines
- Node.js best practices community

---

## 📞 Soporte

Si encuentras algún bug o tienes una sugerencia:

1. Abre un [Issue](https://github.com/ismaeltorresh/neec-backend/issues)
2. Describe el problema/sugerencia con detalle
3. Incluye logs relevantes y pasos para reproducir

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub**
