# Scripts SQL Generados

Este directorio contiene scripts SQL generados automáticamente por el generador de endpoints.

## 📁 Estructura

Cada endpoint generado incluye un archivo SQL con el formato:
```
create-{table-name}-table.sql
```

Por ejemplo:
- `create-products-table.sql`
- `create-users-table.sql`
- `create-product-categories-table.sql`

## 🎯 Uso

### Opción 1: Ejecutar desde la terminal

```bash
# MySQL/MariaDB
mysql -u root -p database_name < db/sql/create-products-table.sql

# PostgreSQL (si se adapta el script)
psql -U postgres -d database_name -f db/sql/create-products-table.sql
```

### Opción 2: Copiar y pegar

1. Abre tu cliente SQL favorito (phpMyAdmin, MySQL Workbench, DBeaver, etc.)
2. Abre el archivo SQL generado
3. Copia el contenido
4. Pégalo en tu cliente SQL y ejecuta

### Opción 3: Usar migraciones de TypeORM

Si prefieres usar migraciones de TypeORM en lugar de ejecutar el SQL directamente:

```bash
npm run migration:generate -- migrations/CreateProductTable
npm run migration:run
```

## 📝 Contenido de los scripts

Cada script SQL incluye:

- ✅ **CREATE TABLE** con estructura completa
- ✅ **Campos de negocio** personalizados
- ✅ **Campos de auditoría** (BaseEntity)
- ✅ **PRIMARY KEY** e **índices** optimizados
- ✅ **Comentarios** descriptivos en cada campo
- ✅ **Datos de ejemplo** (comentados, listos para usar)
- ✅ **Consultas útiles** (comentadas, para referencia)

## 🔧 Personalización

Los scripts SQL son plantillas base. Puedes personalizarlos agregando:

- **Campos adicionales** según tu modelo de negocio
- **Índices compuestos** para optimizar consultas específicas
- **Foreign keys** para relaciones con otras tablas
- **Constraints** personalizados (UNIQUE, CHECK, etc.)
- **Triggers** para lógica de negocio
- **Datos iniciales** descomentando la sección INSERT

## ⚠️ Notas importantes

- Los scripts usan `CREATE TABLE IF NOT EXISTS` para evitar errores si la tabla ya existe
- Los campos de auditoría (`recordStatus`, `dataSource`, `createdAt`, `updatedAt`) son parte de `BaseEntity` y se incluyen automáticamente
- Los índices están optimizados para las consultas más comunes del repositorio generado
- El motor es InnoDB y el charset es utf8mb4 (recomendado para soporte completo de Unicode)

## 🗑️ Limpieza

Estos archivos son generados automáticamente y pueden ser recreados en cualquier momento ejecutando el generador de endpoints nuevamente.

Si no necesitas los scripts SQL (porque usas solo migraciones de TypeORM), puedes:

1. Agregar `db/sql/*.sql` al `.gitignore`
2. Eliminar los archivos SQL después de ejecutarlos
3. Mantenerlos como referencia de la estructura de la base de datos

## 🔗 Referencias

- [MySQL CREATE TABLE](https://dev.mysql.com/doc/refman/8.0/en/create-table.html)
- [MariaDB CREATE TABLE](https://mariadb.com/kb/en/create-table/)
- [TypeORM Migrations](https://typeorm.io/migrations)
