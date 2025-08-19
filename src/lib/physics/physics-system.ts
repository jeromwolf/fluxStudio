import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsDebug } from './physics-debug'

// 물리 시스템 이벤트 타입
export interface PhysicsEvent {
  type: 'collision' | 'trigger' | 'contact'
  bodyA: PhysicsBody
  bodyB: PhysicsBody
  impulse?: number
  normal?: THREE.Vector3
}

// 물리 바디 정보
export interface PhysicsBody {
  id: string
  rigidBody: RAPIER.RigidBody
  collider: RAPIER.Collider
  mesh: THREE.Mesh | THREE.Group
  type: 'static' | 'dynamic' | 'kinematic'
  mass?: number
  friction?: number
  restitution?: number
  userData?: any
}

// 물리 설정
export interface PhysicsWorldSettings {
  gravity: THREE.Vector3
  timeStep: number
  enableSleep: boolean
  enableCCD: boolean // Continuous Collision Detection
  maxVelocityIterations: number
  maxPositionIterations: number
}

// 충돌 모양 타입
export type ColliderShape = 
  | { type: 'box'; size: THREE.Vector3 }
  | { type: 'sphere'; radius: number }
  | { type: 'cylinder'; radius: number; height: number }
  | { type: 'cone'; radius: number; height: number }
  | { type: 'capsule'; radius: number; height: number }
  | { type: 'trimesh'; vertices: Float32Array; indices: Uint32Array }
  | { type: 'convex'; vertices: Float32Array }

export class PhysicsSystem {
  private world: RAPIER.World | null = null
  private eventQueue: RAPIER.EventQueue | null = null
  private bodies: Map<string, PhysicsBody> = new Map()
  private eventListeners: ((event: PhysicsEvent) => void)[] = []
  private isInitialized = false
  private settings: PhysicsWorldSettings
  
  constructor(settings?: Partial<PhysicsWorldSettings>) {
    this.settings = {
      gravity: new THREE.Vector3(0, -9.81, 0),
      timeStep: 1.0 / 60.0,
      enableSleep: true,
      enableCCD: true,
      maxVelocityIterations: 4,
      maxPositionIterations: 1,
      ...settings
    }
  }

  // 물리 시스템 초기화
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await RAPIER.init()
      
      // 물리 월드 생성
      const gravity = new RAPIER.Vector3(
        this.settings.gravity.x,
        this.settings.gravity.y,
        this.settings.gravity.z
      )
      this.world = new RAPIER.World(gravity)
      
      // 이벤트 큐 생성
      this.eventQueue = new RAPIER.EventQueue(true)
      
      // 물리 월드 설정
      this.world.timestep = this.settings.timeStep
      this.world.maxVelocityIterations = this.settings.maxVelocityIterations
      this.world.maxPositionIterations = this.settings.maxPositionIterations
      
