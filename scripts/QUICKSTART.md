# Guía Rápida: Crear un Nuevo Endpoint

Esta guía te muestra cómo crear un endpoint completo desde cero en menos de 5 minutos.

## 🚀 Paso a Paso

### 1. Generar el endpoint

```bash
npm run generate product y
```

Esto creará automáticamente:
- ✅ `routes/product.routes.ts` - Controlador con CRUD completo
- ✅ `schemas/product.schema.ts` - Validaciones Zod
- ✅ `interfaces/product.interface.ts` - Tipos TypeScript
- ✅ `entities/product.entity.ts` - Entidad TypeORM
- ✅ `repositories/product.repository.ts` - Repositorio de datos
- ✅ `db/sql/create-products-table.sql` - Script SQL para crear la tabla
- ✅ Actualiza `routes/index.ts` automáticamente

### 2. Personalizar la entidad (opcional)

Edita `entities/product.entity.ts` para agregar campos personalizados:

```typescript
@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ⬇️ Agrega tus campos personalizados aquí
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;
}
```

### 3. Actualizar el schema Zod

Sincroniza `schemas/product.schema.ts` con los nuevos campos:

```typescript
export const createProductSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),
  
  description: z.string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .trim()
    .optional()
    .nullable(),
  
  isActive: z.boolean().default(true),

  // ⬇️ Agrega validaciones para tus campos personalizados
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio es demasiado alto'),

  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),

  imageUrl: z.string()
    .url('URL de imagen inválida')
    .max(500, 'La URL no puede exceder 500 caracteres')
    .optional(),
});
```

### 4. Actualizar la interface

Sincroniza `interfaces/product.interface.ts`:

```typescript
export interface ICreateProduct {
  name: string;
  description?: string | null;
  isActive: boolean;
  // ⬇️ Agrega los tipos de tus campos personalizados
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface I Product extends IBaseEntity {
  name: string;
  description?: string | null;
  isActive: boolean;
  price: number;
  stock: number;
  imageUrl?: string;
}
```

### 5. Crear la migración

**Opción A: Ejecutar el SQL directamente (más rápido)**

```bash
# Usando MySQL/MariaDB desde la terminal
mysql -u root -p neec_db < db/sql/create-products-table.sql

# O copiar y pegar el contenido del archivo SQL en tu cliente favorito
# (phpMyAdmin, MySQL Workbench, DBeaver, etc.)
```

El archivo SQL generado incluye:
- ✅ Estructura completa de la tabla
- ✅ Índices optimizados
- ✅ Comentarios descriptivos
- ✅ Campos de auditoría (BaseEntity)
- ✅ Datos de ejemplo comentados
- ✅ Consultas útiles comentadas

**Opción B: Usar migraciones de TypeORM (más controlado)**

```bash
npm run migration:generate -- migrations/CreateProductTable
```

Esto generará un archivo como `migrations/1234567890-CreateProductTable.ts`:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTable1234567890 implements MigrationInterface {
    name = 'CreateProductTable1234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`products\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL,
            \`description\` text NULL,
            \`isActive\` tinyint NOT NULL DEFAULT 1,
            \`price\` decimal(10,2) NOT NULL,
            \`stock\` int NOT NULL DEFAULT 0,
            \`imageUrl\` varchar(500) NULL,
            \`recordStatus\` tinyint NOT NULL DEFAULT 1,
            \`dataSource\` enum('sql', 'nosql', 'both', 'fake') NOT NULL DEFAULT 'sql',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`products\``);
    }
}
```

### 6. Ejecutar la migración (si usaste Opción B)

```bash
npm run migration:run
```

Si usaste la Opción A (SQL directo), puedes saltar este paso.

### 7. Probar el endpoint

El endpoint ya está disponible en `/api/v1/products`:

```bash
# Crear un producto
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "description": "Laptop de alto rendimiento",
    "price": 1299.99,
    "stock": 10,
    "imageUrl": "https://example.com/laptop.jpg",
    "isActive": true
  }'

