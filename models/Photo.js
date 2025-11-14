const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: false
  }

}, {
  tableName: 'photos'
});

module.exports = Photo;

