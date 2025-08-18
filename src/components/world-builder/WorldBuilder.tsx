'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ObjectPalette } from './ObjectPalette'
import { OBJECT_TEMPLATES, ObjectType, createWorldObject } from '@/lib/world-builder/objects'
import { ObjectEditor } from './ObjectEditor'
import { SaveLoadPanel } from '@/components/ui/save-load-panel'
import { DebugPanel } from './DebugPanel'
import { WorldStorage, SavedWorld } from '@/lib/storage/world-storage'
import { Save, FolderOpen, MousePointer2, Hand, PlusCircle, Edit3 } from 'lucide-react'
import '@/lib/world-builder/initialize'

interface PlacedObject {
  id: string
  type: ObjectType
  mesh: THREE.Mesh | THREE.Group
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

function BuilderScene({ 
  selectedObject, 
  onPlaceObject,
  placedObjects,
  onSelectPlacedObject,
  selectedPlacedObject,
  editorMode
}: { 
  selectedObject: ObjectType | null
  onPlaceObject: (object: PlacedObject) => void
  placedObjects: PlacedObject[]
  onSelectPlacedObject: (object: PlacedObject | null) => void
  selectedPlacedObject: PlacedObject | null
  editorMode: EditorMode
}) {
  const { scene, camera } = useThree()
  const [previewObject, setPreviewObject] = useState<THREE.Mesh | null>(null)
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3())
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  // Handle mouse move for preview and dragging
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    // Use pointer from Three.js event
    const mouse = event.pointer

    raycaster.current.setFromCamera(mouse, camera)
    
    const intersectPoint = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(plane.current, intersectPoint)
    
    setMousePosition(intersectPoint)

    // Handle object dragging in move mode
    if (editorMode === 'move' && isDragging && selectedPlacedObject) {
      const newPosition = intersectPoint.clone().sub(dragOffset)
      newPosition.y = selectedPlacedObject.position.y // Keep original height
      
      // Update mesh position
      selectedPlacedObject.mesh.position.copy(newPosition)
      
      // Update state to trigger re-render
      setPlacedObjects(prev => prev.map(obj => {
        if (obj.id === selectedPlacedObject.id) {
          return {
            ...obj,
            position: newPosition.clone()
          }
        }
        return obj
      }))
      return
    }

