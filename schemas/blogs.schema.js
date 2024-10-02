const Joi = require('joi');

const field = {
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

const put = Joi.object({
  content: field.content.required(),
  date: field.date.required(),
  featureImage: field.featureImage.required(),
  isPublished: field.isPublished.required(),
  lastUpdate: field.lastUpdate.required(),
  sumary: field.sumary.required(),
  title: field.title.required(),
  userId: field.userId.required(),
});

const get = Joi.object({
  id: id.required(),
});

const del = Joi.object({
  id: id.required(),
});

module.exports = { put, get, del };
