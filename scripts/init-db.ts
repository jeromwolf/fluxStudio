import * as dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load environment variables
dotenv.config({ path: '.env' })

async function initDatabase() {
  console.log('🚀 Initializing database schema...')
  
  const sql = neon(process.env.DATABASE_URL!)
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✅ Created users table')
    
    // Create avatars table
    await sql`
      CREATE TABLE IF NOT EXISTS avatars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        metadata JSONB NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✅ Created avatars table')
    
    // Create worlds table
    await sql`
      CREATE TABLE IF NOT EXISTS worlds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends')),
        max_players INTEGER DEFAULT 50,
        objects JSONB,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✅ Created worlds table')
    
    // Create world_visits table
    await sql`
      CREATE TABLE IF NOT EXISTS world_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        visited_at TIMESTAMP DEFAULT NOW() NOT NULL,
        duration INTEGER DEFAULT 0
      )
    `
    console.log('✅ Created world_visits table')
    
    // Create friendships table
    await sql`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, friend_id)
      )
    `
    console.log('✅ Created friendships table')
    
    console.log('\n🎉 Database schema initialized successfully!')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()