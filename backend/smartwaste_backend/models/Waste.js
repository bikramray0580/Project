// models/Waste.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Waste = sequelize.define('Waste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // frontend fields
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  quantity: {
    type: DataTypes.STRING(100), // storing as string like "500 kg" keeps it simple
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // coordinates
  lat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Waste;
