import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const AIHint = sequelize.define('AIHint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hintText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0.5
  }
});

export default AIHint;