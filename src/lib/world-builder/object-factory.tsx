import * as THREE from 'three'
import { ObjectRegistry } from './object-system/registry'

// Factory interface for extensibility
export interface ObjectFactory {
  createGeometry(container: THREE.Group, definition: any): void
}

// Registry for object factories
const factoryRegistry = new Map<string, ObjectFactory>()

// Register a factory for a specific object type pattern
export function registerFactory(pattern: string, factory: ObjectFactory) {
  factoryRegistry.set(pattern, factory)
}

// Create a Three.js object from registry definition
export function createObjectFromDefinition(
  type: string, 
  position: THREE.Vector3
): THREE.Group {
  console.log('Creating object:', type, 'at position:', position)
  
  const registry = ObjectRegistry.getInstance()
  const definition = registry.get(type)
  
  if (!definition) {
    console.warn(`Object type ${type} not found in registry`)
    return createFallbackObject(position)
  }
  
  console.log('Found definition:', definition.metadata.name)
  console.log('Available factories:', Array.from(factoryRegistry.keys()))
  
  const container = new THREE.Group()
  container.position.copy(position)
  
  // Store metadata
  container.userData = {
    type: type,
    name: definition.metadata.name,
    definition: definition
  }
  
  // Find appropriate factory
  let factoryUsed = false
  for (const [pattern, factory] of factoryRegistry) {
    if (type.includes(pattern)) {
      console.log(`Type "${type}" includes pattern "${pattern}" - using factory`)
      factory.createGeometry(container, definition)
      factoryUsed = true
      break
    }
  }
  
  // Fallback if no factory found
  if (!factoryUsed) {
    console.log('No factory found for type:', type, '- using fallback geometry')
    createFallbackGeometry(container)
  }
  
  // Enable shadows
  container.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  console.log('Created container with', container.children.length, 'children')
  console.log('Container position:', container.position)
  return container
}

// Simple factories
class ChairFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const material = new THREE.MeshStandardMaterial({
      color: definition.config.materials?.default?.color || '#8B4513',
      roughness: 0.7,
      metalness: 0.1
    })
    
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.05, 0.45),
      material
    )
    seat.position.y = 0.45
    container.add(seat)
    
    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.5, 0.05),
      material
    )
    back.position.set(0, 0.7, -0.2)
    container.add(back)
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45)
    const positions = [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, material.clone())
      leg.position.set(pos[0], 0.225, pos[1])
      container.add(leg)
    })
  }
}

class BoxFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: definition.config.materials?.default?.color || '#4A90E2',
        roughness: 0.7,
        metalness: 0.3
      })
    )
    container.add(mesh)
  }
}

// Additional factories
class SphereFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 16),
      new THREE.MeshStandardMaterial({
        color: definition.config.materials?.default?.color || '#4CAF50',
        roughness: 0.7,
        metalness: 0.3
      })
    )
    container.add(mesh)
  }
}

class CylinderFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      new THREE.MeshStandardMaterial({
        color: definition.config.materials?.default?.color || '#FF6347',
        roughness: 0.7,
        metalness: 0.3
      })
    )
    container.add(mesh)
  }
}

// Castle Factory
class CastleFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const wallColor = definition.config.materials?.default?.color || '#8B7355'
    const material = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 })
    
    // Main keep
    const keep = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2.5, 2),
      material
    )
    keep.position.y = 1.25
    container.add(keep)
    
    // Corner towers
    const towerGeo = new THREE.CylinderGeometry(0.4, 0.4, 3)
    const roofGeo = new THREE.ConeGeometry(0.5, 0.8, 6)
    const roofMat = new THREE.MeshStandardMaterial({ color: '#8B4513' })
    
    const positions = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]
    positions.forEach(pos => {
      const tower = new THREE.Mesh(towerGeo, material)
      tower.position.set(pos[0], 1.5, pos[1])
      container.add(tower)
      
      const roof = new THREE.Mesh(roofGeo, roofMat)
      roof.position.set(pos[0], 3.4, pos[1])
      container.add(roof)
    })
  }
}

// Magic Circle Factory
class MagicCircleFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const circleColor = definition.config.materials?.default?.color || '#9400D3'
    const material = new THREE.MeshStandardMaterial({ 
      color: circleColor,
      emissive: circleColor,
      emissiveIntensity: 0.5
    })
    
    // Base platform
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.1),
      new THREE.MeshStandardMaterial({ color: '#1C1C1C', roughness: 0.8 })
    )
    base.position.y = 0.05
    container.add(base)
    
    // Magic ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 2, 64),
      material
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.11
    container.add(ring)
  }
}

