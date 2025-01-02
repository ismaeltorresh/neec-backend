const Joi = require('joi');

const users = {
  created_at: Joi.date().timestamp(),
  email: Joi.string().email().required(),
  id: Joi.string().uuid(),
  last_login: Joi.date().timestamp(),
  location: Joi.string(),
  password_hash: Joi.string().required(),
  people_id: Joi.string().uuid(),
  reset_password_token: Joi.string(),
  role: Joi.string(), // e.g., 'admin', 'user'
  status: Joi.string(), // e.g., 'active', 'inactive'
  updated_at: Joi.date().timestamp(),
  updated_by: Joi.string().uuid(),
  username: Joi.string().required(),
  verification_token: Joi.string(),
};

const usersDelete = Joi.object({
  id: users.id.required(),
});

const usersGet = Joi.object({
  id: users.id.required(),
});

const usersPatch = Joi.object({
  id: users.id.required(),
});

const usersPost = Joi.object({
  id: users.id.required(),
  username: users.username.required(),
  password_hash: users.password_hash.required(),
  status: users.status.required(),
  role: users.role.required(),
});

module.exports = {
  users,
  usersDelete,
  usersGet,
  usersPatch,
  usersPost,
};
