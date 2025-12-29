# Migración a TypeORM

## Fecha de Migración
29 de diciembre de 2025

## Resumen
Se ha migrado exitosamente el proyecto de **Sequelize 6.x** a **TypeORM** como ORM principal para la gestión de bases de datos MariaDB/MySQL.

---

## Cambios Realizados

### 1. Dependencias

#### Eliminadas
- `sequelize` (v6.37.7)
- `mariadb` (v3.4.5)

#### Agregadas
- `typeorm` - ORM principal con soporte para TypeScript
- `mysql2` - Driver MySQL/MariaDB compatible con TypeORM
- `reflect-metadata` - Requerido para decoradores de TypeORM

### 2. Configuración TypeScript ([tsconfig.json](../tsconfig.json))

Se agregaron las siguientes opciones del compilador necesarias para TypeORM:

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true,
  "strictPropertyInitialization": false
}
```

**Razón:** TypeORM utiliza decoradores de TypeScript para definir entidades y sus propiedades.

### 3. Archivo de Conexión ([db/connection.ts](../db/connection.ts))

#### Antes (Sequelize)
```typescript
const sequelize = new Sequelize(database, user, password, {
  host, port, dialect: 'mariadb',
  pool: { max: 10, min: 2, ... }
});
```

#### Ahora (TypeORM)
```typescript
export const AppDataSource = new DataSource({
  type: 'mysql',
  host, port, username, password, database,
  entities: ['./entities/**/*.entity.{ts,js}'],
  migrations: ['./migrations/**/*.{ts,js}'],
  synchronize: false, // NUNCA en producción
});
```

#### Nuevas Funciones Exportadas
- `initializeDatabase()` - Inicializa el DataSource de TypeORM
- `closeDatabase()` - Cierra la conexión gracefully
- `testConnection()` - Alias de inicialización (compatibilidad legacy)

### 4. Estructura de Directorios

Se crearon nuevos directorios para el patrón Repository de TypeORM:

```
neec-backend/
├── entities/           # Definiciones de entidades con decoradores
│   ├── base.entity.ts
│   └── example.entity.ts
├── repositories/       # Capa de acceso a datos (Repository pattern)
│   ├── base.repository.ts
│   └── example.repository.ts
└── migrations/         # Migraciones de base de datos (versionado de schema)
```

### 5. Patrón de Entidades

#### BaseEntity Abstracta
Todas las entidades extienden de `BaseEntity` que incluye campos comunes:

```typescript
@Entity()
export abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'boolean', default: true })
  recordStatus!: boolean;

  @Column({ type: 'varchar', default: 'sql' })
  dataSource!: 'sql' | 'nosql' | 'both' | 'fake';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

#### Ejemplo de Entidad
```typescript
@Entity('examples')
@Index(['email'], { unique: true })
export class Example extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
```

### 6. Patrón Repository

#### BaseRepository Genérico
Proporciona operaciones CRUD estándar para todas las entidades:

- `findAll(options?)` - Lista todos los registros activos
- `findById(id)` - Busca por ID
- `findOne(where)` - Busca con condiciones personalizadas
- `create(data)` - Crea nuevo registro
- `update(id, data)` - Actualiza registro existente
- `delete(id)` - Soft delete (recordStatus = false)
- `hardDelete(id)` - Eliminación física permanente
- `count(where?)` - Cuenta registros

#### Repositorio Específico
```typescript
export class ExampleRepository extends BaseRepository<Example> {
  constructor() {
    super(AppDataSource.getRepository(Example));
  }

  async findByEmail(email: string): Promise<Example | null> {
    return await this.repository.findOne({ where: { email } });
  }
}
```

### 7. Archivo Principal ([index.ts](../index.ts))

#### Cambios en Imports
```typescript
// Antes
import { sequelize } from './db/connection.js';

// Ahora
import 'reflect-metadata'; // DEBE ser al inicio
import { AppDataSource, initializeDatabase, closeDatabase } from './db/connection.js';
```

#### Inicialización
```typescript
// Antes
await sequelize.authenticate();
await sequelize.sync();

// Ahora
await initializeDatabase();
```

