import { Pool } from 'pg';

const pool = new Pool({
  user: 'blog_user',
  host: 'localhost',
  database: 'blog_platform',
  password: 'RrAaJj@26082003',
  port: 5432, // Default PostgreSQL port
});

export default pool;