# Listar productos
curl http://localhost:3000/api/v1/products

# Obtener un producto
curl http://localhost:3000/api/v1/products/1

# Actualizar un producto
curl -X PATCH http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1199.99,
    "stock": 8
  }'

# Eliminar un producto (soft delete)
curl -X DELETE http://localhost:3000/api/v1/products/1
```

## 🎨 Personalización Avanzada

### Agregar métodos personalizados al repositorio

Edita `repositories/product.repository.ts`:

```typescript
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(AppDataSource.getRepository(Product));
  }

  // Métodos ya incluidos
  async findActive(): Promise<Product[]> { ... }
  async searchByName(name: string): Promise<Product[]> { ... }

  // ⬇️ Agrega tus métodos personalizados
  async findByPriceRange(min: number, max: number): Promise<Product[]> {
    try {
      return await this.repository
        .createQueryBuilder('product')
        .where('product.price BETWEEN :min AND :max', { min, max })
        .andWhere('product.recordStatus = :recordStatus', { recordStatus: true })
        .orderBy('product.price', 'ASC')
        .getMany();
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding products by price range', {
        min,
        max,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    try {
      return await this.repository.find({
        where: {
          stock: LessThan(threshold),
          recordStatus: true,
        },
        order: {
          stock: 'ASC',
        },
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding low stock products', {
        threshold,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }
}
```

### Agregar rutas personalizadas

Edita `routes/product.routes.ts`:

```typescript
// ⬇️ Agrega rutas personalizadas después de las rutas CRUD básicas

/**
 * @api {get} /api/v1/products/price-range Obtener productos por rango de precio
 */
router.get(
  '/price-range',
  asyncHandler(async (req: Request, res: Response) => {
    const { min = 0, max = 999999 } = req.query;
    
    logger.info('Fetching products by price range', { min, max });
    
    const products = await productRepo.findByPriceRange(
      Number(min),
      Number(max)
    );
    
    return res.json({
      data: products,
      meta: { total: products.length },
    });
  })
);

/**
 * @api {get} /api/v1/products/low-stock Obtener productos con stock bajo
 */
router.get(
  '/low-stock',
  asyncHandler(async (req: Request, res: Response) => {
    const { threshold = 10 } = req.query;
    
    logger.info('Fetching low stock products', { threshold });
    
    const products = await productRepo.findLowStock(Number(threshold));
    
    return res.json({
      data: products,
      meta: { total: products.length },
    });
  })
);
```

## ✅ Checklist Final

- [ ] Endpoint generado con `npm run generate <nombre> y`
- [ ] Campos personalizados agregados en entity
- [ ] Validaciones sincronizadas en schema
- [ ] Tipos actualizados en interface
- [ ] Migración creada y ejecutada
- [ ] Endpoint probado con Postman/curl
- [ ] Métodos personalizados agregados al repository (opcional)
- [ ] Rutas personalizadas agregadas (opcional)
- [ ] Código documentado con JSDoc
- [ ] Tests unitarios creados (opcional pero recomendado)

## 📚 Recursos

- [Documentación de Zod](https://zod.dev/)
- [Documentación de TypeORM](https://typeorm.io/)
- [Documentación de Express](https://expressjs.com/)
- [scripts/README.md](README.md) - Documentación del generador

## 🆘 Solución de Problemas

### Error: "Module not found"

Verifica que hayas ejecutado `npm install` después de generar el endpoint.

### Error: "Table already exists"

Si ya ejecutaste la migración antes, usa `npm run migration:revert` para revertirla.

### Validación falla en Postman

Verifica que el schema Zod esté sincronizado con la entidad y que estés enviando los datos en el formato correcto (JSON).

### Endpoint no aparece en las rutas

Verifica que `routes/index.ts` se haya actualizado correctamente y que el servidor se haya reiniciado.
