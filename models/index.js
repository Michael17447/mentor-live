import sequelize from './sequelize.js';
import Session from './Session.js';
import SessionEvent from './SessionEvent.js';
import AIHint from './AIHint.js';

// Связи между моделями
Session.hasMany(SessionEvent, { foreignKey: 'SessionId' });
SessionEvent.belongsTo(Session, { foreignKey: 'SessionId' });

Session.hasMany(AIHint, { foreignKey: 'SessionId' });
AIHint.belongsTo(Session, { foreignKey: 'SessionId' });

export { sequelize, Session, SessionEvent, AIHint };