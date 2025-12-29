# Migración de Joi a Zod

## Resumen

Se ha completado la migración del sistema de validación de **Joi** a **Zod** para mejorar la integración con TypeScript y aprovechar la inferencia automática de tipos.

## Fecha de Migración
29 de diciembre de 2025

## Motivación

1. **Inferencia de Tipos Nativa**: Zod proporciona inferencia automática de tipos de TypeScript desde los esquemas de validación
2. **TypeScript-First**: Zod está diseñado específicamente para TypeScript, a diferencia de Joi que es JavaScript-first
3. **Tamaño del Bundle**: Zod es más ligero que Joi (~8KB vs ~146KB minificado)
4. **Mejor DX**: Mensajes de error más claros y mejor soporte de IDE

## Archivos Modificados

### 1. schemas/template.schema.ts
**Antes (Joi)**:
```typescript
import Joi from 'joi';

const baseSchemas = {
  id: Joi.string().uuid(),
  dataSource: Joi.string().valid('sql', 'nosql', 'both', 'fake'),
  recordStatus: Joi.number().valid(0, 1),
  // ...
};

const getSchema = Joi.object({
  dataSource: baseSchemas.dataSource.required(),
  recordStatus: baseSchemas.recordStatus.required(),
  page: Joi.number().integer().min(1).default(1),
  // ...
});
```

**Después (Zod)**:
```typescript
import { z } from 'zod';

export const DataSourceEnum = z.enum(['sql', 'nosql', 'both', 'fake']);
export const RecordStatusEnum = z.union([z.literal(0), z.literal(1)]);

export const baseSchemas = {
  id: z.string().uuid(),
  dataSource: DataSourceEnum,
  recordStatus: RecordStatusEnum,
  createdAt: z.coerce.date(),
  // ...
};

export const getSchema = z.object({
  dataSource: baseSchemas.dataSource,
  recordStatus: RecordStatusEnum,
  page: z.coerce.number().int().min(1).default(1).optional(),
  // ...
});
```

**Cambios Clave**:
- Uso de `z.enum()` para valores permitidos en lugar de `.valid()`
- Uso de `z.coerce` para conversión automática de tipos (útil para query params)
- Campos opcionales con `.optional()` en lugar de omitir `.required()`
- Inferencia automática de tipos con `z.infer<typeof schema>`

### 2. middlewares/validator.handler.ts
**Antes (Joi)**:
```typescript
import { Schema } from 'joi';

function validatorHandler<T extends Schema>(schema: T, property: ValidationProperty) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw boom.badRequest('Validation error', { details });
    }
    
    req[property] = value;
    next();
  };
}
```

**Después (Zod)**:
```typescript
import { type ZodSchema, ZodError } from 'zod';

function formatZodErrors(error: ZodError): Array<{ field: string; message: string; code: string }> {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

function validatorHandler<T extends ZodSchema>(schema: T, property: ValidationProperty) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[property];
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const details = formatZodErrors(result.error);
      throw boom.badRequest('Validation error', { 
        details,
        fields: details.map(d => d.field).join(', ')
      });
    }
    
    req[property] = result.data;
    next();
  };
}
```

**Cambios Clave**:
- Uso de `schema.safeParse()` en lugar de `schema.validate()`
- Acceso a `error.issues` en lugar de `error.details`
- Uso de `result.success` para verificar validez
- Datos validados en `result.data` en lugar de `value`

### 3. routes/template.routes.ts
**Antes**:
```typescript
interface InputData {
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
  id?: string;
  recordStatus?: number;
  // ... más campos
}

router.get('/', validatorHandler(get, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const inputData = req.query as InputData;
  // ...
}));
```

**Después**:
```typescript
import { 
  type GetInput,
  type PostInput,
  type UpdateInput,
  type DeleteInput,
  type ParamsInput
} from '../schemas/template.schema.js';

router.get('/', validatorHandler(get, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const inputData = req.query as unknown as GetInput;
  // ...
}));
```

