'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/auth/hooks'

export default function MetaversePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    } else if (!isLoading && isAuthenticated) {
      // 로그인한 사용자는 대시보드로
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 이 페이지는 더 이상 사용되지 않음
  return null
}