'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree, ThreeEvent, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ObjectPalette } from './ObjectPalette'
import { ObjectType, createWorldObject } from '@/lib/world-builder/objects/index'
import { ObjectEditor } from './ObjectEditor'
import { DebugPanel } from './DebugPanel'
import { PhysicsSystem } from '@/lib/physics/physics-system'
import { PhysicsObjectManager } from '@/lib/world-builder/physics-object-manager'
import type { WorldObject, PhysicsInteractions } from '@/lib/world-builder/object-system/types'
import { Save, FolderOpen, MousePointer2, Hand, PlusCircle, Edit3, Zap, ZapOff, Play, Pause } from 'lucide-react'

type EditorMode = 'select' | 'build' | 'move'

interface PhysicsWorldBuilderProps {
  className?: string
}

function PhysicsScene({ 
  selectedObject, 
  onPlaceObject,
  worldObjects,
  onSelectWorldObject,
  selectedWorldObject,
  editorMode,
  onUpdateObject,
  physicsEnabled,
  onTogglePhysics
}: { 
  selectedObject: ObjectType | null
  onPlaceObject: (object: WorldObject) => void
  worldObjects: WorldObject[]
  onSelectWorldObject: (object: WorldObject | null) => void
  selectedWorldObject: WorldObject | null
  editorMode: EditorMode
  onUpdateObject: (id: string, updates: Partial<WorldObject>) => void
  physicsEnabled: boolean
  onTogglePhysics: () => void
}) {
  const { scene, camera } = useThree()
  const [previewObject, setPreviewObject] = useState<THREE.Mesh | THREE.Group | null>(null)
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3())
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  
  // Physics system references
  const physicsSystemRef = useRef<PhysicsSystem | null>(null)
  const physicsObjectManagerRef = useRef<PhysicsObjectManager | null>(null)
  const [physicsInitialized, setPhysicsInitialized] = useState(false)

  // Initialize physics system
  useEffect(() => {
    const initPhysics = async () => {
      try {
        const physicsSystem = new PhysicsSystem({
          gravity: new THREE.Vector3(0, -9.81, 0),
          enableCCD: true
        })
        
        await physicsSystem.initialize()
        physicsSystemRef.current = physicsSystem
        
        const objectManager = new PhysicsObjectManager(physicsSystem)
        physicsObjectManagerRef.current = objectManager
        
        setPhysicsInitialized(true)
        console.log('🔬 Physics system initialized in world builder')
      } catch (error) {
        console.error('❌ Failed to initialize physics system:', error)
      }
    }

    initPhysics()

    return () => {
      if (physicsSystemRef.current) {
        physicsSystemRef.current.dispose()
      }
    }
  }, [])

  // Physics simulation loop
  useFrame((state, deltaTime) => {
    if (!physicsEnabled || !physicsSystemRef.current || !physicsObjectManagerRef.current) {
      return
    }

    // Step physics simulation
    physicsSystemRef.current.step(deltaTime)
    
    // Update all physics objects
    physicsObjectManagerRef.current.updateAll()
  })

  // Add/remove physics when objects change or physics is toggled
  useEffect(() => {
    if (!physicsObjectManagerRef.current || !physicsInitialized) return

    if (physicsEnabled) {
      // Add physics to all objects that support it
      worldObjects.forEach(obj => {
        if (obj.config.interactions?.physics?.enabled && !obj.physicsBody) {
          physicsObjectManagerRef.current!.addPhysicsObject(obj)
        }
      })
    } else {
      // Remove physics from all objects
      physicsObjectManagerRef.current.clear()
    }
  }, [worldObjects, physicsEnabled, physicsInitialized])

  // Handle mouse move for preview and dragging
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    const mouse = event.pointer
    raycaster.current.setFromCamera(mouse, camera)
    
    const intersectPoint = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(plane.current, intersectPoint)
    
    setMousePosition(intersectPoint)

    // Handle object dragging in move mode
    if (editorMode === 'move' && isDragging && selectedWorldObject) {
      const newPosition = intersectPoint.clone().sub(dragOffset)
      newPosition.y = selectedWorldObject.properties.position.y // Keep original height
      
      // Update object position
      selectedWorldObject.properties.position.copy(newPosition)
      if (selectedWorldObject.mesh) {
        selectedWorldObject.mesh.position.copy(newPosition)
      }
      
      // Update physics body if exists
      if (selectedWorldObject.physicsBody) {
        physicsObjectManagerRef.current?.updatePhysicsObject(selectedWorldObject)
      }
      
      onUpdateObject(selectedWorldObject.id, selectedWorldObject)
      return
    }

    // Handle preview in build mode
    if (editorMode === 'build' && selectedObject) {
      if (previewObject) {
        previewObject.position.copy(intersectPoint)
        previewObject.position.y = 0
      } else {
        // Create preview object
        const preview = createWorldObject(selectedObject, intersectPoint)
        // Make preview transparent
        preview.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial
            material.opacity = 0.5
            material.transparent = true
          }
        })
        scene.add(preview)
        setPreviewObject(preview as any)
      }
    }
  }, [selectedObject, previewObject, camera, scene, editorMode, isDragging, selectedWorldObject, dragOffset, onUpdateObject])

  // Handle mouse down
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    const mouse = event.pointer
    raycaster.current.setFromCamera(mouse, camera)

    const meshes = worldObjects.map(obj => obj.mesh).filter(Boolean) as (THREE.Mesh | THREE.Group)[]
    const intersects = raycaster.current.intersectObjects(meshes, true)
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object
      let rootObject = clickedMesh
      while (rootObject.parent && rootObject.parent.type !== 'Scene') {
        rootObject = rootObject.parent
      }
      
      const clickedObject = worldObjects.find(obj => obj.mesh === rootObject || obj.mesh === clickedMesh)
      
      if (clickedObject) {
        console.log('Selected physics object:', clickedObject.metadata.name)
        onSelectWorldObject(clickedObject)
        
        // Start dragging in move mode
        if (editorMode === 'move') {
          setIsDragging(true)
          const intersectPoint = intersects[0].point
          setDragOffset(intersectPoint.clone().sub(clickedObject.properties.position))
        }
      }
    } else {
      // Click on empty space
      if (editorMode === 'build' && selectedObject && previewObject) {
        // Create new world object with physics support
        const position = previewObject.position.clone()
        const mesh = createWorldObject(selectedObject, position)
        
        // Create WorldObject with physics config
        const worldObject: WorldObject = {
          id: `${selectedObject}-${Date.now()}`,
          metadata: {
            id: `${selectedObject}-${Date.now()}`,
            type: selectedObject,
            name: selectedObject,
            category: 'basic' as any,
            icon: '📦'
          },
          properties: {
            position: position.clone(),
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1)
          },
          config: {
            interactions: {
              clickable: true,
              hoverable: true,
              draggable: true,
              selectable: true,
              physics: {
                enabled: true,
                type: 'dynamic',
                mass: 1,
                friction: 0.5,
                restitution: 0.3
              } as PhysicsInteractions
            }
          },
          mesh
        }
        
        scene.add(mesh)
        onPlaceObject(worldObject)
        
        // Add physics if enabled
        if (physicsEnabled && physicsObjectManagerRef.current) {
          physicsObjectManagerRef.current.addPhysicsObject(worldObject)
        }
        
        scene.remove(previewObject)
        setPreviewObject(null)
      } else {
        onSelectWorldObject(null)
      }
    }
  }, [camera, worldObjects, onSelectWorldObject, editorMode, selectedObject, previewObject, scene, onPlaceObject, physicsEnabled])

  // Handle mouse up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Clean up preview when selection changes
  useEffect(() => {
    return () => {
      if (previewObject) {
        scene.remove(previewObject)
      }
    }
  }, [selectedObject, previewObject, scene])

  // Make sure all world objects are in the scene
  useEffect(() => {
    worldObjects.forEach(obj => {
      if (obj.mesh && !scene.children.includes(obj.mesh)) {
        scene.add(obj.mesh)
      }
    })

    return () => {
      worldObjects.forEach(obj => {
        if (obj.mesh && scene.children.includes(obj.mesh)) {
          scene.remove(obj.mesh)
        }
      })
    }
  }, [worldObjects, scene])

  return (
    <>
      {/* Ground plane */}
      <Grid 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#888888" 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#666666" 
        fadeDistance={30} 
        fadeStrength={1}
        infiniteGrid
        followCamera={false}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        castShadow
      />
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        onPointerDown={handlePointerDown as any}
        onPointerMove={handlePointerMove as any}
        onPointerUp={handlePointerUp as any}
      />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={60} />
      
      {/* Physics debug info */}
      {physicsEnabled && physicsObjectManagerRef.current && (
        <mesh position={[0, 10, 0]} visible={false}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
    </>
  )
}

export function PhysicsWorldBuilder({ className }: PhysicsWorldBuilderProps) {
  const [selectedObject, setSelectedObject] = useState<ObjectType | null>(null)
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([])
  const [selectedWorldObject, setSelectedWorldObject] = useState<WorldObject | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>('select')
  const [physicsEnabled, setPhysicsEnabled] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const handlePlaceObject = useCallback((object: WorldObject) => {
    setWorldObjects(prev => [...prev, object])
    console.log(`Placed object: ${object.metadata.name}`)
  }, [])

  const handleUpdateObject = useCallback((id: string, updates: Partial<WorldObject>) => {
    setWorldObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ))
  }, [])

  const handleDeleteSelectedObject = useCallback(() => {
    if (selectedWorldObject) {
      setWorldObjects(prev => prev.filter(obj => obj.id !== selectedWorldObject.id))
      setSelectedWorldObject(null)
    }
  }, [selectedWorldObject])

  const handleTogglePhysics = useCallback(() => {
    setPhysicsEnabled(prev => !prev)
    console.log(`Physics ${!physicsEnabled ? 'enabled' : 'disabled'}`)
  }, [physicsEnabled])

  return (
    <div className={cn("h-screen flex", className)}>
      {/* Left sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Mode selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 mb-4">
            <Button
              variant={editorMode === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('select')}
              className="flex items-center gap-2"
            >
              <MousePointer2 className="w-4 h-4" />
              선택
            </Button>
            <Button
              variant={editorMode === 'build' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('build')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              배치
            </Button>
            <Button
              variant={editorMode === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('move')}
              className="flex items-center gap-2"
            >
              <Hand className="w-4 h-4" />
              이동
            </Button>
          </div>

          {/* Physics controls */}
          <div className="flex gap-2">
            <Button
              variant={physicsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={handleTogglePhysics}
              className="flex items-center gap-2"
            >
              {physicsEnabled ? (
                <>
                  <Zap className="w-4 h-4" />
                  물리 ON
                </>
              ) : (
                <>
                  <ZapOff className="w-4 h-4" />
                  물리 OFF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              디버그
            </Button>
          </div>
        </div>

        {/* Object palette */}
        {editorMode === 'build' && (
          <div className="flex-1 overflow-hidden">
            <ObjectPalette
              selectedObject={selectedObject}
              onSelectObject={setSelectedObject}
            />
          </div>
        )}

        {/* Object editor */}
        {selectedWorldObject && (
          <div className="flex-1 overflow-hidden">
            <ObjectEditor
              object={selectedWorldObject}
              onUpdate={(updates) => handleUpdateObject(selectedWorldObject.id, updates)}
              onDelete={handleDeleteSelectedObject}
              physicsEnabled={physicsEnabled}
            />
          </div>
        )}

        {/* Debug panel */}
        {showDebug && (
          <div className="border-t border-gray-200 p-4">
            <DebugPanel 
              objectCount={worldObjects.length}
              physicsObjectCount={worldObjects.filter(obj => obj.physicsBody).length}
              physicsEnabled={physicsEnabled}
              selectedObject={selectedWorldObject}
            />
          </div>
        )}
      </div>

      {/* Main canvas */}
      <div className="flex-1">
        <Canvas shadows>
          <PhysicsScene
            selectedObject={selectedObject}
            onPlaceObject={handlePlaceObject}
            worldObjects={worldObjects}
            onSelectWorldObject={setSelectedWorldObject}
            selectedWorldObject={selectedWorldObject}
            editorMode={editorMode}
            onUpdateObject={handleUpdateObject}
            physicsEnabled={physicsEnabled}
            onTogglePhysics={handleTogglePhysics}
          />
        </Canvas>
      </div>
    </div>
  )
}