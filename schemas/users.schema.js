const Joi = require('joi');

const users = {
  createdAt: Joi.date().timestamp(), // FECHA Y HORA DE CREACIÓN
  dataSource: Joi.string(), // EL ORIGEN O DESTINO DE LOS DATOS EJE: SQL | NOSQL | BOTH
  email: Joi.string().email(),
  id: Joi.string().uuid(), // IDENTIFICADOR ÚNICO
  lastLogin: Joi.date().timestamp(),
  location: Joi.string(),
  passwordHash: Joi.string(),
  passwordResetToken: Joi.string(),
  peopleId: Joi.string().uuid(),
  recordStatus: Joi.boolean(), // INDICA SI EL REGISTRO SE PUEDE MOSTRAR O NO
  role: Joi.string(), // e.g., 'admin', 'user'
  status: Joi.string(), // e.g., 'active', 'inactive'
  tokenVerification: Joi.string(),
  updatedAt: Joi.date().timestamp(), // FECHA Y HORA DE ACTUALIZACIÓN
  updatedBy: Joi.string().uuid(), // ID DEL USUARIO QUE MODIFICÓ
  useAs: Joi.string(), // EL USO QUE LE DARÁS EJE: CONTACT |
  userName: Joi.string(),
};

const usersDelete = Joi.object({
  id: users.id.required(),
  updatedAt: users.updatedAt.required(),
  updatedBy: users.updatedBy.required(),
  dataSource: users.dataSource.required(),
  recordStatus: users.recordStatus.required(),
});

const usersGet = Joi.object({
  id: users.id.required(),
  dataSource: users.dataSource.required(),
});

const usersPatch = Joi.object({
  id: users.id.required(),
  updatedAt: users.updatedAt.required(),
  updatedBy: users.updatedBy.required(),
  dataSource: users.dataSource.required(),
});

const usersPost = Joi.object({
  createdAt: users.createdAt.required(),
  dataSource: users.dataSource.required(),
  id: users.id.required(),
  passwordHash: users.passwordHash.required(),
  recordStatus: users.recordStatus.required(),
  role: users.role.required(),
  status: users.status.required(),
  updatedAt: users.updatedAt.required(),
  updatedBy: users.updatedBy.required(),
  useAs: Joi.required(),
  userName: users.userName.required(),
});

module.exports = {
  users,
  usersDelete,
  usersGet,
  usersPatch,
  usersPost,
};
