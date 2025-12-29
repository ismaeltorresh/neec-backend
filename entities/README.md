# Entidades TypeORM

Este directorio contiene las definiciones de entidades del proyecto usando decoradores de TypeORM.

## Estructura

- **base.entity.ts** - Entidad base abstracta con campos comunes (id, recordStatus, timestamps)
- **example.entity.ts** - Entidad de ejemplo/template para referencia

## Crear una Nueva Entidad

### 1. Crear el archivo de entidad

```typescript
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity.js';

@Entity('nombre_tabla')
@Index(['campo1', 'campo2']) // Índice compuesto opcional
export class MiEntidad extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  campo1!: string;

  @Column({ type: 'int', default: 0 })
  campo2!: number;

  @Column({ type: 'text', nullable: true })
  campoOpcional?: string;
}
```

### 2. Convenciones de Nomenclatura

- **Archivo:** `nombre-entidad.entity.ts` (kebab-case)
- **Clase:** `NombreEntidad` (PascalCase)
- **Tabla:** `nombre_entidades` (snake_case, plural)
- **Columnas:** Snake_case en BD, camelCase en TypeScript

### 3. Tipos de Columna Comunes

```typescript
// String
@Column({ type: 'varchar', length: 255 })
nombre!: string;

// Número entero
@Column({ type: 'int' })
cantidad!: number;

// Decimal/Float
@Column({ type: 'decimal', precision: 10, scale: 2 })
precio!: number;

// Boolean
@Column({ type: 'boolean', default: false })
activo!: boolean;

// Texto largo
@Column({ type: 'text' })
descripcion!: string;

// JSON
@Column({ type: 'json' })
metadata!: Record<string, unknown>;

// Fecha
@Column({ type: 'date' })
fechaNacimiento!: Date;

// Timestamp
@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
creado!: Date;

// Enum
@Column({ type: 'enum', enum: ['activo', 'inactivo', 'pendiente'] })
estado!: 'activo' | 'inactivo' | 'pendiente';
```

### 4. Índices y Constraints

```typescript
// Índice único en una columna
@Column({ unique: true })
email!: string;

// Índice compuesto
@Index(['campo1', 'campo2'])
export class MiEntidad extends BaseEntity { ... }

// Índice único compuesto
@Index(['campo1', 'campo2'], { unique: true })
export class MiEntidad extends BaseEntity { ... }

// Columna no nula
@Column({ nullable: false })
requerido!: string;

// Valor por defecto
@Column({ default: 'valor' })
conDefault!: string;
```

### 5. Relaciones

```typescript
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// Muchos a Uno (FK)
@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: number;
}

// Uno a Muchos
@Entity('users')
export class User extends BaseEntity {
  @OneToMany(() => Order, order => order.user)
  orders!: Order[];
}

// Muchos a Muchos
@Entity('students')
export class Student extends BaseEntity {
  @ManyToMany(() => Course, course => course.students)
  @JoinTable({
    name: 'student_courses',
    joinColumn: { name: 'student_id' },
    inverseJoinColumn: { name: 'course_id' }
  })
  courses!: Course[];
}

@Entity('courses')
export class Course extends BaseEntity {
  @ManyToMany(() => Student, student => student.courses)
  students!: Student[];
}
```

## BaseEntity

Todas las entidades deben extender de `BaseEntity` que proporciona:

- `id` - Primary key auto-incremental
- `recordStatus` - Soft delete (boolean)
- `dataSource` - Origen de datos ('sql' | 'nosql' | 'both' | 'fake')
- `createdAt` - Timestamp de creación
- `updatedAt` - Timestamp de última actualización

## Naming Strategy

TypeORM convierte automáticamente:
- `camelCase` → `snake_case` en nombres de columnas (configurable)
- Las entidades definen el nombre de tabla explícitamente con `@Entity('nombre_tabla')`

## Validación

**⚠️ IMPORTANTE:** TypeORM NO valida datos automáticamente.

Siempre validar con Zod antes de guardar:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});

// En el servicio
const validData = userSchema.parse(data);
const user = await userRepository.create(validData);
```

## Migraciones

Después de crear/modificar entidades, generar migración:

```bash
npm run migration:generate -- migrations/NombreDescriptivo
npm run migration:run
```

## Referencias

- [TypeORM Entities](https://typeorm.io/entities)
- [Column Types](https://typeorm.io/entities#column-types)
- [Relations](https://typeorm.io/relations)
- [Indices](https://typeorm.io/indices)
