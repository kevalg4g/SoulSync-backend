const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Swipe = sequelize.define('Swipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  swiperId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  swipedId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  direction: {
    type: DataTypes.ENUM('left', 'right'),
    allowNull: false
  },

}, {
  tableName: 'swipes',
  indexes: [
    {
      unique: true,
      fields: ['swiperId', 'swipedId']
    }
  ]
});

module.exports = Swipe;

