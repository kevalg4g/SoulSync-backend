const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

}, {
  tableName: 'matches',
  indexes: [
    {
      unique: true,
      fields: ['user1Id', 'user2Id']
    }
  ]
});

module.exports = Match;

