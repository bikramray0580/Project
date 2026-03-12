const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'No Name' },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
}, { timestamps: true });

const Waste = sequelize.define('Waste', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  lat: { type: DataTypes.FLOAT },
  lng: { type: DataTypes.FLOAT },
  postedBy: { type: DataTypes.INTEGER }
}, { timestamps: true });

const Request = sequelize.define('Request', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  requesterId: { type: DataTypes.INTEGER }
}, { timestamps: true });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Waste,
  Request
};
