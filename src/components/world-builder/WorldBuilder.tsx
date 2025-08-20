'use client';

import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useThree, ThreeEvent, useFrame } from '@react-three/fiber';
import {
  Save,
  FolderOpen,
  MousePointer2,
  Hand,
  PlusCircle,
  Edit3,
  Zap,
  ZapOff,
  Play,
  Pause,
  Gamepad2,
  User,
} from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

THREE.ColorManagement.enabled = true;
import { Button } from '@/components/ui/button';
import { SaveLoadPanel } from '@/components/ui/save-load-panel';
import { GameLauncher } from '@/features/games';
import { PhysicsSystem } from '@/lib/physics/physics-system';
import { WorldStorage, SavedWorld } from '@/lib/storage/world-storage';
import { cn } from '@/lib/utils';
import { initializeWorldBuilder } from '@/lib/world-builder/initialize';
import type {
  WorldObject,
  PhysicsInteractions,
  ObjectCategory,
} from '@/lib/world-builder/object-system/types';
import { ObjectType, createWorldObject } from '@/lib/world-builder/objects/index';

import { PhysicsObjectManager } from '@/lib/world-builder/physics-object-manager';
import { DebugPanel } from './DebugPanel';
import { ObjectEditor } from './ObjectEditor';

import { AvatarWorldIntegration } from './AvatarWorldIntegration';

import { useSelectedAvatar } from '@/shared/stores/avatar-store';

import { ObjectPalette } from './ObjectPalette';

// Ensure world builder is initialized
if (typeof window !== 'undefined') {
  console.log('WorldBuilder: Initializing world builder system');
  initializeWorldBuilder();
}

// Convert PlacedObject to WorldObject factory
function createWorldObjectFromType(type: ObjectType, position: THREE.Vector3): WorldObject {
  const mesh = createWorldObject(type, position);

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      id: `${type}-${Date.now()}`,
      type,
      name: type,
      category: 'basic' as ObjectCategory,
      icon: '📦',
    },
    properties: {
      position: position.clone(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
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
          restitution: 0.3,
        } as PhysicsInteractions,
      },
    },
    mesh,
  };
}

