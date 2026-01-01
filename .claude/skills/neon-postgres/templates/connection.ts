import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL || '{{connectionString}}');
export const db = drizzle(sql);

export async function getPooledConnection() {
  // Neon handles pooling automatically in serverless environments
  return sql;
}

export const schema = {
  // Define your tables here
  users: {
    id: 'serial PRIMARY KEY',
    email: 'text NOT NULL UNIQUE',
    created_at: 'timestamp DEFAULT NOW()',
  },
};
