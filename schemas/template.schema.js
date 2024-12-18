const Joi = require('joi');

const templateField = {
  content: Joi.string(),
  date: Joi.date(),
  featureImage: Joi.string(),
  id: Joi.string().uuid(),
  isPublished: Joi.boolean(),
  lastUpdate: Joi.date(),
  sumary: Joi.string(),
  tagList: Joi.array(),
  title: Joi.string(),
  userId: Joi.string().uuid(),
};

const templateDelete = Joi.object({
  id: templateField.id.required(),
});

const templateGet = Joi.object({
  id: templateField.id.required(),
});

const templatePatch = Joi.object({
  id: templateField.id.required(),
});

const templatePost = Joi.object({
  content: templateField.content.required(),
  date: templateField.date.required(),
  featureImage: templateField.featureImage.required(),
  isPublished: templateField.isPublished.required(),
  lastUpdate: templateField.lastUpdate.required(),
  sumary: templateField.sumary.required(),
  title: templateField.title.required(),
  userId: templateField.userId.required(),
});

module.exports = {
  templateDelete,
  templateField,
  templateGet,
  templatePatch,
  templatePost,
};
