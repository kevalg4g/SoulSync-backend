const { Sequelize } = require('sequelize');  // use  sequelize ORM
require('dotenv').config({ path: '.env' });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: { connectTimeout: 10000 }
});

// ERROR HANDLING USE TRY&catch

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`DB: ${process.env.DB_NAME}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  } catch (error) {
    console.error(`DB failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sequelize, testConnection };

