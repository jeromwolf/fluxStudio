'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ObjectType } from '@/lib/world-builder/objects'
import { ObjectRegistry } from '@/lib/world-builder/object-system/registry'
import { ObjectCategory } from '@/lib/world-builder/object-system/types'
import { Search } from 'lucide-react'

interface ObjectPaletteProps {
  selectedObject: ObjectType | null
  onSelectObject: (type: ObjectType | null) => void
  className?: string
}

export function ObjectPalette({ selectedObject, onSelectObject, className }: ObjectPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ObjectCategory | 'all'>('all')
  const [objects, setObjects] = useState<any[]>([])

  useEffect(() => {
    // Get all objects from registry
    const registry = ObjectRegistry.getInstance()
    console.log('ObjectPalette: Getting objects from registry')
    const allObjects = registry.getAll()
    console.log('ObjectPalette: Found', allObjects.length, 'objects')
    setObjects(allObjects)
    
    // If no objects, try again after a delay
    if (allObjects.length === 0) {
      console.log('ObjectPalette: No objects found, retrying in 500ms')
      setTimeout(() => {
        const retryObjects = registry.getAll()
        console.log('ObjectPalette: Retry found', retryObjects.length, 'objects')
        setObjects(retryObjects)
      }, 500)
    }
  }, [])

  // Filter objects based on search and category
  const filteredObjects = objects.filter(obj => {
    const matchesSearch = searchQuery === '' || 
      obj.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || obj.metadata.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(objects.map(obj => obj.metadata.category)))

  return (
    <div className={cn("bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80 max-h-[600px] flex flex-col", className)}>
      <h3 className="text-lg font-semibold mb-3">Object Library</h3>
      
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search objects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "px-3 py-1 text-xs rounded-full transition-colors",
            selectedCategory === 'all'
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as ObjectCategory)}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors capitalize",
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Object Grid */}
      <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
        {filteredObjects.map((obj) => (
          <button
            key={obj.metadata.type}
            onClick={() => {
              const newSelection = selectedObject === obj.metadata.type ? null : obj.metadata.type
              console.log('Object selected:', obj.metadata.type, '→', newSelection)
              onSelectObject(newSelection)
            }}
            className={cn(
              "p-3 rounded-lg border-2 transition-all hover:scale-105",
              "flex flex-col items-center justify-center",
              "bg-white hover:bg-gray-50",
              selectedObject === obj.metadata.type
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <span className="text-2xl mb-1">{obj.metadata.icon}</span>
            <span className="text-xs text-center leading-tight">
              {obj.metadata.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Object Count */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {filteredObjects.length} of {objects.length} objects
      </div>
    </div>
  )
}