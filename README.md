# NEEC Backend

> API REST empresarial construida con Node.js, Express, TypeScript, Zod y TypeORM sobre MariaDB

**[🇬🇧 English Version](README-EN.md)** | **🇪🇸 Versión en Español**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3+-E83524?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Zod](https://img.shields.io/badge/Zod-3.22+-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)

---

## 📋 Tabla de Contenidos

- [🚀 Inicio Rápido](#-inicio-rápido)
- [🤖 Scripts de Automatización](#-scripts-de-automatización)
- [📖 ¿Qué es NEEC Backend?](#-qué-es-neec-backend)
- [🏗️ Arquitectura](#-arquitectura)
- [🛠️ Stack Tecnológico](#-stack-tecnológico)
- [⚙️ Instalación Completa](#-instalación-completa)
- [📜 Comandos y Scripts](#-comandos-y-scripts)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔧 Sistema de Validación (Zod)](#-sistema-de-validación-zod)
- [🗄️ TypeORM y Base de Datos](#-typeorm-y-base-de-datos)
- [🧪 Testing](#-testing)
- [🔒 Seguridad](#-seguridad)
- [📚 Documentación Adicional](#-documentación-adicional)

---

## 🚀 Inicio Rápido

**¿Primera vez con el proyecto? Solo 3 pasos:**

```bash
# 1️⃣ Instalar dependencias
npm install

# 2️⃣ Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de base de datos

# 3️⃣ Iniciar en desarrollo
npm run dev
```

**✅ ¡Listo!** Tu servidor está corriendo en `http://localhost:8008`

---

## 🤖 Scripts de Automatización

### 🎯 ¿Por qué son importantes?

Los scripts de automatización son la **herramienta más poderosa** de este proyecto. Te permiten crear endpoints completos en segundos, eliminando el trabajo repetitivo y asegurando consistencia en todo el código.

### 1. Generador de Endpoints Completos

**Genera toda la estructura necesaria para un nuevo endpoint con un solo comando.**

#### ¿Qué genera automáticamente?

| Archivo | Descripción | Ubicación |
|---------|-------------|-----------|
| 🛣️ **Route** | Controlador con CRUD completo (GET, POST, PATCH, DELETE) | `routes/nombre.routes.ts` |
| ✅ **Schema** | Validaciones Zod con tipos automáticos | `schemas/nombre.schema.ts` |
| 📝 **Interface** | Tipos TypeScript para DTOs | `interfaces/nombre.interface.ts` |
| 🗃️ **Entity** | Modelo de base de datos con decoradores TypeORM | `entities/nombre.entity.ts` |
| 💾 **Repository** | Capa de acceso a datos con métodos CRUD | `repositories/nombre.repository.ts` |
| 📊 **SQL Script** | Script completo para crear la tabla en BD | `db/sql/create-nombre-table.sql` |

**Bonus:** También actualiza `routes/index.ts` automáticamente para registrar el endpoint.

#### Comando Básico

```bash
npm run generate <nombre> y
```

#### 📦 Ejemplo 1: Crear endpoint de "Productos"

```bash
npm run generate product y
```

**Resultado:**

```
✅ Generando archivos para: product

📁 Archivos creados:
  ✓ routes/product.routes.ts
  ✓ schemas/product.schema.ts  
  ✓ interfaces/product.interface.ts
  ✓ entities/product.entity.ts
  ✓ repositories/product.repository.ts
  ✓ db/sql/create-product-table.sql

📝 routes/index.ts actualizado automáticamente

🎉 ¡Endpoint listo!
```

**Código generado (vista previa):**

```typescript
// routes/product.routes.ts - Controlador con CRUD completo
import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.handler.js';
import { validatorHandler } from '../middlewares/validator.handler.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';
import { ProductRepository } from '../repositories/product.repository.js';

const router = Router();
const productRepository = new ProductRepository();

// GET /api/v1/products - Listar todos
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const products = await productRepository.findAll();
  res.json(products);
}));

// POST /api/v1/products - Crear nuevo
router.post('/', 
  validatorHandler(createProductSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productRepository.create(req.body);
    res.status(201).json(product);
  })
);

// PATCH /api/v1/products/:id - Actualizar
router.patch('/:id',
  validatorHandler(updateProductSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productRepository.update(parseInt(req.params.id), req.body);
    res.json(product);
  })
);

// DELETE /api/v1/products/:id - Eliminar (soft delete)
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await productRepository.delete(parseInt(req.params.id));
  res.status(204).send();
}));

export default router;
```

```typescript
// schemas/product.schema.ts - Validación con Zod
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
// entities/product.entity.ts - Modelo TypeORM
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

**APIs automáticamente disponibles:**

```http
GET    /api/v1/products          # Listar todos los productos
GET    /api/v1/products/:id      # Obtener un producto
POST   /api/v1/products          # Crear producto
PATCH  /api/v1/products/:id      # Actualizar producto
DELETE /api/v1/products/:id      # Eliminar (soft delete)
```

#### 👤 Ejemplo 2: Crear endpoint de "Usuarios"

```bash
npm run generate user y
```

Genera:
- `routes/user.routes.ts`
- `schemas/user.schema.ts`
- `interfaces/user.interface.ts`
- `entities/user.entity.ts`
- `repositories/user.repository.ts`
- `db/sql/create-user-table.sql`
- URLs: `/api/v1/users`, `/api/v1/users/:id`, etc.

#### 🛒 Ejemplo 3: Endpoint con nombre compuesto

```bash
npm run generate product-category y
```

Genera:
- Archivos con nombre: `product-category.*`
- Clases con nombre: `ProductCategory`
- URLs: `/api/v1/product-categories`

---

### 💡 ¿Cómo funciona internamente el generador?

**Paso a paso:**

1. **Lee el nombre:** Ejemplo "product"
   
2. **Convierte formatos:**
   - `PascalCase`: `Product` → Para nombres de clases
   - `camelCase`: `product` → Para variables
   - `kebab-case`: `product` → Para nombres de archivos
   - `plural`: `products` → Para URLs de API

3. **Genera desde plantillas:**
   - Lee templates predefinidos
   - Reemplaza `{{placeholder}}` con valores reales
   - Aplica formato TypeScript

4. **Registra automáticamente:**
   - Actualiza `routes/index.ts`
   - Agrega el import y la ruta

---

### ⚠️ Pasos después de generar

1. **Ejecuta el SQL generado:**
   ```bash
   mysql -u root -p neec_dev < db/sql/create-product-table.sql
   ```

2. **Personaliza los campos** (opcional):
   
   **Agregar validaciones personalizadas:**
   ```typescript
   // schemas/product.schema.ts
   export const createProductSchema = z.object({
     name: z.string().min(3).max(255),
     sku: z.string().regex(/^[A-Z0-9-]+$/), // ← Nueva validación
     price: z.coerce.number().positive(),
     category: z.enum(['electronics', 'clothing', 'food']), // ← Nueva validación
   });
   ```

   **Agregar columnas a la entidad:**
   ```typescript
   // entities/product.entity.ts
   @Entity('products')
   export class Product extends BaseEntity {
     @Column()
     name!: string;

     @Column({ unique: true }) // ← Nueva columna
     sku!: string;

     @Column({ type: 'enum', enum: ['electronics', 'clothing', 'food'] }) // ← Nueva columna
     category!: string;
   }
   ```

3. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

4. **Prueba tu endpoint:**
   ```bash
   # Crear producto
   curl -X POST http://localhost:8008/api/v1/products \
     -H "Content-Type: application/json" \
     -d '{"name": "Laptop", "price": 999.99, "stock": 10}'

   # Listar productos
   curl http://localhost:8008/api/v1/products
   ```

---

### 📚 Documentación adicional del generador

Para más detalles sobre el generador y sus opciones avanzadas, consulta:

- **[scripts/README.md](scripts/README.md)** - Documentación completa del generador
- **[scripts/QUICKSTART.md](scripts/QUICKSTART.md)** - Guía rápida con ejemplos

---

## 📖 ¿Qué es NEEC Backend?

**NEEC Backend** es una API REST empresarial diseñada con las mejores prácticas de Node.js y TypeScript.

### 🎯 Objetivos del Proyecto

- **🔒 Seguro**: OAuth 2.0, Helmet, Rate Limiting, validación estricta
- **📏 Escalable**: Arquitectura en capas, TypeORM con pooling, separación de responsabilidades
- **✅ Confiable**: Tests automatizados, CI/CD, TypeScript strict mode
- **🚀 Productivo**: Generadores automáticos, hot-reload, documentación OpenAPI
- **🌍 Global**: Documentación bilingüe (español/inglés)

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **TypeScript 5.0+** | Seguridad de tipos en tiempo de compilación con strict mode |
| **Validación Zod** | Schemas con inferencia automática de tipos (Single Source of Truth) |
| **TypeORM 0.3+** | ORM moderno con decoradores, migraciones y Query Builder |
| **OAuth 2.0** | Autenticación segura con Auth0 (JWT Bearer tokens) |
| **Rate Limiting** | Protección contra brute-force y abuso |
| **Testing Jest** | Pruebas unitarias y de integración |
| **OpenTelemetry** | Observabilidad y trazabilidad de peticiones |
| **CI/CD** | Pipeline automatizado con GitHub Actions |
| **Documentación Bilingüe** | Código comentado en español e inglés con JSDoc |

---

## 🏗️ Arquitectura

### Arquitectura en Capas (Layered Architecture)

Separación estricta de responsabilidades siguiendo principios SOLID:

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

### Flujo de Datos

```
[Request] → Middleware → Controller → Zod Validation → Service → Repository → TypeORM → Database
                                                                                              ↓
[Response] ← Middleware ← Controller ← Service ← Repository ← TypeORM Entity ← Database
```

### Principios de Diseño

1. **Separation of Concerns**: Cada capa tiene una responsabilidad única
2. **Dependency Injection**: Repositories inyectados en services
3. **Single Source of Truth**: Zod schemas → TypeScript types
4. **Fail Fast**: Validación temprana en controllers
5. **Error Boundaries**: asyncHandler captura errores async

---

## 🛠️ Stack Tecnológico

### Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | v20 LTS | Runtime JavaScript |
| **TypeScript** | 5.0+ | Type safety, strict mode |
| **Express.js** | 4.19 | Framework web HTTP |

### Base de Datos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **TypeORM** | 0.3+ | ORM con decoradores y migraciones |
| **mysql2** | Latest | Driver para MariaDB/MySQL |
| **MariaDB** / **MySQL** | 10.x / 8.x | Base de datos relacional |

### Validación y Tipos

| Tecnología | Propósito |
|------------|-----------|
| **Zod** 3.22 | Validación + inferencia automática de tipos |
| **@hapi/boom** 10.0 | HTTP errors estructurados y tipados |

### Seguridad

| Tecnología | Propósito |
|------------|-----------|
| **Helmet** 8.0 | Security headers HTTP |
| **express-rate-limit** 7.x | Rate limiting por IP |
| **express-oauth2-jwt-bearer** | Integración Auth0 OAuth 2.0 |

### Testing y Desarrollo

| Tecnología | Propósito |
|------------|-----------|
| **Jest** 29.7 | Testing framework |
| **ts-jest** | TypeScript preset para Jest |
| **Nodemon** 3.1 | Hot-reload en desarrollo |
| **ts-node** | Ejecutar TypeScript directamente |
| **ESLint** 9.8 | Linting y code style |

### Observabilidad

| Tecnología | Propósito |
|------------|-----------|
| **Sentry** | APM, error tracking y performance monitoring |

---

## ⚙️ Instalación Completa

### Requisitos Previos

| Herramienta | Versión Mínima | Comando de Verificación |
|-------------|----------------|-------------------------|
| **Node.js** | v20 LTS | `node --version` |
| **npm** | v9+ | `npm --version` |
| **MariaDB/MySQL** | 10.x / 8.x | `mysql --version` |

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/ismaeltorresh/neec-backend.git
cd neec-backend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- TypeScript y ts-node
- Express.js y middlewares (helmet, cors, rate-limit)
- TypeORM y driver mysql2
- Zod para validación
- Jest para testing
- ESLint para linting
- Y todas las demás dependencias

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env  # o: code .env, vim .env
```

**Variables críticas a configurar:**

```bash
# 🌍 Aplicación
NODE_ENV=development        # development | testing | production
PORT=8008                  # Puerto del servidor

# 🗄️ Base de Datos
DB_HOST=localhost          # Host
DB_PORT=3306              # Puerto (3306 por defecto)
DB_USER=root              # Usuario
DB_PASSWORD=tu_password   # ⚠️ Cambiar por tu contraseña
DB_NAME=neec_dev          # Nombre de la base de datos

# 🔐 OAuth 2.0 (Auth0) - Opcional para empezar
AUDIENCE=https://api.loha.mx
ISSUER_BASE_URL=https://dev-xxx.us.auth0.com/

# 🛡️ Seguridad
BODY_LIMIT=100kb
DOCS_TOKEN=token_secreto

# 📊 Monitoreo (Opcional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.05
```

### Paso 4: Crear la Base de Datos

**Opción A: Crear manualmente (recomendado)**

```bash
# Conectar a MySQL/MariaDB
mysql -u root -p

# En el prompt de MySQL:
CREATE DATABASE neec_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Opción B: Usar script SQL (legacy)**

```bash
mysql -u root -p < db/database.sql
```

### Paso 5: Ejecutar Migraciones (si existen)

```bash
# Ver migraciones pendientes
npm run migration:show

# Ejecutar migraciones
npm run migration:run
```

### Paso 6: Iniciar el Servidor

**Modo Desarrollo (con hot-reload):**

```bash
npm run dev
```

**Modo Producción:**

```bash
# Compilar TypeScript a JavaScript
npm run build

# Iniciar servidor con código compilado
npm start
```

### ✅ Verificar Instalación

Si todo salió bien, deberías ver:

```
🚀 Server running on port 8008
✅ Database connected successfully
📝 Environment: development
```

Ahora puedes acceder a:
- **API**: http://localhost:8008
- **Health Check**: http://localhost:8008/health
- **API Info**: http://localhost:8008/api

---

## 📜 Comandos y Scripts

### 🔥 Desarrollo

```bash
npm run dev          # Servidor con hot-reload (nodemon + ts-node)
npm run type-check   # Verificar tipos TypeScript sin compilar
npm run lint         # ESLint - revisar calidad del código
```

### 🤖 Generadores

```bash
# Generar endpoint completo (6 archivos + SQL)
npm run generate <nombre> y

# Ejemplos:
npm run generate customer y          # Endpoint de clientes
npm run generate product-review y    # Endpoint de reseñas
npm run generate shipping-address y  # Endpoint de direcciones
```

### 🏗️ Compilación

```bash
npm run build        # Compilar TypeScript → JavaScript en dist/
npm start            # Ejecutar código compilado (producción)
```

### 🗄️ Base de Datos (TypeORM)

```bash
npm run migration:show      # Ver migraciones
npm run migration:run       # Ejecutar migraciones pendientes
npm run migration:revert    # Revertir última migración
npm run migration:generate -- -n NombreMigracion  # Generar desde entities
npm run migration:create -- -n NombreMigracion    # Crear migración vacía
```

### 🧪 Testing

```bash
npm test             # Ejecutar todos los tests
npm run test:watch   # Modo watch (re-ejecuta al cambiar archivos)
npm run test:coverage # Tests con reporte de cobertura
```

### 🔒 Seguridad

```bash
npm run security:audit   # Auditoría de seguridad
npm audit fix            # Arreglar vulnerabilidades automáticamente
```

### 📚 Documentación

```bash
npm run docs         # Servidor de documentación OpenAPI/Swagger
```

---

## 📁 Estructura del Proyecto

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
│   └── sql/                       # Scripts SQL generados automáticamente
│
├── 📁 entities/                   # [ES] Modelos de BD / [EN] Database models
│   ├── base.entity.ts             # Entidad base con campos comunes
│   ├── example.entity.ts          # Ejemplo de entidad
│   └── README.md
│
├── 📁 schemas/                    # [ES] Validaciones Zod / [EN] Zod validations
│   ├── example.schema.ts          # Validaciones con inferencia de tipos
│   └── template.schema.ts
│
├── 📁 interfaces/                 # [ES] Tipos TypeScript / [EN] TypeScript types
│   ├── example.interface.ts       # DTOs y tipos de respuesta
│   └── README.md
│
├── 📁 routes/                     # [ES] Controladores / [EN] Controllers
│   ├── index.ts                   # Router principal
│   ├── example.routes.ts          # CRUD completo
│   └── template.routes.ts
│
├── 📁 repositories/               # [ES] Acceso a datos / [EN] Data access
│   ├── base.repository.ts         # Repository genérico con CRUD
│   ├── example.repository.ts
│   └── README.md
│
├── 📁 migrations/                 # [ES] Migraciones de BD / [EN] Database migrations
│   ├── 1703851200000-CreateExampleTable.ts
│   └── README.md
│
├── 📁 middlewares/                # [ES] Middleware Express / [EN] Express middleware
│   ├── async.handler.ts           # asyncHandler, withTimeout, withRetry
│   ├── error.handler.ts           # Manejador global de errores
│   ├── validator.handler.ts       # Validación con Zod
│   ├── rate-limit.handler.ts      # Rate limiting
│   └── perf.handler.ts            # Monitoreo de rendimiento
│
├── 📁 utils/                      # [ES] Utilidades / [EN] Utilities
│   ├── logger.ts                  # Sistema de logging estructurado
│   ├── validation.ts              # Validadores personalizados
│   ├── pagination.ts              # Helpers de paginación
│   └── response.ts                # Helpers HTTP response
│
├── 📁 types/                      # [ES] Tipos globales / [EN] Global types
│   └── index.ts                   # Interfaces compartidas
│
├── 📁 environments/               # [ES] Configuración por ambiente / [EN] Environment config
│   ├── index.ts                   # Carga automática según NODE_ENV
│   ├── environments.development.ts
│   ├── environments.production.ts
│   └── environments.testing.ts
│
├── 📁 scripts/                    # [ES] Scripts de automatización / [EN] Automation scripts
│   ├── generate-endpoint.js       # 🤖 Generador de endpoints
│   ├── security-audit.sh          # Auditoría de seguridad
│   ├── README.md
│   └── QUICKSTART.md
│
└── 📁 test/                       # [ES] Archivos de pruebas / [EN] Test files
    ├── schema-sync.test.ts
    └── fakedata.json
```

### 💡 ¿Qué hace cada carpeta?

| Carpeta | Responsabilidad | Archivos Clave |
|---------|-----------------|----------------|
| **routes/** | Manejar peticiones HTTP y responder | `*.routes.ts` |
| **schemas/** | Validar datos de entrada con Zod | `*.schema.ts` |
| **entities/** | Definir modelos de base de datos | `*.entity.ts` |
| **repositories/** | Realizar operaciones CRUD en la BD | `*.repository.ts` |
| **interfaces/** | Definir tipos TypeScript | `*.interface.ts` |
| **middlewares/** | Interceptar y procesar peticiones | `*.handler.ts` |
| **utils/** | Funciones auxiliares reutilizables | `logger.ts`, etc. |
| **migrations/** | Versionar cambios en la BD | Timestamp-*.ts |

---

## 🔧 Sistema de Validación (Zod)

### ¿Por qué Zod?

**Zod** es una biblioteca de validación **TypeScript-first** que permite:

1. **Single Source of Truth**: Define el schema una vez, obtén tipos automáticamente
2. **Validación Runtime**: Valida datos en tiempo de ejecución
3. **Type Safety**: Tipos TypeScript inferidos automáticamente
4. **Error Messages**: Mensajes de error personalizados y descriptivos

### Ejemplo Completo

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

### Uso en Routes

```typescript
// routes/product.routes.ts

import { Router } from 'express';
import { validatorHandler } from '../middlewares/validator.handler.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

// [ES] Middleware validatorHandler aplica el schema de Zod
// [EN] validatorHandler middleware applies the Zod schema
router.post('/',
  validatorHandler(createProductSchema, 'body'),  // ← Validación automática
  asyncHandler(async (req: Request, res: Response) => {
    // [ES] req.body ya está validado y tipado
    // [EN] req.body is already validated and typed
    const product = req.body; // Tipo: CreateProductDto
    // ...
  })
);
```

### Validaciones Avanzadas

```typescript
// [ES] Validación personalizada / [EN] Custom validation
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '[ES] Las contraseñas no coinciden / [EN] Passwords do not match',
  path: ['confirmPassword'],
});

// [ES] Transformaciones / [EN] Transformations
const normalizedSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  name: z.string().transform((val) => val.trim()),
});

// [ES] Validación condicional / [EN] Conditional validation
const shippingSchema = z.object({
  needsShipping: z.boolean(),
  address: z.string().optional(),
}).refine((data) => {
  if (data.needsShipping) {
    return data.address !== undefined;
  }
  return true;
}, {
  message: '[ES] La dirección es requerida / [EN] Address is required',
  path: ['address'],
});
```

---

## 🗄️ TypeORM y Base de Datos

### Configuración

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

### Entities (Modelos)

```typescript
// entities/product.entity.ts

import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity.js';

/**
 * [ES] Entidad de productos
 * [EN] Product entity
 */
@Entity('products')
@Index(['sku'], { unique: true })
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({
    type: 'enum',
    enum: ['electronics', 'clothing', 'food', 'other'],
    default: 'other'
  })
  category!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
```

### BaseEntity

Todos los modelos extienden de `BaseEntity`:

```typescript
// entities/base.entity.ts

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column
} from 'typeorm';

/**
 * [ES] Entidad base con campos comunes a todas las tablas
 * [EN] Base entity with common fields for all tables
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'record_status', type: 'boolean', default: true })
  recordStatus!: boolean;

  @Column({ name: 'data_source', type: 'varchar', length: 50, default: 'sql' })
  dataSource!: string;
}
```

### Repositories

```typescript
// repositories/product.repository.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../db/connection.js';
import { Product } from '../entities/product.entity.js';
import { BaseRepository } from './base.repository.js';

/**
 * [ES] Repository para operaciones de productos
 * [EN] Repository for product operations
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  /**
   * [ES] Buscar productos por categoría
   * [EN] Find products by category
   */
  async findByCategory(category: string): Promise<Product[]> {
    return await this.repository.find({
      where: { category, recordStatus: true },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * [ES] Buscar producto por SKU
   * [EN] Find product by SKU
   */
  async findBySku(sku: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { sku, recordStatus: true }
    });
  }

  /**
   * [ES] Actualizar stock
   * [EN] Update stock
   */
  async updateStock(id: number, quantity: number): Promise<void> {
    await this.repository.increment({ id }, 'stock', quantity);
  }
}
```

### Migraciones

**Generar migración desde entities:**

```bash
npm run migration:generate -- -n AddCategoryToProduct
```

**Crear migración vacía:**

```bash
npm run migration:create -- -n CreateProductsTable
```

**Ejecutar migraciones:**

```bash
npm run migration:run
```

**Revertir última migración:**

```bash
npm run migration:revert
```

**Ejemplo de migración:**

```typescript
// migrations/1703851200000-CreateProductsTable.ts

import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateProductsTable1703851200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'products',
      new Index({
        columnNames: ['sku'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

---

## 🧪 Testing

### Configuración Jest

```javascript
// jest.config.js

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
  ],
};
```

### Ejemplo de Test

```typescript
// middlewares/async.handler.test.ts

import { asyncHandler } from './async.handler.js';
import type { Request, Response, NextFunction } from 'express';

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next with error if async function throws', async () => {
    const error = new Error('Test error');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should resolve successfully if no error', async () => {
    const handler = asyncHandler(async (req: Request, res: Response) => {
      res.json({ success: true });
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Tests con reporte de cobertura
npm run test:coverage
```

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

| Característica | Implementación | Propósito |
|----------------|----------------|-----------|
| **Helmet** | `app.use(helmet())` | Security headers HTTP |
| **Rate Limiting** | `rate-limit.handler.ts` | Prevenir brute-force |
| **OAuth 2.0** | Auth0 integration | Autenticación segura |
| **Zod Validation** | Input validation | Prevenir inyección SQL/XSS |
| **CORS** | Configurado para dominios permitidos | Controlar acceso cross-origin |
| **TypeScript Strict** | `strict: true` | Type safety |

### OAuth 2.0 (Auth0)

```typescript
// index.ts

import { auth } from 'express-oauth2-jwt-bearer';

// [ES] Middleware de autenticación OAuth 2.0
// [EN] OAuth 2.0 authentication middleware
const checkJwt = auth({
  audience: env.audience,
  issuerBaseURL: env.issuerBaseUrl,
});

// [ES] Proteger rutas con OAuth
// [EN] Protect routes with OAuth
app.use('/api/v1/protected', checkJwt);
```

### Rate Limiting

```typescript
// middlewares/rate-limit.handler.ts

import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: '[ES] Demasiadas peticiones / [EN] Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Validación de Entrada

```typescript
// [ES] SIEMPRE validar entrada del usuario
// [EN] ALWAYS validate user input

router.post('/',
  validatorHandler(createProductSchema, 'body'),  // ← Validación Zod
  asyncHandler(async (req: Request, res: Response) => {
    // req.body ya está validado
  })
);
```

### Auditoría de Seguridad

```bash
# Auditoría de dependencias
npm run security:audit

# Arreglar vulnerabilidades automáticamente
npm audit fix

# Auditoría con GitHub Actions (CI/CD)
# Ver: .github/workflows/ci-cd.yml
```

---

## 📚 Documentación Adicional

### Documentos del Proyecto

- **[README-EN.md](README-EN.md)** - Documentación en inglés
- **[scripts/README.md](scripts/README.md)** - Documentación del generador
- **[scripts/QUICKSTART.md](scripts/QUICKSTART.md)** - Guía rápida del generador
- **[entities/README.md](entities/README.md)** - Guía de entities
- **[repositories/README.md](repositories/README.md)** - Guía de repositories
- **[migrations/README.md](migrations/README.md)** - Guía de migraciones

### Recursos Externos

- **TypeScript**: https://www.typescriptlang.org/docs/
- **Express.js**: https://expressjs.com/
- **TypeORM**: https://typeorm.io/
- **Zod**: https://zod.dev/
- **Jest**: https://jestjs.io/
- **Auth0**: https://auth0.com/docs/

### Contribuir

¿Encontraste un bug? ¿Tienes una idea para mejorar el proyecto?

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Licencia

Este proyecto está bajo la licencia MIT.

---

**Hecho con ❤️ por el equipo de desarrollo**