// Crystal Factory
class CrystalFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const crystalColor = definition.config.materials?.default?.color || '#00CED1'
    const material = new THREE.MeshStandardMaterial({ 
      color: crystalColor,
      emissive: crystalColor,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    })
    
    // Base rock
    const base = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6, 0),
      new THREE.MeshStandardMaterial({ color: '#2F4F4F', roughness: 0.9 })
    )
    base.position.y = -0.2
    container.add(base)
    
    // Crystal
    const crystal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.1, 1.5, 6),
      material
    )
    crystal.position.y = 0.5
    container.add(crystal)
    
    // Crystal tip
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.5, 6),
      material
    )
    tip.position.y = 1.25
    container.add(tip)
  }
}

// Dragon Egg Factory
class DragonEggFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const eggColor = definition.config.materials?.default?.color || '#8B0000'
    
    // Nest
    const nest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1, 0.3),
      new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.9 })
    )
    nest.position.y = 0.15
    container.add(nest)
    
    // Egg
    const egg = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 24),
      new THREE.MeshStandardMaterial({ 
        color: eggColor,
        roughness: 0.3,
        metalness: 0.2
      })
    )
    egg.position.y = 0.8
    egg.scale.y = 1.4
    container.add(egg)
  }
}

// Portal Factory
class PortalFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const portalColor = '#00FFFF'
    
    // Portal frame
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.2, 8, 32),
      new THREE.MeshStandardMaterial({ color: '#444444', metalness: 0.9 })
    )
    container.add(ring)
    
    // Portal surface
    const portal = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 32),
      new THREE.MeshStandardMaterial({ 
        color: portalColor, 
        emissive: portalColor, 
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
      })
    )
    container.add(portal)
    
    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.2, 3),
      new THREE.MeshStandardMaterial({ color: '#444444', metalness: 0.7 })
    )
    base.position.y = -2
    container.add(base)
  }
}

// Hologram Factory
class HologramFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const hologramColor = '#00FF00'
    
    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.2),
      new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.8 })
    )
    base.position.y = 0.1
    container.add(base)
    
    // Hologram projection
    const hologram = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: hologramColor,
        emissive: hologramColor,
        emissiveIntensity: 0.5,
        wireframe: true
      })
    )
    hologram.position.y = 1.5
    container.add(hologram)
  }
}

// Robot Factory
class RobotFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const bodyColor = '#808080'
    const material = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7 })
    
    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.5), material)
    body.position.y = 1
    container.add(body)
    
    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.4), material)
    head.position.y = 1.75
    container.add(head)
    
    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ 
      color: '#FF0000', 
      emissive: '#FF0000', 
      emissiveIntensity: 0.5 
    })
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.15, 1.8, 0.21)
    container.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.15, 1.8, 0.21)
    container.add(rightEye)
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2)
    const leftLeg = new THREE.Mesh(legGeo, material)
    leftLeg.position.set(-0.25, 0.25, 0)
    container.add(leftLeg)
    const rightLeg = new THREE.Mesh(legGeo, material)
    rightLeg.position.set(0.25, 0.25, 0)
    container.add(rightLeg)
  }
}

// Tree Factory
class TreeFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 2),
      new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.8 })
    )
    trunk.position.y = 1
    container.add(trunk)
    
    // Leaves
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 3, 8),
      new THREE.MeshStandardMaterial({ color: '#228B22' })
    )
    leaves.position.y = 3
    container.add(leaves)
  }
}

// Rock Factory
class RockFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8, 0),
      new THREE.MeshStandardMaterial({ 
        color: '#808080', 
        roughness: 0.9,
        metalness: 0
      })
    )
    rock.position.y = 0.4
    container.add(rock)
  }
}

// Roller Coaster Factory
class RollerCoasterFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const trackColor = '#FF0000'
    
    // Track loop
    const track = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.15, 8, 32),
      new THREE.MeshStandardMaterial({ color: trackColor })
    )
    track.position.y = 2
    container.add(track)
    
    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.1, 0.1, 4)
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#333333' })
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(Math.cos(angle) * 2, 2, Math.sin(angle) * 2)
      container.add(pillar)
    }
  }
}

// Ferris Wheel Factory
class FerrisWheelFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    // Wheel
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.1, 8, 32),
      new THREE.MeshStandardMaterial({ color: '#4169E1', metalness: 0.7 })
    )
    wheel.position.y = 3
    container.add(wheel)
    
    // Support
    const support = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 3),
      new THREE.MeshStandardMaterial({ color: '#333333' })
    )
    support.position.y = 1.5
    container.add(support)
    
    // Cabins (simplified)
    const cabinGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3)
    const cabinMat = new THREE.MeshStandardMaterial({ color: '#FF0000' })
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const cabin = new THREE.Mesh(cabinGeo, cabinMat)
      cabin.position.set(Math.cos(angle) * 2, 3 + Math.sin(angle) * 2, 0)
      container.add(cabin)
    }
  }
}

