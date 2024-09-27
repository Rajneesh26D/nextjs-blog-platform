import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'blog_user',
  host: 'localhost',
  database: 'blog_platform',
  password: 'RrAaJj@26082003',
  port: 5432, // Default PostgreSQL port
});

// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL,
//   ssl: {
//     rejectUnauthorized: false, // Adjust this based on your setup
//   },
// });

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

export default pool;

