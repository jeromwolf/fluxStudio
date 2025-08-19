'use client'

import { useAuth } from '@/core/auth/hooks'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WelcomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold">로딩 중...</h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  const steps = [
    {
      title: '환영합니다! 🎉',
      content: (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
            {user.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              '👋'
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            안녕하세요, {user.name || '새로운 크리에이터'}님!
          </h3>
          <p className="text-gray-300 text-lg mb-6">
            Flux Studio에 오신 것을 환영합니다.<br/>
            나만의 메타버스를 만들어보세요!
          </p>
        </div>
      )
    },
    {
      title: '시작하기 전에 📋',
      content: (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            알아두면 좋은 기능들
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white/10 rounded-lg p-4">
              <div className="text-2xl">🎨</div>
              <div>
                <h4 className="font-semibold text-white">월드 빌더</h4>
                <p className="text-gray-300 text-sm">드래그 앤 드롭으로 3D 오브젝트를 배치하여 월드를 만들어보세요</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white/10 rounded-lg p-4">
              <div className="text-2xl">👤</div>
              <div>
                <h4 className="font-semibold text-white">아바타 커스터마이징</h4>
                <p className="text-gray-300 text-sm">100+ 아이템으로 나만의 아바타를 꾸며보세요</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white/10 rounded-lg p-4">
              <div className="text-2xl">💾</div>
              <div>
                <h4 className="font-semibold text-white">자동 저장</h4>
                <p className="text-gray-300 text-sm">모든 작업이 클라우드에 자동으로 저장됩니다</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '준비 완료! 🚀',
      content: (
        <div className="text-center">
          <div className="text-6xl mb-6">🌌</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            이제 시작할 준비가 되었습니다!
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            Flux Studio에서 무한한 창의력을 발휘해보세요.<br/>
            첫 번째 월드를 만들어보시겠어요?
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/studio')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
            >
              🎨 월드 빌더로 이동
            </Button>
            <Button
              onClick={() => router.push('/avatar')}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              👤 아바타 먼저 꾸미기
            </Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">진행률</span>
              <span className="text-sm text-gray-300">{step + 1}/3</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px] flex flex-col justify-center">
            {steps[step].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-white/20">
            <Button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              variant="ghost"
              className="text-white hover:bg-white/10 disabled:opacity-50"
            >
              이전
            </Button>
            
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/studio')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                시작하기
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <Button
              onClick={() => router.push('/studio')}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 text-sm"
            >
              건너뛰고 바로 시작
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}