// Re-export database client and schema
export { db, testConnection } from './client'
export * from './schema'

// Export types
export type { User, Avatar, World, WorldVisit, Friendship } from './types'