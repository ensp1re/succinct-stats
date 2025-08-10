import { Pool } from "pg"

// Create a singleton Postgres pool using DATABASE_URL
let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in environment")
    }

    // For most cases, try without SSL first (many databases don't support SSL)
    let sslConfig: boolean | { rejectUnauthorized: boolean } = false
    
    // Only enable SSL if explicitly requested
    if (process.env.DATABASE_FORCE_SSL === 'true') {
      sslConfig = { rejectUnauthorized: false }
    }

    pool = new Pool({ 
      connectionString, 
      max: 5,
      ssl: sslConfig,
      // Add connection timeout
      connectionTimeoutMillis: 10000,
      // Add idle timeout
      idleTimeoutMillis: 30000
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
    
    // If it's an SSL error, provide helpful guidance
    if (error.message?.includes('SSL') || error.message?.includes('ssl')) {
      console.error('SSL connection failed. Make sure your database supports SSL or set DATABASE_FORCE_SSL=false')
      throw new Error(`Database SSL Error: ${error.message}. Try setting DATABASE_FORCE_SSL=false if your database doesn't support SSL.`)
    }
    
    // Re-throw the error to be handled by the calling code
    throw error
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}


