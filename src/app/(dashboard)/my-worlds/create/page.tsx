'use client';

import { ChevronLeft, ChevronRight, Globe, Lock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useWorldStore } from '@/shared/stores/world-store';

export default function CreateWorldPage() {
  const router = useRouter();
  const createWorld = useWorldStore((state) => state.createWorld);

  const [worldData, setWorldData] = useState({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'private' | 'friends',
    maxPlayers: 50,
  });

  const handleCreate = () => {
    console.log('Create world clicked', worldData);

    if (!worldData.name.trim()) {
      alert('월드 이름을 입력해주세요');
      return;
    }

    const newWorld = createWorld({
      name: worldData.name,
      description: worldData.description,
      visibility: worldData.visibility,
      maxPlayers: worldData.maxPlayers,
    });

    console.log('New world created:', newWorld);

    if (newWorld) {
      // Navigate to world builder
      const editPath = `/my-worlds/${newWorld.id}/edit`;
      console.log('Navigating to:', editPath);
      router.push(editPath);
    } else {
      console.error('Failed to create world');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="mb-8 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/my-worlds')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                뒤로
              </Button>
              <h1 className="text-2xl font-bold">새 월드 만들기</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>월드 정보 입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* World Name */}
            <div>
              <Label htmlFor="world-name">월드 이름 *</Label>
              <Input
                id="world-name"
                type="text"
                placeholder="예: 나의 첫 번째 집"
                value={worldData.name}
                onChange={(e) => setWorldData({ ...worldData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="world-description">설명</Label>
              <Textarea
                id="world-description"
                placeholder="이 월드에 대해 설명해주세요..."
                value={worldData.description}
                onChange={(e) => setWorldData({ ...worldData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Visibility */}
            <div>
              <Label>공개 설정</Label>
              <RadioGroup
                value={worldData.visibility}
                onValueChange={(value: any) => setWorldData({ ...worldData, visibility: value })}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex flex-1 cursor-pointer items-center">
                    <Globe className="mr-2 h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">공개</p>
                      <p className="text-sm text-gray-600">누구나 방문할 수 있습니다</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="friends" id="friends" />
                  <Label htmlFor="friends" className="flex flex-1 cursor-pointer items-center">
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">친구 공개</p>
                      <p className="text-sm text-gray-600">친구만 방문할 수 있습니다</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex flex-1 cursor-pointer items-center">
                    <Lock className="mr-2 h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium">비공개</p>
                      <p className="text-sm text-gray-600">나만 입장할 수 있습니다</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Max Players */}
            <div>
              <Label htmlFor="max-players">최대 인원</Label>
              <Input
                id="max-players"
                type="number"
                min="1"
                max="100"
                value={worldData.maxPlayers}
                onChange={(e) =>
                  setWorldData({ ...worldData, maxPlayers: parseInt(e.target.value) || 50 })
                }
                className="mt-1"
              />
              <p className="mt-1 text-sm text-gray-600">
                동시에 접속할 수 있는 최대 인원 (1-100명)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={() => router.push('/my-worlds')}>
                취소
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!worldData.name.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                월드 만들기
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