**Cambios Clave**:
- Eliminación de `InputData` interface manual
- Uso de tipos inferidos automáticamente de Zod schemas
- Uso de `as unknown as Type` para conversión de tipos Express

## Tipos Inferidos

Zod ahora proporciona tipos automáticos para cada schema:

```typescript
// Exportados desde schemas/template.schema.ts
export type DeleteInput = z.infer<typeof deleteSchema>;
export type GetInput = z.infer<typeof getSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ParamsInput = z.infer<typeof paramsSchema>;
```

Estos tipos son **exactamente iguales** a la estructura del schema, sin necesidad de definiciones duplicadas.

## Compatibilidad hacia Atrás

Se mantuvieron exportaciones con nombres legacy para compatibilidad:

```typescript
// Legacy exports (mantienen compatibilidad con código existente)
export const del = deleteSchema;
export const get = getSchema;
export const update = updateSchema;
export const post = postSchema;
export const schema = postSchema; // alias for full schema
```

## Pruebas

- ✅ Compilación TypeScript: `npm run type-check` - 0 errores
- ✅ Tests unitarios: `npm test` - 12/12 pasando (migrados a TypeScript con ts-jest)
- ✅ Compilación de producción: `npm run build` - exitosa
- ✅ Servidor de desarrollo: `npm run dev` - funcional

### Migración de Tests a TypeScript

Los tests también fueron migrados a TypeScript:

**Archivo**: `middlewares/async.handler.test.ts` (anteriormente `.test.js`)

**Mejoras**:
- Tipado completo de Request, Response y NextFunction de Express
- Uso de tipos genéricos de Jest para mocks
- Tipo `Boom` importado de `@hapi/boom` para errores tipados
- Type assertions apropiadas para acceder a propiedades de mock
- Inferencia de tipos en funciones async de test

## Ventajas Obtenidas

1. **Type Safety Mejorado**: Los tipos se infieren directamente de los schemas de validación
2. **Menos Código**: No es necesario definir interfaces separadas
3. **Mejor IntelliSense**: Autocompletado mejorado en el IDE
4. **Validación Más Estricta**: Zod es más estricto con los tipos por defecto
5. **Mejor DX**: Errores de tipo más claros durante el desarrollo
6. **Bundle Más Pequeño**: Zod es significativamente más ligero que Joi

## Próximos Pasos

1. ✅ Migrar schemas de validación
2. ✅ Actualizar validator middleware
3. ✅ Actualizar rutas con tipos inferidos
4. ⏳ Remover dependencia de Joi si no se usa en otros lugares
5. ⏳ Actualizar documentación del API
6. ⏳ Agregar más validaciones específicas del dominio

## Dependencias

**Agregadas**:
- `zod: ^3.22.4`

**A Remover** (si no se usan en otro lugar):
- `joi: ^17.12.1`

## Notas Adicionales

### Coerción de Tipos
Zod proporciona `z.coerce` para convertir automáticamente valores de string a otros tipos, útil para query parameters:

```typescript
page: z.coerce.number().int().min(1).default(1).optional(),
```

Esto convierte `"1"` → `1` automáticamente.

### Enums
Zod maneja enums de manera más TypeScript-friendly:

```typescript
// Joi
dataSource: Joi.string().valid('sql', 'nosql', 'both', 'fake')

// Zod
export const DataSourceEnum = z.enum(['sql', 'nosql', 'both', 'fake']);
// Tipo inferido: "sql" | "nosql" | "both" | "fake"
```

### Validaciones Complejas
Para validaciones condicionales o transformaciones, Zod proporciona:
- `.refine()` para validaciones personalizadas
- `.transform()` para transformar datos
- `.pipe()` para encadenar validaciones

## Referencias

- [Zod Documentation](https://zod.dev/)
- [Joi to Zod Migration Guide](https://zod.dev/?id=comparison)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
