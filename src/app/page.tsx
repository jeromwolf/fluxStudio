'use client';

import {
  ArrowRight,
  Play,
  Users,
  Globe,
  Sparkles,
  Zap,
  Star,
  Gamepad2,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/core/auth/hooks';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // 로그인 상태에 따른 버튼 텍스트 변경
  const getStartedText = isAuthenticated ? '대시보드' : '시작하기';
  const getStartedAction = isAuthenticated ? '/dashboard' : '/auth/signin';

  const handleGetStarted = () => {
    router.push(getStartedAction);
  };

  const handleExplore = () => {
    // 공개 월드 탐험 페이지로 이동
    router.push('/worlds');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-30 blur-3xl filter" />
        <div className="absolute right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-blue-500 opacity-30 blur-3xl filter" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl filter" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
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
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white/70">{user?.name || user?.email}</span>
                <Button
                  variant="ghost"
                  className="text-white hover:text-purple-300"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  대시보드
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                시작하기
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* 메인 히어로 섹션 */}
      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-6 text-5xl font-bold sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                당신만의 메타버스를
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                만들어보세요
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300 sm:text-2xl">
              나만의 3D 아바타로 메타버스를 탐험하고
              <br />
              친구들과 함께 게임을 즐기세요
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-lg hover:from-purple-700 hover:to-blue-700"
              >
                {getStartedText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleExplore}
                className="border-white/30 px-8 py-6 text-lg text-white hover:bg-white/10"
              >
                <Play className="mr-2 h-5 w-5" />
                둘러보기
              </Button>
            </div>
          </div>
        </div>

        {/* 기능 소개 섹션 */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-white/20 bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">나만의 아바타</h3>
              <p className="text-gray-300">
                개성있는 3D 아바타를 만들어
                <br />
                모든 월드에서 나를 표현하세요
              </p>
            </Card>

            <Card className="border-white/20 bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">월드 빌더</h3>
              <p className="text-gray-300">
                상상하는 모든 것을 3D로 만들고
                <br />
                친구들을 초대하세요
              </p>
            </Card>

            <Card className="border-white/20 bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/20">
                <Gamepad2 className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">게임 & 소통</h3>
              <p className="text-gray-300">
                다양한 미니게임을 즐기고
                <br />
                새로운 친구들을 만나세요
              </p>
            </Card>
          </div>

          {/* 게임 월드 섹션 추가 */}
          <div className="mt-12">
            <Card className="transform border-purple-400/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 backdrop-blur transition-all hover:scale-[1.02] hover:from-purple-600/30 hover:to-pink-600/30">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="mb-6 flex-1 md:mb-0">
                  <div className="mb-4 flex items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <span className="ml-3 rounded-full bg-purple-400/20 px-3 py-1 text-sm font-medium text-purple-400">
                      NEW!
                    </span>
                  </div>
                  <h3 className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                    게임 월드
                  </h3>
                  <p className="mb-4 text-lg text-gray-300">
                    메타버스에서 다양한 미니게임을 즐기세요!
                    <br />
                    코인 수집, 레이싱, 배틀로얄 등 재미있는 게임들이 준비되어 있습니다.
                  </p>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      코인 수집 게임 - 제한 시간 내에 코인을 모으세요
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      숨바꼭질 - 친구들과 함께 즐기는 클래식 게임
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>더 많은 게임 곧 출시 예정!
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={() => router.push('/worlds')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg hover:from-purple-700 hover:to-pink-700"
                  >
                    게임 월드 입장
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/worlds/builder')}
                    className="border-purple-400/50 px-8 py-6 text-lg text-white hover:bg-purple-400/10"
                  >
                    월드 만들기
                    <Globe className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 사용 방법 섹션 */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h3 className="mb-12 text-center text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              어떻게 시작하나요?
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">아바타 만들기</h4>
              <p className="text-gray-300">
                나만의 개성있는 3D 아바타를
                <br />
                커스터마이징해보세요
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">월드 탐험</h4>
              <p className="text-gray-300">
                다양한 월드를 탐험하거나
                <br />
                직접 만들어보세요
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">함께 즐기기</h4>
              <p className="text-gray-300">
                친구들과 게임을 하고
                <br />
                새로운 경험을 공유하세요
              </p>
            </div>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 backdrop-blur">
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="mb-2 text-4xl font-bold">🎮</div>
                <p className="text-gray-300">코인 수집 게임</p>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">🌍</div>
                <p className="text-gray-300">월드 빌더</p>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">🎆</div>
                <p className="text-gray-300">아바타 커스터마이징</p>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">🚀</div>
                <p className="text-gray-300">무한한 가능성</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h3 className="mb-4 text-3xl font-bold">지금 바로 시작하세요</h3>
          <p className="mb-8 text-xl text-gray-300">무료로 가입하고 메타버스의 세계로 떠나보세요</p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-lg hover:from-purple-700 hover:to-blue-700"
          >
            {isAuthenticated ? '대시보드로 이동' : '무료로 시작하기'}
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">© 2024 Flux Studio. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                이용약관
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
