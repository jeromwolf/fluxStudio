'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorldStore } from '@/shared/stores/world-store'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Edit3, Users, MessageSquare, Volume2, VolumeX, Settings } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera, Sky } from '@react-three/drei'
import * as THREE from 'three'

export default function PlayWorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [world, setWorld] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const savedWorlds = useWorldStore((state) => state.savedWorlds)
  const currentAvatar = useAvatarStore((state) => state.currentAvatar)
  
  useEffect(() => {
    const foundWorld = savedWorlds.find(w => w.id === id)
    if (foundWorld) {
      setWorld(foundWorld)
    } else {
      router.push('/worlds')
    }
  }, [id, savedWorlds, router])

  const handleEditWorld = () => {
    router.push(`/worlds/${id}/edit`)
  }

  const handleLeaveWorld = () => {
    router.push('/worlds')
  }

  if (!world) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">월드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLeaveWorld}
            className="text-white hover:text-gray-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            나가기
          </Button>
          <h1 className="text-lg font-semibold">{world.name}</h1>
          <div className="flex items-center text-sm text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>1/{world.maxPlayers}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="text-white hover:text-gray-300"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:text-gray-300"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          {world.creatorId === 'current-user' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditWorld}
              className="text-white hover:text-gray-300"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-gray-300"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* 3D World View */}
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[10, 10, 10]} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          <Grid args={[100, 100]} />
          
          {/* Render world objects */}
          {world.objects && world.objects.map((obj: any, index: number) => (
            <mesh key={index} position={[obj.position.x, obj.position.y, obj.position.z]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={obj.color || '#888888'} />
            </mesh>
          ))}
          
          {/* Player Avatar */}
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.5, 1.5]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
        </Canvas>

        {/* Chat Panel */}
        {showChat && (
          <Card className="absolute bottom-4 left-4 w-80 h-96 bg-white/90 backdrop-blur">
            <div className="p-4 h-full flex flex-col">
              <h3 className="font-semibold mb-2">채팅</h3>
              <div className="flex-1 overflow-y-auto mb-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-500 text-center">
                  채팅 메시지가 없습니다
                </p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="메시지 입력..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button size="sm">전송</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Controls Help */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm">
          <p className="font-semibold mb-1">조작법</p>
          <p>이동: WASD</p>
          <p>시점: 마우스</p>
          <p>점프: Space</p>
        </div>
      </div>
    </div>
  )
}