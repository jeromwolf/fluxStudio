'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DebugPanelProps {
  selectedObject: any | null
  placedObjects: any[]
  className?: string
}

export function DebugPanel({ selectedObject, placedObjects, className }: DebugPanelProps) {
  return (
    <div className={cn("bg-black/90 text-green-400 font-mono text-xs p-3 rounded max-w-sm", className)}>
      <h4 className="text-yellow-400 mb-2">🐛 Debug Info</h4>
      
      <div className="mb-2">
        <strong>Total Objects:</strong> {placedObjects.length}
      </div>
      
      {selectedObject && (
        <div className="space-y-1">
          <div><strong>Selected:</strong></div>
          <div>ID: {selectedObject.id}</div>
          <div>Type: {selectedObject.type}</div>
          <div>Mesh Type: {selectedObject.mesh?.type || 'Unknown'}</div>
          <div>Is Group: {selectedObject.mesh?.type === 'Group' ? 'YES' : 'NO'}</div>
          <div>Is Mesh: {selectedObject.mesh?.type === 'Mesh' ? 'YES' : 'NO'}</div>
          {selectedObject.mesh?.type === 'Group' && (
            <div>Children: {selectedObject.mesh.children.length}</div>
          )}
          <div className="text-xs">
            Pos: ({selectedObject.position.x.toFixed(1)}, {selectedObject.position.y.toFixed(1)}, {selectedObject.position.z.toFixed(1)})
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-green-800">
        <div className="text-yellow-400">Object List:</div>
        {placedObjects.slice(-5).map((obj, i) => (
          <div key={obj.id} className="text-xs">
            {i+1}. {obj.type} ({obj.mesh?.type})
          </div>
        ))}
        {placedObjects.length > 5 && (
          <div className="text-gray-500">... and {placedObjects.length - 5} more</div>
        )}
      </div>
    </div>
  )
}