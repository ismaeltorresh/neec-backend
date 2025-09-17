## NEEC Backend - Documentación de la API

Este repositorio contiene el backend del proyecto NEEC y expone una pequeña API REST montada en Express.
Esta documentación cubre instalación, configuración y uso de los endpoints disponibles en `/api/v1`.

## Contenido rápido

- Endpoints: `/api/v1/products`, `/api/v1/people`, `/api/v1/address`, `/api/v1/blogs`, `/api/v1/users`, `/api/v1/template`
- Soporte para varias fuentes de datos por recurso: `sql`, `nosql`, `fake`, `both`.
- Validaciones con `Joi` via `middlewares/validator.handler.js`.
- Respuestas de listado con formato paginado `{ data, meta }`.

## Requisitos previos

- Node.js 14+ y npm.
- (Opcional) Base de datos SQL (MySQL/MariaDB/ PostgreSQL según configuración) si vas a usar `dataSource=sql`.

## Instalación rápida

1) Clona el repositorio y entra en la carpeta:

```bash
git clone git@github.com:ismaeltorresh/neec-backend.git
cd neec-backend
```

2) Instala dependencias:

```bash
npm install
```

3) Variables de entorno (ejemplo mínimo): crea un `.env` o exporta las variables necesarias antes de ejecutar.

Ejemplo mínimo:

```
PORT=3000
DATABASE_URL=mysql://user:pass@host:3306/dbname
execution=development
```

4) Ejecuta en modo desarrollo:

```bash
npm run dev
```

El servidor por defecto monta las rutas bajo `http://localhost:3000/api/v1/`.

## Scripts disponibles

- `npm run dev` - ejecuta con nodemon en modo development (usa variables cross-env definidas en package.json).
- `npm start` - inicia en modo producción.
- `npm run build` - empaqueta con webpack.

## Convenciones y helpers importantes

- Validación: los endpoints usan `Joi` y el middleware `middlewares/validator.handler.js` para validar `body`, `query` o `params` según el esquema exportado en `schemas/*`.
- Paginación: las rutas de listado devuelven `{ data, meta }`. Hay dos helpers:
  - `utils/response.js::paginated(array, page, pageSize)` para arrays en memoria (fake).
  - `utils/pagination.js::sqlPaginate(options)` para paginación segura en SQL.
- Mock NoSQL: `utils/nosqlMock.js` permite simular `list`, `findById` y `paginateList` a partir de `test/fakedata.json`.

## Parámetros comunes en consultas (query params)

- `dataSource` (required en las validaciones): `sql` | `nosql` | `fake` | `both`.
- `page`, `pageSize` (paginación). Defaults: `page=1`, `pageSize=10`.
- `q` (búsqueda por texto sobre columnas configuradas por recurso).
- `sortBy`, `sortDir` (orden seguro - solo campos permitidos por recurso).
- Filtros específicos por recurso (por ejemplo `brand`, `sku`, `nameOne`, `city`, etc.).

## Endpoints por recurso (resumen)

Base URL: `http://localhost:3000/api/v1`

- Products (`/products`)
  - GET /products
    - Query: `dataSource`, `page`, `pageSize`, `q`, `brand`, `categoryId`, `sku`, `code`, `recordStatus`, `sortBy`, `sortDir`.
    - Retorna `{ data, meta }` o estructura combinada para `both`.
  - GET /products/schema - devuelve el esquema cuando `execution=development`.
  - GET /products/:id - obtiene 1 registro por `id` (usa `dataSource` en query).
  - POST /products - crea un recurso (body validado por `schemas/products.schema.js`).
  - PUT /products/:id - actualiza un recurso (body validado por `update` schema).
  - DELETE /products/:id - elimina (body validado por `del` schema`).

- People (`/people`) — (mismo patrón que products)
  - GET /people
  - GET /people/schema
  - GET /people/:id
  - POST /people
  - PUT /people/:id
  - DELETE /people/:id

- Address (`/address`) — (mismo patrón)
  - GET /address
  - GET /address/schema
  - GET /address/:id
  - POST /address
  - PUT /address/:id
  - DELETE /address/:id

- Blogs (`/blogs`)
  - POST /blogs/posts - crea un post (body libre en el router actual).
  - GET /blogs/posts - lista posts (mocked en router).
  - GET /blogs/posts:postId - obtiene post por id (router incompleto, revisar si se planea usar).
  - GET /blogs/schema - devuelve un esquema simplificado cuando `execution=development`.

- Users (`/users`)
  - GET /users - listado (soporta `sql` y paginación con filtros `userName`, `email`, `role`, `status`).
  - GET /users/datamodel - devuelve el datamodel cuando `execution=development`.
  - GET /users/:id
  - POST /users - crea usuario (validado por `schemas/users.schema.js`).
  - PATCH /users/:id - actualiza parcialmente (validaciones aplicadas en params).
  - DELETE /users/:id - elimina (validado por `usersDelete`).

- Template (`/template`)
  - GET /template
  - GET /template/schema
  - GET /template/:id
  - POST /template
  - PUT /template/:id
  - DELETE /template/:id
  - Nota: este recurso incluye ejemplos de uso de la conexión SQL (`db/connection.js`) y algunos queries directos en el router.

## Ejemplos de uso (cURL)

- Listar `people` usando datos fake (paginado):

```bash
curl "http://localhost:3000/api/v1/people?dataSource=fake&page=1&pageSize=5"
```

- Buscar `products` por marca y ordenar:

```bash
curl "http://localhost:3000/api/v1/products?dataSource=fake&brand=Acme&page=1&pageSize=10&sortBy=price&sortDir=ASC"
```

- Obtener un `template` por id (SQL):

```bash
curl "http://localhost:3000/api/v1/template/123e4567-e89b-12d3-a456-426614174000?dataSource=sql"
```

- Crear un `product` (ejemplo mínimo — body requiere fields según `schemas/products.schema.js`):

```bash
curl -X POST "http://localhost:3000/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{"dataSource":"sql","createdAt":1690000000,"id":"uuid-1234","recordStatus":true,"updatedAt":1690000000,"updatedBy":"uuid-user","useAs":"test","sumary":"Resumen","price":123.45}'
```

## Validación y errores

- Los esquemas de validación están en `schemas/*.schema.js` y se aplican mediante `validator.handler.js`.
- Cuando la validación falla el middleware devuelve un error 400 con detalles del `Joi` error envuelto por `boom.badRequest`.
- Para errores internos se usa `boom.internal` y para condiciones de autorización/ambiente incorrecto se usan `boom.forbidden` o `boom.badRequest` según el caso.

## Testing y Mocks

- Tests unitarios y de integración usan `jest` y `supertest` (revisa `test/*.test.js`).
- Para pruebas sin base de datos se usa `utils/nosqlMock.js` y `test/fakedata.json`.

## Notas operativas y buenas prácticas

- En desarrollo, las rutas `/schema` y `/datamodel` devuelven los esquemas de validación cuando `execution=development`.
- `dataSource=both` devuelve un objeto con versiones `sql` y `nosql` (o un placeholder) útil para comparar resultados.
- Reemplaza `nosqlMock` por la integración real con tu base de datos NoSQL en producción.

## Siguientes pasos recomendados

- Añadir documentación OpenAPI/Swagger a partir de los esquemas Joi (automatizable).
- Implementar control de autenticación/autorization (actualmente hay dependencias para JWT/OAuth en `package.json` pero los routers no integran auth en todas las rutas).
- Completar endpoints de `blogs` (ruta `/posts:postId` parece incompleta).
