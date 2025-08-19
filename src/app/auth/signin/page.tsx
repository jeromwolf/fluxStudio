'use client'

import { useState } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useAuth, getProviderInfo } from '@/core/auth/hooks'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">이미 로그인되어 있습니다</h2>
          <p className="text-gray-300 mb-6">스튜디오로 이동하세요</p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            대시보드로 이동
          </Button>
        </div>
      </div>
    )
  }

  const handleProviderSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    try {
      await signIn(providerId, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const providers = [
    { id: 'google', ...getProviderInfo('google') },
    { id: 'discord', ...getProviderInfo('discord') },
    { id: 'github', ...getProviderInfo('github') },
    { id: 'credentials', ...getProviderInfo('guest') }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌌 Flux Studio
          </h1>
          <p className="text-xl text-gray-300">
            메타버스 크리에이터 플랫폼
          </p>
          <p className="text-sm text-gray-400 mt-2">
            로그인하여 나만의 3D 월드를 만들어보세요
          </p>
        </div>

        {/* Sign in options */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            로그인 방법을 선택하세요
          </h2>
          
          <div className="space-y-4">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                onClick={() => handleProviderSignIn(provider.id)}
                disabled={isLoading !== null}
                className="w-full h-12 text-left justify-start space-x-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-200"
                style={{ backgroundColor: isLoading === provider.id ? `${provider.color}20` : undefined }}
              >
                <span className="text-lg">{provider.icon}</span>
                <div className="flex-1">
                  <span className="font-medium">
                    {isLoading === provider.id ? '로그인 중...' : provider.name}
                  </span>
                  <div className="text-xs text-gray-300">
                    {provider.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs text-gray-400 text-center">
              로그인하면 <a href="#" className="text-blue-300 hover:underline">서비스 약관</a>과{' '}
              <a href="#" className="text-blue-300 hover:underline">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">
            Flux Studio 기능
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium text-white">3D 월드 빌더</div>
              <div className="text-gray-400 text-xs">드래그 앤 드롭으로 쉽게 제작</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-white">아바타 커스터마이징</div>
              <div className="text-gray-400 text-xs">100+ 아이템으로 꾸미기</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-medium text-white">멀티플레이어</div>
              <div className="text-gray-400 text-xs">친구들과 함께 탐험</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">💾</div>
              <div className="font-medium text-white">클라우드 저장</div>
              <div className="text-gray-400 text-xs">언제 어디서나 접근</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}