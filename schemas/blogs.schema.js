const Joi = require('joi');

const schema = {
  content: Joi.string(),
  createdAt: Joi.date().timestamp(), // FECHA Y HORA DE CREACIÓN
  dataSource: Joi.string(), // EL ORIGEN O DESTINO DE LOS DATOS EJE: SQL | NOSQL | BOTH
  date: Joi.date(),
  featureImage: Joi.string(),
  id: Joi.string().uuid(), // IDENTIFICADOR ÚNICO
  isPublished: Joi.boolean(),
  lastUpdate: Joi.date(),
  recordStatus: Joi.boolean(), // INDICA SI EL REGISTRO SE PUEDE MOSTRAR O NO
  sumary: Joi.string(),
  tagList: Joi.array(),
  title: Joi.string(),
  updatedAt: Joi.date().timestamp(), // FECHA Y HORA DE ACTUALIZACIÓN
  updatedBy: Joi.string().uuid(), // ID DEL USUARIO QUE MODIFICÓ
  useAs: Joi.string(), // EL USO QUE LE DARÁS EJE: CONTACT |
  userId: Joi.string().uuid(),
};

const post = Joi.object({
  content: schema.content.required(),
  createdAt: schema.createdAt.required(),
  dataSource: schema.dataSource.required(),
  date: schema.date.required(),
  featureImage: schema.featureImage.required(),
  id: schema.id.required(),
  isPublished: schema.isPublished.required(),
  lastUpdate: schema.lastUpdate.required(),
  recordStatus: schema.recordStatus.required(),
  sumary: schema.sumary.required(),
  title: schema.title.required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
  useAs: schema.useAs.required(),
  userId: schema.userId.required(),
});

const update = Joi.object({
  dataSource: schema.dataSource.required(),
  id: schema.id.required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
  recordStatus: schema.recordStatus.required(),
});

const get = Joi.object({
  dataSource: schema.dataSource.required(),
  recordStatus: schema.recordStatus.required(),
  id: schema.id.required(),
});

const del = Joi.object({
  dataSource: schema.dataSource.required(),
  id: schema.id.required(),
  recordStatus: schema.recordStatus.valid(false).required(),
  updatedAt: schema.updatedAt.required(),
  updatedBy: schema.updatedBy.required(),
});

module.exports = { post, update, get, del, schema };