#### Health Check
```typescript
// Antes
await sequelize.authenticate();

// Ahora
if (AppDataSource.isInitialized) {
  await AppDataSource.query('SELECT 1');
}
```

#### Graceful Shutdown
Se agregó manejo de señales SIGTERM/SIGINT para cerrar conexiones:

```typescript
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 8. Tipos ([types/index.ts](../types/index.ts))

Se eliminó la propiedad `dialect` del tipo `Environment` ya que TypeORM la maneja internamente:

```typescript
// Antes
db: {
  maria: {
    dialect: 'mariadb',
    logging: boolean | ((sql: string) => void);
  }
}

// Ahora
db: {
  maria: {
    logging: boolean;
  }
}
```

### 9. Archivos de Ambiente

Se actualizaron todos los archivos de configuración de ambiente:
- [environments.development.ts](../environments/environments.development.ts)
- [environments.production.ts](../environments/environments.production.ts)
- [environments.testing.ts](../environments/environments.testing.ts)

Eliminando la propiedad `dialect` de cada uno.

### 10. Scripts de NPM ([package.json](../package.json))

Se agregaron scripts para TypeORM CLI:

```json
{
  "typeorm": "typeorm-ts-node-esm",
  "migration:generate": "npm run typeorm -- migration:generate -d db/ormconfig.ts",
  "migration:create": "npm run typeorm -- migration:create",
  "migration:run": "npm run typeorm -- migration:run -d db/ormconfig.ts",
  "migration:revert": "npm run typeorm -- migration:revert -d db/ormconfig.ts",
  "schema:sync": "npm run typeorm -- schema:sync -d db/ormconfig.ts",
  "schema:drop": "npm run typeorm -- schema:drop -d db/ormconfig.ts"
}
```

---

## Ventajas de TypeORM sobre Sequelize

### 1. **TypeScript First**
- TypeORM está diseñado nativamente para TypeScript con decoradores
- Mejor inferencia de tipos y autocompletado
- Menos código boilerplate para definiciones de modelos

### 2. **Decoradores Expresivos**
```typescript
// TypeORM - Claro y conciso
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;
}

// vs Sequelize - Más verboso
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true
  }
});
```

### 3. **Active Record y Data Mapper**
TypeORM soporta ambos patrones:
```typescript
// Active Record
const user = new User();
user.email = 'test@example.com';
await user.save();

// Data Mapper (Repository)
const userRepo = AppDataSource.getRepository(User);
await userRepo.save(user);
```

### 4. **Migraciones Automáticas**
```bash
# Genera migración detectando cambios en entidades
npm run migration:generate -- migrations/AddUserTable

# Ejecuta migraciones pendientes
npm run migration:run
```

### 5. **Query Builder Tipado**
```typescript
const users = await repository
  .createQueryBuilder('user')
  .where('user.age > :age', { age: 18 })
  .orderBy('user.name', 'ASC')
  .getMany();
```

### 6. **Relaciones Más Intuitivas**
```typescript
@Entity()
export class User extends BaseEntity {
  @OneToMany(() => Order, order => order.user)
  orders!: Order[];
}

@Entity()
export class Order extends BaseEntity {
  @ManyToOne(() => User, user => user.orders)
  user!: User;
}
```

### 7. **Mejor Performance**
- Lazy loading y eager loading optimizados
- Query caching incorporado
- Connection pooling más eficiente con mysql2

---

## Guía de Uso

### Crear una Nueva Entidad

1. **Definir la entidad** en `entities/`:

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity.js';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;
}
```

2. **Crear el repositorio** en `repositories/`:

```typescript
import { BaseRepository } from './base.repository.js';
import { Product } from '../entities/product.entity.js';
import { AppDataSource } from '../db/connection.js';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(AppDataSource.getRepository(Product));
  }

  async findByName(name: string): Promise<Product[]> {
    return await this.repository
      .createQueryBuilder('product')
      .where('product.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }
}
```

3. **Usar en servicios**:

