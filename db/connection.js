const { Sequelize } = require('sequelize');
const env = require('../environments');
const boom = require('@hapi/boom');

const sequelize = new Sequelize(
  env.db.maria.database,
  env.db.maria.user,
  env.db.maria.password,
  {
    host: env.db.maria.host,
    port: env.db.maria.port,
    dialect: env.db.maria.dialect,
    logging: env.db.maria.logging,
  }
);

// Function to test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Maria DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Re-throw the error to be handled elsewhere
  }
}

// Test the connection when the file is loaded
// testConnection();

module.exports = {
  sequelize,
  testConnection
};