    // Handle preview in build mode
    if (editorMode === 'build' && selectedObject) {
      if (previewObject) {
        previewObject.position.copy(intersectPoint)
        previewObject.position.y = 0
      } else {
        // Create preview object
        const template = OBJECT_TEMPLATES.find(t => t.type === selectedObject)
        if (template) {
          const preview = createWorldObject(template, intersectPoint)
          preview.material.opacity = 0.7
          preview.material.transparent = true
          scene.add(preview)
          setPreviewObject(preview)
        }
      }
    }
  }, [selectedObject, previewObject, camera, scene, editorMode, isDragging, selectedPlacedObject, dragOffset])

  // Handle mouse down
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    // Use pointer from Three.js event
    const mouse = event.pointer
    raycaster.current.setFromCamera(mouse, camera)

    const meshes = placedObjects.map(obj => obj.mesh)
    const intersects = raycaster.current.intersectObjects(meshes, true) // true for recursive
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object
      // Find the root object (could be a child of a group)
      let rootObject = clickedMesh
      while (rootObject.parent && rootObject.parent.type !== 'Scene') {
        rootObject = rootObject.parent
      }
      const clickedObject = placedObjects.find(obj => obj.mesh === rootObject || obj.mesh === clickedMesh)
      
      if (clickedObject) {
        console.log('Selected object:', {
          id: clickedObject.id,
          type: clickedObject.type,
          meshType: clickedObject.mesh.type,
          isGroup: clickedObject.mesh instanceof THREE.Group,
          isMesh: clickedObject.mesh instanceof THREE.Mesh
        })
        onSelectPlacedObject(clickedObject)
        
        // Start dragging in move mode
        if (editorMode === 'move') {
          setIsDragging(true)
          const intersectPoint = intersects[0].point
          setDragOffset(intersectPoint.clone().sub(clickedObject.position))
        }
      }
    } else {
      // Click on empty space
      if (editorMode === 'build' && selectedObject && previewObject) {
        // Place new object
        const template = OBJECT_TEMPLATES.find(t => t.type === selectedObject)
        if (!template) return

        const worldObject = createWorldObject(template, previewObject.position.clone())
        scene.add(worldObject)

        const placedObject: PlacedObject = {
          id: `${selectedObject}-${Date.now()}`,
          type: selectedObject,
          mesh: worldObject,
          position: worldObject.position.clone(),
          rotation: worldObject.rotation.clone(),
          scale: worldObject.scale.clone()
        }

        onPlaceObject(placedObject)
        scene.remove(previewObject)
        setPreviewObject(null)
      } else {
        onSelectPlacedObject(null)
      }
    }
  }, [camera, placedObjects, onSelectPlacedObject, editorMode, selectedObject, previewObject, scene, onPlaceObject])

  // Handle mouse up
  const handlePointerUp = useCallback(() => {
    if (isDragging && selectedPlacedObject) {
      // Finalize position after dragging
      const updatedObject = placedObjects.find(obj => obj.id === selectedPlacedObject.id)
      if (updatedObject) {
        updatedObject.position = updatedObject.mesh.position.clone()
      }
    }
    setIsDragging(false)
  }, [isDragging, selectedPlacedObject, placedObjects])

  // Clean up preview when selection changes
  React.useEffect(() => {
    return () => {
      if (previewObject) {
        scene.remove(previewObject)
      }
    }
  }, [selectedObject, previewObject, scene])

  // Make sure all placed objects are in the scene
  React.useEffect(() => {
    placedObjects.forEach(obj => {
      if (obj.mesh && !scene.children.includes(obj.mesh)) {
        scene.add(obj.mesh)
      }
    })

    // Cleanup when objects are removed
    return () => {
      placedObjects.forEach(obj => {
        if (scene.children.includes(obj.mesh)) {
          scene.remove(obj.mesh)
        }
      })
    }
  }, [placedObjects, scene])

  // Highlight selected object
  React.useEffect(() => {
    placedObjects.forEach(obj => {
      const updateEmissive = (mesh: THREE.Mesh, selected: boolean) => {
        if (mesh.material && 'emissive' in mesh.material) {
          mesh.material.emissive = new THREE.Color(selected ? 0x444444 : 0x000000)
          mesh.material.emissiveIntensity = selected ? 0.3 : 0
        }
      }

      const isSelected = obj.id === selectedPlacedObject?.id
      
      if (obj.mesh instanceof THREE.Mesh) {
        updateEmissive(obj.mesh, isSelected)
      } else if (obj.mesh instanceof THREE.Group) {
        // Update emissive for all mesh children in the group
        obj.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            updateEmissive(child, isSelected)
          }
        })
      }
    })
  }, [selectedPlacedObject, placedObjects])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      
      <Grid 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6b7280" 
        sectionSize={10} 
        sectionThickness={1} 
        sectionColor="#374151" 
        fadeDistance={100} 
        fadeStrength={1} 
        infiniteGrid
      />
      
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  )
}

type EditorMode = 'build' | 'select' | 'move'

