// Export all stores from a single entry point
export * from './global-store'
export * from './avatar-store'
export * from './world-store'
export * from './persistence'

// Store initialization and setup
export function initializeStores() {
  console.log('🏪 Initializing Zustand stores with cloud persistence...')
  
  // Initialize cloud sync for authenticated users
  if (typeof window !== 'undefined') {
    // Check if user is online and start background sync
    if (navigator.onLine) {
      console.log('🌐 Online mode - enabling cloud sync')
    } else {
      console.log('📴 Offline mode - using local storage only')
    }
  }
}

// Store cleanup function
export function cleanupStores() {
  console.log('🧹 Cleaning up Zustand stores...')
  // Any cleanup logic for stores can go here
}