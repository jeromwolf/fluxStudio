import type { NextAuthConfig } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/core/database/client'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  
  providers: [
    // Google OAuth (Primary for general users)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Discord OAuth (Gaming-focused users)
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),

    // GitHub OAuth (Developer-friendly)
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Guest/Demo login for testing
    CredentialsProvider({
      id: 'credentials',
      name: 'Guest',
      credentials: {
        username: { label: 'Username', type: 'text' }
      },
      async authorize(credentials) {
        // 게스트 로그인은 항상 허용
        // 서버/클라이언트 일관성을 위해 고정된 ID 사용
        const guestId = 'guest-user'
        return {
          id: guestId,
          name: '게스트 사용자',
          email: `${guestId}@flux.studio`,
          image: null
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/welcome',
    error: '/auth/error'
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Include user ID in JWT token
      if (user) {
        token.userId = user.id
      }
      
      // Store provider info for avatar creation
      if (account) {
        token.provider = account.provider
      }
      
      return token
    },

    async session({ session, token }) {
      // Include user ID in session
      if (token.userId) {
        session.user.id = token.userId as string
      }
      
      if (token.provider) {
        session.user.provider = token.provider as string
      }

      return session
    },

    async signIn({ user, account, profile }) {
      // Allow all OAuth providers
      if (account?.provider !== 'credentials') {
        return true
      }
      
      // Guest login validation
      if (account?.provider === 'credentials' && user?.email?.includes('guest')) {
        return true
      }

      return false
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser && user.id) {
        console.log(`🎉 New user registered: ${user.email} via ${account?.provider}`)
        // TODO: Create default avatar for new users
        // await createDefaultAvatarForUser(user.id)
      }
    },

    async signOut({ session }) {
      console.log(`👋 User signed out: ${session?.user?.email}`)
    }
  },

  debug: process.env.NODE_ENV === 'development'
}