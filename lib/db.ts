import { neon } from '@neondatabase/serverless'

let sqlInstance: any = null

export function getSql() {
  if (!sqlInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    sqlInstance = neon(process.env.DATABASE_URL)
  }
  return sqlInstance
}

export async function initializeDatabase() {
  try {
    const sql = getSql()
    // Create solar_entries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS solar_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        total_generation DECIMAL(10, 2) NOT NULL,
        import_grid DECIMAL(10, 2) NOT NULL,
        export_grid DECIMAL(10, 2) NOT NULL,
        unit_used DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(date)
      )
    `

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_solar_entries_date 
      ON solar_entries(date DESC)
    `

    console.log('[v0] Database initialized successfully')
  } catch (error) {
    console.error('[v0] Error initializing database:', error)
    throw error
  }
}
