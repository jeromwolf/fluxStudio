'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useGlobalStore } from '@/shared/stores/global-store'
import { setCurrentUserIdProvider } from '@/shared/stores/persistence'

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  provider?: string
}

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const setUserLoading = useGlobalStore((state) => state.setUserLoading)
  const initializeFromSession = useGlobalStore((state) => state.initializeFromSession)
  const clearUserData = useGlobalStore((state) => state.clearUserData)

  const user: AuthUser | null = session?.user 
    ? {
        id: session.user.id!,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        provider: session.user.provider
      }
    : null

  // Sync auth state with global store and persistence
  useEffect(() => {
    if (status === 'loading') {
      setUserLoading(true)
      return
    }

    if (user) {
      // 사용자 인증됨
      const userData = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        emailVerified: null,
        image: user.image,
        username: user.name || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      initializeFromSession(userData)
      
      // 영속성 시스템에 사용자 ID 설정
      setCurrentUserIdProvider(() => user.id)
      
      console.log('✅ User authenticated:', user.email)
    } else {
      // 사용자 인증되지 않음
      clearUserData()
      
      // 게스트 모드로 설정
      setCurrentUserIdProvider(() => 'temp-user')
      
      console.log('🔓 User not authenticated - using guest mode')
    }
  }, [user, status, setUserLoading, initializeFromSession, clearUserData])

  const login = useCallback(async (provider?: string, options?: any) => {
    if (provider) {
      return await signIn(provider, { callbackUrl: '/studio', ...options })
    } else {
      // Redirect to custom sign-in page
      router.push('/auth/signin')
    }
  }, [router])

  const resetStore = useGlobalStore((state) => state.reset)
  
  const logout = useCallback(async () => {
    // Clear stores before signing out
    resetStore?.()
    
    await signOut({ 
      callbackUrl: '/',
      redirect: true
    })
  }, [resetStore])

  const loginAsGuest = useCallback(async () => {
    return await signIn('credentials', {
      username: 'guest',
      callbackUrl: '/dashboard',
      redirect: true
    })
  }, [])

  return {
    // Auth state
    user,
    isAuthenticated: !!user,
    isLoading: status === 'loading',
    status,
    session,

    // Actions
    login,
    logout,
    loginAsGuest,
    updateSession: update,

    // Convenience checks
    isGuest: user?.email?.includes('guest'),
    hasProvider: (provider: string) => user?.provider === provider,
    
    // Navigation helpers
    requireAuth: () => {
      if (!user && status !== 'loading') {
        router.push('/auth/signin')
        return false
      }
      return true
    }
  }
}

// Custom hook for protected routes
export function useRequireAuth() {
  const { user, isLoading, requireAuth } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      requireAuth()
    }
  }, [user, isLoading, requireAuth])

  return { user, isLoading }
}

// Provider selection helper
export function getProviderInfo(provider: string) {
  const providers = {
    google: {
      name: 'Google',
      icon: '🌐',
      color: '#db4437',
      description: 'Sign in with your Google account'
    },
    discord: {
      name: 'Discord',
      icon: '🎮',
      color: '#7289da',
      description: 'Sign in with your Discord account'
    },
    github: {
      name: 'GitHub',
      icon: '📱',
      color: '#333',
      description: 'Sign in with your GitHub account'
    },
    guest: {
      name: 'Guest',
      icon: '👤',
      color: '#6b7280',
      description: 'Try without an account (limited features)'
    }
  }

  return providers[provider as keyof typeof providers] || providers.google
}