import { Sequelize } from 'sequelize';

console.log('🔧 Initializing database connection with direct parameters...');

// Прямые параметры подключения к PostgreSQL
const sequelize = new Sequelize({
  database: 'railway',
  username: 'postgres', 
  password: 'XEICewXuOIRNddmhiNqzfRtQkpGxbKey',
  host: 'tramway.proxy.rlwy.net',
  port: 47079,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

console.log('✅ PostgreSQL database configured with direct connection');
export default sequelize;