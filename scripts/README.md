# Generador de Endpoints

Script automatizado para generar la estructura completa de un nuevo endpoint en el proyecto NEEC Backend.

## 🚀 Características

El script genera automáticamente todos los archivos necesarios para un nuevo endpoint:

- **Route** (`routes/*.routes.ts`) - Controlador con operaciones CRUD completas
- **Schema** (`schemas/*.schema.ts`) - Validaciones Zod
- **Interface** (`interfaces/*.interface.ts`) - Tipos TypeScript
- **Entity** (`entities/*.entity.ts`) - Entidad TypeORM
- **Repository** (`repositories/*.repository.ts`) - Capa de acceso a datos
- **SQL Script** (`db/sql/create-*-table.sql`) - Script SQL para crear la tabla
- **Actualización automática** de `routes/index.ts`

## 📋 Uso

### Comando rápido

```bash
npm run generate <nombre-endpoint> y
```

### Ejemplos

```bash
# Generar endpoint para productos
npm run generate product y

# Generar endpoint con nombre compuesto
npm run generate product-category y

# Generar endpoint para usuarios
npm run generate user y
```

### Proceso interactivo (sin argumentos)

Si ejecutas el comando sin argumentos, te mostrará la ayuda:

```bash
npm run generate
# ❌ Error: Debes proporcionar un nombre
# Uso: npm run generate <nombre> [y]
# Ejemplo: npm run generate product y
```

### Formato del nombre

- **Singular**: Usa el nombre en singular (ej: `product`, no `products`)
- **kebab-case**: Usa guiones para separar palabras (ej: `product-category`)
- **Minúsculas**: Todo en minúsculas

El script automáticamente generará:
- **PascalCase** para clases: `ProductCategory`
- **camelCase** para variables: `productCategory`
- **Plural** para rutas y tablas: `product-categories`

### 4. Archivos generados

El script mostrará el progreso y resultado:

```
🎯 Generador de Endpoints NEEC Backend

📋 Configuración:
   Nombre: product
   PascalCase: Product
   camelCase: product
   Plural: products

🚀 Generando archivos...

✅ Creado: Route (product.routes.ts)
✅ Creado: Schema (product.schema.ts)
✅ Creado: Interface (product.interface.ts)
✅ Creado: Entity (product.entity.ts)
✅ Creado: Repository (product.repository.ts)
✅ Actualizado: routes/index.ts
```

## 🎯 Ejemplos

### Endpoint simple

```bash
npm run generate user y
```

Genera:
- Clase: `User`
- Variable: `user`
- Plural: `users`
- Tabla DB: `users`
- Ruta: `/api/v1/users`

### Endpoint compuesto

```bash
npm run generate product-category y
```

Genera:
- Clase: `ProductCategory`
- Variable: `productCategory`  
- Plural: `product-categories`
- Tabla DB: `product-categories`
- Ruta: `/api/v1/product-categories`

### Endpoint con palabra terminada en 'y'

```bash
npm run generate company y
```

Genera:
- Clase: `Company`
- Variable: `company`
- Plural: `companies` (automáticamente cambia 'y' por 'ies')
- Tabla DB: `companies`
- Ruta: `/api/v1/companies`

## 📝 Pasos siguientes

Después de generar el endpoint:

1. **Revisar y ajustar** los archivos generados según tus necesidades específicas

2. **Crear la tabla en la base de datos** (elige una opción):

   **Opción A: Ejecutar el SQL directamente**
   ```bash
   # MySQL/MariaDB
   mysql -u root -p neec_db < db/sql/create-products-table.sql
   
   # O usando un cliente SQL
   # Copia y pega el contenido de db/sql/create-products-table.sql
   ```

   **Opción B: Usar migraciones de TypeORM**
   ```bash
   # Generar migración desde la entidad
   npm run migration:generate -- migrations/CreateProductTable
   
   # Ejecutar migración
   npm run migration:run
   ```

3. **Probar el endpoint**:
   ```bash
   GET /api/v1/products
   POST /api/v1/products
   GET /api/v1/products/:id
   PATCH /api/v1/products/:id
   DELETE /api/v1/products/:id
   ```

## 🔧 Estructura del código generado

### Route (Controlador)

- ✅ Operaciones CRUD completas (GET, POST, PATCH, DELETE)
- ✅ Validación de datos con middleware
- ✅ Manejo de errores con Boom
- ✅ Logging integrado
- ✅ Tipado TypeScript completo

### Schema (Validación)

- ✅ Validaciones Zod robustas
- ✅ Schemas para CREATE, UPDATE y QUERY
- ✅ Tipos inferidos automáticamente
- ✅ Valores por defecto configurados

### Interface (Tipos)

- ✅ Interfaces TypeScript completas
- ✅ DTOs para CREATE y UPDATE
- ✅ Interface completa con BaseEntity
- ✅ Parámetros de query tipados

### Entity (Persistencia)

- ✅ Decoradores TypeORM configurados
- ✅ Herencia de BaseEntity
- ✅ Tipos de columna apropiados
- ✅ Comentarios de sincronización

### Repository (Acceso a datos)

- ✅ Extiende BaseRepository
- ✅ Métodos personalizados (findActive, searchByName)
- ✅ Manejo de errores integrado
- ✅ Logging de operaciones

### SQL Script (Base de datos)

- ✅ CREATE TABLE con estructura completa
- ✅ Campos de negocio (name, description, isActive)
- ✅ Campos de auditoría (BaseEntity)
- ✅ Índices optimizados para búsquedas
- ✅ Comentarios descriptivos en cada campo
- ✅ Datos de ejemplo (comentados)
- ✅ Consultas útiles (comentadas)
- ✅ Compatible con MySQL/MariaDB

**Ejemplo de SQL generado:**

```sql
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Nombre del product',
  `description` TEXT NULL COMMENT 'Descripción detallada',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado activo/inactivo',
  `recordStatus` TINYINT(1) NOT NULL DEFAULT 1,
  `dataSource` ENUM('sql', 'nosql', 'both', 'fake') NOT NULL DEFAULT 'sql',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_products_name` (`name`),
  INDEX `idx_products_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## ⚙️ Personalización

El código generado es una plantilla base. Puedes personalizarlo agregando:

- **Campos adicionales** en schema, interface y entity
- **Validaciones específicas** en el schema Zod
- **Relaciones** con otras entidades
- **Índices** en la base de datos
- **Métodos personalizados** en el repository
- **Middlewares adicionales** en las rutas

## 🛠️ Convenciones de nomenclatura

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| Archivo | `product.routes.ts` | kebab-case |
| Clase | `Product`, `ProductRepository` | PascalCase |
| Variable | `product`, `productRepo` | camelCase |
| Plural | `products` | Rutas y tablas DB |
| Tabla DB | `products` | Plural del nombre |

## ⚠️ Notas importantes

- **No sobrescribe archivos existentes**: Si un archivo ya existe, el script lo omitirá
- **Sincronización**: Los archivos generados están sincronizados entre sí, pero debes mantener esa sincronización en cambios futuros
- **Migración requerida**: Después de crear la entidad, debes crear y ejecutar una migración de base de datos
- **Validación de nombres**: El script valida que el nombre sea válido antes de generar archivos

## 🐛 Solución de problemas

### El script no ejecuta

Asegúrate de tener las dependencias instaladas:
```bash
npm install
```

### Error al actualizar routes/index.ts

Verifica que el archivo `routes/index.ts` existe y tiene el formato esperado.

### Los archivos no se crean

Verifica que tengas permisos de escritura en las carpetas del proyecto.

## 📚 Referencias

- [Zod Documentation](https://zod.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
