# Migraciones TypeORM

Este directorio contiene las migraciones de base de datos gestionadas por TypeORM.

## ¿Qué son las Migraciones?

Las migraciones son archivos de control de versiones para tu schema de base de datos. Permiten:

- ✅ Versionado del schema de base de datos
- ✅ Rastreabilidad de cambios
- ✅ Sincronización entre entornos (dev, staging, prod)
- ✅ Rollback de cambios problemáticos
- ✅ Colaboración en equipo sin conflictos

## Comandos Disponibles

### Generar Migración (Recomendado)

TypeORM compara tus entidades con el schema actual y genera la migración automáticamente:

```bash
npm run migration:generate -- migrations/NombreDescriptivo
```

**Ejemplo:**
```bash
npm run migration:generate -- migrations/CreateUserTable
npm run migration:generate -- migrations/AddIndexToProducts
npm run migration:generate -- migrations/AddUserRoleColumn
```

### Crear Migración Manual

Para crear una migración vacía que editarás manualmente:

```bash
npm run migration:create -- migrations/NombreDescriptivo
```

### Ejecutar Migraciones

Aplica todas las migraciones pendientes:

```bash
npm run migration:run
```

### Revertir Última Migración

```bash
npm run migration:revert
```

Para revertir múltiples migraciones, ejecuta el comando repetidamente.

### Mostrar Estado de Migraciones

```bash
npm run typeorm -- migration:show -d db/ormconfig.ts
```

## Workflow Recomendado

### 1. Modificar/Crear Entidad

```typescript
// entities/user.entity.ts
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  // Nueva columna
  @Column({ type: 'varchar', nullable: true })
  phone?: string;
}
```

### 2. Generar Migración

```bash
npm run migration:generate -- migrations/AddPhoneToUser
```

Esto genera un archivo como:

```typescript
// migrations/1703851234567-AddPhoneToUser.ts
export class AddPhoneToUser1703851234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phone',
      type: 'varchar',
      isNullable: true
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### 3. Revisar y Ajustar

Revisa el archivo generado. Puedes agregar:
- Índices
- Constraints
- Datos de seed
- Transformaciones personalizadas

### 4. Ejecutar Migración

```bash
npm run migration:run
```

### 5. Commit

```bash
git add migrations/1703851234567-AddPhoneToUser.ts
git commit -m "feat: add phone column to users"
```

## Estructura de una Migración

```typescript
import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';

export class MiMigracion1703851234567 implements MigrationInterface {
  name = 'MiMigracion1703851234567'

  // Migración hacia adelante (aplicar cambios)
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Código para aplicar cambios
  }

  // Migración hacia atrás (revertir cambios)
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Código para revertir cambios
  }
}
```

## Operaciones Comunes

### Crear Tabla

```typescript
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
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: 'varchar',
          length: '255',
          isNullable: false
        },
        {
          name: 'price',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0
        }
      ]
    }),
    true // ifNotExists
  );
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropTable('products');
}
```

### Agregar Columna

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.addColumn('users', new TableColumn({
    name: 'avatar_url',
    type: 'varchar',
    length: '500',
    isNullable: true
  }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropColumn('users', 'avatar_url');
}
```

### Modificar Columna

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.changeColumn('users', 'name', new TableColumn({
    name: 'name',
    type: 'varchar',
    length: '500', // Era 255, ahora 500
    isNullable: false
  }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.changeColumn('users', 'name', new TableColumn({
    name: 'name',
    type: 'varchar',
    length: '255', // Revertir a 255
    isNullable: false
  }));
}
```

### Eliminar Columna

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropColumn('users', 'deprecated_field');
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.addColumn('users', new TableColumn({
    name: 'deprecated_field',
    type: 'varchar',
    isNullable: true
  }));
}
```

### Crear Índice

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.createIndex('users', new TableIndex({
    name: 'IDX_USERS_EMAIL',
    columnNames: ['email'],
    isUnique: true
  }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
}
```

### Crear Foreign Key

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.createForeignKey('orders', new TableForeignKey({
    name: 'FK_ORDERS_USER',
    columnNames: ['user_id'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropForeignKey('orders', 'FK_ORDERS_USER');
}
```

### Renombrar Tabla

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.renameTable('old_users', 'users');
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.renameTable('users', 'old_users');
}
```

### Raw SQL (Cuando sea necesario)

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE INDEX idx_users_created_at 
    ON users(created_at DESC)
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    DROP INDEX idx_users_created_at ON users
  `);
}
```

## Seed Data en Migraciones

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Crear tabla
  await queryRunner.createTable(new Table({ ... }));

  // Insertar datos iniciales
  await queryRunner.query(`
    INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrator'),
    ('user', 'Regular User'),
    ('guest', 'Guest User')
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropTable('roles');
}
```

## Best Practices

### ✅ DO

- **Generar automáticamente** cuando sea posible
- **Revisar** las migraciones generadas antes de ejecutarlas
- **Testear** migraciones en desarrollo antes de producción
- **Incluir down()** para poder revertir cambios
- **Nombrar descriptivamente**: `CreateUserTable`, `AddEmailIndex`
- **Un cambio lógico por migración**
- **Commit migraciones al repo**
- **Ejecutar en orden secuencial**

### ❌ DON'T

- **Modificar migraciones ya ejecutadas** en producción
- **Eliminar migraciones del historial**
- **Usar `synchronize: true` en producción**
- **Olvidar el método `down()`**
- **Hardcodear valores sensibles**
- **Ejecutar migraciones manualmente en producción** sin revisión

## Debugging

### Ver SQL que se ejecutará

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Activar logging temporalmente
  await queryRunner.query('SET SESSION sql_mode = ""');
  console.log('About to create table...');
  await queryRunner.createTable(...);
}
```

### Transacciones Manuales

TypeORM ejecuta migraciones en transacciones automáticamente, pero puedes controlarlo:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.startTransaction();
  try {
    await queryRunner.query('...');
    await queryRunner.query('...');
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

## Entornos

### Desarrollo

```bash
# Generar y ejecutar libremente
npm run migration:generate -- migrations/FeatureName
npm run migration:run
npm run migration:revert # si algo sale mal
```

### Staging/Producción

```bash
# 1. Revisar migraciones pendientes
npm run typeorm -- migration:show -d db/ormconfig.ts

# 2. Backup de BD
mysqldump -u user -p database > backup_before_migration.sql

# 3. Ejecutar migraciones
npm run migration:run

# 4. Verificar aplicación
# Pruebas funcionales, monitoreo

# 5. Si falla: rollback
npm run migration:revert
# Restaurar backup si es necesario
```

## Troubleshooting

### Error: "QueryFailedError"

Revisa el SQL generado en el error. Posibles causas:
- Columna ya existe
- Tipo de dato incompatible
- Violación de constraint

### Error: "Cannot find module"

Asegúrate de que `tsconfig.json` incluya:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### Migración no se genera

1. Verifica que las entidades tengan cambios
2. Asegura que `AppDataSource` esté configurado correctamente
3. Revisa que la BD esté actualizada al último schema

## Referencias

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Migration API](https://typeorm.io/migration-api)
- [Schema Sync (NO usar en prod)](https://typeorm.io/connection-options#common-connection-options)
