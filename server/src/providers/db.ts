import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id         SERIAL PRIMARY KEY,
      status     VARCHAR(20)    NOT NULL DEFAULT 'queued',
      progress   INTEGER        NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);
}
