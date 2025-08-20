'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { WorldBuilder } from '@/components/world-builder/WorldBuilder';

export default function WorldBuilderPage() {
  const searchParams = useSearchParams();
  const gameParam = searchParams.get('game');

  useEffect(() => {
    // URL 파라미터 확인용 로그
    if (gameParam === 'coin-collector') {
      console.log('게임 파라미터 감지:', gameParam);
      console.log('자동 게임 시작은 일시적으로 비활성화되어 있습니다.');
      console.log('"게임 플레이" 버튼을 수동으로 클릭하세요.');
    }
  }, [gameParam]);

  return <WorldBuilder />;
}
