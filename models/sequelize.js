import { Sequelize } from 'sequelize';

console.log('🔧 Initializing PostgreSQL database...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// ТОЛЬКО PostgreSQL - без SQLite
const sequelize = new Sequelize(process.env.DATABASE_URL, {
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

console.log('✅ PostgreSQL database initialized');
export default sequelize;