function BuilderScene({
  selectedObject,
  onPlaceObject,
  worldObjects,
  onSelectWorldObject,
  selectedWorldObject,
  editorMode,
  onUpdateObject,
  physicsEnabled,
  onTogglePhysics,
  onPhysicsManagerReady,
  avatarModeEnabled,
}: {
  selectedObject: ObjectType | null;
  onPlaceObject: (object: WorldObject) => void;
  worldObjects: WorldObject[];
  onSelectWorldObject: (object: WorldObject | null) => void;
  selectedWorldObject: WorldObject | null;
  editorMode: EditorMode;
  onUpdateObject: (id: string, updates: Partial<WorldObject>) => void;
  physicsEnabled: boolean;
  onTogglePhysics: () => void;
  onPhysicsManagerReady?: (manager: PhysicsObjectManager) => void;
  avatarModeEnabled: boolean;
}) {
  const { scene, camera } = useThree();
  const [previewObject, setPreviewObject] = useState<THREE.Mesh | THREE.Group | null>(null);

  // Store scene reference for games
  useEffect(() => {
    if (onPhysicsManagerReady && scene) {
      (window as any).__worldBuilderScene = scene;
    }
  }, [scene, onPhysicsManagerReady]);
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  // Physics system references
  const physicsSystemRef = useRef<PhysicsSystem | null>(null);
  const physicsObjectManagerRef = useRef<PhysicsObjectManager | null>(null);
  const [physicsInitialized, setPhysicsInitialized] = useState(false);

  // Initialize physics system
  useEffect(() => {
    const initPhysics = async () => {
      try {
        const physicsSystem = new PhysicsSystem({
          gravity: new THREE.Vector3(0, -9.81, 0),
          enableCCD: true,
        });

        await physicsSystem.initialize();
        physicsSystemRef.current = physicsSystem;

        const objectManager = new PhysicsObjectManager(physicsSystem);
        physicsObjectManagerRef.current = objectManager;

        setPhysicsInitialized(true);
        console.log('🔬 Physics system initialized in WorldBuilder');
      } catch (error) {
        console.error('❌ Failed to initialize physics system:', error);
      }
    };

    initPhysics();

    return () => {
      if (physicsSystemRef.current) {
        physicsSystemRef.current.dispose();
      }
    };
  }, []);

  // Physics simulation loop
  useFrame((state, deltaTime) => {
    if (!physicsEnabled || !physicsSystemRef.current || !physicsObjectManagerRef.current) {
      return;
    }

    // Step physics simulation
    physicsSystemRef.current.step(deltaTime);

    // Update all physics objects
    physicsObjectManagerRef.current.updateAll();
  });

  // Expose physics manager to parent
  useEffect(() => {
    if (physicsObjectManagerRef.current && onPhysicsManagerReady) {
      onPhysicsManagerReady(physicsObjectManagerRef.current);
    }
  }, [physicsObjectManagerRef.current, onPhysicsManagerReady]);

  // Add/remove physics when objects change or physics is toggled
  useEffect(() => {
    if (!physicsObjectManagerRef.current || !physicsInitialized) return;

    if (physicsEnabled) {
      // Add physics to all objects that support it
      worldObjects.forEach((obj) => {
        if (obj.config.interactions?.physics?.enabled && !obj.physicsBody) {
          physicsObjectManagerRef.current!.addPhysicsObject(obj);
        }
      });
    } else {
      // Remove physics from all objects
      physicsObjectManagerRef.current.clear();
    }
  }, [worldObjects, physicsEnabled, physicsInitialized]);

  // Handle mouse move for preview and dragging
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // Use pointer from Three.js event
      const mouse = event.pointer;

      raycaster.current.setFromCamera(mouse, camera);

      const intersectPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, intersectPoint);

      setMousePosition(intersectPoint);

      // Handle object dragging in move mode
      if (editorMode === 'move' && isDragging && selectedWorldObject) {
        const newPosition = intersectPoint.clone().sub(dragOffset);
        newPosition.y = selectedWorldObject.properties.position.y; // Keep original height

        // Update object position
        selectedWorldObject.properties.position.copy(newPosition);
        if (selectedWorldObject.mesh) {
          selectedWorldObject.mesh.position.copy(newPosition);
        }

        // Update physics body if exists
        if (selectedWorldObject.physicsBody) {
          physicsObjectManagerRef.current?.updatePhysicsObject(selectedWorldObject);
        }

        onUpdateObject(selectedWorldObject.id, selectedWorldObject);
        return;
      }

      // Handle preview in build mode
      if (editorMode === 'build' && selectedObject) {
        if (previewObject) {
          previewObject.position.copy(intersectPoint);
          previewObject.position.y = 0;
        } else {
          // Create preview object
          console.log('Creating preview for:', selectedObject);
          console.log('Intersect point:', intersectPoint);
          try {
            // Create object directly from type
            const preview = createWorldObject(selectedObject, intersectPoint);
            console.log('Preview object created:', preview);
            console.log('Preview children:', preview.children ? preview.children.length : 0);

            // Make preview transparent
            preview.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.opacity = 0.7;
                material.transparent = true;
              }
            });
            scene.add(preview);
            setPreviewObject(preview as any);
            console.log('Preview added to scene');
          } catch (error) {
            console.error('Error creating preview:', error);
          }
        }
      }
    },
    [
      selectedObject,
      previewObject,
      camera,
      scene,
      editorMode,
      isDragging,
      selectedWorldObject,
      dragOffset,
      onUpdateObject,
    ]
  );

  // Handle mouse down
  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // Use pointer from Three.js event
      const mouse = event.pointer;
      raycaster.current.setFromCamera(mouse, camera);

      const meshes = worldObjects.map((obj) => obj.mesh).filter(Boolean) as (
        | THREE.Mesh
        | THREE.Group
      )[];
      const intersects = raycaster.current.intersectObjects(meshes, true); // true for recursive

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        // Find the root object (could be a child of a group)
        let rootObject = clickedMesh;
        while (rootObject.parent && rootObject.parent.type !== 'Scene') {
          rootObject = rootObject.parent;
        }
        const clickedObject = worldObjects.find(
          (obj) => obj.mesh === rootObject || obj.mesh === clickedMesh
        );

        if (clickedObject) {
          console.log('Selected physics object:', clickedObject.metadata.name);
          onSelectWorldObject(clickedObject);

          // Start dragging in move mode
          if (editorMode === 'move') {
            setIsDragging(true);
            const intersectPoint = intersects[0].point;
            setDragOffset(intersectPoint.clone().sub(clickedObject.properties.position));
          }
        }
      } else {
        // Click on empty space
        if (editorMode === 'build' && selectedObject && previewObject) {
          // Create new world object with physics support
          const position = previewObject.position.clone();
          const worldObject = createWorldObjectFromType(selectedObject, position);

          scene.add(worldObject.mesh!);
          onPlaceObject(worldObject);

          // Add physics if enabled
          if (physicsEnabled && physicsObjectManagerRef.current) {
            physicsObjectManagerRef.current.addPhysicsObject(worldObject);
          }

          scene.remove(previewObject);
          setPreviewObject(null);
        } else {
          onSelectWorldObject(null);
        }
      }
    },
    [
      camera,
      worldObjects,
      onSelectWorldObject,
      editorMode,
      selectedObject,
      previewObject,
      scene,
      onPlaceObject,
      physicsEnabled,
    ]
  );

  // Handle mouse up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Clean up preview when selection changes
  React.useEffect(() => {
    return () => {
      if (previewObject) {
        scene.remove(previewObject);
      }
    };
  }, [selectedObject, previewObject, scene]);

  // Make sure all world objects are in the scene
  React.useEffect(() => {
    worldObjects.forEach((obj) => {
      if (obj.mesh && !scene.children.includes(obj.mesh)) {
        scene.add(obj.mesh);
      }
    });

    return () => {
      worldObjects.forEach((obj) => {
        if (obj.mesh && scene.children.includes(obj.mesh)) {
          scene.remove(obj.mesh);
        }
      });
    };
  }, [worldObjects, scene]);

  // Highlight selected object
  React.useEffect(() => {
    worldObjects.forEach((obj) => {
      const updateEmissive = (mesh: THREE.Mesh, selected: boolean) => {
        if (mesh.material && 'emissive' in mesh.material) {
          mesh.material.emissive = new THREE.Color(selected ? 0x444444 : 0x000000);
          mesh.material.emissiveIntensity = selected ? 0.3 : 0;
        }
      };

      const isSelected = obj.id === selectedWorldObject?.id;

      if (obj.mesh instanceof THREE.Mesh) {
        updateEmissive(obj.mesh, isSelected);
      } else if (obj.mesh instanceof THREE.Group) {
        // Update emissive for all mesh children in the group
        obj.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            updateEmissive(child, isSelected);
          }
        });
      }
    });
  }, [selectedWorldObject, worldObjects]);

  // Create ground plane when physics is enabled
  useEffect(() => {
    if (!physicsEnabled || !physicsObjectManagerRef.current || !physicsInitialized) return;

    // Check if ground already exists
    const existingGround = worldObjects.find((obj) => obj.id === 'physics-ground');
    if (existingGround) return;

    // Create physics ground
    const groundMesh = new THREE.Mesh(
      new THREE.BoxGeometry(100, 0.5, 100),
      new THREE.MeshStandardMaterial({
        color: 0x606060,
        transparent: true,
        opacity: 0.5,
      })
    );
    groundMesh.position.y = -0.25;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const groundObject: WorldObject = {
      id: 'physics-ground',
      metadata: {
        id: 'physics-ground',
        type: 'ground',
        name: 'Physics Ground',
        category: 'basic' as ObjectCategory,
        icon: '🟫',
      },
      properties: {
        position: groundMesh.position.clone(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1),
      },
      config: {
        interactions: {
          clickable: false,
          selectable: false,
          draggable: false,
          physics: {
            enabled: true,
            type: 'static',
            shape: { type: 'box', size: new THREE.Vector3(100, 0.5, 100) },
          } as PhysicsInteractions,
        },
      },
      mesh: groundMesh,
    };

    // Add physics to ground
    physicsObjectManagerRef.current.addPhysicsObject(groundObject);

    // Don't add to worldObjects to keep it separate from user objects

    return () => {
      // Clean up ground when physics is disabled
      if (groundMesh && scene.children.includes(groundMesh)) {
        scene.remove(groundMesh);
        groundMesh.geometry.dispose();
        if (groundMesh.material instanceof THREE.Material) {
          groundMesh.material.dispose();
        }
      }
      if (physicsObjectManagerRef.current) {
        physicsObjectManagerRef.current.removePhysicsObject('physics-ground');
      }
    };
  }, [physicsEnabled, physicsInitialized, scene, worldObjects]);

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

      {/* Avatar Integration */}
      <AvatarWorldIntegration
        enabled={avatarModeEnabled}
        onAvatarPositionChange={(position) => {
          // Optional: handle avatar position changes
          console.log('Avatar moved to:', position);
        }}
      />
    </>
  );
}

