'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { WorldObject } from '@/lib/world-builder/object-system/types'

interface DebugPanelProps {
  objectCount: number
  physicsObjectCount: number
  physicsEnabled: boolean
  selectedObject: WorldObject | null
  className?: string
}

export function DebugPanel({ 
  objectCount, 
  physicsObjectCount, 
  physicsEnabled, 
  selectedObject, 
  className 
}: DebugPanelProps) {
  return (
    <div className={cn("bg-black/90 text-green-400 font-mono text-xs p-3 rounded max-w-sm", className)}>
      <h4 className="text-yellow-400 mb-2">🐛 Physics Debug</h4>
      
      {/* System Status */}
      <div className="mb-3 space-y-1">
        <div><strong>Physics:</strong> {physicsEnabled ? '🟢 ON' : '🔴 OFF'}</div>
        <div><strong>Total Objects:</strong> {objectCount}</div>
        <div><strong>Physics Objects:</strong> {physicsObjectCount}</div>
        <div><strong>Physics Ratio:</strong> {objectCount > 0 ? `${Math.round(physicsObjectCount / objectCount * 100)}%` : '0%'}</div>
      </div>
      
      {/* Selected Object Info */}
      {selectedObject && (
        <div className="mb-3 space-y-1 border-t border-green-800 pt-2">
          <div><strong className="text-cyan-400">Selected Object:</strong></div>
          <div>ID: {selectedObject.id}</div>
          <div>Name: {selectedObject.metadata.name}</div>
          <div>Type: {selectedObject.metadata.type}</div>
          <div>Category: {selectedObject.metadata.category}</div>
          <div>Mesh: {selectedObject.mesh?.type || 'None'}</div>
          {selectedObject.mesh?.type === 'Group' && (
            <div>Children: {selectedObject.mesh.children.length}</div>
          )}
          
          {/* Position */}
          <div className="text-cyan-300">
            Pos: ({selectedObject.properties.position.x.toFixed(1)}, {selectedObject.properties.position.y.toFixed(1)}, {selectedObject.properties.position.z.toFixed(1)})
          </div>
          
          {/* Physics Info */}
          {selectedObject.physicsBody ? (
            <div className="text-yellow-300">
              <div>🔬 Physics: ACTIVE</div>
              <div>Type: {selectedObject.config.interactions?.physics?.type?.toUpperCase() || 'UNKNOWN'}</div>
              <div>Mass: {selectedObject.config.interactions?.physics?.mass || 'Auto'}</div>
              <div>Friction: {selectedObject.config.interactions?.physics?.friction || 'Default'}</div>
              <div>Restitution: {selectedObject.config.interactions?.physics?.restitution || 'Default'}</div>
              <div>Shape: {selectedObject.config.interactions?.physics?.shape?.type?.toUpperCase() || 'Auto'}</div>
              {selectedObject.config.interactions?.physics?.isSensor && (
                <div className="text-purple-300">🎯 SENSOR MODE</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">⚪ Physics: INACTIVE</div>
          )}
        </div>
      )}
      
      {/* System Performance */}
      <div className="pt-2 border-t border-green-800">
        <div className="text-yellow-400 mb-1">Performance:</div>
        <div>Render Objects: {objectCount}</div>
        <div>Physics Bodies: {physicsObjectCount}</div>
        {physicsEnabled && (
          <div className="text-orange-300">
            ⚡ Physics simulation running
          </div>
        )}
      </div>
      
      {/* Tips */}
      {!physicsEnabled && objectCount > 0 && (
        <div className="mt-2 pt-2 border-t border-yellow-800">
          <div className="text-yellow-300">💡 Tip:</div>
          <div className="text-yellow-200">Enable physics to see objects interact!</div>
        </div>
      )}
    </div>
  )
}