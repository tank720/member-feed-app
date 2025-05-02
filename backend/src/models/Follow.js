import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
});

// Set up associations
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'followingId'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'followerId'
});

// Create the table if it doesn't exist
Follow.sync();

export default Follow;