type EditorMode = 'build' | 'select' | 'move' | 'avatar';

export function WorldBuilder() {
  const [selectedObject, setSelectedObject] = useState<ObjectType | null>(null);
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([]);
  const [editorMode, setEditorMode] = useState<EditorMode>('build');
  const [selectedWorldObject, setSelectedWorldObject] = useState<WorldObject | null>(null);
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [currentWorldId, setCurrentWorldId] = useState<string | null>(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const selectedAvatar = useSelectedAvatar();
  const [avatarModeEnabled, setAvatarModeEnabled] = useState(false);

  // Physics manager reference for applying forces
  const physicsManagerRef = useRef<PhysicsObjectManager | null>(null);
  // Scene reference for games
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = () => {
    setSavedWorlds(WorldStorage.getAllWorlds());
  };

  const handlePlaceObject = useCallback((object: WorldObject) => {
    setWorldObjects((prev) => [...prev, object]);
    console.log(`Placed object: ${object.metadata.name}`);
  }, []);

  const handleUpdateObject = useCallback((id: string, updates: Partial<WorldObject>) => {
    setWorldObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)));
  }, []);

  const handleDeleteSelectedObject = useCallback(() => {
    if (selectedWorldObject) {
      setWorldObjects((prev) => prev.filter((obj) => obj.id !== selectedWorldObject.id));
      setSelectedWorldObject(null);
    }
  }, [selectedWorldObject]);

  const handleTogglePhysics = useCallback(() => {
    setPhysicsEnabled((prev) => !prev);
    console.log(`Physics ${!physicsEnabled ? 'enabled' : 'disabled'}`);
  }, [physicsEnabled]);

  const handleApplyForce = useCallback((objectId: string, force: THREE.Vector3) => {
    if (physicsManagerRef.current) {
      physicsManagerRef.current.applyForce(objectId, force);
    }
  }, []);

  const handleApplyImpulse = useCallback((objectId: string, impulse: THREE.Vector3) => {
    if (physicsManagerRef.current) {
      physicsManagerRef.current.applyImpulse(objectId, impulse);
    }
  }, []);

  const handleClearAll = () => {
    if (!confirm('Clear all objects? This cannot be undone.')) return;

    worldObjects.forEach((obj) => {
      if (obj.mesh instanceof THREE.Mesh) {
        obj.mesh.geometry.dispose();
        if (obj.mesh.material instanceof THREE.Material) {
          obj.mesh.material.dispose();
        } else if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach((mat) => mat.dispose());
        }
      } else if (obj.mesh instanceof THREE.Group) {
        obj.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            } else if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            }
          }
        });
      }
    });
    setWorldObjects([]);
    setSelectedWorldObject(null);
    setCurrentWorldId(null);
  };

  const handleSaveWorld = (name: string) => {
    // Convert WorldObjects to legacy format for storage compatibility
    const legacyObjects = worldObjects.map((obj) => ({
      id: obj.id,
      type: obj.metadata.type,
      position: {
        x: obj.properties.position.x,
        y: obj.properties.position.y,
        z: obj.properties.position.z,
      },
      rotation: {
        x: obj.properties.rotation.x,
        y: obj.properties.rotation.y,
        z: obj.properties.rotation.z,
      },
      scale: {
        x: obj.properties.scale.x,
        y: obj.properties.scale.y,
        z: obj.properties.scale.z,
      },
    }));

    const world = WorldStorage.saveWorld(
      name,
      legacyObjects,
      {},
      `A physics world with ${worldObjects.length} objects`
    );
    if (world) {
      setCurrentWorldId(world.id);
      loadWorlds();
    }
  };

  const handleLoadWorld = (id: string) => {
    const world = WorldStorage.getWorld(id);
    if (!world) return;

    // Clear current world
    handleClearAll();

    // Load objects from saved world
    const newObjects: PlacedObject[] = world.objects
      .map((obj) => {
        const mesh = createWorldObject(
          obj.type,
          new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z)
        );
        mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

        if (obj.color) {
          if (mesh instanceof THREE.Mesh && mesh.material && 'color' in mesh.material) {
            mesh.material.color = new THREE.Color(obj.color);
          } else if (mesh instanceof THREE.Group) {
            mesh.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material && 'color' in child.material) {
                child.material.color = new THREE.Color(obj.color);
              }
            });
          }
        }

        return {
          id: obj.id,
          type: obj.type as ObjectType,
          mesh,
          position: new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z),
          rotation: new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z),
          scale: new THREE.Vector3(obj.scale.x, obj.scale.y, obj.scale.z),
        };
      })
      .filter(Boolean) as PlacedObject[];

    setPlacedObjects(newObjects);
    setCurrentWorldId(id);
    WorldStorage.setCurrentWorld(id);
  };

  const handleExportWorld = (id: string) => {
    const json = WorldStorage.exportWorld(id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `world_${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportWorld = async (file: File) => {
    try {
      const text = await file.text();
      const world = WorldStorage.importWorld(text);
      if (world) {
        loadWorlds();
        handleLoadWorld(world.id);
      }
    } catch (error) {
      console.error('Failed to import world:', error);
    }
  };

  const handleDeleteObject = () => {
    if (!selectedPlacedObject) return;

    setPlacedObjects((prev) => prev.filter((obj) => obj.id !== selectedPlacedObject.id));

    // Dispose of the mesh/group
    if (selectedPlacedObject.mesh instanceof THREE.Mesh) {
      selectedPlacedObject.mesh.geometry.dispose();
      if (selectedPlacedObject.mesh.material instanceof THREE.Material) {
        selectedPlacedObject.mesh.material.dispose();
      } else if (Array.isArray(selectedPlacedObject.mesh.material)) {
        selectedPlacedObject.mesh.material.forEach((mat) => mat.dispose());
      }
    } else if (selectedPlacedObject.mesh instanceof THREE.Group) {
      // Dispose all children in the group
      selectedPlacedObject.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          }
        }
      });
    }

    setSelectedPlacedObject(null);
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        {/* Mode selector */}
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex gap-2">
            <Button
              variant={editorMode === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditorMode('select');
                setAvatarModeEnabled(false);
              }}
              className="flex items-center gap-2"
            >
              <MousePointer2 className="h-4 w-4" />
              선택
            </Button>
            <Button
              variant={editorMode === 'build' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditorMode('build');
                setAvatarModeEnabled(false);
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              배치
            </Button>
            <Button
              variant={editorMode === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditorMode('move');
                setAvatarModeEnabled(false);
              }}
              className="flex items-center gap-2"
            >
              <Hand className="h-4 w-4" />
              이동
            </Button>
            <Button
              variant={editorMode === 'avatar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditorMode('avatar');
                setAvatarModeEnabled(true);
              }}
              className="flex items-center gap-2"
              disabled={!selectedAvatar}
              title={!selectedAvatar ? '아바타를 먼저 선택해주세요' : ''}
            >
              <User className="h-4 w-4" />
              아바타
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
                  <Zap className="h-4 w-4" />
                  물리 ON
                </>
              ) : (
                <>
                  <ZapOff className="h-4 w-4" />
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
              <Edit3 className="h-4 w-4" />
              디버그
            </Button>
          </div>

          {/* Games button */}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGames(true)}
              className="flex w-full items-center gap-2"
              data-game-launcher
            >
              <Gamepad2 className="h-4 w-4" />
              게임 플레이
            </Button>
          </div>
        </div>

        {/* Object palette */}
        {editorMode === 'build' && (
          <div className="flex-1 overflow-hidden">
            <ObjectPalette selectedObject={selectedObject} onSelectObject={setSelectedObject} />
          </div>
        )}

        {/* Avatar mode info */}
        {editorMode === 'avatar' && (
          <div className="flex-1 p-4">
            {selectedAvatar ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">아바타 모드</h3>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-2 text-sm font-medium text-blue-800">현재 아바타</p>
                  <p className="text-lg font-bold text-blue-900">{selectedAvatar.name}</p>
                </div>
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">조작 방법:</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• W/A/S/D 또는 방향키: 이동</div>
                    <div>• Shift: 달리기</div>
                    <div>• 카메라가 자동으로 아바타를 따라갑니다</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  아바타 모드를 사용하려면 먼저 아바타를 선택해주세요.
                </p>
                <button
                  className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
                  onClick={() => {
                    // Navigate to avatar selection
                    window.location.href = '/avatar';
                  }}
                >
                  아바타 선택하러 가기 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Object editor */}
        {selectedWorldObject && (
          <div className="flex-1 overflow-hidden">
            <ObjectEditor
              object={selectedWorldObject}
              onUpdate={handleUpdateObject}
              onDelete={handleDeleteSelectedObject}
              physicsEnabled={physicsEnabled}
              onApplyForce={handleApplyForce}
              onApplyImpulse={handleApplyImpulse}
            />
          </div>
        )}

        {/* Debug panel */}
        {showDebug && (
          <div className="border-t border-gray-200 p-4">
            <DebugPanel
              objectCount={worldObjects.length}
              physicsObjectCount={worldObjects.filter((obj) => obj.physicsBody).length}
              physicsEnabled={physicsEnabled}
              selectedObject={selectedWorldObject}
            />
          </div>
        )}
      </div>

      {/* Main canvas */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [10, 10, 10], fov: 50 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 50, 200]} />

          <BuilderScene
            selectedObject={selectedObject}
            onPlaceObject={handlePlaceObject}
            worldObjects={worldObjects}
            onSelectWorldObject={setSelectedWorldObject}
            selectedWorldObject={selectedWorldObject}
            editorMode={editorMode}
            onUpdateObject={handleUpdateObject}
            physicsEnabled={physicsEnabled}
            onTogglePhysics={handleTogglePhysics}
            onPhysicsManagerReady={(manager) => {
              physicsManagerRef.current = manager;
            }}
            avatarModeEnabled={avatarModeEnabled}
          />

          <PerspectiveCamera makeDefault position={[10, 10, 10]} />
          <OrbitControls
            enablePan={!avatarModeEnabled}
            enableZoom={!avatarModeEnabled}
            enableRotate={!avatarModeEnabled}
            enabled={!avatarModeEnabled}
            minDistance={5}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Game Launcher Modal */}
      {showGames && (window as any).__worldBuilderScene && (
        <GameLauncher
          scene={(window as any).__worldBuilderScene}
          currentPlayer={{
            id: 'player-1',
            name: 'Player 1',
            avatar: null,
          }}
          onClose={() => setShowGames(false)}
        />
      )}
    </div>
  );
}
