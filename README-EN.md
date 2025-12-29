# NEEC Backend

> REST API Backend built with Node.js, Express.js, TypeScript, Zod and TypeORM over MariaDB/MySQL

**🇬🇧 English Version** | **[🇪🇸 Versión en Español](README.md)**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3+-E83524?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Zod](https://img.shields.io/badge/Zod-3.22+-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-success?logo=jest)](https://jestjs.io/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

---

## 📋 Table of Contents

- [Description](#-description)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)
- [API Usage](#-api-usage)
- [Validation System (Zod)](#-validation-system-zod)
- [TypeORM and Migrations](#-typeorm-and-migrations)
- [Testing](#-testing)
- [Security](#-security)
- [CI/CD](#-cicd)
- [Additional Documentation](#-additional-documentation)

---

## 📖 Description

**NEEC Backend** is an enterprise REST API built with layered architecture following SOLID principles, Domain-Driven Design (DDD) and security best practices (OWASP, NIST).

### ✨ Key Features

- ✅ **TypeScript Strict Mode** - Compile-time type safety
- ✅ **TypeORM** - TypeScript-first ORM with decorators, versioned migrations and Repository Pattern
- ✅ **Zod** - Validation with automatic type inference (Single Source of Truth)
- ✅ **Layered Architecture** - Routes → Services → Repositories → Database
- ✅ **Async Error Handling** - Middlewares `asyncHandler`, `withTimeout`, `withRetry`
- ✅ **Structured Logging** - Centralized system with 6 levels (info, warn, error, debug, db, perf)
- ✅ **OAuth 2.0** - Auth0 integration (JWT Bearer tokens)
- ✅ **Rate Limiting** - Protection against brute-force and DoS
- ✅ **Security Hardening** - Helmet, CORS, input sanitization
- ✅ **CI/CD** - GitHub Actions with automated build, tests and deploy

---

## 🏗️ Architecture

Layered architecture with strict separation of concerns:

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

### Data Flow

```
Request → Middleware → Controller → Zod Validation → Service → Repository → TypeORM → Database
                                                                                        ↓
Response ← Middleware ← Controller ← Service ← Repository ← TypeORM Entity ← Database
```

---

## 🛠️ Tech Stack

### Core
- **Node.js** v20 LTS
- **TypeScript** 5.0+ (strict mode, ES2022 target)
- **Express.js** 4.19

### Database
- **TypeORM** 0.3+ (decorators, migrations, Query Builder)
- **mysql2** (driver for MariaDB/MySQL)
- **MariaDB** 10.x / **MySQL** 8.x

### Validation and Types
- **Zod** 3.22 - Validation + type inference
- **@hapi/boom** 10.0 - Typed HTTP errors

### Security
- **Helmet** 8.0 - Security headers
- **express-rate-limit** 7.x - Rate limiting
- **express-oauth2-jwt-bearer** - Auth0 integration

### Testing and Development
- **Jest** 29.7 + **ts-jest**
- **Nodemon** 3.1 + **ts-node**
- **ESLint** 9.8

### Monitoring
- **Sentry** - APM and error tracking

---

## 🚀 Installation

### Prerequisites

- Node.js v20+
- MariaDB 10.x or MySQL 8.x
- npm v9+

### 1. Clone and Install

```bash
git clone https://github.com/ismaeltorresh/neec-backend.git
cd neec-backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Application
NODE_ENV=development
PORT=8008

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=neec_dev

# OAuth 2.0 (Auth0)
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://dev-xxx.us.auth0.com/

# Security
BODY_LIMIT=100kb
DOCS_TOKEN=secret_token

# Sentry (optional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.05
```

### 3. Create Database

```bash
# Option 1: Use SQL script (legacy)
mysql -u root -p < db/database.sql

# Option 2: Create manually
mysql -u root -p
CREATE DATABASE neec_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```bash
# Run all pending migrations
npm run migration:run
```

### 5. Start Server

```bash
# Development (hot-reload)
npm run dev

# Production
npm run build
npm start
```

---

## ⚙️ Configuration

### Environments

Configuration files in [`environments/`](environments/):

- **`environments.development.ts`** - Local development
- **`environments.production.ts`** - Production
- **`environments.testing.ts`** - Tests

Automatic loading based on `NODE_ENV`.

### TypeORM DataSource

Configured in [`db/connection.ts`](db/connection.ts) and [`db/ormconfig.ts`](db/ormconfig.ts):

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
  synchronize: false, // ⚠️ NEVER true in production
  logging: env.execution === 'development',
});
```

---

## 📜 Scripts

### Development

```bash
npm run dev          # Server with hot-reload (TypeScript)
npm run type-check   # Check types without compiling
```

### Build

```bash
npm run build        # Compile TS → JS in dist/
```

### Production

```bash
npm start            # Run compiled code
```

### Testing

```bash
npm test             # Jest (supports .ts and .js)
npm run lint         # ESLint
```

### TypeORM (Migrations)

```bash
# Generate migration from entity changes
npm run migration:generate -- migrations/CreateUserTable

# Create empty migration
npm run migration:create -- migrations/AddIndexToUsers

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run typeorm -- migration:show -d db/ormconfig.ts
```

### Security

```bash
npm run security:audit   # Security audit
```

---

## 📁 Project Structure

```
neec-backend/
├── db/
│   ├── connection.ts           # TypeORM DataSource
│   ├── ormconfig.ts            # Config for CLI
│   └── database.sql            # Legacy schema (reference)
├── entities/                   # TypeORM entities
│   ├── base.entity.ts          # Abstract base entity
│   ├── example.entity.ts       # Example
│   └── README.md
├── repositories/               # Repository Pattern
│   ├── base.repository.ts      # Generic repository
│   ├── example.repository.ts   # Example
│   └── README.md
├── migrations/                 # Versioned migrations
│   ├── 1703851200000-CreateExampleTable.ts
│   └── README.md
├── schemas/                    # Zod schemas
│   ├── example.schema.ts       # Validation + inferred types
│   └── template.schema.ts
├── interfaces/                 # TypeScript interfaces (DTOs)
│   ├── example.interface.ts
│   └── README.md
├── routes/                     # Controllers
│   ├── index.ts                # Main router
│   ├── example.routes.ts       # Complete CRUD
│   └── template.routes.ts
├── middlewares/
│   ├── async.handler.ts        # asyncHandler, withTimeout, withRetry
│   ├── error.handler.ts        # Global error handler
│   ├── validator.handler.ts    # Zod validation
│   ├── rate-limit.handler.ts   # Rate limiting
│   └── perf.handler.ts
├── utils/
│   ├── logger.ts               # Structured logging
│   ├── validation.ts           # parseIntSafe, validatePagination
│   ├── pagination.ts           # SQL pagination
│   └── response.ts             # HTTP helpers
├── environments/               # Environment configuration
│   ├── index.ts
│   ├── environments.development.ts
│   ├── environments.production.ts
│   └── environments.testing.ts
├── types/
│   └── index.ts                # Global types
├── docs/                       # Documentation
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

## 🌐 API Usage

### Available Endpoints

| Method | Route | Description |
|--------|------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Health check (DB status) |
| `GET` | `/api` | API info |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/api/v1/examples` | List examples (paginated) |
| `GET` | `/api/v1/examples/:id` | Get example by ID |
| `GET` | `/api/v1/examples/email/:email` | Search by email |
| `POST` | `/api/v1/examples` | Create example |
| `PATCH` | `/api/v1/examples/:id` | Update example |
| `DELETE` | `/api/v1/examples/:id` | Soft delete |
| `DELETE` | `/api/v1/examples/:id/hard` | Hard delete |

### Usage Examples

#### 1. List Examples with Filters

```bash
GET /api/v1/examples?page=1&pageSize=10&isActive=true&sortBy=createdAt&sortOrder=DESC

# Response
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

#### 2. Create Example

```bash
POST /api/v1/examples
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "description": "New user",
  "isActive": true
}

# Response (201 Created)
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

#### 3. Update Example

```bash
PATCH /api/v1/examples/2
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false
}

# Response (200 OK)
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

#### 4. Search by Email

```bash
GET /api/v1/examples/email/jane@example.com

# Response (200 OK)
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  ...
}
```

#### 5. Delete (Soft Delete)

```bash
DELETE /api/v1/examples/2

# Response (204 No Content)
```

---

## ✅ Validation System (Zod)

### Philosophy: Single Source of Truth

**Zod schemas** are the single source of truth. TypeScript types are automatically inferred:

```typescript
// schemas/example.schema.ts
import { z } from 'zod';

// 1️⃣ Define Zod schema
export const createExampleSchema = z.object({
  name: z.string().min(3).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  description: z.string().max(5000).trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

// 2️⃣ Automatically infer types
export type CreateExampleInput = z.infer<typeof createExampleSchema>;

// 3️⃣ Schema for updates (all fields optional)
export const updateExampleSchema = createExampleSchema.partial();
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
```

### Usage in Routes

```typescript
// routes/example.routes.ts
import { validatorHandler } from '../middlewares/validator.handler.js';
import { createExampleSchema, type CreateExampleInput } from '../schemas/example.schema.js';

router.post(
  '/',
  validatorHandler(createExampleSchema, 'body'), // ✅ Zod validation
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateExampleInput; // ✅ Inferred type
    const example = await exampleRepo.create(data);
    res.status(201).json(example);
  })
);
```

### Zod Advantages

- ✅ **Type Inference** - `z.infer<typeof schema>` generates types automatically
- ✅ **Runtime Validation** - Validates data at runtime
- ✅ **Bundle Size** - ~8KB vs ~146KB (Joi)
- ✅ **TypeScript First** - Designed for TypeScript
- ✅ **Composable** - `.merge()`, `.extend()`, `.partial()`

**Complete documentation**: [`docs/ZOD_MIGRATION.md`](docs/ZOD_MIGRATION.md)

---

## 🗄️ TypeORM and Migrations

### Entities

Defined with decorators in [`entities/`](entities/):

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

### Repositories

Repository Pattern in [`repositories/`](repositories/):

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

### Migrations

```bash
# 1. Modify entity
# Edit entities/example.entity.ts

# 2. Generate migration automatically
npm run migration:generate -- migrations/AddPhoneToExample

# 3. Review generated file in migrations/
# migrations/1234567890000-AddPhoneToExample.ts

# 4. Run migration
npm run migration:run

# 5. If something goes wrong, revert
npm run migration:revert
```

### ⚠️ Important: Zod ↔ TypeORM Synchronization

Keep synchronized:

1. **Zod Schema** (validation + types) → [`schemas/example.schema.ts`](schemas/example.schema.ts)
2. **Interfaces** (DTOs) → [`interfaces/example.interface.ts`](interfaces/example.interface.ts)
3. **TypeORM Entity** (persistence) → [`entities/example.entity.ts`](entities/example.entity.ts)

**Complete documentation**: [`docs/ZOD_TYPEORM_SYNC.md`](docs/ZOD_TYPEORM_SYNC.md), [`docs/TYPEORM_MIGRATION.md`](docs/TYPEORM_MIGRATION.md)

---

## 🧪 Testing

```bash
# All tests
npm test

# Specific tests
npm test async.handler.test
```

### Test Example

```typescript
// test/example.test.ts
import { describe, it, expect } from '@jest/globals';
import { ExampleRepository } from '../repositories/example.repository.js';

describe('ExampleRepository', () => {
  let repo: ExampleRepository;

  beforeEach(() => {
    repo = new ExampleRepository();
  });

  it('should create an example', async () => {
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

## 🔒 Security

### Implemented

- ✅ **Input Validation** - Zod with sanitization
- ✅ **SQL Injection Prevention** - Parameterized TypeORM
- ✅ **Rate Limiting** - 100 req/15min (prod)
- ✅ **Helmet** - HTTP security headers
- ✅ **CORS** - Origins whitelist
- ✅ **JWT Validation** - OAuth 2.0 with Auth0
- ✅ **Error Sanitization** - No stack traces in production
- ✅ **Secrets Management** - `.env` variables

### Security Audit

```bash
npm run security:audit
```

**Complete documentation**: [`docs/SECURITY.md`](docs/SECURITY.md)

---

## 🚀 CI/CD

### GitHub Actions

Configured in [`.github/workflows/`](.github/workflows/):

**`ci-cd.yml`** (Main Pipeline):
- ✅ Build TypeScript (`npm run build`)
- ✅ Type check (`npm run type-check`)
- ✅ Tests (`npm test`)
- ✅ Security audit
- ✅ Deploy to staging (`develop` branch)
- ✅ Deploy to production (`main` branch)

**`pr-checks.yml`** (Pull Requests):
- ✅ Type check
- ✅ Build
- ✅ Tests
- ✅ Automatic comment with results

---

## 📚 Additional Documentation

| Document | Description |
|-----------|-------------|
| [`MIGRATION_SUMMARY.md`](MIGRATION_SUMMARY.md) | TypeORM migration summary |
| [`ZOD_TYPEORM_SYNC_SUMMARY.md`](ZOD_TYPEORM_SYNC_SUMMARY.md) | Zod ↔ TypeORM synchronization |
| [`docs/TYPEORM_MIGRATION.md`](docs/TYPEORM_MIGRATION.md) | Complete TypeORM guide |
| [`docs/ZOD_MIGRATION.md`](docs/ZOD_MIGRATION.md) | Joi → Zod migration |
| [`docs/ZOD_TYPEORM_SYNC.md`](docs/ZOD_TYPEORM_SYNC.md) | Synchronization pattern |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security guide |
| [`docs/MEJORAS_IMPLEMENTADAS.md`](docs/MEJORAS_IMPLEMENTADAS.md) | Improvements history |
| [`entities/README.md`](entities/README.md) | Entities guide |
| [`repositories/README.md`](repositories/README.md) | Repositories guide |
| [`migrations/README.md`](migrations/README.md) | Migrations guide |
| [`interfaces/README.md`](interfaces/README.md) | Interfaces guide |

---

## 🤝 Contributing

1. Fork the repository
2. Create branch: `git checkout -b feature/new-feature`
3. Commit: `git commit -m 'Add: new feature'`
4. Push: `git push origin feature/new-feature`
5. Open Pull Request

### Pre-commit Checklist

- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `npm test` ✅
- [ ] `npm run lint` ✅
- [ ] Documentation updated

---

## 👨‍💻 Author

**Ismael Torres**
- GitHub: [@ismaeltorresh](https://github.com/ismaeltorresh)
- Repository: [neec-backend](https://github.com/ismaeltorresh/neec-backend)

---

## 📝 License

ISC © [@ismaeltorresh](https://github.com/ismaeltorresh)

---

**⭐ If you found it useful, consider giving it a star on GitHub**