// Carousel Factory
class CarouselFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    // Platform
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 0.2),
      new THREE.MeshStandardMaterial({ color: '#8B4513' })
    )
    platform.position.y = 0.5
    container.add(platform)
    
    // Central pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 3.5),
      new THREE.MeshStandardMaterial({ color: '#FFD700', metalness: 0.8 })
    )
    pole.position.y = 1.75
    container.add(pole)
    
    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: '#FF1493' })
    )
    roof.position.y = 3.5
    container.add(roof)
  }
}

// Bumper Cars Factory
class BumperCarsFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    // Arena floor
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.1),
      new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.3 })
    )
    floor.position.y = 0.05
    container.add(floor)
    
    // Border
    const border = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.2, 8, 32),
      new THREE.MeshStandardMaterial({ color: '#FF0000' })
    )
    border.rotation.x = -Math.PI / 2
    border.position.y = 0.2
    container.add(border)
    
    // Cars (simplified)
    const carColors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00']
    carColors.forEach((color, i) => {
      const angle = (i / 4) * Math.PI * 2
      const car = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.35, 0.3),
        new THREE.MeshStandardMaterial({ color })
      )
      car.position.set(Math.cos(angle) * 1.5, 0.3, Math.sin(angle) * 1.5)
      container.add(car)
    })
  }
}

// Table Factory
class TableFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const material = new THREE.MeshStandardMaterial({ color: '#8B4513' })
    
    // Tabletop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, 0.8),
      material
    )
    top.position.y = 0.75
    container.add(top)
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75)
    const positions = [[-0.5, -0.35], [0.5, -0.35], [-0.5, 0.35], [0.5, 0.35]]
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, material)
      leg.position.set(pos[0], 0.375, pos[1])
      container.add(leg)
    })
  }
}

// Cone Factory (for basic cone shape)
class ConeShapeFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.MeshStandardMaterial({ 
        color: definition.config.materials?.default?.color || '#FFA500',
        roughness: 0.7
      })
    )
    cone.position.y = 0.5
    container.add(cone)
  }
}

// Office Chair Factory
class OfficeChairFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const material = new THREE.MeshStandardMaterial({ color: '#333333' })
    
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.5),
      material
    )
    seat.position.y = 0.5
    container.add(seat)
    
    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.05),
      material
    )
    back.position.set(0, 0.8, -0.225)
    container.add(back)
    
    // Base with wheels
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.05),
      material
    )
    base.position.y = 0.1
    container.add(base)
    
    // Center pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.4),
      material
    )
    pole.position.y = 0.3
    container.add(pole)
  }
}

// Gaming Chair Factory
class GamingChairFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const material = new THREE.MeshStandardMaterial({ color: '#FF0000' })
    const blackMat = new THREE.MeshStandardMaterial({ color: '#000000' })
    
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.5),
      material
    )
    seat.position.y = 0.5
    container.add(seat)
    
    // High back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.8, 0.08),
      material
    )
    back.position.set(0, 0.9, -0.21)
    container.add(back)
    
    // Headrest
    const headrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.2, 0.1),
      blackMat
    )
    headrest.position.set(0, 1.4, -0.21)
    container.add(headrest)
    
    // Armrests
    const armrestGeo = new THREE.BoxGeometry(0.08, 0.3, 0.3)
    const leftArm = new THREE.Mesh(armrestGeo, blackMat)
    leftArm.position.set(-0.3, 0.65, 0)
    container.add(leftArm)
    const rightArm = new THREE.Mesh(armrestGeo, blackMat)
    rightArm.position.set(0.3, 0.65, 0)
    container.add(rightArm)
  }
}

