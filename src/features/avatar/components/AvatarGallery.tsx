'use client'

import { useState } from 'react'
import { AvatarCustomization, AvatarPreset } from '../types'
import { allPresets } from '../data/presets'

interface AvatarGalleryProps {
  avatars: AvatarCustomization[]
  onSelectAvatar: (avatar: AvatarCustomization) => void
  onCreateNew: () => void
  onDeleteAvatar: (avatarId: string) => void
}

export function AvatarGallery({ 
  avatars, 
  onSelectAvatar, 
  onCreateNew, 
  onDeleteAvatar 
}: AvatarGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'my' | 'presets'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: '전체', count: avatars.length + allPresets.length },
    { id: 'my', name: '내 아바타', count: avatars.length },
    { id: 'presets', name: '프리셋', count: allPresets.length }
  ]

  const filteredItems = () => {
    let items: (AvatarCustomization | AvatarPreset)[] = []
    
    if (selectedCategory === 'all') {
      items = [...avatars, ...allPresets]
    } else if (selectedCategory === 'my') {
      items = avatars
    } else {
      items = allPresets
    }

    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return items
  }

  const isAvatar = (item: any): item is AvatarCustomization => {
    return 'id' in item && 'type' in item && !('category' in item)
  }

  const isPreset = (item: any): item is AvatarPreset => {
    return 'category' in item
  }

  const handleItemClick = (item: AvatarCustomization | AvatarPreset) => {
    if (isAvatar(item)) {
      onSelectAvatar(item)
    } else if (isPreset(item)) {
      // Convert preset to avatar
      const newAvatar: AvatarCustomization = {
        id: `avatar-${Date.now()}`,
        name: `${item.name} 복사본`,
        type: item.customization?.type || 'humanoid',
        body: item.customization?.body || {
          type: 'normal',
          height: 1.0,
          skinColor: '#F5C6A0'
        },
        face: item.customization?.face || {
          shape: 'oval',
          eyes: { type: 'normal', color: '#4A5568', lashes: true },
          eyebrows: { type: 'normal', color: '#2D3748' },
          nose: { type: 'normal' },
          mouth: { type: 'normal', lipColor: '#E53E3E' }
        },
        hair: item.customization?.hair || {
          style: 'medium',
          color: '#2D3748'
        },
        clothing: item.customization?.clothing || {
          top: { id: 'tshirt-1', name: '티셔츠', type: 'shirt', style: 'casual', color: '#3182CE' },
          bottom: { id: 'jeans-1', name: '청바지', type: 'pants', style: 'casual', color: '#2B6CB0' },
          shoes: { id: 'sneakers-1', name: '운동화', type: 'sneakers', style: 'casual', color: '#FFFFFF' }
        },
        accessories: item.customization?.accessories || {},
        animations: item.customization?.animations || {
          idle: { id: 'idle-1', name: '기본', speed: 1.0, loop: true },
          walk: { id: 'walk-1', name: '걷기', speed: 1.0, loop: true },
          run: { id: 'run-1', name: '달리기', speed: 1.2, loop: true },
          emotes: ['wave', 'thumbsup', 'dance']
        }
      }
      onSelectAvatar(newAvatar)
    }
  }

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">아바타 갤러리</h1>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="아바타 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(category.id as any)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="mb-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
        >
          + 새 아바타 만들기
        </button>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredItems().map((item) => (
          <div
            key={'id' in item ? item.id : `preset-${item.id}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {/* Avatar Preview */}
            <div className="relative mb-3">
              <div className="w-full h-40 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <div className="w-20 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 left-2">
                {isPreset(item) && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    item.category === 'basic' ? 'bg-green-100 text-green-800' :
                    item.category === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                    item.category === 'seasonal' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {item.category === 'basic' ? '무료' :
                     item.category === 'premium' ? '프리미엄' :
                     item.category === 'seasonal' ? '시즌' : '특별'}
                  </span>
                )}
              </div>

              {/* Price for Premium */}
              {isPreset(item) && item.price && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  {item.price} FLUX
                </div>
              )}

              {/* Delete Button for User Avatars */}
              {isAvatar(item) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteAvatar(item.id)
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Avatar Info */}
            <div>
              <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {isAvatar(item) ? item.type :
                 isPreset(item) ? item.customization?.type || 'humanoid' : 'humanoid'}
              </p>

              {/* Avatar Features */}
              <div className="flex flex-wrap gap-1">
                {isAvatar(item) && item.accessories?.special && item.accessories.special.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">✨ 특수효과</span>
                )}
                {isPreset(item) && item.customization?.accessories?.special && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">✨ 특수효과</span>
                )}
                {isPreset(item) && item.requirements && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">🏆 업적 필요</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems().length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery ? '검색 결과가 없습니다' : '아바타가 없습니다'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? '다른 검색어를 시도해보세요' 
              : '새로운 아바타를 만들어보세요'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              첫 번째 아바타 만들기
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 아바타 꾸미기 팁</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 프리셋을 선택한 후 원하는 대로 커스터마이징할 수 있습니다</li>
          <li>• 특수 효과로 더욱 독특한 아바타를 만들어보세요</li>
          <li>• 프리미엄 아이템은 FLUX 코인으로 구매할 수 있습니다</li>
          <li>• 시즌 한정 아이템은 기간 내에만 사용할 수 있습니다</li>
          <li>• 업적을 달성하면 특별한 아바타를 얻을 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}