# NEEC Backend

> Backend API REST construido con Node.js, Express.js, TypeScript, Zod y TypeORM sobre MariaDB/MySQL

**[🇬🇧 English Version](README-EN.md)** | **🇪🇸 Versión en Español**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3+-E83524?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Zod](https://img.shields.io/badge/Zod-3.22+-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-success?logo=jest)](https://jestjs.io/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts](#-scripts)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Uso de la API](#-uso-de-la-api)
- [Sistema de Validación (Zod)](#-sistema-de-validación-zod)
- [TypeORM y Migraciones](#-typeorm-y-migraciones)
- [Testing](#-testing)
- [Seguridad](#-seguridad)
- [CI/CD](#-cicd)
- [Documentación Adicional](#-documentación-adicional)

---

## 📖 Descripción

**NEEC Backend** es una API REST empresarial construida con arquitectura en capas siguiendo principios SOLID, Domain-Driven Design (DDD) y las mejores prácticas de seguridad (OWASP, NIST).

### ✨ Características Principales

- ✅ **TypeScript Strict Mode** - Seguridad de tipos en tiempo de compilación
- ✅ **TypeORM** - ORM TypeScript-first con decoradores, migraciones versionadas y Repository Pattern
- ✅ **Zod** - Validación con inferencia automática de tipos (Single Source of Truth)
- ✅ **Arquitectura en Capas** - Routes → Services → Repositories → Database
- ✅ **Async Error Handling** - Middlewares `asyncHandler`, `withTimeout`, `withRetry`
- ✅ **Logging Estructurado** - Sistema centralizado con 6 niveles (info, warn, error, debug, db, perf)
- ✅ **OAuth 2.0** - Integración con Auth0 (JWT Bearer tokens)
- ✅ **Rate Limiting** - Protección contra brute-force y DoS
- ✅ **Security Hardening** - Helmet, CORS, input sanitization
- ✅ **CI/CD** - GitHub Actions con build, tests y deploy automatizado

---

## 🏗️ Arquitectura

Arquitectura en capas con separación estricta de responsabilidades:

```
┌─────────────────────────────────────────┐
│      HTTP Layer (Express.js)            │
│  Middlewares: Auth, CORS, Helmet,       │
│  Rate Limit, Error Handler              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Routes/Controllers Layer           │
│  • HTTP req/res handling                │
│  • Zod validation                       │
│  • Service orchestration                │
│  • HTTP status codes                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                  │
│  • Business logic                       │
│  • Transaction orchestration            │
│  • Error handling (Boom)                │
│  • Cross-repository operations          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Repository Layer                   │
│  • TypeORM repositories                 │
│  • Data access abstraction              │
│  • Query building                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Entities Layer (TypeORM)           │
│  • Database models (decorators)         │
│  • Relations                            │
│  • Lifecycle hooks                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database (MariaDB)              │
└─────────────────────────────────────────┘
```

### Flujo de Datos

```
Request → Middleware → Controller → Zod Validation → Service → Repository → TypeORM → Database
                                                                                        ↓
Response ← Middleware ← Controller ← Service ← Repository ← TypeORM Entity ← Database
```

---

## 🛠️ Stack Tecnológico

### Core
- **Node.js** v20 LTS
- **TypeScript** 5.0+ (strict mode, ES2022 target)
- **Express.js** 4.19

### Base de Datos
- **TypeORM** 0.3+ (decoradores, migraciones, Query Builder)
- **mysql2** (driver para MariaDB/MySQL)
- **MariaDB** 10.x / **MySQL** 8.x

### Validación y Tipos
- **Zod** 3.22 - Validación + inferencia de tipos
- **@hapi/boom** 10.0 - HTTP errors tipados

### Seguridad
- **Helmet** 8.0 - Security headers
- **express-rate-limit** 7.x - Rate limiting
- **express-oauth2-jwt-bearer** - Auth0 integration

### Testing y Desarrollo
- **Jest** 29.7 + **ts-jest**
- **Nodemon** 3.1 + **ts-node**
- **ESLint** 9.8

### Monitoreo
- **Sentry** - APM y error tracking

---

## 🚀 Instalación

### Requisitos Previos

- Node.js v20+
- MariaDB 10.x o MySQL 8.x
- npm v9+

### 1. Clonar e Instalar

```bash
git clone https://github.com/ismaeltorresh/neec-backend.git
cd neec-backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env`:

```bash
# Application
NODE_ENV=development
PORT=8008

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=neec_dev

# OAuth 2.0 (Auth0)
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://dev-xxx.us.auth0.com/

# Security
BODY_LIMIT=100kb
DOCS_TOKEN=token_secreto

# Sentry (opcional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.05
```

### 3. Crear Base de Datos

```bash
# Opción 1: Usar script SQL (legacy)
mysql -u root -p < db/database.sql

# Opción 2: Crear manualmente
mysql -u root -p
CREATE DATABASE neec_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Ejecutar Migraciones

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run
```

### 5. Iniciar Servidor

```bash
# Desarrollo (hot-reload)
npm run dev

# Producción
npm run build
npm start
```

---

## ⚙️ Configuración

### Ambientes

Archivos de configuración en [`environments/`](environments/):

- **`environments.development.ts`** - Desarrollo local
- **`environments.production.ts`** - Producción
- **`environments.testing.ts`** - Tests

Carga automática según `NODE_ENV`.

### TypeORM DataSource

Configurado en [`db/connection.ts`](db/connection.ts) y [`db/ormconfig.ts`](db/ormconfig.ts):

```typescript
// db/connection.ts
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  synchronize: false, // ⚠️ NUNCA true en producción
  logging: env.execution === 'development',
});
```

---

## 📜 Scripts

### Desarrollo

```bash
npm run dev          # Servidor con hot-reload (TypeScript)
npm run type-check   # Verificar tipos sin compilar
```

### Compilación

```bash
npm run build        # Compilar TS → JS en dist/
```

### Producción

```bash
npm start            # Ejecutar código compilado
```

### Testing

```bash
npm test             # Jest (soporta .ts y .js)
npm run lint         # ESLint
```

### TypeORM (Migraciones)

```bash
# Generar migración desde cambios en entidades
npm run migration:generate -- migrations/CreateUserTable

# Crear migración vacía
npm run migration:create -- migrations/AddIndexToUsers

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run typeorm -- migration:show -d db/ormconfig.ts
```

### Seguridad

```bash
npm run security:audit   # Auditoría de seguridad
```

---

## 📁 Estructura del Proyecto

```
neec-backend/
├── db/
│   ├── connection.ts           # TypeORM DataSource
│   ├── ormconfig.ts            # Config para CLI
│   └── database.sql            # Schema legacy (referencia)
├── entities/                   # Entidades TypeORM
│   ├── base.entity.ts          # Entidad base abstracta
│   ├── example.entity.ts       # Ejemplo
│   └── README.md
├── repositories/               # Repository Pattern
│   ├── base.repository.ts      # Repository genérico
│   ├── example.repository.ts   # Ejemplo
│   └── README.md
├── migrations/                 # Migraciones versionadas
│   ├── 1703851200000-CreateExampleTable.ts
│   └── README.md
├── schemas/                    # Schemas Zod
│   ├── example.schema.ts       # Validación + tipos inferidos
│   └── template.schema.ts
├── interfaces/                 # Interfaces TypeScript (DTOs)
│   ├── example.interface.ts
│   └── README.md
├── routes/                     # Controllers
│   ├── index.ts                # Router principal
│   ├── example.routes.ts       # CRUD completo
│   └── template.routes.ts
├── middlewares/
│   ├── async.handler.ts        # asyncHandler, withTimeout, withRetry
│   ├── error.handler.ts        # Error handler global
│   ├── validator.handler.ts    # Validación Zod
│   ├── rate-limit.handler.ts   # Rate limiting
│   └── perf.handler.ts
├── utils/
│   ├── logger.ts               # Logging estructurado
│   ├── validation.ts           # parseIntSafe, validatePagination
│   ├── pagination.ts           # Paginación SQL
│   └── response.ts             # Helpers HTTP
├── environments/               # Configuración por ambiente
│   ├── index.ts
│   ├── environments.development.ts
│   ├── environments.production.ts
│   └── environments.testing.ts
├── types/
│   └── index.ts                # Tipos globales
├── docs/                       # Documentación
│   ├── TYPEORM_MIGRATION.md
│   ├── ZOD_TYPEORM_SYNC.md
│   ├── SECURITY.md
│   └── ...
├── .github/workflows/          # CI/CD
│   ├── ci-cd.yml
│   └── pr-checks.yml
├── index.ts                    # Entry point
├── instrument.ts               # Sentry init
├── tsconfig.json
├── jest.config.js
├── .env.example
└── README.md
```

---

## 🌐 Uso de la API

### Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Health check (DB status) |
| `GET` | `/api` | API info |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/api/v1/examples` | Listar ejemplos (paginado) |
| `GET` | `/api/v1/examples/:id` | Obtener ejemplo por ID |
| `GET` | `/api/v1/examples/email/:email` | Buscar por email |
| `POST` | `/api/v1/examples` | Crear ejemplo |
| `PATCH` | `/api/v1/examples/:id` | Actualizar ejemplo |
| `DELETE` | `/api/v1/examples/:id` | Soft delete |
| `DELETE` | `/api/v1/examples/:id/hard` | Hard delete |

### Ejemplos de Uso

#### 1. Listar Ejemplos con Filtros

```bash
GET /api/v1/examples?page=1&pageSize=10&isActive=true&sortBy=createdAt&sortOrder=DESC

# Respuesta
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "description": "Example user",
      "isActive": true,
      "recordStatus": true,
      "dataSource": "sql",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
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

#### 2. Crear Ejemplo

```bash
POST /api/v1/examples
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "description": "New user",
  "isActive": true
}

# Respuesta (201 Created)
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "description": "New user",
  "isActive": true,
  "recordStatus": true,
  "dataSource": "sql",
  "createdAt": "2025-01-16T14:20:00.000Z",
  "updatedAt": "2025-01-16T14:20:00.000Z"
}
```

#### 3. Actualizar Ejemplo

```bash
PATCH /api/v1/examples/2
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false
}

# Respuesta (200 OK)
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "description": "Updated description",
  "isActive": false,
  "recordStatus": true,
  "dataSource": "sql",
  "createdAt": "2025-01-16T14:20:00.000Z",
  "updatedAt": "2025-01-16T15:45:00.000Z"
}
```

#### 4. Buscar por Email

```bash
GET /api/v1/examples/email/jane@example.com

# Respuesta (200 OK)
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  ...
}
```

#### 5. Eliminar (Soft Delete)

```bash
DELETE /api/v1/examples/2

# Respuesta (204 No Content)
```

---

## ✅ Sistema de Validación (Zod)

### Filosofía: Single Source of Truth

Los **schemas Zod** son la única fuente de verdad. Los tipos TypeScript se infieren automáticamente:

```typescript
// schemas/example.schema.ts
import { z } from 'zod';

// 1️⃣ Definir schema Zod
export const createExampleSchema = z.object({
  name: z.string().min(3).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  description: z.string().max(5000).trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

// 2️⃣ Inferir tipos automáticamente
export type CreateExampleInput = z.infer<typeof createExampleSchema>;

// 3️⃣ Schema para actualizaciones (todos los campos opcionales)
export const updateExampleSchema = createExampleSchema.partial();
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
```

### Uso en Rutas

```typescript
// routes/example.routes.ts
import { validatorHandler } from '../middlewares/validator.handler.js';
import { createExampleSchema, type CreateExampleInput } from '../schemas/example.schema.js';

router.post(
  '/',
  validatorHandler(createExampleSchema, 'body'), // ✅ Validación Zod
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateExampleInput; // ✅ Tipo inferido
    const example = await exampleRepo.create(data);
    res.status(201).json(example);
  })
);
```

### Ventajas de Zod

- ✅ **Type Inference** - `z.infer<typeof schema>` genera tipos automáticamente
- ✅ **Runtime Validation** - Valida datos en ejecución
- ✅ **Bundle Size** - ~8KB vs ~146KB (Joi)
- ✅ **TypeScript First** - Diseñado para TypeScript
- ✅ **Composable** - `.merge()`, `.extend()`, `.partial()`

**Documentación completa**: [`docs/ZOD_MIGRATION.md`](docs/ZOD_MIGRATION.md)

---

## 🗄️ TypeORM y Migraciones

### Entidades

Definidas con decoradores en [`entities/`](entities/):

```typescript
// entities/example.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity.js';

@Entity('examples')
export class Example extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
```

### Repositorios

Patrón Repository en [`repositories/`](repositories/):

```typescript
// repositories/example.repository.ts
import { BaseRepository } from './base.repository.js';
import { Example } from '../entities/example.entity.js';

export class ExampleRepository extends BaseRepository<Example> {
  constructor() {
    super(Example);
  }

  async findByEmail(email: string): Promise<Example | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findActiveExamples(): Promise<Example[]> {
    return this.repository.find({ where: { isActive: true } });
  }
}
```

### Migraciones

```bash
# 1. Modificar entidad
# Editar entities/example.entity.ts

# 2. Generar migración automáticamente
npm run migration:generate -- migrations/AddPhoneToExample

# 3. Revisar archivo generado en migrations/
# migrations/1234567890000-AddPhoneToExample.ts

# 4. Ejecutar migración
npm run migration:run

# 5. Si algo sale mal, revertir
npm run migration:revert
```

### ⚠️ Importante: Sincronización Zod ↔ TypeORM

Mantener sincronizados:

1. **Schema Zod** (validación + tipos) → [`schemas/example.schema.ts`](schemas/example.schema.ts)
2. **Interfaces** (DTOs) → [`interfaces/example.interface.ts`](interfaces/example.interface.ts)
3. **Entidad TypeORM** (persistencia) → [`entities/example.entity.ts`](entities/example.entity.ts)

**Documentación completa**: [`docs/ZOD_TYPEORM_SYNC.md`](docs/ZOD_TYPEORM_SYNC.md), [`docs/TYPEORM_MIGRATION.md`](docs/TYPEORM_MIGRATION.md)

---

## 🧪 Testing

```bash
# Todos los tests
npm test

# Tests específicos
npm test async.handler.test
```

### Ejemplo de Test

```typescript
// test/example.test.ts
import { describe, it, expect } from '@jest/globals';
import { ExampleRepository } from '../repositories/example.repository.js';

describe('ExampleRepository', () => {
  let repo: ExampleRepository;

  beforeEach(() => {
    repo = new ExampleRepository();
  });

  it('debe crear un ejemplo', async () => {
    const data = {
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
    };

    const example = await repo.create(data);

    expect(example.id).toBeDefined();
    expect(example.name).toBe(data.name);
    expect(example.email).toBe(data.email);
  });
});
```

---

## 🔒 Seguridad

### Implementado

- ✅ **Input Validation** - Zod con sanitización
- ✅ **SQL Injection Prevention** - TypeORM parametrizado
- ✅ **Rate Limiting** - 100 req/15min (prod)
- ✅ **Helmet** - Security headers HTTP
- ✅ **CORS** - Whitelist de origins
- ✅ **JWT Validation** - OAuth 2.0 con Auth0
- ✅ **Error Sanitization** - No stack traces en producción
- ✅ **Secrets Management** - Variables `.env`

### Auditoría de Seguridad

```bash
npm run security:audit
```

**Documentación completa**: [`docs/SECURITY.md`](docs/SECURITY.md)

---

## 🚀 CI/CD

### GitHub Actions

Configurados en [`.github/workflows/`](.github/workflows/):

**`ci-cd.yml`** (Main Pipeline):
- ✅ Build TypeScript (`npm run build`)
- ✅ Type check (`npm run type-check`)
- ✅ Tests (`npm test`)
- ✅ Security audit
- ✅ Deploy a staging (rama `develop`)
- ✅ Deploy a producción (rama `main`)

**`pr-checks.yml`** (Pull Requests):
- ✅ Type check
- ✅ Build
- ✅ Tests
- ✅ Comentario automático con resultados

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [`MIGRATION_SUMMARY.md`](MIGRATION_SUMMARY.md) | Resumen migración a TypeORM |
| [`ZOD_TYPEORM_SYNC_SUMMARY.md`](ZOD_TYPEORM_SYNC_SUMMARY.md) | Sincronización Zod ↔ TypeORM |
| [`docs/TYPEORM_MIGRATION.md`](docs/TYPEORM_MIGRATION.md) | Guía completa TypeORM |
| [`docs/ZOD_MIGRATION.md`](docs/ZOD_MIGRATION.md) | Migración Joi → Zod |
| [`docs/ZOD_TYPEORM_SYNC.md`](docs/ZOD_TYPEORM_SYNC.md) | Patrón de sincronización |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Guía de seguridad |
| [`docs/MEJORAS_IMPLEMENTADAS.md`](docs/MEJORAS_IMPLEMENTADAS.md) | Historial de mejoras |
| [`entities/README.md`](entities/README.md) | Guía de entidades |
| [`repositories/README.md`](repositories/README.md) | Guía de repositorios |
| [`migrations/README.md`](migrations/README.md) | Guía de migraciones |
| [`interfaces/README.md`](interfaces/README.md) | Guía de interfaces |

---

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Pre-commit Checklist

- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `npm test` ✅
- [ ] `npm run lint` ✅
- [ ] Documentación actualizada

---

## 👨‍💻 Autor

**Ismael Torres**
- GitHub: [@ismaeltorresh](https://github.com/ismaeltorresh)
- Repository: [neec-backend](https://github.com/ismaeltorresh/neec-backend)

---

## 📝 Licencia

ISC © [@ismaeltorresh](https://github.com/ismaeltorresh)

---

**⭐ Si te resultó útil, considera darle una estrella en GitHub**
