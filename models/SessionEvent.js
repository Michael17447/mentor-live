import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

const SessionEvent = sequelize.define('SessionEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'code_change',
      'cursor_move', 
      'audio_toggle',
      'edit_permission',
      'ai_hint',
      'session_start',
      'session_end'
    ),
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default SessionEvent;