// Spaceship Factory
class SpaceshipFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const hullColor = '#C0C0C0'
    const accentColor = '#00FFFF'
    
    // Main hull (cone shape)
    const hull = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2, 8),
      new THREE.MeshStandardMaterial({ 
        color: hullColor,
        metalness: 0.8,
        roughness: 0.2
      })
    )
    hull.rotation.z = Math.PI / 2
    container.add(hull)
    
    // Cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 8),
      new THREE.MeshStandardMaterial({ 
        color: accentColor, 
        emissive: accentColor, 
        emissiveIntensity: 0.3 
      })
    )
    cockpit.position.x = -0.5
    container.add(cockpit)
    
    // Wings
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 0.6),
      new THREE.MeshStandardMaterial({ color: hullColor, metalness: 0.8 })
    )
    wing.position.z = 0.3
    container.add(wing)
    
    // Engines
    const engineGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5)
    const engineMat = new THREE.MeshStandardMaterial({ 
      color: '#FF0000', 
      emissive: '#FF0000', 
      emissiveIntensity: 0.5 
    })
    const leftEngine = new THREE.Mesh(engineGeo, engineMat)
    leftEngine.position.set(0.8, -0.7, 0)
    leftEngine.rotation.z = Math.PI / 2
    container.add(leftEngine)
    const rightEngine = new THREE.Mesh(engineGeo, engineMat)
    rightEngine.position.set(0.8, 0.7, 0)
    rightEngine.rotation.z = Math.PI / 2
    container.add(rightEngine)
  }
}

// Flower Factory
class FlowerFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const petalColor = '#FFD700'
    const centerColor = '#8B4513'
    
    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5),
      new THREE.MeshStandardMaterial({ color: '#228B22' })
    )
    stem.position.y = 0.75
    container.add(stem)
    
    // Flower center
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.1),
      new THREE.MeshStandardMaterial({ color: centerColor })
    )
    center.position.y = 1.5
    container.add(center)
    
    // Petals
    const petalGeo = new THREE.BoxGeometry(0.15, 0.1, 0.3)
    const petalMat = new THREE.MeshStandardMaterial({ color: petalColor })
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const petal = new THREE.Mesh(petalGeo, petalMat)
      petal.position.set(Math.cos(angle) * 0.25, 1.5, Math.sin(angle) * 0.25)
      petal.rotation.y = angle
      container.add(petal)
    }
  }
}

// Bush Factory
class BushFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    const bushColor = '#228B22'
    const material = new THREE.MeshStandardMaterial({ 
      color: bushColor,
      roughness: 0.9
    })
    
    // Main bush body
    const main = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 8),
      material
    )
    main.position.y = 0.4
    container.add(main)
    
    // Additional clusters
    const cluster1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6),
      material
    )
    cluster1.position.set(-0.3, 0.3, 0.2)
    container.add(cluster1)
    
    const cluster2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 6),
      material
    )
    cluster2.position.set(0.25, 0.35, -0.2)
    container.add(cluster2)
  }
}

// Register default factories
registerFactory('chair', new ChairFactory())
registerFactory('box', new BoxFactory())
registerFactory('cube', new BoxFactory())
registerFactory('sphere', new SphereFactory())
registerFactory('cylinder', new CylinderFactory())
registerFactory('cone', new ConeShapeFactory())
registerFactory('table', new TableFactory())

// Register furniture factories
registerFactory('furniture_chair_basic', new ChairFactory())
registerFactory('furniture_chair_office', new OfficeChairFactory())
registerFactory('furniture_chair_gaming', new GamingChairFactory())
registerFactory('furniture_chair_dining', new ChairFactory())
registerFactory('furniture_chair_stool', new ChairFactory())

// Register nature factories
registerFactory('nature_tree', new TreeFactory())
registerFactory('nature_rock', new RockFactory())
registerFactory('nature_flower', new FlowerFactory())
registerFactory('nature_bush', new BushFactory())

// Register amusement park factories
registerFactory('amusement_roller_coaster', new RollerCoasterFactory())
registerFactory('amusement_ferris_wheel', new FerrisWheelFactory())
registerFactory('amusement_carousel', new CarouselFactory())
registerFactory('amusement_bumper_cars', new BumperCarsFactory())

// Register sci-fi factories
registerFactory('scifi_spaceship', new SpaceshipFactory())
registerFactory('scifi_portal', new PortalFactory())
registerFactory('scifi_hologram', new HologramFactory())
registerFactory('scifi_robot', new RobotFactory())

// Register fantasy factories
registerFactory('fantasy_castle', new CastleFactory())
registerFactory('fantasy_magic_circle', new MagicCircleFactory())
registerFactory('fantasy_crystal', new CrystalFactory())
registerFactory('fantasy_dragon_egg', new DragonEggFactory())

// Debug logging
console.log('Object factories registered:', Array.from(factoryRegistry.keys()))

// Helpers
function createFallbackGeometry(container: THREE.Group) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: '#808080',
      roughness: 0.7,
      metalness: 0.3
    })
  )
  container.add(mesh)
}

function createFallbackObject(position: THREE.Vector3): THREE.Group {
  const container = new THREE.Group()
  container.position.copy(position)
  createFallbackGeometry(container)
  return container
}