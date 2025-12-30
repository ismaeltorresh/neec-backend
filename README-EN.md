# NEEC Backend

> Enterprise REST API built with Node.js, Express, TypeScript, Zod and TypeORM on MariaDB

**🇬🇧 English Version** | **[🇪🇸 Versión en Español](README.md)**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3+-E83524?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Zod](https://img.shields.io/badge/Zod-3.22+-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🤖 Automation Scripts](#-automation-scripts)
- [📖 What is NEEC Backend?](#-what-is-neec-backend)
- [🏗️ Architecture](#-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [⚙️ Complete Installation](#-complete-installation)
- [📜 Commands and Scripts](#-commands-and-scripts)
- [📁 Project Structure](#-project-structure)
- [🔧 Validation System (Zod)](#-validation-system-zod)
- [🗄️ TypeORM and Database](#-typeorm-and-database)
- [🧪 Testing](#-testing)
- [🔒 Security](#-security)
- [📚 Additional Documentation](#-additional-documentation)

---

## 🚀 Quick Start

**First time with the project? Just 3 steps:**

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3️⃣ Start in development mode
npm run dev
```

**✅ Done!** Your server is running at `http://localhost:8008`

---

## 🤖 Automation Scripts

### 🎯 Why are they important?

Automation scripts are the **most powerful tool** in this project. They allow you to create complete endpoints in seconds, eliminating repetitive work and ensuring consistency across all code.

### 1. Complete Endpoint Generator

**Generates all the necessary structure for a new endpoint with a single command.**

#### What does it generate automatically?

| File | Description | Location |
|------|-------------|----------|
| 🛣️ **Route** | Controller with complete CRUD (GET, POST, PATCH, DELETE) | `routes/name.routes.ts` |
| ✅ **Schema** | Zod validations with automatic types | `schemas/name.schema.ts` |
| 📝 **Interface** | TypeScript types for DTOs | `interfaces/name.interface.ts` |
| 🗃️ **Entity** | Database model with TypeORM decorators | `entities/name.entity.ts` |
| 💾 **Repository** | Data access layer with CRUD methods | `repositories/name.repository.ts` |
| 📊 **SQL Script** | Complete script to create the table in DB | `db/sql/create-name-table.sql` |

**Bonus:** It also automatically updates `routes/index.ts` to register the endpoint.

#### Basic Command

```bash
npm run generate <name> y
```

#### 📦 Example 1: Create "Products" endpoint

```bash
npm run generate product y
```

**Result:**

```
✅ Generating files for: product

📁 Files created:
  ✓ routes/product.routes.ts
  ✓ schemas/product.schema.ts  
  ✓ interfaces/product.interface.ts
  ✓ entities/product.entity.ts
  ✓ repositories/product.repository.ts
  ✓ db/sql/create-product-table.sql

📝 routes/index.ts automatically updated

🎉 Endpoint ready!
```

**Generated code (preview):**

```typescript
// routes/product.routes.ts - Controller with complete CRUD
import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.handler.js';
import { validatorHandler } from '../middlewares/validator.handler.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';
import { ProductRepository } from '../repositories/product.repository.js';

const router = Router();
const productRepository = new ProductRepository();

// GET /api/v1/products - List all
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const products = await productRepository.findAll();
  res.json(products);
}));

// POST /api/v1/products - Create new
router.post('/', 
  validatorHandler(createProductSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productRepository.create(req.body);
    res.status(201).json(product);
  })
);

// PATCH /api/v1/products/:id - Update
router.patch('/:id',
  validatorHandler(updateProductSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productRepository.update(parseInt(req.params.id), req.body);
    res.json(product);
  })
);

// DELETE /api/v1/products/:id - Delete (soft delete)
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await productRepository.delete(parseInt(req.params.id));
  res.status(204).send();
}));

export default router;
```

```typescript
// schemas/product.schema.ts - Validation with Zod
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string()
    .min(1, '[ES] El nombre es obligatorio / [EN] Name is required')
    .max(255, '[ES] Máximo 255 caracteres / [EN] Maximum 255 characters'),
  description: z.string().optional(),
  price: z.coerce.number()
    .positive('[ES] El precio debe ser positivo / [EN] Price must be positive'),
  stock: z.coerce.number()
    .int()
    .nonnegative()
    .optional(),
  recordStatus: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// [ES] Tipos automáticos inferidos desde Zod
// [EN] Automatic types inferred from Zod
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
```

```typescript
// entities/product.entity.ts - TypeORM Model
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity.js';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;
}
```

**APIs automatically available:**

```http
GET    /api/v1/products          # List all products
GET    /api/v1/products/:id      # Get one product
POST   /api/v1/products          # Create product
PATCH  /api/v1/products/:id      # Update product
DELETE /api/v1/products/:id      # Delete (soft delete)
```

#### 👤 Example 2: Create "Users" endpoint

```bash
npm run generate user y
```

Generates:
- `routes/user.routes.ts`
- `schemas/user.schema.ts`
- `interfaces/user.interface.ts`
- `entities/user.entity.ts`
- `repositories/user.repository.ts`
- `db/sql/create-user-table.sql`
- URLs: `/api/v1/users`, `/api/v1/users/:id`, etc.

#### 🛒 Example 3: Endpoint with compound name

```bash
npm run generate product-category y
```

Generates:
- Files with name: `product-category.*`
- Classes with name: `ProductCategory`
- URLs: `/api/v1/product-categories`

---

### 💡 How does the generator work internally?

**Step by step:**

1. **Reads the name:** Example "product"
   
2. **Converts formats:**
   - `PascalCase`: `Product` → For class names
   - `camelCase`: `product` → For variables
   - `kebab-case`: `product` → For file names
   - `plural`: `products` → For API URLs

3. **Generates from templates:**
   - Reads predefined templates
   - Replaces `{{placeholder}}` with real values
   - Applies TypeScript formatting

4. **Registers automatically:**
   - Updates `routes/index.ts`
   - Adds the import and route

---

### ⚠️ Steps after generating

1. **Run the generated SQL:**
   ```bash
   mysql -u root -p neec_dev < db/sql/create-product-table.sql
   ```

2. **Customize fields** (optional):
   
   **Add custom validations:**
   ```typescript
   // schemas/product.schema.ts
   export const createProductSchema = z.object({
     name: z.string().min(3).max(255),
     sku: z.string().regex(/^[A-Z0-9-]+$/), // ← New validation
     price: z.coerce.number().positive(),
     category: z.enum(['electronics', 'clothing', 'food']), // ← New validation
   });
   ```

   **Add columns to entity:**
   ```typescript
   // entities/product.entity.ts
   @Entity('products')
   export class Product extends BaseEntity {
     @Column()
     name!: string;

     @Column({ unique: true }) // ← New column
     sku!: string;

     @Column({ type: 'enum', enum: ['electronics', 'clothing', 'food'] }) // ← New column
     category!: string;
   }
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

4. **Test your endpoint:**
   ```bash
   # Create product
   curl -X POST http://localhost:8008/api/v1/products \
     -H "Content-Type: application/json" \
     -d '{"name": "Laptop", "price": 999.99, "stock": 10}'

   # List products
   curl http://localhost:8008/api/v1/products
   ```

---

### 📚 Additional generator documentation

For more details about the generator and its advanced options, see:

- **[scripts/README.md](scripts/README.md)** - Complete generator documentation
- **[scripts/QUICKSTART.md](scripts/QUICKSTART.md)** - Quick guide with examples

---

## 📖 What is NEEC Backend?

**NEEC Backend** is an enterprise REST API designed with Node.js and TypeScript best practices.

### 🎯 Project Goals

- **🔒 Secure**: OAuth 2.0, Helmet, Rate Limiting, strict validation
- **📏 Scalable**: Layered architecture, TypeORM with pooling, separation of concerns
- **✅ Reliable**: Automated tests, CI/CD, TypeScript strict mode
- **🚀 Productive**: Automatic generators, hot-reload, OpenAPI documentation
- **🌍 Global**: Bilingual documentation (Spanish/English)

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| **TypeScript 5.0+** | Compile-time type safety with strict mode |
| **Zod Validation** | Schemas with automatic type inference (Single Source of Truth) |
| **TypeORM 0.3+** | Modern ORM with decorators, migrations and Query Builder |
| **OAuth 2.0** | Secure authentication with Auth0 (JWT Bearer tokens) |
| **Rate Limiting** | Protection against brute-force and abuse |
| **Jest Testing** | Unit and integration tests |
| **OpenTelemetry** | Observability and request tracing |
| **CI/CD** | Automated pipeline with GitHub Actions |
| **Bilingual Documentation** | Code commented in Spanish and English with JSDoc |

---

## 🏗️ Architecture

### Layered Architecture

Strict separation of concerns following SOLID principles:

```
┌─────────────────────────────────────────┐
│       HTTP Layer (Express)              │
│  • CORS, Helmet, Rate Limiting          │
│  • OAuth 2.0 Middleware                 │
│  • Body Parser, Compression             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Routes Layer (Controllers)          │
│  • Request/Response handling            │
│  • Zod validation middleware            │
│  • HTTP status codes                    │
│  • Error boundaries (asyncHandler)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Service Layer (Business Logic)     │
│  • Pure business logic                  │
│  • Transaction orchestration            │
│  • Error handling (Boom)                │
│  • Cross-repository operations          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Repository Layer (Data Access)     │
│  • TypeORM repositories                 │
│  • Data access abstraction              │
│  • Query building                       │
│  • Database connection pooling          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Entities Layer (TypeORM Models)     │
│  • Database models (decorators)         │
│  • Relations (OneToMany, ManyToOne)     │
│  • Lifecycle hooks                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database (MariaDB/MySQL)        │
└─────────────────────────────────────────┘
```

### Data Flow

```
[Request] → Middleware → Controller → Zod Validation → Service → Repository → TypeORM → Database
                                                                                              ↓
[Response] ← Middleware ← Controller ← Service ← Repository ← TypeORM Entity ← Database
```

### Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Injection**: Repositories injected into services
3. **Single Source of Truth**: Zod schemas → TypeScript types
4. **Fail Fast**: Early validation in controllers
5. **Error Boundaries**: asyncHandler catches async errors

---

## 🛠️ Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v20 LTS | JavaScript runtime |
| **TypeScript** | 5.0+ | Type safety, strict mode |
| **Express.js** | 4.19 | HTTP web framework |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeORM** | 0.3+ | ORM with decorators and migrations |
| **mysql2** | Latest | Driver for MariaDB/MySQL |
| **MariaDB** / **MySQL** | 10.x / 8.x | Relational database |

### Validation and Types

| Technology | Purpose |
|------------|---------|
| **Zod** 3.22 | Validation + automatic type inference |
| **@hapi/boom** 10.0 | Structured and typed HTTP errors |

### Security

| Technology | Purpose |
|------------|---------|
| **Helmet** 8.0 | HTTP security headers |
| **express-rate-limit** 7.x | Rate limiting per IP |
| **express-oauth2-jwt-bearer** | Auth0 OAuth 2.0 integration |

### Testing and Development

| Technology | Purpose |
|------------|---------|
| **Jest** 29.7 | Testing framework |
| **ts-jest** | TypeScript preset for Jest |
| **Nodemon** 3.1 | Hot-reload in development |
| **ts-node** | Run TypeScript directly |
| **ESLint** 9.8 | Linting and code style |

### Observability

| Technology | Purpose |
|------------|---------|
| **Sentry** | APM, error tracking and performance monitoring |

---

## ⚙️ Complete Installation

### Prerequisites

| Tool | Minimum Version | Verification Command |
|------|----------------|----------------------|
| **Node.js** | v20 LTS | `node --version` |
| **npm** | v9+ | `npm --version` |
| **MariaDB/MySQL** | 10.x / 8.x | `mysql --version` |

### Step 1: Clone Repository

```bash
git clone https://github.com/ismaeltorresh/neec-backend.git
cd neec-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- TypeScript and ts-node
- Express.js and middlewares (helmet, cors, rate-limit)
- TypeORM and mysql2 driver
- Zod for validation
- Jest for testing
- ESLint for linting
- And all other dependencies

### Step 3: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit with your favorite editor
nano .env  # or: code .env, vim .env
```

**Critical variables to configure:**

```bash
# 🌍 Application
NODE_ENV=development        # development | testing | production
PORT=8008                  # Server port

# 🗄️ Database
DB_HOST=localhost          # Host
DB_PORT=3306              # Port (3306 by default)
DB_USER=root              # User
DB_PASSWORD=your_password # ⚠️ Change to your real password
DB_NAME=neec_dev          # Database name

# 🔐 OAuth 2.0 (Auth0) - Optional to start
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://dev-xxx.us.auth0.com/

# 🛡️ Security
BODY_LIMIT=100kb
DOCS_TOKEN=secret_token

# 📊 Monitoring (Optional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.05
```

### Step 4: Create Database

**Option A: Create manually (recommended)**

```bash
# Connect to MySQL/MariaDB
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE neec_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option B: Use SQL script (legacy)**

```bash
mysql -u root -p < db/database.sql
```

### Step 5: Run Migrations (if any)

```bash
# View pending migrations
npm run migration:show

# Run migrations
npm run migration:run
```

### Step 6: Start Server

**Development Mode (with hot-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
# Compile TypeScript to JavaScript
npm run build

# Start server with compiled code
npm start
```

### ✅ Verify Installation

If everything went well, you should see:

```
🚀 Server running on port 8008
✅ Database connected successfully
📝 Environment: development
```

Now you can access:
- **API**: http://localhost:8008
- **Health Check**: http://localhost:8008/health
- **API Info**: http://localhost:8008/api

---

## 📜 Commands and Scripts

### 🔥 Development

```bash
npm run dev          # Server with hot-reload (nodemon + ts-node)
npm run type-check   # Verify TypeScript types without compiling
npm run lint         # ESLint - check code quality
```

### 🤖 Generators

```bash
# Generate complete endpoint (6 files + SQL)
npm run generate <name> y

# Examples:
npm run generate customer y          # Customer endpoint
npm run generate product-review y    # Product reviews endpoint
npm run generate shipping-address y  # Shipping addresses endpoint
```

### 🏗️ Compilation

```bash
npm run build        # Compile TypeScript → JavaScript in dist/
npm start            # Run compiled code (production)
```

### 🗄️ Database (TypeORM)

```bash
npm run migration:show      # View migrations
npm run migration:run       # Run pending migrations
npm run migration:revert    # Revert last migration
npm run migration:generate -- -n MigrationName  # Generate from entities
npm run migration:create -- -n MigrationName    # Create empty migration
```

### 🧪 Testing

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode (re-runs on file changes)
npm run test:coverage # Tests with coverage report
```

### 🔒 Security

```bash
npm run security:audit   # Security audit
npm audit fix            # Fix vulnerabilities automatically
```

### 📚 Documentation

```bash
npm run docs         # OpenAPI/Swagger documentation server
```

---

## 📁 Project Structure

```plaintext
neec-backend/
├── 📄 index.ts                    # [ES] Punto de entrada / [EN] Entry point
├── 📄 instrument.ts               # [ES] Instrumentación Sentry / [EN] Sentry instrumentation
├── 📄 tsconfig.json               # [ES] Config TypeScript / [EN] TypeScript config
├── 📄 jest.config.js              # [ES] Config Jest / [EN] Jest configuration
├── 📄 package.json                # [ES] Dependencias y scripts / [EN] Dependencies and scripts
│
├── 📁 db/                         # [ES] Base de datos / [EN] Database
│   ├── connection.ts              # TypeORM DataSource + connection pooling
│   ├── ormconfig.ts               # TypeORM CLI configuration
│   └── sql/                       # Auto-generated SQL scripts
│
├── 📁 entities/                   # [ES] Modelos de BD / [EN] Database models
│   ├── base.entity.ts             # Base entity with common fields
│   ├── example.entity.ts          # Example entity
│   └── README.md
│
├── 📁 schemas/                    # [ES] Validaciones Zod / [EN] Zod validations
│   ├── example.schema.ts          # Validations with type inference
│   └── template.schema.ts
│
├── 📁 interfaces/                 # [ES] Tipos TypeScript / [EN] TypeScript types
│   ├── example.interface.ts       # DTOs and response types
│   └── README.md
│
├── 📁 routes/                     # [ES] Controladores / [EN] Controllers
│   ├── index.ts                   # Main router
│   ├── example.routes.ts          # Complete CRUD
│   └── template.routes.ts
│
├── 📁 repositories/               # [ES] Acceso a datos / [EN] Data access
│   ├── base.repository.ts         # Generic repository with CRUD
│   ├── example.repository.ts
│   └── README.md
│
├── 📁 migrations/                 # [ES] Migraciones de BD / [EN] Database migrations
│   ├── 1703851200000-CreateExampleTable.ts
│   └── README.md
│
├── 📁 middlewares/                # [ES] Middleware Express / [EN] Express middleware
│   ├── async.handler.ts           # asyncHandler, withTimeout, withRetry
│   ├── error.handler.ts           # Global error handler
│   ├── validator.handler.ts       # Zod validation
│   ├── rate-limit.handler.ts      # Rate limiting
│   └── perf.handler.ts            # Performance monitoring
│
├── 📁 utils/                      # [ES] Utilidades / [EN] Utilities
│   ├── logger.ts                  # Structured logging system
│   ├── validation.ts              # Custom validators
│   ├── pagination.ts              # Pagination helpers
│   └── response.ts                # HTTP response helpers
│
├── 📁 types/                      # [ES] Tipos globales / [EN] Global types
│   └── index.ts                   # Shared interfaces
│
├── 📁 environments/               # [ES] Configuración por ambiente / [EN] Environment config
│   ├── index.ts                   # Auto-load based on NODE_ENV
│   ├── environments.development.ts
│   ├── environments.production.ts
│   └── environments.testing.ts
│
├── 📁 scripts/                    # [ES] Scripts de automatización / [EN] Automation scripts
│   ├── generate-endpoint.js       # 🤖 Endpoint generator
│   ├── security-audit.sh          # Security audit
│   ├── README.md
│   └── QUICKSTART.md
│
└── 📁 test/                       # [ES] Archivos de pruebas / [EN] Test files
    ├── schema-sync.test.ts
    └── fakedata.json
```

### 💡 What does each folder do?

| Folder | Responsibility | Key Files |
|--------|----------------|-----------|
| **routes/** | Handle HTTP requests and respond | `*.routes.ts` |
| **schemas/** | Validate input data with Zod | `*.schema.ts` |
| **entities/** | Define database models | `*.entity.ts` |
| **repositories/** | Perform CRUD operations on DB | `*.repository.ts` |
| **interfaces/** | Define TypeScript types | `*.interface.ts` |
| **middlewares/** | Intercept and process requests | `*.handler.ts` |
| **utils/** | Reusable utility functions | `logger.ts`, etc. |
| **migrations/** | Version control for DB changes | Timestamp-*.ts |

---

## 🔧 Validation System (Zod)

### Why Zod?

**Zod** is a **TypeScript-first** validation library that allows:

1. **Single Source of Truth**: Define schema once, get types automatically
2. **Runtime Validation**: Validate data at runtime
3. **Type Safety**: TypeScript types inferred automatically
4. **Error Messages**: Custom and descriptive error messages

### Complete Example

```typescript
// schemas/product.schema.ts

import { z } from 'zod';

// [ES] Schema de validación / [EN] Validation schema
export const createProductSchema = z.object({
  name: z.string()
    .min(3, '[ES] Mínimo 3 caracteres / [EN] Minimum 3 characters')
    .max(255, '[ES] Máximo 255 caracteres / [EN] Maximum 255 characters'),
  
  sku: z.string()
    .regex(/^[A-Z0-9-]+$/, '[ES] SKU inválido / [EN] Invalid SKU'),
  
  price: z.coerce.number()
    .positive('[ES] El precio debe ser positivo / [EN] Price must be positive'),
  
  stock: z.coerce.number()
    .int()
    .nonnegative()
    .default(0),
  
  category: z.enum(['electronics', 'clothing', 'food', 'other']),
  
  tags: z.array(z.string()).optional(),
  
  isActive: z.boolean().default(true),
});

// [ES] Schema para actualización (todos los campos opcionales)
// [EN] Schema for update (all fields optional)
export const updateProductSchema = createProductSchema.partial();

// [ES] Tipos automáticos inferidos desde Zod - NO necesitas definirlos manualmente
// [EN] Automatic types inferred from Zod - NO need to define them manually
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
```

---

## 🗄️ TypeORM and Database

### Configuration

```typescript
// db/connection.ts

import { DataSource } from 'typeorm';
import { env } from '../environments/index.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  
  // [ES] Entidades y migraciones / [EN] Entities and migrations
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  
  // [ES] ⚠️ NUNCA true en producción / [EN] ⚠️ NEVER true in production
  synchronize: false,
  
  // [ES] Logging en desarrollo / [EN] Logging in development
  logging: env.execution === 'development',
  
  // [ES] Pool de conexiones / [EN] Connection pooling
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
});
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🔒 Security

### Implemented Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Helmet** | `app.use(helmet())` | HTTP security headers |
| **Rate Limiting** | `rate-limit.handler.ts` | Prevent brute-force |
| **OAuth 2.0** | Auth0 integration | Secure authentication |
| **Zod Validation** | Input validation | Prevent SQL injection/XSS |
| **CORS** | Configured domains | Control cross-origin access |
| **TypeScript Strict** | `strict: true` | Type safety |

---

## 📚 Additional Documentation

### Project Documents

- **[README.md](README.md)** - Documentation in Spanish
- **[scripts/README.md](scripts/README.md)** - Generator documentation
- **[scripts/QUICKSTART.md](scripts/QUICKSTART.md)** - Generator quick guide
- **[entities/README.md](entities/README.md)** - Entities guide
- **[repositories/README.md](repositories/README.md)** - Repositories guide
- **[migrations/README.md](migrations/README.md)** - Migrations guide

### External Resources

- **TypeScript**: https://www.typescriptlang.org/docs/
- **Express.js**: https://expressjs.com/
- **TypeORM**: https://typeorm.io/
- **Zod**: https://zod.dev/
- **Jest**: https://jestjs.io/
- **Auth0**: https://auth0.com/docs/

### Contributing

Found a bug? Have an idea to improve the project?

1. Fork the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add: new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

### License

This project is licensed under the MIT License.

---

**Made with ❤️ by the development team**
