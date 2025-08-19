// This file should only be imported on the server side
// For client-side code, use API routes instead

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

// Prevent client-side usage
if (typeof window !== 'undefined') {
  throw new Error('Database client cannot be used on the client side. Use API routes instead.')
}

// Check if we're running on the server
if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  require('dotenv').config({ path: '.env.local' })
}

// Neon serverless client
const sql = neon(process.env.DATABASE_URL!)

// Drizzle ORM instance
export const db = drizzle(sql)

// Connection test function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`
    console.log('✅ Database connected:', result[0])
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}