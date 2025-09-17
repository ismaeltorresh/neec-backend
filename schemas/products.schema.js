/*
The provided code is a validation schema using the Joi library in JavaScript.
It defines a schema object that contains validation rules for different fields. Each field has a specific type and some additional constraints.
Several validation schemas are defined for different CRUD operations (Create, Read, Update, Delete). These schemas are Joi objects that use the rules defined in the schema and specify which fields are required for each operation.
Each of these schemas ensures that the provided data complies with the specified rules before allowing the operation to proceed, which helps maintain data integrity and consistency in the application.
*/

const Joi = require('joi');

const schema = {
  // ** Start recommended mandatory schema **
  createdAt: Joi.date().timestamp(), // Date and time of creation
  dataSource: Joi.string().valid('sql', 'nosql', 'both', 'fake'), // The origin or destination of the data e.g. sql | nosql | both
  id: Joi.string().uuid(), // Unique identifier
  recordStatus: Joi.boolean(), // Indicates if the record can be displayed or not
  updatedAt: Joi.date().timestamp(), // Date and time of update
  updatedBy: Joi.string().uuid(), // ID of the user who modified
  useAs: Joi.string(), // The use you will give e.g. contact | ...
  slug: Joi.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), // Slug for URL-friendly representation
  // ** Ends recommended mandatory schema **

  brand: Joi.string(), // Brand of the product
  categoryId: Joi.string().uuid(), // Category ID
  code: Joi.string().alphanum(), // Product code
  color: Joi.string(), // Color of the product
  description: Joi.string(), // Description
  flavor: Joi.string(), // Flavor of the product
  height: Joi.number().min(0), // Height of the product
  length: Joi.number().min(0), // Length of the product
  material: Joi.string(), // Material of the product
  photoUrl: Joi.string().uri(), // URL of the product photo
  price: Joi.number(), // Sale price
  rating: Joi.number().min(0).max(5), // Product rating
  size: Joi.string(), // Size of the product
  sku: Joi.string().alphanum(), // Stock Keeping Unit
  stock: Joi.number().integer().min(0), // Stock quantity
  sumary: Joi.string(), // Summary
  tags: Joi.array().items(Joi.string()), // Tags associated with the product
  units: Joi.number().integer().min(0), // Number of units
  weight: Joi.number().min(0), // Weight of the product
  width: Joi.number().min(0), // Width of the product
};


const del = Joi.object({
  // ** Start recommended required fields **
  dataSource: schema.dataSource.required(),
  id: schema.id.required(),
  recordStatus: schema.recordStatus.valid(false).required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
  // ** Start recommended required fields **
});

const get = Joi.object({
  // ** Start recommended required fields **
  dataSource: schema.dataSource.required(),
  recordStatus: schema.recordStatus.required(),
  // Pagination
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  // ** Ends recommended required fields **
});

const update = Joi.object({
  // ** Start recommended required fields **
  dataSource: schema.dataSource.required(),
  id: schema.id.required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
  recordStatus: schema.recordStatus.required(),
  // ** Ends recommended required fields **
});

const post = Joi.object({
  // ** Start recommended required fields **
  createdAt: schema.createdAt.required(),
  dataSource: schema.dataSource.required(),
  id: schema.id.required(),
  recordStatus: schema.recordStatus.required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
  useAs: schema.useAs.required(),
  // ** Ends recommended required fields **

  sumary: schema.sumary.required(),
  price: schema.price.required(),
});

module.exports = {
  schema,
  del,
  get,
  update,
  post,
};
