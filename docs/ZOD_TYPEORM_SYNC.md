# Sincronización Zod ↔ TypeORM

## Problema

En proyectos con TypeORM + Zod, tenemos **dos fuentes de verdad**:

1. **Entidades TypeORM** (con decoradores) - Definen el schema de BD
2. **Schemas Zod** - Validan datos de entrada

Esto puede causar:
- ❌ Duplicación de definiciones
- ❌ Desincronización entre validación y BD
- ❌ Mantenimiento complejo

## Solución: Zod como Fuente de Verdad

### Estrategia Implementada

1. **Definir schemas Zod primero** (validación + tipos)
2. **Crear entidades TypeORM manualmente** (pero alineadas con Zod)
3. **Inferir tipos TypeScript desde Zod** (no desde entidades)
4. **Usar validación Zod en controllers** antes de pasar a repositorios

---

## 📋 Patrón Recomendado

### 1. Schema Zod (schemas/example.schema.ts)

```typescript
import { z } from 'zod';

// Schema para CREATE (sin campos auto-generados)
export const createExampleSchema = z.object({
  name: z.string().min(3).max(255).trim(),
  email: z.string().email().max(255).toLowerCase(),
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().default(true),
});

// Schema para UPDATE (todos opcionales)
export const updateExampleSchema = createExampleSchema.partial();

// Schema para RESPONSE (incluye campos de BD)
export const exampleResponseSchema = createExampleSchema.merge(
  z.object({
    id: z.number().int().positive(),
    recordStatus: z.boolean(),
    dataSource: z.enum(['sql', 'nosql', 'both', 'fake']),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
);

// Tipos inferidos (SINGLE SOURCE OF TRUTH)
export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;
```

### 2. Entidad TypeORM (entities/example.entity.ts)

```typescript
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity.js';

/**
 * ⚠️ MANTENER SINCRONIZADO CON: schemas/example.schema.ts
 * 
 * Checklist de sincronización:
 * ✓ name: varchar(255) ↔ z.string().max(255)
 * ✓ email: varchar(255) unique ↔ z.string().email().max(255)
 * ✓ description: text nullable ↔ z.string().optional().nullable()
 * ✓ isActive: boolean default true ↔ z.boolean().default(true)
 */
@Entity('examples')
@Index(['email'], { unique: true })
export class Example extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
```

### 3. Controlador (routes/example.routes.ts)

```typescript
import { Router } from 'express';
import { validatorHandler } from '../middlewares/validator.handler.js';
import { asyncHandler } from '../middlewares/async.handler.js';
import { createExampleSchema, updateExampleSchema } from '../schemas/example.schema.js';
import type { CreateExampleInput } from '../schemas/example.schema.js';
import { ExampleRepository } from '../repositories/example.repository.js';

const router = Router();
const exampleRepo = new ExampleRepository();

// CREATE con validación Zod
router.post(
  '/',
  validatorHandler(createExampleSchema, 'body'),
  asyncHandler(async (req, res) => {
    // req.body ya está validado y tipado como CreateExampleInput
    const data = req.body as CreateExampleInput;
    const example = await exampleRepo.create(data);
    res.status(201).json(example);
  })
);

// UPDATE con validación Zod
router.patch(
  '/:id',
  validatorHandler(updateExampleSchema, 'body'),
  asyncHandler(async (req, res) => {
    const data = req.body as UpdateExampleInput;
    const id = parseInt(req.params.id);
    const example = await exampleRepo.update(id, data);
    res.json(example);
  })
);
```

---

## ✅ Ventajas de Este Enfoque

1. **Zod como Fuente de Verdad**
   - Validación + tipos en un solo lugar
   - Tipos inferidos automáticamente: `z.infer<typeof schema>`

2. **TypeORM Alineado**
   - Entidades reflejan la estructura de Zod
   - Comentarios explícitos sobre sincronización

