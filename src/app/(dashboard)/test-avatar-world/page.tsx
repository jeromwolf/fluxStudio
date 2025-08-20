'use client';

import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useSelectedAvatar } from '@/shared/stores/avatar-store';

export default function TestAvatarWorldPage() {
  const router = useRouter();
  const selectedAvatar = useSelectedAvatar();

  const handleStartWorld = () => {
    if (selectedAvatar) {
      router.push('/worlds/builder');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-gray-900">아바타와 월드 통합 테스트</h1>

        <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold">현재 선택된 아바타</h2>

          {selectedAvatar ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-200">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedAvatar.name}</p>
                  <p className="text-sm text-gray-600">타입: {selectedAvatar.type}</p>
                </div>
              </div>

              <Button onClick={handleStartWorld} className="w-full" size="lg">
                월드 빌더에서 아바타 사용하기
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-600">선택된 아바타가 없습니다.</p>
              <Link href="/avatar">
                <Button>아바타 선택하러 가기</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold">사용 방법</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold">아바타 선택</h3>
                <p className="text-gray-600">먼저 아바타 페이지에서 원하는 아바타를 선택하세요.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold">월드 빌더 실행</h3>
                <p className="text-gray-600">
                  월드 빌더를 열고 상단의 &apos;아바타&apos; 모드를 선택하세요.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold">월드 탐험</h3>
                <p className="text-gray-600">
                  <kbd className="rounded bg-gray-100 px-2 py-1 text-sm">W/A/S/D</kbd> 또는 방향키로
                  이동하고,
                  <kbd className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">Shift</kbd>를 눌러
                  달리세요!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>팁:</strong> 아바타 모드에서는 카메라가 자동으로 아바타를 따라갑니다. 다른
              모드로 전환하면 일반 카메라 조작이 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
