// Export all database services
export { AvatarService } from './avatar-service'
export { WorldService } from './world-service'
export { MigrationService } from './migration-service'

// Service instances (singletons)
export const avatarService = new AvatarService()
export const worldService = new WorldService()

// Service initialization
export function initializeDatabaseServices() {
  console.log('🗃️ Initializing database services...')
  // Any service initialization logic can go here
}

// Service cleanup
export function cleanupDatabaseServices() {
  console.log('🧹 Cleaning up database services...')
  // Any cleanup logic can go here
}