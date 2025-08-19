import * as THREE from 'three'
import { PhysicsSystem, type ColliderShape, type PhysicsEvent, type PhysicsBody } from '../physics/physics-system'
import type { WorldObject, PhysicsInteractions } from './object-system/types'

export class PhysicsObjectManager {
  private physicsSystem: PhysicsSystem
  private physicsObjects = new Map<string, WorldObject>()
  private eventHandlers = new Map<string, (event: PhysicsEvent) => void>()

  constructor(physicsSystem: PhysicsSystem) {
    this.physicsSystem = physicsSystem
    this.setupPhysicsEventHandlers()
  }

  private setupPhysicsEventHandlers() {
    this.physicsSystem.addEventListener((event: PhysicsEvent) => {
      this.handlePhysicsEvent(event)
    })
  }

  private handlePhysicsEvent(event: PhysicsEvent) {
    const objA = this.physicsObjects.get(event.bodyA.id)
    const objB = this.physicsObjects.get(event.bodyB.id)

    if (!objA || !objB) return

    const physicsA = objA.config.interactions?.physics
    const physicsB = objB.config.interactions?.physics

    switch (event.type) {
      case 'collision':
        if (physicsA?.onCollisionStart) {
          physicsA.onCollisionStart(objB, event.impulse)
        }
        if (physicsB?.onCollisionStart) {
          physicsB.onCollisionStart(objA, event.impulse)
        }
        break

      case 'trigger':
        if (physicsA?.onTriggerEnter) {
          physicsA.onTriggerEnter(objB)
        }
        if (physicsB?.onTriggerEnter) {
          physicsB.onTriggerEnter(objA)
        }
        break
    }
  }

  addPhysicsObject(object: WorldObject): boolean {
    const physics = object.config.interactions?.physics
    if (!physics?.enabled || !object.mesh) {
      return false
    }

    try {
      // 물리 바디 생성
      const shape = this.getColliderShapeFromMesh(object.mesh, physics.shape)
      const physicsBody = this.physicsSystem.createRigidBody(
        object.id,
        object.mesh,
        shape,
        physics.type || 'dynamic',
        {
          mass: physics.mass,
          friction: physics.friction,
          restitution: physics.restitution,
          density: physics.density,
          isSensor: physics.isSensor,
          userData: object
        }
      )

      if (physicsBody) {
        object.physicsBody = physicsBody
        this.physicsObjects.set(object.id, object)
        
        console.log(`✅ Added physics to object: ${object.metadata.name}`)
        return true
      }
    } catch (error) {
      console.error(`❌ Failed to add physics to object ${object.id}:`, error)
    }

    return false
  }

  removePhysicsObject(objectId: string): boolean {
    const success = this.physicsSystem.removeRigidBody(objectId)
    if (success) {
      this.physicsObjects.delete(objectId)
      console.log(`🗑️ Removed physics from object: ${objectId}`)
    }
    return success
  }

  updatePhysicsObject(object: WorldObject): void {
    if (!object.physicsBody || !object.mesh) return

    // 물리 바디와 메시 위치 동기화
    const body = object.physicsBody
    if (body.type !== 'static') {
      const position = body.rigidBody.translation()
      const rotation = body.rigidBody.rotation()
      
      // Update object properties and mesh from physics
      object.properties.position.set(position.x, position.y, position.z)
      object.properties.rotation.setFromQuaternion(
        new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
      )
      
      // Update mesh transform
      object.mesh.position.set(position.x, position.y, position.z)
      object.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
    } else {
      // Static 바디는 메시 위치를 물리 바디에 반영
      const pos = object.properties.position
      const rot = object.mesh.quaternion
      
      body.rigidBody.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true)
      body.rigidBody.setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w }, true)
    }
  }

  applyForce(objectId: string, force: THREE.Vector3, point?: THREE.Vector3): boolean {
    return this.physicsSystem.applyForce(objectId, force, point)
  }

  applyImpulse(objectId: string, impulse: THREE.Vector3, point?: THREE.Vector3): boolean {
    return this.physicsSystem.applyImpulse(objectId, impulse, point)
  }

  setVelocity(objectId: string, velocity: THREE.Vector3): boolean {
    return this.physicsSystem.setVelocity(objectId, velocity)
  }

  // 메시로부터 적절한 콜라이더 형태 생성
  private getColliderShapeFromMesh(mesh: THREE.Mesh | THREE.Group, customShape?: ColliderShape): ColliderShape {
    if (customShape) {
      return customShape
    }

    // 메시의 지오메트리를 분석하여 적절한 콜라이더 결정
    let geometry: THREE.BufferGeometry | null = null

    if (mesh instanceof THREE.Mesh) {
      geometry = mesh.geometry
    } else if (mesh instanceof THREE.Group && mesh.children.length > 0) {
      const firstChild = mesh.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh
      if (firstChild) {
        geometry = firstChild.geometry
      }
    }

    if (!geometry) {
      // 기본값: 단위 박스
      return { type: 'box', size: new THREE.Vector3(1, 1, 1) }
    }

    // 바운딩 박스 계산
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox!
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // 지오메트리 타입에 따른 콜라이더 선택
    if (geometry instanceof THREE.BoxGeometry) {
      return { type: 'box', size }
    } else if (geometry instanceof THREE.SphereGeometry) {
      const radius = Math.max(size.x, size.y, size.z) / 2
      return { type: 'sphere', radius }
    } else if (geometry instanceof THREE.CylinderGeometry) {
      return { type: 'cylinder', radius: size.x / 2, height: size.y }
    } else if (geometry instanceof THREE.ConeGeometry) {
      return { type: 'cone', radius: size.x / 2, height: size.y }
    } else {
      // 복잡한 지오메트리는 convex hull 사용
      const positions = geometry.attributes.position?.array
      if (positions) {
        return { type: 'convex', vertices: new Float32Array(positions) }
      }
      
      // 최후의 수단: 박스
      return { type: 'box', size }
    }
  }

  // 물리 활성화된 오브젝트 가져오기
  getPhysicsObjects(): WorldObject[] {
    return Array.from(this.physicsObjects.values())
  }

  // 물리 오브젝트 개수
  getPhysicsObjectCount(): number {
    return this.physicsObjects.size
  }

  // 디버그 정보
  getDebugInfo(): {
    objectCount: number
    physicsSystemInfo: any
  } {
    return {
      objectCount: this.physicsObjects.size,
      physicsSystemInfo: this.physicsSystem.getDebugInfo()
    }
  }

  // 모든 물리 오브젝트 제거
  clear(): void {
    const objectIds = Array.from(this.physicsObjects.keys())
    objectIds.forEach(id => this.removePhysicsObject(id))
  }

  // 물리 오브젝트 일괄 업데이트
  updateAll(): void {
    this.physicsObjects.forEach(object => {
      this.updatePhysicsObject(object)
    })
  }

  // 특정 타입의 물리 오브젝트만 가져오기
  getPhysicsObjectsByType(type: 'static' | 'dynamic' | 'kinematic'): WorldObject[] {
    return Array.from(this.physicsObjects.values()).filter(obj => 
      obj.config.interactions?.physics?.type === type
    )
  }
}