'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useWorldSharing } from '@/shared/hooks/use-world-sharing'
import { useWorldStore } from '@/shared/stores/world-store'
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Download, 
  Eye, 
  Users, 
  Clock,
  Star,
  Filter
} from 'lucide-react'
import type { World } from '@/core/database/types'

interface WorldExplorerProps {
  isOpen: boolean
  onClose: () => void
}

export function WorldExplorer({ isOpen, onClose }: WorldExplorerProps) {
  const sharing = useWorldSharing()
  const worldStore = useWorldStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'public' | 'popular'>('public')
  const [worlds, setWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(false)

  // 월드 데이터 로드
  const loadWorlds = async () => {
    setLoading(true)
    try {
      let results: World[] = []
      
      if (searchQuery.trim()) {
        results = await sharing.searchWorlds(searchQuery)
      } else if (activeTab === 'popular') {
        const popularWorlds = await sharing.getPopularWorlds(20)
        results = popularWorlds.map(w => ({ ...w, visitCount: w.visitCount }))
      } else {
        results = await sharing.getPublicWorlds(20)
      }
      
      setWorlds(results)
    } catch (error) {
      console.error('Failed to load worlds:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadWorlds()
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        loadWorlds()
      }
    }, 500)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadWorlds()
  }

  const handleDuplicateWorld = async (world: World) => {
    const duplicated = await sharing.duplicateWorld(world.id, `${world.name} (복사본)`)
    if (duplicated) {
      // 월드 스토어 새로고침
      worldStore.loadFromCloud(worldStore.currentWorld?.creatorId || '')
    }
  }

  const handleVisitWorld = async (world: World) => {
    await sharing.visitWorld(world.id)
    // TODO: 실제 월드 페이지로 이동 또는 월드 뷰어 열기
    console.log('Visiting world:', world.name)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                월드 탐색기
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {/* 탭 */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('public')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                공개 월드
              </Button>
              <Button
                variant={activeTab === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('popular')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                인기 월드
              </Button>
            </div>

            {/* 검색 */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="월드 이름이나 설명으로 검색..."
                className="flex-1"
              />
              <Button type="submit" size="sm" className="px-4">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* 월드 목록 */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">월드를 불러오는 중...</p>
                </div>
              </div>
            ) : worlds.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>표시할 월드가 없습니다</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">"{searchQuery}"에 대한 검색 결과가 없습니다</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {worlds.map((world) => (
                  <Card key={world.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* 썸네일 영역 */}
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-600 relative">
                      {world.thumbnailUrl ? (
                        <img 
                          src={world.thumbnailUrl} 
                          alt={world.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Globe className="w-8 h-8" />
                        </div>
                      )}
                      {activeTab === 'popular' && 'visitCount' in world && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {(world as any).visitCount}
                        </div>
                      )}
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate" title={world.name}>
                        {world.name}
                      </h3>
                      
                      {world.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {world.description}
                        </p>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {world.maxPlayers}명
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(world.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleVisitWorld(world)}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          방문
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateWorld(world)}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          복제
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{worlds.length}개의 월드</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadWorlds}
                  disabled={loading}
                >
                  새로고침
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}