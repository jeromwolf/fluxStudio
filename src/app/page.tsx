'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Play, Users, Globe, Sparkles, Zap, Star } from 'lucide-react'
import { useAuth } from '@/core/auth/hooks'
import { useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // 이미 로그인한 사용자는 대시보드로 리다이렉트
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleGetStarted = () => {
    router.push('/auth/signin')
  }

  const handleExplore = () => {
    // 게스트 모드로 공개 월드 탐험
    router.push('/worlds/explore?mode=guest')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Flux Studio
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-purple-300"
              onClick={handleExplore}
            >
              둘러보기
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              시작하기
            </Button>
          </div>
        </nav>
      </header>

      {/* 메인 히어로 섹션 */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                당신만의 메타버스를
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                만들어보세요
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              3D 아바타를 만들고, 나만의 월드를 구축하며,<br />
              친구들과 함께 새로운 경험을 공유하세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6"
              >
                시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleExplore}
                className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                둘러보기
              </Button>
            </div>
          </div>
        </div>

        {/* 기능 소개 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur border-white/20 p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">나만의 아바타</h3>
              <p className="text-gray-300">
                다양한 스타일과 액세서리로 나를 표현하는 3D 아바타를 만들어보세요
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">월드 빌더</h3>
              <p className="text-gray-300">
                드래그 앤 드롭으로 쉽게 3D 월드를 만들고 친구들과 공유하세요
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">실시간 소통</h3>
              <p className="text-gray-300">
                친구들과 함께 월드를 탐험하고 실시간으로 채팅하며 소통하세요
              </p>
            </Card>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">0+</div>
                <p className="text-gray-300">활성 사용자</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0+</div>
                <p className="text-gray-300">생성된 월드</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0+</div>
                <p className="text-gray-300">아바타 생성</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">∞</div>
                <p className="text-gray-300">가능성</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h3 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            무료로 가입하고 메타버스의 세계로 떠나보세요
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6"
          >
            무료로 시작하기
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Flux Studio. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                이용약관
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}