```typescript
import { ProductRepository } from '../repositories/product.repository.js';

const productRepo = new ProductRepository();

// Crear
const product = await productRepo.create({
  name: 'Laptop',
  price: 999.99,
  stock: 10
});

// Buscar
const products = await productRepo.findAll();
const product = await productRepo.findById(1);

// Actualizar
await productRepo.update(1, { stock: 5 });

// Eliminar (soft delete)
await productRepo.delete(1);
```

### Crear una Migración

```bash
# Generar automáticamente desde cambios en entidades
npm run migration:generate -- migrations/CreateProductTable

# O crear manualmente
npm run migration:create -- migrations/AddIndexToProducts

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

### Sincronizar Schema (Solo Desarrollo)

```bash
# ⚠️ NUNCA usar en producción
npm run schema:sync
```

---

## Compatibilidad con MariaDB

TypeORM usa el driver `mysql2` que es **100% compatible** con MariaDB. Las características específicas soportadas:

- ✅ Tipos de datos MariaDB (JSON, GEOMETRY, etc.)
- ✅ Transacciones ACID
- ✅ Stored Procedures y Functions
- ✅ Views
- ✅ Índices compuestos y únicos
- ✅ Foreign Keys con cascade
- ✅ Full-text search
- ✅ Connection pooling optimizado

---

## Seguridad y Best Practices

### 1. **NUNCA usar synchronize: true en producción**
```typescript
// ❌ PELIGROSO
synchronize: true // Puede borrar datos

// ✅ CORRECTO
synchronize: false // Usar migraciones
```

### 2. **Validar datos con Zod antes de guardar**
```typescript
const productSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
});

const validData = productSchema.parse(data);
await productRepo.create(validData);
```

### 3. **Usar transacciones para operaciones críticas**
```typescript
await AppDataSource.transaction(async manager => {
  await manager.save(user);
  await manager.save(order);
  // Si alguna falla, rollback automático
});
```

### 4. **Implementar soft delete (ya incluido en BaseEntity)**
```typescript
// Soft delete
await productRepo.delete(id); // recordStatus = false

// Hard delete (solo cuando sea necesario)
await productRepo.hardDelete(id); // Eliminación física
```

### 5. **Query timeouts para prevenir long-running queries**
```typescript
const products = await repository
  .createQueryBuilder('product')
  .where('product.category = :cat', { cat: 'electronics' })
  .maxExecutionTime(5000) // 5 segundos máximo
  .getMany();
```

---

## Troubleshooting

### Error: "Cannot use import statement outside a module"
**Solución:** Asegúrate de que `tsconfig.json` tenga:
```json
{
  "module": "ESNext",
  "moduleResolution": "node"
}
```

### Error: "experimentalDecorators" must be enabled
**Solución:** Ya está configurado en `tsconfig.json`:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### Error: "reflect-metadata shim is required"
**Solución:** Importa al inicio de `index.ts`:
```typescript
import 'reflect-metadata';
```

### Error de conexión a MariaDB
**Verificar:**
1. Variables de entorno: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
2. MariaDB está corriendo: `mysql -u root -p`
3. Firewall permite puerto 3306

---

## Próximos Pasos

1. ✅ Migración completada de Sequelize a TypeORM
2. ⏳ Crear entidades para todas las tablas existentes
3. ⏳ Generar migraciones para schema actual
4. ⏳ Migrar servicios existentes para usar repositorios
5. ⏳ Agregar tests unitarios para repositorios
6. ⏳ Documentar relaciones entre entidades
7. ⏳ Implementar caché de queries (Redis opcional)

---

## Referencias

- [Documentación Oficial TypeORM](https://typeorm.io/)
- [TypeORM con MySQL/MariaDB](https://typeorm.io/connection-options#mysql--mariadb-connection-options)
- [Decoradores de TypeORM](https://typeorm.io/entities)
- [Migraciones](https://typeorm.io/migrations)
- [Repository Pattern](https://typeorm.io/custom-repository)
- [Query Builder](https://typeorm.io/select-query-builder)

---

**Autor:** GitHub Copilot  
**Fecha:** 29 de diciembre de 2025  
**Versión:** 1.0.0
