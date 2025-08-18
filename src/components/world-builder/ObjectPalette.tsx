'use client'

import React from 'react'
import { OBJECT_TEMPLATES, ObjectType } from '@/lib/world-builder/objects'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ObjectPaletteProps {
  selectedObject: ObjectType | null
  onSelectObject: (type: ObjectType) => void
  className?: string
}

export function ObjectPalette({ selectedObject, onSelectObject, className }: ObjectPaletteProps) {
  const categories = ['nature', 'structure', 'decoration'] as const
  
  return (
    <div className={cn("bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4", className)}>
      <h3 className="text-lg font-semibold mb-3">Objects</h3>
      
      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">{category}</h4>
          <div className="grid grid-cols-3 gap-2">
            {OBJECT_TEMPLATES
              .filter(template => template.category === category)
              .map(template => (
                <Button
                  key={template.type}
                  variant={selectedObject === template.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectObject(template.type)}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <span className="text-2xl mb-1">{template.icon}</span>
                  <span className="text-xs">{template.name}</span>
                </Button>
              ))}
          </div>
        </div>
      ))}
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Click an object, then click in the world to place it
        </p>
      </div>
    </div>
  )
}