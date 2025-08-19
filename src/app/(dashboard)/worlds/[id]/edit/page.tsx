'use client'

import { use } from 'react'
import { WorldBuilder } from '@/components/world-builder/WorldBuilder'
import { useWorldStore } from '@/shared/stores/world-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, Play } from 'lucide-react'

export default function EditWorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [worldName, setWorldName] = useState('')
  
  const savedWorlds = useWorldStore((state) => state.savedWorlds)
  const selectWorld = useWorldStore((state) => state.selectWorld)
  
  useEffect(() => {
    const world = savedWorlds.find(w => w.id === id)
    if (world) {
      setWorldName(world.name)
      selectWorld(id)
    } else {
      // World not found, redirect to worlds list
      router.push('/worlds')
    }
  }, [id, savedWorlds, selectWorld, router])

  const handleSave = () => {
    // WorldBuilder handles saving internally
    alert('월드가 저장되었습니다!')
  }

  const handlePlay = () => {
    router.push(`/worlds/${id}/play`)
  }

  const handleBack = () => {
    router.push('/worlds')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm z-10">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              월드 목록
            </Button>
            <h1 className="text-lg font-semibold">{worldName} - 편집 중</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              저장
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePlay}
            >
              <Play className="h-4 w-4 mr-1" />
              플레이
            </Button>
          </div>
        </div>
      </div>

      {/* World Builder */}
      <div className="flex-1 overflow-hidden">
        <WorldBuilder />
      </div>
    </div>
  )
}