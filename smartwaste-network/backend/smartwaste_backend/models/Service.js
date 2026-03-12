// models/Service.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Service extends Model {}

Service.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  short: { type: DataTypes.STRING, allowNull: true },
  long: { type: DataTypes.TEXT, allowNull: true },
  iconUrl: { type: DataTypes.STRING, allowNull: true }, // e.g. /uploads/service.png
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  sequelize,
  modelName: 'Service',
  tableName: 'services',
  timestamps: true
});

module.exports = Service;
