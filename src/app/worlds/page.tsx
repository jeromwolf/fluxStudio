'use client';

import { Gamepad2, Globe, Users, Plus, Play, Star, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WorldCard {
  id: string;
  name: string;
  description: string;
  type: 'game' | 'social' | 'creative';
  thumbnail: string;
  players: number;
  maxPlayers: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
}

const FEATURED_WORLDS: WorldCard[] = [
  {
    id: 'coin-collector',
    name: '코인 수집 게임',
    description: '60초 안에 최대한 많은 코인을 모으세요!',
    type: 'game',
    thumbnail: '🪙',
    players: 0,
    maxPlayers: 4,
    rating: 4.5,
    isNew: true,
  },
  {
    id: 'world-builder',
    name: '월드 빌더',
    description: '나만의 3D 월드를 만들고 친구들과 공유하세요',
    type: 'creative',
    thumbnail: '🏗️',
    players: 0,
    maxPlayers: 10,
    rating: 4.8,
  },
  {
    id: 'social-hub',
    name: '소셜 허브',
    description: '친구들과 만나서 대화하고 즐거운 시간을 보내세요',
    type: 'social',
    thumbnail: '🎭',
    players: 0,
    maxPlayers: 50,
    rating: 4.2,
    isTrending: true,
  },
];

const TYPE_COLORS = {
  game: 'from-purple-500 to-pink-500',
  social: 'from-blue-500 to-cyan-500',
  creative: 'from-green-500 to-emerald-500',
};

const TYPE_LABELS = {
  game: '게임',
  social: '소셜',
  creative: '크리에이티브',
};

export default function WorldsPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'all' | 'game' | 'social' | 'creative'>('all');

  const handleEnterWorld = (worldId: string) => {
    if (worldId === 'world-builder') {
      router.push('/worlds/builder');
    } else if (worldId === 'coin-collector') {
      router.push('/worlds/builder?game=coin-collector');
    } else {
      // 다른 월드는 추후 구현
      alert('이 월드는 준비 중입니다!');
    }
  };

  const filteredWorlds =
    selectedType === 'all'
      ? FEATURED_WORLDS
      : FEATURED_WORLDS.filter((world) => world.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 헤더 */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-white hover:text-purple-400"
              >
                ← 메인으로
              </Button>
              <h1 className="text-2xl font-bold text-white">월드 탐험</h1>
            </div>
            <Button
              onClick={() => router.push('/worlds/builder')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              월드 만들기
            </Button>
          </div>
        </div>
      </header>

      {/* 필터 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            className={
              selectedType === 'all' ? 'bg-white text-black' : 'border-white/30 text-white'
            }
          >
            전체
          </Button>
          <Button
            variant={selectedType === 'game' ? 'default' : 'outline'}
            onClick={() => setSelectedType('game')}
            className={selectedType === 'game' ? 'bg-purple-600' : 'border-white/30 text-white'}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            게임
          </Button>
          <Button
            variant={selectedType === 'social' ? 'default' : 'outline'}
            onClick={() => setSelectedType('social')}
            className={selectedType === 'social' ? 'bg-blue-600' : 'border-white/30 text-white'}
          >
            <Users className="mr-2 h-4 w-4" />
            소셜
          </Button>
          <Button
            variant={selectedType === 'creative' ? 'default' : 'outline'}
            onClick={() => setSelectedType('creative')}
            className={selectedType === 'creative' ? 'bg-green-600' : 'border-white/30 text-white'}
          >
            <Globe className="mr-2 h-4 w-4" />
            크리에이티브
          </Button>
        </div>

        {/* 월드 그리드 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorlds.map((world) => (
            <Card
              key={world.id}
              className="transform overflow-hidden border-white/20 bg-white/10 backdrop-blur transition-all hover:scale-[1.02] hover:bg-white/20"
            >
              {/* 썸네일 */}
              <div
                className={`h-48 bg-gradient-to-br ${TYPE_COLORS[world.type]} relative flex items-center justify-center`}
              >
                <span className="text-6xl">{world.thumbnail}</span>

                {/* 배지 */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {world.isNew && (
                    <span className="rounded-full bg-purple-600 px-2 py-1 text-xs text-white">
                      NEW
                    </span>
                  )}
                  {world.isTrending && (
                    <span className="flex items-center rounded-full bg-orange-600 px-2 py-1 text-xs text-white">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      인기
                    </span>
                  )}
                </div>

                {/* 타입 라벨 */}
                <div className="absolute bottom-2 left-2">
                  <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                    {TYPE_LABELS[world.type]}
                  </span>
                </div>
              </div>

              {/* 정보 */}
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-white">{world.name}</h3>
                <p className="mb-4 text-gray-300">{world.description}</p>

                {/* 통계 */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center text-gray-400">
                    <Users className="mr-1 h-4 w-4" />
                    <span className="text-sm">
                      {world.players}/{world.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <Star className="mr-1 h-4 w-4 fill-current" />
                    <span className="text-sm">{world.rating}</span>
                  </div>
                </div>

                {/* 입장 버튼 */}
                <Button
                  onClick={() => handleEnterWorld(world.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  입장하기
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* 추가 월드 예고 */}
        <div className="mt-12 text-center">
          <Card className="inline-block border-white/10 bg-white/5 p-8 backdrop-blur">
            <Clock className="mx-auto mb-4 h-12 w-12 text-purple-400" />
            <h3 className="mb-2 text-xl font-bold text-white">더 많은 월드가 곧 추가됩니다!</h3>
            <p className="mb-4 text-gray-400">
              레이싱, 배틀로얄, 미로 탈출 등 다양한 게임들이 준비 중입니다.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/worlds/builder')}
              className="border-purple-400/50 text-white hover:bg-purple-400/10"
            >
              지금 나만의 월드 만들기
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
