import { Pool } from "pg"

// Create a singleton Postgres pool using DATABASE_URL
let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in environment")
    }

    // Determine SSL configuration based on environment and URL
    let sslConfig: boolean | { rejectUnauthorized: boolean } = false
    
    if (process.env.NODE_ENV === 'production') {
      // Check if the connection string indicates SSL should be disabled
      if (connectionString.includes('sslmode=disable') || process.env.DATABASE_SSL_DISABLED === 'true') {
        sslConfig = false
      } else {
        sslConfig = { rejectUnauthorized: false }
      }
    }

    pool = new Pool({ 
      connectionString, 
      max: 5,
      ssl: sslConfig
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params: unknown[] = []): Promise<{ rows: T[] }>{
  try {
    const p = getDbPool()
    const res = await p.query(sql, params)
    return { rows: res.rows as T[] }
  } catch (error: any) {
    // Log the error for debugging
    console.error('Database query error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      sql: sql.substring(0, 100) + '...' // First 100 chars for debugging
    })
    
    // Re-throw the error to be handled by the calling code
    throw error
  }
}