      this.isInitialized = true
      PhysicsDebug.success('Physics system initialized with Rapier')
      PhysicsDebug.info('Settings:', this.settings)
    } catch (error) {
      PhysicsDebug.error('Failed to initialize physics system:', error)
      throw error
    }
  }

  // 물리 시스템 정리
  dispose(): void {
    if (this.world) {
      this.world.free()
      this.world = null
    }
    if (this.eventQueue) {
      this.eventQueue.free()
      this.eventQueue = null
    }
    this.bodies.clear()
    this.eventListeners = []
    this.isInitialized = false
    console.log('🧹 Physics system disposed')
  }

  // 물리 바디 생성
  createRigidBody(
    id: string,
    mesh: THREE.Mesh | THREE.Group,
    shape: ColliderShape,
    type: 'static' | 'dynamic' | 'kinematic' = 'dynamic',
    options: {
      mass?: number
      friction?: number
      restitution?: number
      density?: number
      isSensor?: boolean
      userData?: any
    } = {}
  ): PhysicsBody | null {
    if (!this.world) {
      console.error('❌ Physics world not initialized')
      return null
    }

    if (this.bodies.has(id)) {
      console.warn(`⚠️ Physics body with ID "${id}" already exists`)
      return this.bodies.get(id)!
    }

    try {
      // 리지드 바디 타입 설정
      let rigidBodyDesc: RAPIER.RigidBodyDesc
      switch (type) {
        case 'static':
          rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
          break
        case 'kinematic':
          rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
          break
        default:
          rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      }

      // 위치와 회전 설정
      const position = mesh.position
      const quaternion = mesh.quaternion
      rigidBodyDesc.setTranslation(position.x, position.y, position.z)
      rigidBodyDesc.setRotation({ x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w })

      // 잠금 설정 (필요시)
      if (type === 'kinematic') {
        rigidBodyDesc.setCanSleep(false)
      }

      // 리지드 바디 생성
      const rigidBody = this.world.createRigidBody(rigidBodyDesc)

      // 콜라이더 생성
      const colliderDesc = this.createColliderDesc(shape, options)
      const collider = this.world.createCollider(colliderDesc, rigidBody)

      // 물리 바디 객체 생성
      const physicsBody: PhysicsBody = {
        id,
        rigidBody,
        collider,
        mesh,
        type,
        mass: options.mass,
        friction: options.friction,
        restitution: options.restitution,
        userData: options.userData
      }

      this.bodies.set(id, physicsBody)
      console.log(`✅ Created ${type} physics body: ${id}`)
      
      return physicsBody
    } catch (error) {
      console.error(`❌ Failed to create physics body "${id}":`, error)
      return null
    }
  }

  // 콜라이더 형태 생성
  private createColliderDesc(shape: ColliderShape, options: any): RAPIER.ColliderDesc {
    let colliderDesc: RAPIER.ColliderDesc

    switch (shape.type) {
      case 'box':
        colliderDesc = RAPIER.ColliderDesc.cuboid(
          shape.size.x / 2,
          shape.size.y / 2,
          shape.size.z / 2
        )
        break
      case 'sphere':
        colliderDesc = RAPIER.ColliderDesc.ball(shape.radius)
        break
      case 'cylinder':
        colliderDesc = RAPIER.ColliderDesc.cylinder(shape.height / 2, shape.radius)
        break
      case 'cone':
        colliderDesc = RAPIER.ColliderDesc.cone(shape.height / 2, shape.radius)
        break
      case 'capsule':
        colliderDesc = RAPIER.ColliderDesc.capsule(shape.height / 2, shape.radius)
        break
      case 'trimesh':
        colliderDesc = RAPIER.ColliderDesc.trimesh(shape.vertices, shape.indices)
        break
      case 'convex':
        colliderDesc = RAPIER.ColliderDesc.convexHull(shape.vertices)!
        break
      default:
        throw new Error(`Unsupported collider shape: ${(shape as any).type}`)
    }

    // 물리 속성 설정
    if (options.friction !== undefined) {
      colliderDesc.setFriction(options.friction)
    }
    if (options.restitution !== undefined) {
      colliderDesc.setRestitution(options.restitution)
    }
    if (options.density !== undefined) {
      colliderDesc.setDensity(options.density)
    }
    if (options.isSensor) {
      colliderDesc.setSensor(true)
    }

    return colliderDesc
  }

  // 물리 바디 제거
  removeRigidBody(id: string): boolean {
    const body = this.bodies.get(id)
    if (!body || !this.world) return false

    try {
      this.world.removeRigidBody(body.rigidBody)
      this.bodies.delete(id)
      console.log(`🗑️ Removed physics body: ${id}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to remove physics body "${id}":`, error)
      return false
    }
  }

  // 물리 바디 가져오기
  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id)
  }

  // 모든 물리 바디 가져오기
  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values())
  }

  // 물리 시뮬레이션 단계 실행
  step(deltaTime?: number): void {
    if (!this.world || !this.eventQueue) return

    const dt = deltaTime || this.settings.timeStep
    
    // 물리 시뮬레이션 실행
    this.world.timestep = dt
    this.world.step(this.eventQueue)
    
    // Three.js 메시 위치/회전 동기화
    this.syncMeshes()
    
    // 물리 이벤트 처리
    this.processEvents()
  }

  // Three.js 메시와 물리 바디 동기화
  private syncMeshes(): void {
    this.bodies.forEach((body) => {
      if (body.type === 'static') return // 정적 바디는 동기화 불필요
      
      const position = body.rigidBody.translation()
      const rotation = body.rigidBody.rotation()
      
      // 위치 동기화
      body.mesh.position.set(position.x, position.y, position.z)
      
      // 회전 동기화
      body.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
    })
  }

  // 물리 이벤트 처리
  private processEvents(): void {
    if (!this.eventQueue) return

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const body1 = this.findBodyByColliderHandle(handle1)
      const body2 = this.findBodyByColliderHandle(handle2)
      
      if (body1 && body2) {
        const event: PhysicsEvent = {
          type: 'collision',
          bodyA: body1,
          bodyB: body2
        }
        
        this.emitEvent(event)
      }
    })

    this.eventQueue.drainContactForceEvents((event) => {
      const body1 = this.findBodyByColliderHandle(event.collider1())
      const body2 = this.findBodyByColliderHandle(event.collider2())
      
      if (body1 && body2) {
        const physicsEvent: PhysicsEvent = {
          type: 'contact',
          bodyA: body1,
          bodyB: body2,
          impulse: event.totalForceMagnitude()
        }
        
        this.emitEvent(physicsEvent)
      }
    })
  }

  // 콜라이더 핸들로 바디 찾기
  private findBodyByColliderHandle(handle: number): PhysicsBody | null {
    for (const body of this.bodies.values()) {
      if (body.collider.handle === handle) {
        return body
      }
    }
    return null
  }

  // 이벤트 발생
  private emitEvent(event: PhysicsEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('❌ Error in physics event listener:', error)
      }
    })
  }

  // 이벤트 리스너 추가
  addEventListener(listener: (event: PhysicsEvent) => void): void {
    this.eventListeners.push(listener)
  }

  // 이벤트 리스너 제거
  removeEventListener(listener: (event: PhysicsEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  // 물리 바디에 힘 적용
  applyForce(id: string, force: THREE.Vector3, point?: THREE.Vector3): boolean {
    const body = this.bodies.get(id)
    if (!body || body.type === 'static') return false

    const forceVector = new RAPIER.Vector3(force.x, force.y, force.z)
    
    if (point) {
      const pointVector = new RAPIER.Vector3(point.x, point.y, point.z)
      body.rigidBody.addForceAtPoint(forceVector, pointVector, true)
    } else {
      body.rigidBody.addForce(forceVector, true)
    }
    
    return true
  }

  // 물리 바디에 임펄스 적용
  applyImpulse(id: string, impulse: THREE.Vector3, point?: THREE.Vector3): boolean {
    const body = this.bodies.get(id)
    if (!body || body.type === 'static') return false

    const impulseVector = new RAPIER.Vector3(impulse.x, impulse.y, impulse.z)
    
    if (point) {
      const pointVector = new RAPIER.Vector3(point.x, point.y, point.z)
      body.rigidBody.applyImpulseAtPoint(impulseVector, pointVector, true)
    } else {
      body.rigidBody.applyImpulse(impulseVector, true)
    }
    
    return true
  }

  // 물리 바디 속도 설정
  setVelocity(id: string, velocity: THREE.Vector3): boolean {
    const body = this.bodies.get(id)
    if (!body || body.type === 'static') return false

    const velocityVector = new RAPIER.Vector3(velocity.x, velocity.y, velocity.z)
    body.rigidBody.setLinvel(velocityVector, true)
    
    return true
  }

  // 물리 바디 각속도 설정
  setAngularVelocity(id: string, angularVelocity: THREE.Vector3): boolean {
    const body = this.bodies.get(id)
    if (!body || body.type === 'static') return false

    const angularVelocityVector = new RAPIER.Vector3(angularVelocity.x, angularVelocity.y, angularVelocity.z)
    body.rigidBody.setAngvel(angularVelocityVector, true)
    
    return true
  }

  // 중력 설정
  setGravity(gravity: THREE.Vector3): void {
    if (!this.world) return
    
    const gravityVector = new RAPIER.Vector3(gravity.x, gravity.y, gravity.z)
    this.world.gravity = gravityVector
    this.settings.gravity = gravity.clone()
  }

  // 물리 시스템 일시정지/재개
  setPaused(paused: boolean): void {
    // Rapier에는 직접적인 일시정지 기능이 없으므로 step 호출을 제어
    // 이는 상위 컴포넌트에서 관리해야 함
  }

  // 디버그 정보 가져오기
  getDebugInfo(): {
    bodyCount: number
    isInitialized: boolean
    settings: PhysicsWorldSettings
  } {
    return {
      bodyCount: this.bodies.size,
      isInitialized: this.isInitialized,
      settings: { ...this.settings }
    }
  }

  // 레이캐스팅
  raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
    solid = true
  ): {
    hit: boolean
    body?: PhysicsBody
    point?: THREE.Vector3
    normal?: THREE.Vector3
    distance?: number
  } {
    if (!this.world) {
      return { hit: false }
    }

    const ray = new RAPIER.Ray(
      { x: origin.x, y: origin.y, z: origin.z },
      { x: direction.x, y: direction.y, z: direction.z }
    )

    const hit = this.world.castRay(ray, maxDistance, solid)
    
    if (hit) {
      const hitPoint = ray.pointAt(hit.toi)
      const collider = this.world.getCollider(hit.collider)
      const body = this.findBodyByColliderHandle(hit.collider)
      
      return {
        hit: true,
        body,
        point: new THREE.Vector3(hitPoint.x, hitPoint.y, hitPoint.z),
        normal: new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z),
        distance: hit.toi
      }
    }

    return { hit: false }
  }
}