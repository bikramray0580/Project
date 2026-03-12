// models/Request.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define("Request", {
  material: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  category: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  requiredQuantity: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  useCase: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  // ✔ IMPORTANT: "items" sent from frontend is an ARRAY → store as JSON
  items: { 
    type: DataTypes.TEXT,
    allowNull: true 
  },

  // ✔ Status for admin to approve / reject
  status: { 
    type: DataTypes.STRING, 
    defaultValue: "pending" 
  }

}, {
  tableName: "requests",
  timestamps: true
});

module.exports = Request;
