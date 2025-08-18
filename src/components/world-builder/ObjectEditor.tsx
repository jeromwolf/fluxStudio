'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import * as THREE from 'three'
import { Trash2, Move, Palette, Settings } from 'lucide-react'

interface ObjectEditorProps {
  selectedObject: {
    id: string
    type: string
    mesh: THREE.Mesh | THREE.Group
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
  } | null
  onUpdateObject: (updates: Partial<{
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
    color: string
  }>) => void
  onDeleteObject: () => void
  className?: string
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b', '#71717a', '#171717',
]

export function ObjectEditor({ 
  selectedObject, 
  onUpdateObject, 
  onDeleteObject,
  className 
}: ObjectEditorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 })
  const [selectedColor, setSelectedColor] = useState('#808080')

  useEffect(() => {
    if (selectedObject) {
      setPosition({
        x: selectedObject.position.x,
        y: selectedObject.position.y,
        z: selectedObject.position.z
      })
      setRotation({
        x: THREE.MathUtils.radToDeg(selectedObject.rotation.x),
        y: THREE.MathUtils.radToDeg(selectedObject.rotation.y),
        z: THREE.MathUtils.radToDeg(selectedObject.rotation.z)
      })
      setScale({
        x: selectedObject.scale.x,
        y: selectedObject.scale.y,
        z: selectedObject.scale.z
      })
      
      // Get current color
      if (selectedObject.mesh instanceof THREE.Mesh && selectedObject.mesh.material) {
        const material = Array.isArray(selectedObject.mesh.material) 
          ? selectedObject.mesh.material[0] 
          : selectedObject.mesh.material
        if ('color' in material) {
          setSelectedColor('#' + material.color.getHexString())
        }
      } else if (selectedObject.mesh instanceof THREE.Group) {
        // For groups, try to get color from first mesh child
        const firstMesh = selectedObject.mesh.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh
        if (firstMesh && firstMesh.material && 'color' in firstMesh.material) {
          setSelectedColor('#' + firstMesh.material.color.getHexString())
        }
      }
    }
  }, [selectedObject])

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...position, [axis]: value }
    setPosition(newPosition)
    onUpdateObject({ 
      position: new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z) 
    })
  }

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = { ...rotation, [axis]: value }
    setRotation(newRotation)
    onUpdateObject({ 
      rotation: new THREE.Euler(
        THREE.MathUtils.degToRad(newRotation.x),
        THREE.MathUtils.degToRad(newRotation.y),
        THREE.MathUtils.degToRad(newRotation.z)
      ) 
    })
  }

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newScale = { ...scale, [axis]: value }
    setScale(newScale)
    onUpdateObject({ 
      scale: new THREE.Vector3(newScale.x, newScale.y, newScale.z) 
    })
  }

  const handleUniformScale = (value: number) => {
    const newScale = { x: value, y: value, z: value }
    setScale(newScale)
    onUpdateObject({ 
      scale: new THREE.Vector3(value, value, value) 
    })
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    onUpdateObject({ color })
  }

  if (!selectedObject) {
    return (
      <div className={cn("bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4", className)}>
        <p className="text-gray-500 text-center">Select an object to edit</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Object Editor
        </h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteObject}
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Type: <span className="font-medium">{selectedObject.type}</span>
      </div>

      {/* Position Controls */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          Position
          <span className="text-xs text-gray-500 ml-auto">
            (You can also drag in Move mode)
          </span>
        </Label>
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex items-center gap-2">
            <span className="w-4 text-xs font-medium uppercase">{axis}</span>
            <input
              type="range"
              min="-50"
              max="50"
              step="0.1"
              value={position[axis]}
              onChange={(e) => handlePositionChange(axis, parseFloat(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={position[axis].toFixed(1)}
              onChange={(e) => handlePositionChange(axis, parseFloat(e.target.value))}
              className="w-16 px-2 py-1 text-xs border rounded"
            />
          </div>
        ))}
      </div>

      {/* Rotation Controls */}
      <div className="space-y-2">
        <Label>Rotation (degrees)</Label>
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex items-center gap-2">
            <span className="w-4 text-xs font-medium uppercase">{axis}</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation[axis]}
              onChange={(e) => handleRotationChange(axis, parseFloat(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={rotation[axis].toFixed(0)}
              onChange={(e) => handleRotationChange(axis, parseFloat(e.target.value))}
              className="w-16 px-2 py-1 text-xs border rounded"
            />
          </div>
        ))}
      </div>

      {/* Scale Controls */}
      <div className="space-y-2">
        <Label>Scale</Label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs">Uniform</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={scale.x}
            onChange={(e) => handleUniformScale(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={scale.x.toFixed(1)}
            onChange={(e) => handleUniformScale(parseFloat(e.target.value))}
            className="w-16 px-2 py-1 text-xs border rounded"
          />
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600">Individual axes</summary>
          <div className="mt-2 space-y-2">
            {(['x', 'y', 'z'] as const).map(axis => (
              <div key={axis} className="flex items-center gap-2">
                <span className="w-4 font-medium uppercase">{axis}</span>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={scale[axis]}
                  onChange={(e) => handleScaleChange(axis, parseFloat(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={scale[axis].toFixed(1)}
                  onChange={(e) => handleScaleChange(axis, parseFloat(e.target.value))}
                  className="w-16 px-2 py-1 text-xs border rounded"
                />
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              className={cn(
                "w-full h-8 rounded border-2 transition-all",
                selectedColor === color ? "border-gray-900 scale-110" : "border-gray-300"
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            handlePositionChange('y', 0)
            onUpdateObject({ position: new THREE.Vector3(position.x, 0, position.z) })
          }}
        >
          Snap to Ground
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            handleRotationChange('x', 0)
            handleRotationChange('y', 0)
            handleRotationChange('z', 0)
          }}
        >
          Reset Rotation
        </Button>
      </div>
    </div>
  )
}