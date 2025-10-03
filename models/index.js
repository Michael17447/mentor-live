import { Sequelize } from 'sequelize';
import Session from './Session.js';
import SessionEvent from './SessionEvent.js';
import AIHint from './AIHint.js';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// 🔥 СВЯЗИ МЕЖДУ МОДЕЛЯМИ - ДОБАВЬТЕ СЮДА
Session.hasMany(SessionEvent, { foreignKey: 'SessionId' });
SessionEvent.belongsTo(Session, { foreignKey: 'SessionId' });

Session.hasMany(AIHint, { foreignKey: 'SessionId' });
AIHint.belongsTo(Session, { foreignKey: 'SessionId' });

export { sequelize };
export { Session, SessionEvent, AIHint };