3. **Type Safety Completo**
   ```typescript
   // Los tipos se infieren desde Zod
   const data: CreateExampleInput = {
     name: 'Test',
     email: 'test@example.com',
     // TypeScript sabe exactamente qué campos son válidos
   };
   ```

4. **Validación Antes de BD**
   - Zod valida en el controller
   - TypeORM solo guarda datos ya validados
   - Errores claros para el cliente

5. **DRY (Don't Repeat Yourself)**
   - Un schema Zod → múltiples usos:
     - Validación de entrada
     - Tipos TypeScript
     - Documentación OpenAPI
     - Tests

---

## 🔄 Workflow de Sincronización

### Cuando Agregues un Campo

#### 1. Actualizar Schema Zod (PRIMERO)

```typescript
// schemas/example.schema.ts
export const createExampleSchema = z.object({
  // ... campos existentes
  
  // ✨ NUEVO CAMPO
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Teléfono inválido')
    .optional(),
});
```

#### 2. Actualizar Interface TypeScript

```typescript
// interfaces/example.interface.ts
export interface ICreateExample {
  // ... campos existentes
  
  // ✨ NUEVO CAMPO (sincronizado con Zod)
  phone?: string;
}

export interface IExample extends IBaseEntity {
  // ... campos existentes
  phone: string | null;
}
```

#### 3. Actualizar Entidad TypeORM

```typescript
// entities/example.entity.ts
@Entity('examples')
export class Example extends BaseEntity {
  // ... campos existentes
  
  // ✨ NUEVO CAMPO (sincronizado con Zod e Interface)
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;
}
```

#### 4. Generar Migración

```bash
npm run migration:generate -- migrations/AddPhoneToExample
npm run migration:run
```

#### 5. Actualizar Tests

```typescript
describe('Example Creation', () => {
  it('debe crear con teléfono', async () => {
    const data = {
      name: 'Test',
      email: 'test@example.com',
      phone: '+1234567890' // ✨ Nuevo campo
    };
    
    // Zod valida automáticamente
    const validated = createExampleSchema.parse(data);
    const example = await exampleRepo.create(validated);
    
    expect(example.phone).toBe('+1234567890');
  });
});
```

---

## 📝 Checklist de Sincronización

Al modificar campos, verificar:

### Longitud de Strings
- ✅ Zod: `.max(255)` ↔ TypeORM: `length: 255`
- ✅ Zod: `.min(3)` ↔ Validación lógica

### Opcionalidad
- ✅ Zod: `.optional()` ↔ TypeORM: `nullable: true`
- ✅ Zod: `.nullable()` ↔ TypeORM: `nullable: true`

### Valores por Defecto
- ✅ Zod: `.default(true)` ↔ TypeORM: `default: true`

### Tipos de Datos
- ✅ Zod: `z.string()` ↔ TypeORM: `type: 'varchar'`
- ✅ Zod: `z.number()` ↔ TypeORM: `type: 'int'` o `'decimal'`
- ✅ Zod: `z.boolean()` ↔ TypeORM: `type: 'boolean'`
- ✅ Zod: `z.date()` ↔ TypeORM: `type: 'timestamp'`

### Validaciones Especiales
- ✅ Zod: `.email()` ↔ TypeORM: Validación en app
- ✅ Zod: `.regex()` ↔ TypeORM: Validación en app
- ✅ Zod: `.enum()` ↔ TypeORM: `type: 'enum', enum: [...]`

### Constraints de BD
- ✅ TypeORM: `unique: true` → Agregar validación en servicio
- ✅ TypeORM: `@Index()` → Optimización de queries

---

## 🛠️ Herramientas Avanzadas (Opcionales)

### Opción 1: ts-to-zod (Generar Zod desde TypeScript)

```bash
npm install -D ts-to-zod

# Generar schemas Zod desde interfaces TypeScript
ts-to-zod src/types/example.ts src/schemas/example.schema.ts
```

### Opción 2: Decoradores Personalizados

Crear decoradores que combinen TypeORM + Zod:

```typescript
// decorators/validated-column.ts
import { Column } from 'typeorm';
import { z } from 'zod';

export function ValidatedColumn(zodSchema: z.ZodType, options: any) {
  return function(target: any, propertyKey: string) {
    // Registrar schema Zod para el campo
    Reflect.defineMetadata('zod:schema', zodSchema, target, propertyKey);
    // Aplicar decorador Column de TypeORM
    Column(options)(target, propertyKey);
  };
}

// Uso
class Example extends BaseEntity {
  @ValidatedColumn(z.string().max(255), { type: 'varchar', length: 255 })
  name!: string;
}
```

### Opción 3: typeorm-zod (Librería Externa)

```bash
npm install typeorm-zod

# Genera schemas Zod desde entidades TypeORM
```

---

## 🔍 Ejemplo Completo: Usuario

### Schema Zod

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(100),
  age: z.number().int().min(18).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### Entidad TypeORM

```typescript
// entities/user.entity.ts
import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity.js';
import bcrypt from 'bcrypt';

/**
 * ⚠️ SINCRONIZADO CON: schemas/user.schema.ts
 */
@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'enum', enum: ['admin', 'user', 'guest'], default: 'user' })
  role!: 'admin' | 'user' | 'guest';

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
```

### Servicio

```typescript
// services/user.service.ts
import { UserRepository } from '../repositories/user.repository.js';
import { validateCreateUser } from '../schemas/user.schema.js';
import type { CreateUserInput } from '../schemas/user.schema.js';
import boom from '@hapi/boom';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(data: unknown) {
    // 1. Validar con Zod (lanza error si inválido)
    const validData: CreateUserInput = validateCreateUser(data);

    // 2. Verificar email único (regla de negocio)
    const exists = await this.userRepo.findByEmail(validData.email);
    if (exists) {
      throw boom.conflict('Email ya registrado');
    }

    // 3. Crear en BD (datos ya validados)
    return await this.userRepo.create(validData);
  }
}
```

---

## 📊 Comparación de Enfoques

### Enfoque Manual (Implementado)

✅ **Ventajas:**
- Control total sobre validación
- Flexibilidad máxima
- Sin dependencias extras
- Claridad en el código

❌ **Desventajas:**
- Sincronización manual
- Posible desincronización

### Enfoque con Librería (typeorm-zod)

✅ **Ventajas:**
- Generación automática
- Siempre sincronizado
- Menos código boilerplate

❌ **Desventajas:**
- Dependencia externa
- Menos control
- Puede generar schemas sub-óptimos

---

## 🎯 Recomendación Final

Para este proyecto, **mantener el enfoque manual** con:

1. ✅ Zod como fuente de verdad para validación
2. ✅ TypeORM para persistencia
3. ✅ Comentarios explícitos sobre sincronización
4. ✅ Checklist de revisión en PRs
5. ✅ Tests que validen ambos (Zod + TypeORM)

### Test de Sincronización

```typescript
// tests/schema-sync.test.ts
describe('Zod ↔ TypeORM Sync', () => {
  it('Example: campos deben coincidir', () => {
    const zodKeys = Object.keys(createExampleSchema.shape);
    const entityColumns = ['name', 'email', 'description', 'isActive'];
    
    expect(zodKeys.sort()).toEqual(entityColumns.sort());
  });

  it('Example: longitudes deben coincidir', () => {
    // Zod define max(255) para name
    const zodMax = createExampleSchema.shape.name._def.checks
      .find(c => c.kind === 'max')?.value;
    
    // TypeORM tiene length: 255
    expect(zodMax).toBe(255);
  });
});
```

---

## 📚 Referencias

- [Zod Documentation](https://zod.dev/)
- [TypeORM Entities](https://typeorm.io/entities)
- [ts-to-zod](https://github.com/fabien0102/ts-to-zod)
- [Type Inference in Zod](https://zod.dev/?id=type-inference)

---

**Última actualización:** 29 de diciembre de 2025  
**Autor:** GitHub Copilot
