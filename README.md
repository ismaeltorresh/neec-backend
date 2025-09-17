# NEEC Backend

Este repositorio contiene el backend del proyecto NEEC.  Está diseñado para manejar la lógica del servidor, la gestión de la base de datos y las APIs que interactúan con el frontend.

## Requisitos previos

Asegúrate de tener instalados los siguientes componentes antes de empezar:

- **Node.js**: versión 14 o superior.
- **npm**: versión 6 o superior.
- **Base de datos**: Se recomienda utilizar PostgreSQL.

## Instalación

Sigue estos pasos para instalar y ejecutar el proyecto localmente:

1. **Clona este repositorio**:

   ```
   bash
   git clone git@github.com:ismaeltorresh/neec-backend.git  
   ```

2. **Navega al directorio del proyecto**:

    ```
    bash
    cd neec-backend
    ```

3. **Instala las dependencias necesarias**:

    ```
    bash
    npm install
    ```

4. **Configuración:**

   El proyecto requiere variables de entorno. Crea un archivo `.env` en la raíz del proyecto y añade lo siguiente:

    PORT=3000
    DATABASE_URL=postgres://usuario:contraseña@host:puerto/nombre_base_datos
    JWT_SECRET=tu_secreto_jwt

    * `PORT`: Puerto del servidor (default: 3000).
    * `DATABASE_URL`: URL de conexión a PostgreSQL.
    * `JWT_SECRET`: Clave secreta para JWT.

5. **Ejecución:**

   Para iniciar el servidor en modo desarrollo:

    ```
    bash
    npm run dev
    ```

   El servidor estará disponible en `http://localhost:3000`.

   Para producción, primero compila y luego inicia:

    ```
    bash
    npm run build
    npm start
    ```

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo.
- `npm run build`: Compila para producción.
- `npm start`: Inicia el servidor en modo producción.

## Estructura del proyecto

El proyecto tiene la siguiente estructura:

neec-backend/
│
├── index.js          # Punto de entrada
├── routes/           # Rutas de la API
├── controllers/      # Lógica de las rutas
├── middlewares/      # Middlewares
├── models/           # Modelos de datos
├── schemas/          # Esquemas de validación
└── config/           # Configuración

## Contribuciones

