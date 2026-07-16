import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { mockDb } from './mock';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/dummy',
});

// Conditionally export mockDb when database connection is not configured
export const db = process.env.DATABASE_URL ? drizzle(pool, { schema }) : (mockDb as any);
export type DbClient = typeof db;