export function WorldBuilder() {
  const [selectedObject, setSelectedObject] = useState<ObjectType | null>(null)
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([])
  const [editorMode, setEditorMode] = useState<EditorMode>('build')
  const [selectedPlacedObject, setSelectedPlacedObject] = useState<PlacedObject | null>(null)
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([])
  const [showSaveLoad, setShowSaveLoad] = useState(false)
  const [currentWorldId, setCurrentWorldId] = useState<string | null>(null)

  useEffect(() => {
    loadWorlds()
  }, [])

  const loadWorlds = () => {
    setSavedWorlds(WorldStorage.getAllWorlds())
  }

  const handlePlaceObject = useCallback((object: PlacedObject) => {
    setPlacedObjects(prev => [...prev, object])
  }, [])

  const handleClearAll = () => {
    if (!confirm('Clear all objects? This cannot be undone.')) return
    
    placedObjects.forEach(obj => {
      if (obj.mesh instanceof THREE.Mesh) {
        obj.mesh.geometry.dispose()
        if (obj.mesh.material instanceof THREE.Material) {
          obj.mesh.material.dispose()
        } else if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(mat => mat.dispose())
        }
      } else if (obj.mesh instanceof THREE.Group) {
        obj.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            } else if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose())
            }
          }
        })
      }
    })
    setPlacedObjects([])
    setSelectedPlacedObject(null)
    setCurrentWorldId(null)
  }

  const handleSaveWorld = (name: string) => {
    const worldObjects = WorldStorage.createWorldFromScene(placedObjects)
    const world = WorldStorage.saveWorld(name, worldObjects, {}, `A world with ${placedObjects.length} objects`)
    if (world) {
      setCurrentWorldId(world.id)
      loadWorlds()
    }
  }

  const handleLoadWorld = (id: string) => {
    const world = WorldStorage.getWorld(id)
    if (!world) return

    // Clear current world
    handleClearAll()

    // Load objects from saved world
    const newObjects: PlacedObject[] = world.objects.map(obj => {
      const template = OBJECT_TEMPLATES.find(t => t.type === obj.type)
      if (!template) return null

      const mesh = createWorldObject(template, new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z))
      mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
      mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
      
      if (obj.color) {
        if (mesh instanceof THREE.Mesh && mesh.material && 'color' in mesh.material) {
          mesh.material.color = new THREE.Color(obj.color)
        } else if (mesh instanceof THREE.Group) {
          mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && 'color' in child.material) {
              child.material.color = new THREE.Color(obj.color)
            }
          })
        }
      }

      return {
        id: obj.id,
        type: obj.type as ObjectType,
        mesh,
        position: new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z),
        rotation: new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z),
        scale: new THREE.Vector3(obj.scale.x, obj.scale.y, obj.scale.z)
      }
    }).filter(Boolean) as PlacedObject[]

    setPlacedObjects(newObjects)
    setCurrentWorldId(id)
    WorldStorage.setCurrentWorld(id)
  }

  const handleExportWorld = (id: string) => {
    const json = WorldStorage.exportWorld(id)
    if (json) {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `world_${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImportWorld = async (file: File) => {
    try {
      const text = await file.text()
      const world = WorldStorage.importWorld(text)
      if (world) {
        loadWorlds()
        handleLoadWorld(world.id)
      }
    } catch (error) {
      console.error('Failed to import world:', error)
    }
  }

  const handleUpdateObject = (updates: Partial<{
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
    color: string
  }>) => {
    if (!selectedPlacedObject) return

    setPlacedObjects(prev => prev.map(obj => {
      if (obj.id === selectedPlacedObject.id) {
        if (updates.position) {
          obj.mesh.position.copy(updates.position)
          obj.position = updates.position.clone()
        }
        if (updates.rotation) {
          obj.mesh.rotation.copy(updates.rotation)
          obj.rotation = updates.rotation.clone()
        }
        if (updates.scale) {
          obj.mesh.scale.copy(updates.scale)
          obj.scale = updates.scale.clone()
        }
        if (updates.color) {
          if (obj.mesh instanceof THREE.Mesh && obj.mesh.material && 'color' in obj.mesh.material) {
            obj.mesh.material.color = new THREE.Color(updates.color)
          } else if (obj.mesh instanceof THREE.Group) {
            // Update color for all mesh children in the group
            obj.mesh.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material && 'color' in child.material) {
                child.material.color = new THREE.Color(updates.color)
              }
            })
          }
        }
        return { ...obj }
      }
      return obj
    }))
  }

  const handleDeleteObject = () => {
    if (!selectedPlacedObject) return

    setPlacedObjects(prev => prev.filter(obj => obj.id !== selectedPlacedObject.id))
    
    // Dispose of the mesh/group
    if (selectedPlacedObject.mesh instanceof THREE.Mesh) {
      selectedPlacedObject.mesh.geometry.dispose()
      if (selectedPlacedObject.mesh.material instanceof THREE.Material) {
        selectedPlacedObject.mesh.material.dispose()
      } else if (Array.isArray(selectedPlacedObject.mesh.material)) {
        selectedPlacedObject.mesh.material.forEach(mat => mat.dispose())
      }
    } else if (selectedPlacedObject.mesh instanceof THREE.Group) {
      // Dispose all children in the group
      selectedPlacedObject.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material instanceof THREE.Material) {
            child.material.dispose()
          } else if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          }
        }
      })
    }
    
    setSelectedPlacedObject(null)
  }

  return (
    <div className={cn(
      "relative w-full h-screen",
      editorMode === 'move' && "cursor-move",
      editorMode === 'select' && "cursor-pointer",
      editorMode === 'build' && selectedObject && "cursor-crosshair"
    )}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 60 }}>
        <BuilderScene 
          selectedObject={editorMode === 'build' ? selectedObject : null} 
          onPlaceObject={handlePlaceObject}
          placedObjects={placedObjects}
          onSelectPlacedObject={setSelectedPlacedObject}
          selectedPlacedObject={selectedPlacedObject}
          editorMode={editorMode}
        />
        <OrbitControls 
          enablePan={true}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4">
        {editorMode === 'build' && (
          <ObjectPalette 
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
          />
        )}
        {editorMode !== 'build' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600">
              Mode: <span className="font-semibold capitalize">{editorMode}</span>
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Editor Mode</h3>
          
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={editorMode === 'build' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setEditorMode('build')
                setSelectedPlacedObject(null)
              }}
              className="flex flex-col items-center py-2"
            >
              <PlusCircle className="w-4 h-4 mb-1" />
              <span className="text-xs">Build</span>
            </Button>
            <Button
              variant={editorMode === 'select' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setEditorMode('select')
                setSelectedObject(null)
              }}
              className="flex flex-col items-center py-2"
            >
              <MousePointer2 className="w-4 h-4 mb-1" />
              <span className="text-xs">Select</span>
            </Button>
            <Button
              variant={editorMode === 'move' ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setEditorMode('move')
                setSelectedObject(null)
              }}
              className="flex flex-col items-center py-2"
            >
              <Hand className="w-4 h-4 mb-1" />
              <span className="text-xs">Move</span>
            </Button>
          </div>
          
          <div className="space-y-2 mb-4">
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveLoad(!showSaveLoad)}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-1" />
              Save/Load Worlds
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              className="w-full"
            >
              Clear All Objects
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Objects placed: {placedObjects.length}</p>
            {currentWorldId && <p className="text-xs">World ID: {currentWorldId.slice(0, 8)}...</p>}
          </div>
          
          {/* Mode Instructions */}
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            {editorMode === 'build' && (
              <p className="text-blue-700">
                <PlusCircle className="w-3 h-3 inline mr-1" />
                Select an object from the palette and click to place
              </p>
            )}
            {editorMode === 'select' && (
              <p className="text-blue-700">
                <MousePointer2 className="w-3 h-3 inline mr-1" />
                Click on objects to select and edit properties
              </p>
            )}
            {editorMode === 'move' && (
              <p className="text-blue-700">
                <Hand className="w-3 h-3 inline mr-1" />
                Click and drag objects to move them
              </p>
            )}
          </div>
        </div>

        {/* Object Editor */}
        {selectedPlacedObject && (
          <ObjectEditor
            selectedObject={selectedPlacedObject}
            onUpdateObject={handleUpdateObject}
            onDeleteObject={handleDeleteObject}
          />
        )}
        
        {/* Debug Panel */}
        <DebugPanel
          selectedObject={selectedPlacedObject}
          placedObjects={placedObjects}
          className="mt-4"
        />
      </div>

      {/* Save/Load Panel */}
      {showSaveLoad && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <SaveLoadPanel
            type="world"
            items={savedWorlds}
            onSave={handleSaveWorld}
            onLoad={handleLoadWorld}
            onExport={handleExportWorld}
            onImport={handleImportWorld}
            onDelete={(id) => {
              if (WorldStorage.deleteWorld(id)) {
                loadWorlds()
                if (currentWorldId === id) {
                  setCurrentWorldId(null)
                }
              }
            }}
            className="w-96"
          />
        </div>
      )}
    </div>
  )
}