import { Sequelize } from 'sequelize';

// Гарантированно работающее решение с SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Файловая база данных
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

console.log('✅ SQLite database initialized successfully');
export default sequelize;