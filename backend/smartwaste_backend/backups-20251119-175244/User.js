// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: true },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(200), allowNull: false }, // hashed
  role: { type: DataTypes.ENUM('user','admin'), allowNull: false, defaultValue: 'user' },
  ecoPoints: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  timestamps: true
});

module.exports = User;