Las contribuciones son bienvenidas.  Sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b nombre-de-tu-rama`).
3. Realiza tus cambios y haz commits descriptivos.
4. Envía tus cambios (`git push origin nombre-de-tu-rama`).
5. Abre un Pull Request describiendo tus cambios.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT (ver archivo `LICENSE`).

Desarrollado y mantenido por [ismaeltorresh](https://github.com/ismaeltorresh).

## **Convensiones:** ##

### Nombres de los campos ###

1. **Seguir una convención de nombres consistente**
    - **CamelCase**: `clientName`, `creationDate`.
    - No usar espacios en nombres de columnas o campos.

2. **Usar nombres significativos y descriptivos**
    - Evita abreviaciones innecesarias.
    - Prefiere `creationDate` en lugar de `cd`.
    - Usa nombres que indiquen el propósito del campo (`useUi` en lugar de `idUser`).

3. **No incluir el tipo de dato en el nombre**
    - `userName`, no `userNameStr`.
    - Si el tipo cambia en el futuro, el nombre seguirá siendo válido.

4. **Usar prefijos solo cuando sea necesario**
    - Evita redundancias: en una tabla `clients`, no llames a un campo `clientName`, solo `name`.
    
5. **Usar nombres en singular**
    - La tabla representa una colección, pero las columnas representan una propiedad de una entidad:
        - Tabla: `users`, columna: `email`.

6. **Utilizar convenciones estándar para claves primarias y foráneas**
    - Para claves primarias: `id` o `userId`.
    - Para claves foráneas: usa el nombre de la tabla seguida de `Id`: `userId`, `clientId`.
    
7. **Evitar palabras reservadas de SQL**
    - Ejemplo: `date`, `order`, `select`.

8. **No mezclar idiomas**
    - Usa nombres en inglés (`customerId`).

9. **No hacer nombres demasiado largos**
    - MongoDB, Firebase y otras bases de datos basadas en documentos almacenan los nombres de los campos junto con los datos, lo que puede aumentar el tamaño del documento.

10. **Estructurar correctamente los datos anidados**
    - En bases de datos NoSQL como MongoDB, es común anidar objetos en lugar de usar relaciones:
      ```
      {
        "userId": 123,
        "profile": {
          "firstName": "Carlos",
          "lastName": "Hernández"
        }
      }
      ```

11. **Campos obligatorios**
    - Todos los schemas deben contener los siguientes campos:
    ```
    const schemaName = {
      createdAt: Joi.date().timestamp(), // FECHA Y HORA DE CREACIÓN
      dataSource: Joi.string(), // EL ORIGEN O DESTINO DE LOS DATOS EJE: SQL | NOSQL | BOTH
      id: Joi.string().uuid(), // IDENTIFICADOR ÚNICO
      recordStatus: Joi.boolean(), // INDICA SI EL REGISTRO SE PUEDE MOSTRAR O NO
      updatedAt: Joi.date().timestamp(), // FECHA Y HORA DE ACTUALIZACIÓN
      updatedBy: Joi.string().uuid(), // ID DEL USUARIO QUE MODIFICÓ
      useAs: Joi.string(), // EL USO QUE LE DARÁS EJE: CONTACT | 
    }
    ```

## Formato de respuestas paginadas

Este proyecto expone endpoints de listado que devuelven un objeto estandarizado con la forma:

```json
{
    "data": [ /* array de elementos */ ],
    "meta": {
        "total": 123,
        "page": 1,
        "pageSize": 10,
        "totalPages": 13
    }
}
```

Helper disponible
- `utils/response.js` exporta la función `paginated(dataArray, page, pageSize)` que devuelve exactamente la estructura anterior (`{ data, meta }`).

Uso en rutas
- Para fuentes `fake` (archivo `test/fakedata.json`) y para datos en memoria, se utiliza `paginated(...)` para construir la respuesta.
- Los endpoints que realizan paginación en SQL usan `utils/sqlPagination.js` que ya devuelve `{ data, meta }`. El helper `paginated` se usa cuando la fuente es un array local.

Ejemplo (en una ruta Express):

```js
const { paginated } = require('../utils/response');
const items = getItemsFromFake();
const page = req.query.page || 1;
const pageSize = req.query.pageSize || 10;
res.json(paginated(items, page, pageSize));
```

## Ejemplos avanzados

Los endpoints de listado soportan combinaciones de paginación, filtros, búsqueda por texto y ordenación restringida a campos permitidos.

1) Paginación simple (page, pageSize)

curl:

```bash
curl "http://localhost:3000/people?dataSource=fake&page=2&pageSize=5"
```

2) Filtros exactos

Ejemplo: buscar productos por `brand` y `sku`:

```bash
curl "http://localhost:3000/products?dataSource=fake&brand=Acme&sku=ACM-001"
```

3) Filtros con wildcard

Puedes usar `*` para indicar comodines (el backend convierte `*` a `%` para búsquedas SQL cuando aplique):

```bash
curl "http://localhost:3000/people?dataSource=fake&nameOne=Mar*"
```

4) Búsqueda por texto (`q`)

Ejemplo: búsqueda en columnas configuradas para el recurso (p.ej. `nameOne`, `slug`):

```bash
curl "http://localhost:3000/people?dataSource=fake&q=maria"
```

5) Ordenación segura

Usa `sortBy` y `sortDir` (solo campos permitidos). Si `sortBy` no está en la lista blanca, el helper rechazará la petición.

```bash
curl "http://localhost:3000/products?dataSource=fake&sortBy=price&sortDir=DESC"
```

6) Combinación (filtros + búsqueda + paginación + orden)

```bash
curl "http://localhost:3000/products?dataSource=fake&brand=Acme&q=auriculares&page=1&pageSize=10&sortBy=price&sortDir=ASC"
```

7) Ejemplo en Node.js (fetch)

```js
const fetch = require('node-fetch');
async function getProducts() {
    const url = 'http://localhost:3000/products?dataSource=fake&brand=Acme&page=1&pageSize=10';
    const res = await fetch(url);
    const body = await res.json();
    console.log('data length', body.data.length);
    console.log('meta', body.meta);
}
getProducts();
```

Notas
- Las rutas SQL usan `utils/sqlPagination.js` que ya devuelve `{ data, meta }`.
- Para fuentes locales (`fake`), se utiliza `utils/response.js::paginated` para garantizar el mismo contrato.

## Uso de `nosqlMock` en pruebas

Para facilitar pruebas locales sin una base de datos NoSQL real, existe el helper `utils/nosqlMock.js` que lee `test/fakedata.json` y expone las funciones:

- `list(serviceName)` - devuelve el array del servicio (p.ej. 'people', 'products').
- `findById(serviceName, id)` - busca un registro por id o devuelve `null`.
- `paginateList(serviceName, page, pageSize, filters, search)` - devuelve `{ data, meta }` y soporta filtros y búsqueda.

Filtros:
- `filters` es un objeto con pares `campo: valor`. Los valores pueden incluir comodines `*` o `%` (ej. `{ nameOne: '*Mar*' }`).

Search:
- `search` es `{ q: 'termino', columns: ['col1','col2'] }` y realiza una búsqueda por substring (case-insensitive) en las columnas indicadas.

Ejemplo de uso en tests (Jest):

```js
const nosqlMock = require('../utils/nosqlMock');

test('mock nosql paginate with filters and search', () => {
    const filters = { useAs: 'supplier' };
    const search = { q: 'juan', columns: ['nameOne', 'slug'] };
    const res = nosqlMock.paginateList('people', 1, 10, filters, search);
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('meta');
});
```

Ejemplo de cómo las rutas consumen estos parámetros (request):

```
GET /api/v1/people?dataSource=nosql&page=1&pageSize=10&nameOne=*Mar*&q=madrid
```

En ese caso la ruta pasará los query params a `nosqlMock.paginateList('people', page, pageSize, filters, search)` y devolverá la respuesta en el formato `{ data, meta }`.

Notas:
- `nosqlMock` está pensado para pruebas y desarrollo local; para producción debes reemplazarlo por la integración con la base de datos NoSQL real.



