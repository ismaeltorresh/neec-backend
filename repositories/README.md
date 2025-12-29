# Repositorios TypeORM

Este directorio contiene los repositorios que implementan el patrón Repository para acceso a datos.

## Estructura

- **base.repository.ts** - Repositorio base genérico con operaciones CRUD
- **example.repository.ts** - Repositorio de ejemplo/template

## Patrón Repository

El patrón Repository abstrae la lógica de acceso a datos, proporcionando una interfaz limpia para servicios.

### Ventajas

✅ **Separación de responsabilidades** - Lógica de negocio vs acceso a datos  
✅ **Testabilidad** - Fácil de mockear para tests  
✅ **Reutilización** - Operaciones comunes en BaseRepository  
✅ **Type safety** - Tipado completo con TypeScript  
✅ **Mantenibilidad** - Cambios en DB solo afectan repositorios  

## Crear un Nuevo Repositorio

### 1. Extender BaseRepository

```typescript
import { BaseRepository } from './base.repository.js';
import { MiEntidad } from '../entities/mi-entidad.entity.js';
import { AppDataSource } from '../db/connection.js';

export class MiEntidadRepository extends BaseRepository<MiEntidad> {
  constructor() {
    super(AppDataSource.getRepository(MiEntidad));
  }

  // Métodos personalizados aquí
}
```

### 2. Métodos Heredados de BaseRepository

Todos los repositorios tienen acceso automático a:

```typescript
// Buscar
await repository.findAll(options?)
await repository.findById(id)
await repository.findOne(where)
await repository.count(where?)

// Crear
await repository.create(data)

// Actualizar
await repository.update(id, data)

// Eliminar
await repository.delete(id)        // Soft delete
await repository.hardDelete(id)    // Eliminación física
```

### 3. Métodos Personalizados

```typescript
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  /**
   * Busca usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email, recordStatus: true }
    });
  }

  /**
   * Busca usuarios por rol con paginación
   */
  async findByRole(role: string, page: number = 1, limit: number = 10): Promise<User[]> {
    return await this.repository.find({
      where: { role, recordStatus: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Busca usuarios activos en los últimos N días
   */
  async findRecentlyActive(days: number): Promise<User[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.repository
      .createQueryBuilder('user')
      .where('user.lastLoginAt > :date', { date })
      .andWhere('user.recordStatus = :status', { status: true })
      .orderBy('user.lastLoginAt', 'DESC')
      .getMany();
  }
}
```

## Query Builder

Para queries complejas, usa el Query Builder de TypeORM:

```typescript
// Búsqueda con múltiples condiciones
async searchUsers(filters: {
  name?: string;
  email?: string;
  minAge?: number;
  maxAge?: number;
}): Promise<User[]> {
  const query = this.repository
    .createQueryBuilder('user')
    .where('user.recordStatus = :status', { status: true });

  if (filters.name) {
    query.andWhere('user.name LIKE :name', { name: `%${filters.name}%` });
  }

  if (filters.email) {
    query.andWhere('user.email LIKE :email', { email: `%${filters.email}%` });
  }

  if (filters.minAge) {
    query.andWhere('user.age >= :minAge', { minAge: filters.minAge });
  }

  if (filters.maxAge) {
    query.andWhere('user.age <= :maxAge', { maxAge: filters.maxAge });
  }

  return await query
    .orderBy('user.createdAt', 'DESC')
    .getMany();
}
```

## Joins y Relaciones

```typescript
// Eager loading con joins
async findUserWithOrders(userId: number): Promise<User | null> {
  return await this.repository.findOne({
    where: { id: userId },
    relations: ['orders', 'orders.items']
  });
}

// Query Builder con joins
async findUsersWithActiveOrders(): Promise<User[]> {
  return await this.repository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.orders', 'order')
    .where('order.status = :status', { status: 'active' })
    .andWhere('user.recordStatus = :recordStatus', { recordStatus: true })
    .getMany();
}
```

## Transacciones

