// models/AdminHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminHistory = sequelize.define('AdminHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity: {
    type: DataTypes.STRING, // 'waste' or 'request'
    allowNull: false
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING, // 'update', 'delete', 'approve', etc.
    allowNull: false
  },
  payload: {
    type: DataTypes.TEXT, // JSON string of what was changed
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = AdminHistory;
