import * as THREE from 'three'

export interface WorldObject {
  id: string
  type: ObjectType
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  metadata?: any
}

export enum ObjectType {
  TREE = 'tree',
  BUILDING = 'building',
  ROCK = 'rock',
  BENCH = 'bench',
  LAMP = 'lamp',
  FOUNTAIN = 'fountain',
  CUSTOM = 'custom'
}

export interface ObjectTemplate {
  type: ObjectType
  name: string
  icon: string
  createGeometry: () => THREE.BufferGeometry
  createMaterial: () => THREE.Material | THREE.Material[]
  createMesh?: () => THREE.Mesh | THREE.Group
  defaultScale?: THREE.Vector3
  category: 'nature' | 'structure' | 'decoration'
}

export const OBJECT_TEMPLATES: ObjectTemplate[] = [
  {
    type: ObjectType.TREE,
    name: 'Tree',
    icon: '🌳',
    category: 'nature',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.ConeGeometry(2, 6, 8),
    createMaterial: () => new THREE.MeshStandardMaterial({ color: 0x228B22 }),
    createMesh: () => {
      const group = new THREE.Group()
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 2
      group.add(trunk)
      
      // Leaves
      const leavesGeo = new THREE.SphereGeometry(2, 8, 6)
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 })
      const leaves = new THREE.Mesh(leavesGeo, leavesMat)
      leaves.position.y = 5
      group.add(leaves)
      
      return group
    }
  },
  {
    type: ObjectType.BUILDING,
    name: 'Building',
    icon: '🏢',
    category: 'structure',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.BoxGeometry(5, 10, 5),
    createMaterial: () => new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      metalness: 0.5,
      roughness: 0.5
    })
  },
  {
    type: ObjectType.ROCK,
    name: 'Rock',
    icon: '🪨',
    category: 'nature',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.DodecahedronGeometry(1.5, 0),
    createMaterial: () => new THREE.MeshStandardMaterial({ 
      color: 0x696969,
      roughness: 0.8
    })
  },
  {
    type: ObjectType.BENCH,
    name: 'Bench',
    icon: '🪑',
    category: 'decoration',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.BoxGeometry(3, 1, 1),
    createMaterial: () => new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.7
    }),
    createMesh: () => {
      const group = new THREE.Group()
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7
      })
      
      // Seat
      const seatGeo = new THREE.BoxGeometry(3, 0.2, 1)
      const seat = new THREE.Mesh(seatGeo, material)
      seat.position.y = 1
      group.add(seat)
      
      // Legs
      const legGeo = new THREE.BoxGeometry(0.2, 1, 0.2)
      const leg1 = new THREE.Mesh(legGeo, material)
      leg1.position.set(-1.3, 0.5, -0.3)
      group.add(leg1)
      
      const leg2 = new THREE.Mesh(legGeo, material)
      leg2.position.set(1.3, 0.5, -0.3)
      group.add(leg2)
      
      const leg3 = new THREE.Mesh(legGeo, material)
      leg3.position.set(-1.3, 0.5, 0.3)
      group.add(leg3)
      
      const leg4 = new THREE.Mesh(legGeo, material)
      leg4.position.set(1.3, 0.5, 0.3)
      group.add(leg4)
      
      return group
    }
  },
  {
    type: ObjectType.LAMP,
    name: 'Street Lamp',
    icon: '💡',
    category: 'decoration',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.CylinderGeometry(0.3, 0.3, 6, 8),
    createMaterial: () => new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      emissive: 0xFFFF00,
      emissiveIntensity: 0.3
    }),
    createMesh: () => {
      const group = new THREE.Group()
      
      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 5, 8)
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const pole = new THREE.Mesh(poleGeo, poleMat)
      pole.position.y = 2.5
      group.add(pole)
      
      // Light housing
      const lightGeo = new THREE.SphereGeometry(0.5, 8, 6)
      const lightMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF00,
        emissive: 0xFFFF00,
        emissiveIntensity: 0.5
      })
      const light = new THREE.Mesh(lightGeo, lightMat)
      light.position.y = 5.5
      group.add(light)
      
      return group
    }
  },
  {
    type: ObjectType.FOUNTAIN,
    name: 'Fountain',
    icon: '⛲',
    category: 'decoration',
    defaultScale: new THREE.Vector3(1, 1, 1),
    createGeometry: () => new THREE.CylinderGeometry(3, 3, 1, 16),
    createMaterial: () => new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      metalness: 0.3,
      roughness: 0.3
    })
  }
]

export function createWorldObject(template: ObjectTemplate, position: THREE.Vector3): THREE.Mesh | THREE.Group {
  if (template.createMesh) {
    const mesh = template.createMesh()
    mesh.position.copy(position)
    if (template.defaultScale) {
      mesh.scale.copy(template.defaultScale)
    }
    
    // Set shadows for all meshes in the group
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    console.log(`Created ${template.type}:`, {
      type: mesh.type,
      isGroup: mesh instanceof THREE.Group,
      isMesh: mesh instanceof THREE.Mesh,
      childrenCount: mesh instanceof THREE.Group ? mesh.children.length : 0
    })
    
    return mesh
  }
  
  // Fallback to old method
  const geometry = template.createGeometry()
  const material = template.createMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  
  mesh.position.copy(position)
  if (template.defaultScale) {
    mesh.scale.copy(template.defaultScale)
  }
  
  mesh.castShadow = true
  mesh.receiveShadow = true
  
  return mesh
}