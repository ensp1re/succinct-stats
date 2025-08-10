import { Pool } from "pg"

// Create a singleton Postgres pool using DATABASE_URL
let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in environment")
    }

    pool = new Pool({ 
      connectionString, 
      max: 5,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params: unknown[] = []): Promise<{ rows: T[] }>{
  const p = getDbPool()
  const res = await p.query(sql, params)
  return { rows: res.rows as T[] }
}


