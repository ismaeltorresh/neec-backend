# Interfaces

Este directorio contiene interfaces TypeScript generadas desde los schemas Zod.

## Propósito

Las interfaces proporcionan:
- ✅ **DTOs tipados** - Data Transfer Objects sin dependencias de ORM
- ✅ **Contratos claros** - Definición explícita de estructuras de datos
- ✅ **Reutilización** - Usables en servicios, controllers, tests
- ✅ **Documentación** - Type hints y autocompletado
- ✅ **Independencia** - Sin acoplar con TypeORM/Zod en runtime

## Estructura

```
interfaces/
├── example.interface.ts     # Interfaces de Example
├── user.interface.ts        # Interfaces de User (cuando se cree)
└── README.md               # Este archivo
```

## Sincronización con Zod

### Workflow Recomendado

```
1. Schema Zod (schemas/entity.schema.ts)
   ↓
2. Interface TypeScript (interfaces/entity.interface.ts)
   ↓
3. Entidad TypeORM (entities/entity.entity.ts)
```

### Ejemplo: De Zod a Interface

#### Schema Zod
```typescript
// schemas/user.schema.ts
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  age: z.number().int().min(18).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

#### Interface TypeScript
```typescript
// interfaces/user.interface.ts
export interface ICreateUser {
  name: string;
  email: string;
  age?: number;
}

export interface IUser extends IBaseEntity {
  name: string;
  email: string;
  age: number | null;
}
```

## Convenciones de Nomenclatura

### Prefijos
- `I` - Interface base: `IUser`, `IProduct`
- `ICreate` - Para creación: `ICreateUser`, `ICreateProduct`
- `IUpdate` - Para actualización: `IUpdateUser`, `IUpdateProduct`
- `IQuery` - Para filtros/búsqueda: `IUserQuery`, `IProductQuery`

### Sufijos
- `Request` - Datos de entrada: `UserRequest`
- `Response` - Datos de salida: `UserResponse`
- `DTO` - Data Transfer Object: `UserDTO`

## Uso en el Código

### En Servicios
```typescript
import type { ICreateUser, IUpdateUser, IUser } from '../interfaces/user.interface.js';

export class UserService {
  async createUser(data: ICreateUser): Promise<IUser> {
    // data tiene tipo explícito
    const user = await this.userRepo.create(data);
    return user as IUser; // Cast seguro
  }

  async updateUser(id: number, data: IUpdateUser): Promise<IUser> {
    return await this.userRepo.update(id, data) as IUser;
  }
}
```

### En Controllers
```typescript
import type { ICreateUser, IPaginatedResponse } from '../interfaces/user.interface.js';

router.post('/', async (req: Request, res: Response) => {
  const data = req.body as ICreateUser;
  const user = await userService.createUser(data);
  res.status(201).json(user);
});

router.get('/', async (req: Request, res: Response) => {
  const result: IPaginatedResponse<IUser> = await userService.list();
  res.json(result);
});
```

### En Tests
```typescript
import type { ICreateUser, IUser } from '../interfaces/user.interface.js';

describe('UserService', () => {
  it('debe crear usuario', async () => {
    const input: ICreateUser = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    };
    
    const result: IUser = await userService.createUser(input);
    
    expect(result.name).toBe(input.name);
    expect(result.id).toBeDefined();
  });
});
```

## Interfaces vs Types vs Zod Infer

### Cuándo Usar Cada Uno

#### Interfaces (interfaces/)
```typescript
export interface IUser {
  name: string;
  email: string;
}
```
**Usar para:**
- ✅ Contratos públicos de API
- ✅ Definiciones extendibles (`extends`)
- ✅ Cuando no dependen de Zod en runtime
- ✅ DTOs compartidos entre capas

#### Types Inferidos (desde Zod)
```typescript
export type CreateUserInput = z.infer<typeof createUserSchema>;
```
**Usar para:**
- ✅ Datos validados por Zod
- ✅ Controllers con validación
- ✅ Garantizar sincronización con schema
- ✅ Transformaciones automáticas (lowercase, trim)

#### Types Alias (types/index.ts)
```typescript
export type UserId = number;
export type UserRole = 'admin' | 'user';
```
**Usar para:**
- ✅ Tipos primitivos con semántica
- ✅ Uniones y tipos complejos
- ✅ Utilities types (Partial, Pick, etc.)

## Helpers de Tipos

### Utility Types Incluidos

```typescript
// En utils/schema-to-interface.ts

// Hacer campos específicos opcionales
type UserWithOptionalAge = OptionalFields<IUser, 'age'>;

// Hacer campos específicos requeridos
type UserRequiredEmail = RequireFields<IUser, 'email'>;

// Excluir null/undefined
type NonNullUser = NonNullableFields<IUser>;

// Versión parcial
type PartialUser = PartialType<IUser>;
```

## Generación Automática (Futuro)

### Script de Generación (Planeado)
```bash
npm run generate:interfaces -- User
```

Esto generaría automáticamente:
1. `interfaces/user.interface.ts` desde `schemas/user.schema.ts`
2. Con todos los tipos base (ICreateUser, IUpdateUser, IUser)
3. Incluyendo JSDoc comments
4. Sincronizado con el schema Zod

### Template
Ver `utils/schema-to-interface.ts` para el helper de generación.

## Checklist de Sincronización

Al crear/modificar un schema Zod:

- [ ] ✅ Crear/actualizar schema Zod
- [ ] ✅ Crear/actualizar interfaces TypeScript
- [ ] ✅ Crear/actualizar entidad TypeORM
- [ ] ✅ Verificar tipos coincidan
- [ ] ✅ Actualizar tests
- [ ] ✅ Generar migración (si aplica)

## Beneficios

### Type Safety
```typescript
// ✅ TypeScript detecta errores
const user: IUser = {
  name: 'John',
  // Error: falta 'email'
};
```

### Autocompletado
```typescript
// IDE sugiere campos disponibles
function processUser(user: IUser) {
  user.n // Autocompleta: name
  user.e // Autocompleta: email
}
```

### Refactoring Seguro
```typescript
// Si renombras un campo en la interface
// TypeScript muestra todos los lugares que deben actualizarse
```

### Documentación Inline
```typescript
/**
 * Interface para crear usuario
 * Campos requeridos: name, email
 * Campos opcionales: age
 */
export interface ICreateUser { ... }
```

## Best Practices

### ✅ DO
- Mantener interfaces sincronizadas con schemas Zod
- Usar prefijos consistentes (I, ICreate, IUpdate)
- Documentar con JSDoc
- Exportar tipos utility (Partial, Pick, etc.)
- Usar en firmas de funciones públicas

### ❌ DON'T
- No duplicar lógica de validación (eso es de Zod)
- No incluir métodos (usar types o classes)
- No usar `any` en interfaces
- No mezclar interfaces con implementaciones

## Referencias

- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Zod Type Inference](https://zod.dev/?id=type-inference)
- [Schema to Interface Helper](../utils/schema-to-interface.ts)

---

**Última actualización:** 29 de diciembre de 2025  
**Autor:** GitHub Copilot
