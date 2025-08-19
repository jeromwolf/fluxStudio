'use client'

import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei'
import { ObjectRegistry } from '@/lib/world-builder/object-system/registry'
import { WorldObject } from '@/lib/world-builder/object-system/types'
import * as THREE from 'three'

// Test scene for chairs
function ChairTestScene() {
  const [selectedObject, setSelectedObject] = useState<WorldObject | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  // Auto-rotate the scene
  useFrame((state, delta) => {
    if (groupRef.current && !selectedObject) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })
  
  // Get all chair objects from registry
  const registry = ObjectRegistry.getInstance()
  const chairObjects = registry.getByCategory('furniture').filter(def => 
    def.metadata.type.includes('chair')
  )
  
  // Create world objects for display
  const chairs: WorldObject[] = chairObjects.map((def, index) => ({
    id: `chair-${index}`,
    type: def.metadata.type,
    properties: {
      position: { 
        x: (index - 2) * 2, 
        y: 0, 
        z: 0 
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    state: {},
    metadata: {
      created: new Date(),
      modified: new Date()
    },
    config: def.config
  }))
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <Environment preset="city" />
      
      {/* Ground */}
      <Grid 
        args={[20, 20]} 
        cellSize={0.5} 
        cellThickness={0.5} 
        cellColor="#6f6f6f" 
        sectionSize={2} 
        sectionThickness={1}
        sectionColor="#9d4d4d"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Chair display */}
      <group ref={groupRef}>
        {chairs.map((chair, index) => {
          const definition = registry.get(chair.type)
          if (!definition) return null
          
          const Component = definition.component
          
          return (
            <group 
              key={chair.id}
              onClick={() => setSelectedObject(chair)}
            >
              <Component 
                object={chair} 
                isPreview={false} 
                isSelected={selectedObject?.id === chair.id}
              />
              
              {/* Label */}
              <Html
                position={[chair.properties.position.x, 2, chair.properties.position.z]}
                center
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {definition.metadata.name}
              </Html>
            </group>
          )
        })}
      </group>
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        target={[0, 0.5, 0]}
      />
    </>
  )
}

// Property panel for testing
function PropertyPanel({ object }: { object: WorldObject | null }) {
  if (!object) {
    return (
      <div className="p-4 text-gray-500">
        Click on a chair to see its properties
      </div>
    )
  }
  
  const registry = ObjectRegistry.getInstance()
  const definition = registry.get(object.type)
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-lg">{definition?.metadata.name}</h3>
      <p className="text-sm text-gray-600">{definition?.metadata.description}</p>
      
      <div className="space-y-2">
        <h4 className="font-semibold">Tags:</h4>
        <div className="flex flex-wrap gap-2">
          {definition?.metadata.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold">Features:</h4>
        <ul className="text-sm space-y-1">
          {Object.entries(definition?.config.interactions || {}).map(([key, value]) => (
            <li key={key} className="flex items-center gap-2">
              <span className={value ? "text-green-600" : "text-gray-400"}>
                {value ? "✓" : "✗"}
              </span>
              <span className="capitalize">{key}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function TestChairsPage() {
  const [selectedObject, setSelectedObject] = useState<WorldObject | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Chair Collection Test</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Grid</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto Rotate</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* 3D View */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [8, 6, 8], fov: 45 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Suspense fallback={null}>
              <ChairTestScene />
            </Suspense>
          </Canvas>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded text-sm">
            <p>🖱️ Left click + drag to rotate</p>
            <p>🖱️ Right click + drag to pan</p>
            <p>🖱️ Scroll to zoom</p>
            <p>👆 Click on chairs to select</p>
          </div>
        </div>
        
        {/* Property Panel */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <PropertyPanel object={selectedObject} />
          
          {/* Performance Stats */}
          <div className="p-4 border-t">
            <h4 className="font-semibold mb-2">Performance</h4>
            <div className="text-sm space-y-1">
              <p>Total Objects: 5 chairs</p>
              <p>Draw Calls: ~15</p>
              <p>Triangles: ~5,000</p>
              <p>Target FPS: 60</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => window.location.href = '/world-builder'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open World Builder
            </button>
            <button
              onClick={() => console.log('Chair models:', ObjectRegistry.getInstance().getByCategory('furniture'))}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Log Chair Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}