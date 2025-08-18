import React from 'react'
import * as THREE from 'three'

export interface BaseObjectProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color?: string
  opacity?: number
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export interface ObjectComponent {
  type: string
  name: string
  icon: string
  category: 'basic' | 'furniture' | 'nature' | 'building' | 'decoration' | 'interactive'
  Component: React.FC<BaseObjectProps>
  defaultProps?: Partial<BaseObjectProps>
  preview?: {
    scale?: number
    rotation?: [number, number, number]
  }
}

// Base wrapper for all objects with common functionality
export function ObjectWrapper({ 
  children, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  onPointerOver,
  onPointerOut
}: BaseObjectProps & { children: React.ReactNode }) {
  return (
    <group 
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {children}
    </group>
  )
}