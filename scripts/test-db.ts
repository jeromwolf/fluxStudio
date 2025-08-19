import * as dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load environment variables first
dotenv.config({ path: '.env' })

async function test() {
  console.log('🔌 Testing Neon PostgreSQL connection...')
  console.log('📍 Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')
  
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    
    console.log('✅ Database connection successful!')
    console.log('⏰ Current time:', result[0].current_time)
    console.log('🐘 PostgreSQL version:', result[0].pg_version)
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error)
    process.exit(1)
  }
}

test()