'use client'

import React, { useEffect, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Plane } from '@react-three/drei'
import { PhysicsSystem } from '@/lib/physics/physics-system'
import { PhysicsObjectManager } from '@/lib/world-builder/physics-object-manager'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Simple physics demo scene
function PhysicsDemo() {
  const { scene } = useThree()
  const [physicsSystem, setPhysicsSystem] = useState<PhysicsSystem | null>(null)
  const [physicsManager, setPhysicsManager] = useState<PhysicsObjectManager | null>(null)
  const [isPhysicsReady, setIsPhysicsReady] = useState(false)
  const objectsRef = React.useRef<any[]>([])

  // Initialize physics
  useEffect(() => {
    const initPhysics = async () => {
      try {
        const physics = new PhysicsSystem({
          gravity: new THREE.Vector3(0, -9.81, 0),
          enableCCD: true
        })
        
        await physics.initialize()
        const manager = new PhysicsObjectManager(physics)
        
        setPhysicsSystem(physics)
        setPhysicsManager(manager)
        setIsPhysicsReady(true)
        
        console.log('✅ Physics initialized for demo')
      } catch (error) {
        console.error('❌ Failed to initialize physics:', error)
      }
    }

    initPhysics()

    return () => {
      if (physicsSystem) {
        physicsSystem.dispose()
      }
    }
  }, [])

  // Create test objects
  useEffect(() => {
    if (!isPhysicsReady || !physicsManager) return

    // Clear previous objects
    objectsRef.current.forEach(obj => {
      if (obj.mesh) scene.remove(obj.mesh)
    })
    objectsRef.current = []

    // Create ground
    const groundMesh = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.5, 20),
      new THREE.MeshStandardMaterial({ color: 0x808080 })
    )
    groundMesh.position.y = -0.25
    scene.add(groundMesh)

    const ground = {
      id: 'ground',
      metadata: { id: 'ground', type: 'ground', name: 'Ground', category: 'basic' as any, icon: '🟫' },
      properties: {
        position: groundMesh.position.clone(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1)
      },
      config: {
        interactions: {
          physics: {
            enabled: true,
            type: 'static' as const,
            shape: { type: 'box' as const, size: new THREE.Vector3(20, 0.5, 20) }
          }
        }
      },
      mesh: groundMesh
    }
    physicsManager.addPhysicsObject(ground as any)
    objectsRef.current.push(ground)

    // Create falling boxes
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
    for (let i = 0; i < 5; i++) {
      const boxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: colors[i] })
      )
      boxMesh.position.set(
        (Math.random() - 0.5) * 5,
        5 + i * 2,
        (Math.random() - 0.5) * 5
      )
      scene.add(boxMesh)

      const box = {
        id: `box-${i}`,
        metadata: { id: `box-${i}`, type: 'box', name: `Box ${i}`, category: 'basic' as any, icon: '📦' },
        properties: {
          position: boxMesh.position.clone(),
          rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ),
          scale: new THREE.Vector3(1, 1, 1)
        },
        config: {
          interactions: {
            physics: {
              enabled: true,
              type: 'dynamic' as const,
              mass: 1,
              friction: 0.5,
              restitution: 0.3,
              shape: { type: 'box' as const, size: new THREE.Vector3(1, 1, 1) }
            }
          }
        },
        mesh: boxMesh
      }
      physicsManager.addPhysicsObject(box as any)
      objectsRef.current.push(box)
    }

    // Create bouncing balls
    for (let i = 0; i < 3; i++) {
      const sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 16),
        new THREE.MeshStandardMaterial({ color: 0x00ffff })
      )
      sphereMesh.position.set(
        (Math.random() - 0.5) * 3,
        10 + i * 2,
        (Math.random() - 0.5) * 3
      )
      scene.add(sphereMesh)

      const sphere = {
        id: `sphere-${i}`,
        metadata: { id: `sphere-${i}`, type: 'sphere', name: `Ball ${i}`, category: 'basic' as any, icon: '⚪' },
        properties: {
          position: sphereMesh.position.clone(),
          rotation: new THREE.Euler(),
          scale: new THREE.Vector3(1, 1, 1)
        },
        config: {
          interactions: {
            physics: {
              enabled: true,
              type: 'dynamic' as const,
              mass: 0.5,
              friction: 0.2,
              restitution: 0.8, // High bounce!
              shape: { type: 'sphere' as const, radius: 0.5 }
            }
          }
        },
        mesh: sphereMesh
      }
      physicsManager.addPhysicsObject(sphere as any)
      objectsRef.current.push(sphere)
    }

  }, [isPhysicsReady, scene, physicsManager])

  // Physics simulation loop
  useFrame((state, deltaTime) => {
    if (!physicsSystem || !physicsManager) return

    // Step physics
    physicsSystem.step(deltaTime)
    
    // Update all physics objects
    physicsManager.updateAll()
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <OrbitControls />
    </>
  )
}

export default function TestPhysicsDemoPage() {
  const [showDemo, setShowDemo] = useState(true)

  return (
    <div className="h-screen bg-gray-100">
      <div className="p-4">
        <Card className="max-w-2xl mx-auto mb-4">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">🔬 물리 엔진 테스트 데모</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">테스트 시나리오:</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>🟥🟩🟦 색상 박스들이 중력에 의해 떨어집니다</li>
                  <li>⚪ 파란 공들은 높은 탄성으로 튀어오릅니다</li>
                  <li>🟫 회색 바닥은 정적 물체로 충돌을 처리합니다</li>
                  <li>각 오브젝트는 서로 다른 물리 속성을 가집니다</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">예상 동작:</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>박스들이 떨어지면서 회전하고 바닥에 충돌합니다</li>
                  <li>공들은 바닥에 부딪히면 높이 튀어오릅니다</li>
                  <li>오브젝트들이 서로 충돌하며 상호작용합니다</li>
                  <li>물리 시뮬레이션이 60 FPS로 부드럽게 동작합니다</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowDemo(false)} 
                  disabled={!showDemo}
                  variant="outline"
                >
                  데모 중지
                </Button>
                <Button 
                  onClick={() => {
                    setShowDemo(false)
                    setTimeout(() => setShowDemo(true), 100)
                  }}
                >
                  데모 재시작
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {showDemo && (
          <div className="h-[calc(100vh-250px)] rounded-lg overflow-hidden shadow-lg bg-white">
            <Canvas 
              shadows 
              camera={{ position: [10, 10, 10], fov: 60 }}
            >
              <PhysicsDemo />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}