import { Sequelize } from 'sequelize';

console.log('🔧 Checking environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Проверяем что DATABASE_URL установлен
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  console.error('Please set DATABASE_URL environment variable in Railway');
  process.exit(1);
}

console.log('✅ DATABASE_URL found, initializing PostgreSQL...');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;