```typescript
import { AppDataSource } from '../db/connection.js';

async createUserWithProfile(userData: any, profileData: any): Promise<User> {
  return await AppDataSource.transaction(async manager => {
    // Crear usuario
    const user = manager.create(User, userData);
    await manager.save(user);

    // Crear perfil
    const profile = manager.create(Profile, {
      ...profileData,
      userId: user.id
    });
    await manager.save(profile);

    return user;
  });
}
```

## Agregaciones

```typescript
// Count con condiciones
async countActiveUsers(): Promise<number> {
  return await this.repository.count({
    where: { isActive: true, recordStatus: true }
  });
}

// Sum, Average, etc.
async getOrderStatistics(): Promise<{total: number, avg: number}> {
  const result = await this.repository
    .createQueryBuilder('order')
    .select('SUM(order.amount)', 'total')
    .addSelect('AVG(order.amount)', 'avg')
    .where('order.recordStatus = :status', { status: true })
    .getRawOne();

  return {
    total: Number(result.total) || 0,
    avg: Number(result.avg) || 0
  };
}
```

## Paginación

```typescript
import { PaginationResult } from '../types/index.js';

async paginate(
  page: number = 1,
  pageSize: number = 10,
  where?: any
): Promise<PaginationResult<User>> {
  const [data, total] = await this.repository.findAndCount({
    where: { ...where, recordStatus: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { createdAt: 'DESC' }
  });

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
```

## Raw Queries (Usar con precaución)

```typescript
// Solo cuando Query Builder no es suficiente
async executeRawQuery(sql: string, params: any[]): Promise<any> {
  try {
    return await this.repository.query(sql, params);
  } catch (error) {
    logger.error('Raw query failed', { sql, error });
    throw boom.internal('Database query failed');
  }
}

// SIEMPRE usar parámetros para prevenir SQL Injection
const users = await repository.executeRawQuery(
  'SELECT * FROM users WHERE email = ? AND age > ?',
  ['test@example.com', 18]
);
```

## Manejo de Errores

BaseRepository ya incluye manejo de errores con Boom:

```typescript
try {
  const user = await userRepository.findById(id);
  if (!user) {
    throw boom.notFound('Usuario no encontrado');
  }
  return user;
} catch (error) {
  if (boom.isBoom(error)) throw error;
  logger.error('Error inesperado', { error });
  throw boom.internal('Error del servidor');
}
```

## Uso en Servicios

```typescript
// En tu servicio
import { UserRepository } from '../repositories/user.repository.js';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getUser(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw boom.notFound('Usuario no encontrado');
    }
    return user;
  }

  async createUser(data: CreateUserDto) {
    // Validar primero con Zod
    const validData = userSchema.parse(data);
    
    // Verificar duplicados
    const exists = await this.userRepo.findByEmail(validData.email);
    if (exists) {
      throw boom.conflict('Email ya registrado');
    }

    // Crear
    return await this.userRepo.create(validData);
  }
}
```

## Testing

```typescript
import { UserRepository } from '../repositories/user.repository.js';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeAll(() => {
    repository = new UserRepository();
  });

  it('debe encontrar usuario por email', async () => {
    const user = await repository.findByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
  });

  it('debe retornar null si usuario no existe', async () => {
    const user = await repository.findById(99999);
    expect(user).toBeNull();
  });
});
```

## Best Practices

✅ **Un repositorio por entidad**  
✅ **Métodos específicos del dominio**  
✅ **Siempre validar con Zod antes de guardar**  
✅ **Usar transacciones para operaciones multi-tabla**  
✅ **Logging estructurado de errores**  
✅ **Soft delete por defecto (recordStatus)**  
✅ **Type safety completo**  
✅ **Queries con timeout**  
✅ **Paginación para listas**  

❌ **No incluir lógica de negocio**  
❌ **No retornar errores genéricos**  
❌ **No exponer Query Builder a servicios**  
❌ **No usar raw queries sin parámetros**  

## Referencias

- [TypeORM Repository API](https://typeorm.io/repository-api)
- [Query Builder](https://typeorm.io/select-query-builder)
- [Transactions](https://typeorm.io/transactions)
- [Custom Repository](https://typeorm.io/custom-repository)
