// db.js - PostgreSQL connection for Navigator admin dashboard

const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'maia_consciousness',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
});

// Test connection on startup
pool.on('connect', () => {
  console.log('🗄️  Navigator admin connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('🔴 PostgreSQL connection error:', err.message);
});

module.exports = { pool };