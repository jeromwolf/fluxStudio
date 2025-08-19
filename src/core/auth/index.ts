import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)

// Helper functions
export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Re-export components and hooks
export { SessionProvider } from './SessionProvider'
export { AuthInitializer } from './AuthInitializer'
export * from './hooks'