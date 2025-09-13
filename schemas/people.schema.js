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
  dataSource: Joi.string().valid('sql', 'nosql', 'both', 'fake').required(), // The origin or destination of the data e.g. sql | nosql | both
  id: Joi.string().uuid().required(), // Unique identifier
  recordStatus: Joi.boolean().required(), // Indicates if the record can be displayed or not
  updatedAt: Joi.date().timestamp().required(), // Date and time of update
  updatedBy: Joi.string().uuid().required(), // ID of the user who modified
  useAs: Joi.string().required(), // The use you will give e.g. contact | client...
  nameOne: Joi.string().required(), // First name, mandatory
  slug: Joi.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), // Slug for URL-friendly representation
  // ** Ends recommended mandatory schema **
  nameTwo: Joi.string(), // Second name, optional
  nameThree: Joi.string(), // Third name, optional
  birthdate: Joi.date(), // Date of birth, optional
  birthHour: Joi.string() // 
    .pattern(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/), // Time of birth, HH:mm format, optional
  birthCountry: Joi.string(), // Country of birth, optional
  identificationNumber: Joi.string().required(), // Identification number, mandatory
  identificationType: Joi.string().required(), // Type of identification, mandatory
  genderBirth: Joi.string()
    .valid('male', 'female'), // Birth gender, optional
  genderCurrent: Joi.string()
    .valid('male', 'female', 'binary'), // Current gender, optional
  maritalStatus: Joi.string()
    .valid('single', 'married', 'divorced', 'widowed'),
  language: Joi.string(),
  weight: Joi.number(),
  height: Joi.number(),
  bloodType: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
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
});

module.exports = {
  schema,
  del,
  get,
  update,
  post,
};
