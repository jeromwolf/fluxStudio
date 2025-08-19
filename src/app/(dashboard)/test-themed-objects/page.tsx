'use client'

import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { ObjectRegistry } from '@/lib/world-builder/object-system/registry'
import { initializeWorldBuilder } from '@/lib/world-builder/initialize'
import * as THREE from 'three'

interface TestObject {
  id: string
  type: string
  position: [number, number, number]
  state: any
}

export default function TestThemedObjectsPage() {
  const [objects, setObjects] = useState<TestObject[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  useEffect(() => {
    // Initialize the world builder system
    initializeWorldBuilder()
    
    // Get all registered objects
    const registry = ObjectRegistry.getInstance()
    const allDefinitions = registry.getAll()
    
    // Create test objects organized by category
    const categories = ['furniture', 'amusement', 'nature', 'scifi', 'fantasy', 'basic']
    const testObjects: TestObject[] = []
    let id = 0
    
    categories.forEach((category, catIndex) => {
      const categoryObjects = allDefinitions.filter(def => 
        def.metadata.category === category || 
        (category === 'basic' && !def.metadata.category)
      )
      
      categoryObjects.forEach((definition, index) => {
        const row = Math.floor(index / 5)
        const col = index % 5
        
        testObjects.push({
          id: `test-${id++}`,
          type: definition.metadata.type,
          position: [
            (col - 2) * 4,
            0,
            (catIndex * 10) + (row * 4)
          ],
          state: definition.config.defaultProperties || {}
        })
      })
    })
    
    setObjects(testObjects)
  }, [])
  
  const filteredObjects = selectedCategory === 'all' 
    ? objects 
    : objects.filter(obj => {
        const registry = ObjectRegistry.getInstance()
        const def = registry.get(obj.type)
        return def?.metadata.category === selectedCategory ||
               (selectedCategory === 'basic' && !def?.metadata.category)
      })
  
  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      <div className="p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-2">🎨 Themed Objects Test</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded ${selectedCategory === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            All Objects
          </button>
          <button
            onClick={() => setSelectedCategory('furniture')}
            className={`px-4 py-2 rounded ${selectedCategory === 'furniture' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🪑 Furniture
          </button>
          <button
            onClick={() => setSelectedCategory('amusement')}
            className={`px-4 py-2 rounded ${selectedCategory === 'amusement' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🎡 Amusement Park
          </button>
          <button
            onClick={() => setSelectedCategory('nature')}
            className={`px-4 py-2 rounded ${selectedCategory === 'nature' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🌳 Nature
          </button>
          <button
            onClick={() => setSelectedCategory('scifi')}
            className={`px-4 py-2 rounded ${selectedCategory === 'scifi' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🚀 Sci-Fi
          </button>
          <button
            onClick={() => setSelectedCategory('fantasy')}
            className={`px-4 py-2 rounded ${selectedCategory === 'fantasy' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🏰 Fantasy
          </button>
          <button
            onClick={() => setSelectedCategory('basic')}
            className={`px-4 py-2 rounded ${selectedCategory === 'basic' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            📦 Basic
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <Canvas
          camera={{ position: [15, 15, 15], fov: 60 }}
          shadows
        >
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          <Grid args={[100, 100]} cellSize={1} />
          
          {filteredObjects.map(obj => {
            const registry = ObjectRegistry.getInstance()
            const definition = registry.get(obj.type)
            if (!definition) return null
            
            const Component = definition.component
            const objectData = {
              ...obj,
              metadata: definition.metadata
            }
            
            return (
              <group key={obj.id} position={obj.position}>
                <Component 
                  object={objectData}
                  isPreview={false}
                  isSelected={false}
                />
                {/* Label */}
                <mesh position={[0, -0.5, 0]}>
                  <planeGeometry args={[3, 0.6]} />
                  <meshBasicMaterial color="#000000" opacity={0.7} transparent />
                </mesh>
              </group>
            )
          })}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </div>
      
      <div className="p-4 bg-gray-800 text-white">
        <p className="text-sm">
          Total Objects: {objects.length} | Showing: {filteredObjects.length}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Use mouse to rotate, scroll to zoom, shift+drag to pan
        </p>
      </div>
    </div>
  )
}