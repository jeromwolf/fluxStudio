import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * Particle Universe Template
 * 은하계처럼 회전하는 파티클 시스템으로 중력과 인터랙션을 구현
 * 
 * Features:
 * - 수천 개의 파티클이 은하계처럼 회전
 * - 중력과 인력/척력 시뮬레이션
 * - 마우스 인터랙션으로 파티클 조작
 * - 별자리 형태로 연결선 생성
 */

// 파티클 타입
export type ParticleType = 'star' | 'planet' | 'asteroid' | 'comet' | 'nebula'

// 중력 모드
export type GravityMode = 'galaxy' | 'solar' | 'cluster' | 'random' | 'blackhole'

// 색상 테마
export type ColorTheme = 'cosmic' | 'aurora' | 'sunset' | 'ocean' | 'fire' | 'custom'

interface ParticleData {
  position: THREE.Vector3
  velocity: THREE.Vector3
  mass: number
  type: ParticleType
  connections: number[]
  lifespan: number
  color: THREE.Color
}

interface ParticleUniverseOptions {
  particleCount: number
  particleType: ParticleType[]
  gravityMode: GravityMode
  gravityStrength: number
  rotationSpeed: number
  colorTheme: ColorTheme
  primaryColor: string
  secondaryColor: string
  showConnections: boolean
  connectionDistance: number
  particleSize: number
  trailEffect: boolean
  interactionStrength: number
  autoRotate: boolean
}

/**
 * 파티클 유니버스 씬 생성
 */
export function createParticleUniverseScene(
  scene: THREE.Scene,
  customization: TemplateCustomization
) {
  const options = customization.options as ParticleUniverseOptions
  
  // 씬 설정 - 더 밝은 배경으로 테스트
  scene.background = new THREE.Color(0x000033) // 더 밝은 남색
  // scene.fog = new THREE.FogExp2(0x000511, 0.0003) // 일단 포그 제거
  
  // 메인 그룹
  const universeGroup = new THREE.Group()
  
  // 파티클 데이터 배열
  const particles: ParticleData[] = []
  const particleCount = options.particleCount || 3000
  
  // 색상 팔레트 생성
  const colorPalette = getColorPalette(options.colorTheme, options.primaryColor, options.secondaryColor)
  
  // 파티클 지오메트리
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  
  // 파티클 초기화
  for (let i = 0; i < particleCount; i++) {
    const particle: ParticleData = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      mass: 0.5 + Math.random() * 2,
      type: options.particleType[Math.floor(Math.random() * options.particleType.length)],
      connections: [],
      lifespan: 1,
      color: new THREE.Color()
    }
    
    // 중력 모드에 따른 초기 위치 설정
    setupInitialPosition(particle, i, particleCount, options.gravityMode)
    
    // 초기 속도 설정
    setupInitialVelocity(particle, options.gravityMode)
    
    // 색상 설정
    const colorIndex = Math.floor(Math.random() * colorPalette.length)
    particle.color = colorPalette[colorIndex].clone()
    
    // 배열에 저장
    positions[i * 3] = particle.position.x
    positions[i * 3 + 1] = particle.position.y
    positions[i * 3 + 2] = particle.position.z
    
    colors[i * 3] = particle.color.r
    colors[i * 3 + 1] = particle.color.g
    colors[i * 3 + 2] = particle.color.b
    
    sizes[i] = (options.particleSize || 1) * (2 + Math.random() * 3) // 더 큰 사이즈
    
    particles.push(particle)
  }
  
  // 파티클 시스템 생성
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  // 파티클 텍스처 생성
  const particleTexture = createParticleTexture()
  
  const material = new THREE.PointsMaterial({
    size: (options.particleSize || 1) * 5, // 크기 증가
    sizeAttenuation: true,
    map: particleTexture,
    transparent: true,
    opacity: 1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const particleSystem = new THREE.Points(geometry, material)
  universeGroup.add(particleSystem)
  
  console.log('🌌 Particle Universe 생성:', {
    particleCount,
    positions: positions.slice(0, 9), // 첫 3개 파티클 위치
    colors: colors.slice(0, 9), // 첫 3개 파티클 색상
    materialSize: material.size,
    groupChildren: universeGroup.children.length
  })
  
  // 연결선 그룹
  const connectionGroup = new THREE.Group()
  universeGroup.add(connectionGroup)
  
  // 중심 어트랙터 (옵션)
  let centralAttractor: THREE.Mesh | null = null
  if (options.gravityMode === 'blackhole') {
    const attractorGeometry = new THREE.SphereGeometry(2, 32, 32)
    const attractorMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    })
    centralAttractor = new THREE.Mesh(attractorGeometry, attractorMaterial)
    
    // 이벤트 호라이즌 효과
    const horizonGeometry = new THREE.RingGeometry(2, 4, 64)
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    const eventHorizon = new THREE.Mesh(horizonGeometry, horizonMaterial)
    centralAttractor.add(eventHorizon)
    
    universeGroup.add(centralAttractor)
  }
  
  // 배경 별들
  const starField = createStarField()
  scene.add(starField)
  
  scene.add(universeGroup)
  
  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const pointLight = new THREE.PointLight(0xffffff, 1, 100)
  pointLight.position.set(0, 0, 50)
  scene.add(pointLight)
  
  // 마우스 인터랙션을 위한 변수
  const mouse = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  let mouseForce = new THREE.Vector3()
  let isMouseDown = false
  
  // 마우스 이벤트 핸들러 (일단 비활성화)
  const handleMouseMove = (event: MouseEvent) => {
    // 마우스 인터랙션은 나중에 구현
  }
  
  const handleMouseDown = () => { isMouseDown = true }
  const handleMouseUp = () => { isMouseDown = false }
  
  // 이벤트 리스너 등록
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
  }
  
  // 애니메이션 함수
  return {
    animate: (time: number) => {
      // 옵션 업데이트
      const currentOptions = customization.options as ParticleUniverseOptions
      
      // 중력 시뮬레이션
      updateParticlePhysics(particles, currentOptions, mouseForce, isMouseDown)
      
      // 위치 업데이트
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
      const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        
        positionAttribute.setXYZ(i, particle.position.x, particle.position.y, particle.position.z)
        
        // 속도에 따른 색상 변화
        const speed = particle.velocity.length()
        const brightness = Math.min(1, 0.5 + speed * 0.1)
        colorAttribute.setXYZ(
          i,
          particle.color.r * brightness,
          particle.color.g * brightness,
          particle.color.b * brightness
        )
      }
      
      positionAttribute.needsUpdate = true
      colorAttribute.needsUpdate = true
      
      // 연결선 업데이트
      if (currentOptions.showConnections) {
        updateConnections(particles, connectionGroup, currentOptions.connectionDistance || 5)
      } else {
        connectionGroup.clear()
      }
      
      // 자동 회전
      if (currentOptions.autoRotate) {
        universeGroup.rotation.y += currentOptions.rotationSpeed * 0.001
      }
      
      // 블랙홀 효과
      if (centralAttractor && options.gravityMode === 'blackhole') {
        centralAttractor.rotation.z += 0.02
        const eventHorizon = centralAttractor.children[0]
        if (eventHorizon) {
          eventHorizon.rotation.z -= 0.03
          eventHorizon.scale.setScalar(1 + Math.sin(time * 2) * 0.1)
        }
      }
      
      // 배경 별 회전
      starField.rotation.y += 0.0001
    },
    
    cleanup: () => {
      // 이벤트 리스너 제거
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }
}

// 초기 위치 설정 함수
function setupInitialPosition(particle: ParticleData, index: number, total: number, mode: GravityMode) {
  switch (mode) {
    case 'galaxy':
      // 나선 은하 형태 (더 작은 스케일로)
      const angle = (index / total) * Math.PI * 20
      const radius = Math.sqrt(index / total) * 30 // 50 -> 30
      const armIndex = Math.floor((index / total) * 3) // 3개의 나선팔
      const armAngle = (armIndex * Math.PI * 2) / 3
      
      particle.position.x = Math.cos(angle + armAngle) * radius
      particle.position.z = Math.sin(angle + armAngle) * radius
      particle.position.y = (Math.random() - 0.5) * 3 * Math.exp(-radius / 30) // 5 -> 3
      break
      
    case 'solar':
      // 태양계 형태
      const orbitRadius = 10 + (index / total) * 40
      const orbitAngle = Math.random() * Math.PI * 2
      particle.position.x = Math.cos(orbitAngle) * orbitRadius
      particle.position.z = Math.sin(orbitAngle) * orbitRadius
      particle.position.y = (Math.random() - 0.5) * 2
      break
      
    case 'cluster':
      // 구상 성단 형태
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = Math.cbrt(Math.random()) * 30
      
      particle.position.x = r * Math.sin(phi) * Math.cos(theta)
      particle.position.y = r * Math.sin(phi) * Math.sin(theta)
      particle.position.z = r * Math.cos(phi)
      break
      
    case 'random':
      // 랜덤 분포
      particle.position.x = (Math.random() - 0.5) * 100
      particle.position.y = (Math.random() - 0.5) * 100
      particle.position.z = (Math.random() - 0.5) * 100
      break
      
    case 'blackhole':
      // 블랙홀 주변 원반
      const diskRadius = 15 + Math.random() * 35
      const diskAngle = Math.random() * Math.PI * 2
      particle.position.x = Math.cos(diskAngle) * diskRadius
      particle.position.z = Math.sin(diskAngle) * diskRadius
      particle.position.y = (Math.random() - 0.5) * 2 * Math.exp(-diskRadius / 20)
      break
  }
}

// 초기 속도 설정 함수
function setupInitialVelocity(particle: ParticleData, mode: GravityMode) {
  switch (mode) {
    case 'galaxy':
    case 'solar':
    case 'blackhole':
      // 궤도 속도
      const radius = particle.position.length()
      const tangent = new THREE.Vector3(-particle.position.z, 0, particle.position.x).normalize()
      const orbitalSpeed = Math.sqrt(10 / radius) * 2
      particle.velocity = tangent.multiplyScalar(orbitalSpeed)
      break
      
    case 'cluster':
      // 작은 랜덤 속도
      particle.velocity.x = (Math.random() - 0.5) * 0.5
      particle.velocity.y = (Math.random() - 0.5) * 0.5
      particle.velocity.z = (Math.random() - 0.5) * 0.5
      break
      
    case 'random':
      // 완전 랜덤
      particle.velocity.x = (Math.random() - 0.5) * 2
      particle.velocity.y = (Math.random() - 0.5) * 2
      particle.velocity.z = (Math.random() - 0.5) * 2
      break
  }
}

// 파티클 물리 업데이트
function updateParticlePhysics(
  particles: ParticleData[],
  options: ParticleUniverseOptions,
  mouseForce: THREE.Vector3,
  isMouseDown: boolean
) {
  const G = options.gravityStrength || 1
  const dt = 0.016 // 60fps 기준
  
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i]
    const force = new THREE.Vector3()
    
    // 중심 중력
    if (options.gravityMode !== 'random') {
      const centerForce = particle.position.clone().negate().normalize()
      const distance = particle.position.length()
      const strength = (G * 100) / (distance * distance + 1)
      force.add(centerForce.multiplyScalar(strength))
    }
    
    // 마우스 인터랙션
    if (isMouseDown && mouseForce) {
      const mouseDir = mouseForce.clone().sub(particle.position)
      const mouseDist = mouseDir.length()
      if (mouseDist < 50) {
        const mouseStrength = (options.interactionStrength || 1) * 10 / (mouseDist + 1)
        force.add(mouseDir.normalize().multiplyScalar(mouseStrength))
      }
    }
    
    // 속도 업데이트
    particle.velocity.add(force.multiplyScalar(dt))
    
    // 속도 제한
    const maxSpeed = 5
    if (particle.velocity.length() > maxSpeed) {
      particle.velocity.normalize().multiplyScalar(maxSpeed)
    }
    
    // 위치 업데이트
    particle.position.add(particle.velocity.clone().multiplyScalar(dt))
    
    // 경계 체크
    const maxDistance = 100
    if (particle.position.length() > maxDistance) {
      particle.position.normalize().multiplyScalar(maxDistance)
      particle.velocity.multiplyScalar(-0.5)
    }
  }
}

// 연결선 업데이트
function updateConnections(particles: ParticleData[], connectionGroup: THREE.Group, maxDistance: number) {
  connectionGroup.clear()
  
  const lines: THREE.Vector3[] = []
  const lineColors: THREE.Color[] = []
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const distance = particles[i].position.distanceTo(particles[j].position)
      
      if (distance < maxDistance) {
        lines.push(particles[i].position.clone())
        lines.push(particles[j].position.clone())
        
        const alpha = 1 - (distance / maxDistance)
        const color = new THREE.Color().lerpColors(particles[i].color, particles[j].color, 0.5)
        color.multiplyScalar(alpha * 0.3)
        
        lineColors.push(color)
        lineColors.push(color)
      }
    }
  }
  
  if (lines.length > 0) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(lines)
    const colors = new Float32Array(lineColors.length * 3)
    
    for (let i = 0; i < lineColors.length; i++) {
      colors[i * 3] = lineColors[i].r
      colors[i * 3 + 1] = lineColors[i].g
      colors[i * 3 + 2] = lineColors[i].b
    }
    
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    
    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial)
    connectionGroup.add(lineSystem)
  }
}

// 색상 팔레트 생성
function getColorPalette(theme: ColorTheme, primary: string, secondary: string): THREE.Color[] {
  switch (theme) {
    case 'cosmic':
      return [
        new THREE.Color(0x4444ff),
        new THREE.Color(0x8844ff),
        new THREE.Color(0xff44ff),
        new THREE.Color(0x44ffff),
        new THREE.Color(0xffffff)
      ]
    case 'aurora':
      return [
        new THREE.Color(0x00ff00),
        new THREE.Color(0x00ff88),
        new THREE.Color(0x00ffff),
        new THREE.Color(0x88ff00),
        new THREE.Color(0xffff00)
      ]
    case 'sunset':
      return [
        new THREE.Color(0xff0044),
        new THREE.Color(0xff4400),
        new THREE.Color(0xff8800),
        new THREE.Color(0xffaa00),
        new THREE.Color(0xffcc00)
      ]
    case 'ocean':
      return [
        new THREE.Color(0x0044ff),
        new THREE.Color(0x0088ff),
        new THREE.Color(0x00ccff),
        new THREE.Color(0x00ffff),
        new THREE.Color(0x88ffff)
      ]
    case 'fire':
      return [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff4400),
        new THREE.Color(0xff8800),
        new THREE.Color(0xffaa00),
        new THREE.Color(0xffff00)
      ]
    case 'custom':
      const color1 = new THREE.Color(primary)
      const color2 = new THREE.Color(secondary)
      return [
        color1,
        color1.clone().lerp(color2, 0.25),
        color1.clone().lerp(color2, 0.5),
        color1.clone().lerp(color2, 0.75),
        color2
      ]
    default:
      return [new THREE.Color(0xffffff)]
  }
}

// 파티클 텍스처 생성
function createParticleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  
  return texture
}

// 배경 별 필드 생성
function createStarField(): THREE.Points {
  const starCount = 5000
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)
  
  for (let i = 0; i < starCount; i++) {
    const radius = 200 + Math.random() * 300
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
    
    const brightness = 0.5 + Math.random() * 0.5
    colors[i * 3] = brightness
    colors[i * 3 + 1] = brightness
    colors[i * 3 + 2] = brightness
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  })
  
  return new THREE.Points(geometry, material)
}

/**
 * Particle Universe 템플릿 정의
 */
export const particleUniverseTemplate: Template3D = {
  id: 'particle-universe',
  name: 'Particle Universe',
  category: 'effects',
  subcategory: 'physics',
  description: '은하계처럼 회전하는 인터랙티브 파티클 시스템',
  thumbnail: '/templates/particle-universe.jpg',
  duration: 15,
  aspectRatio: '16:9',
  platform: 'general',
  
  sceneSetup: (scene: THREE.Scene, customization: TemplateCustomization) => {
    return createParticleUniverseScene(scene, customization)
  },
  
  ui: {
    customization: {
      sections: [
        {
          id: 'particles',
          title: '파티클 설정',
          description: '파티클의 개수와 타입을 설정합니다',
          fields: [
            {
              id: 'particleCount',
              type: 'slider',
              label: '파티클 개수',
              min: 500,
              max: 10000,
              step: 100,
              defaultValue: 3000
            },
            {
              id: 'particleType',
              type: 'multiSelect',
              label: '파티클 타입',
              defaultValue: ['star', 'planet'],
              options: [
                { value: 'star', label: '별' },
                { value: 'planet', label: '행성' },
                { value: 'asteroid', label: '소행성' },
                { value: 'comet', label: '혜성' },
                { value: 'nebula', label: '성운' }
              ]
            },
            {
              id: 'particleSize',
              type: 'slider',
              label: '파티클 크기',
              min: 0.5,
              max: 3,
              step: 0.1,
              defaultValue: 1
            }
          ]
        },
        {
          id: 'physics',
          title: '물리 시뮬레이션',
          fields: [
            {
              id: 'gravityMode',
              type: 'select',
              label: '중력 모드',
              defaultValue: 'galaxy',
              options: [
                { value: 'galaxy', label: '나선 은하' },
                { value: 'solar', label: '태양계' },
                { value: 'cluster', label: '구상 성단' },
                { value: 'random', label: '랜덤' },
                { value: 'blackhole', label: '블랙홀' }
              ]
            },
            {
              id: 'gravityStrength',
              type: 'slider',
              label: '중력 강도',
              min: 0.1,
              max: 3,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'rotationSpeed',
              type: 'slider',
              label: '회전 속도',
              min: 0,
              max: 5,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'autoRotate',
              type: 'toggle',
              label: '자동 회전',
              defaultValue: true
            }
          ]
        },
        {
          id: 'appearance',
          title: '시각 효과',
          fields: [
            {
              id: 'colorTheme',
              type: 'select',
              label: '색상 테마',
              defaultValue: 'cosmic',
              options: [
                { value: 'cosmic', label: '우주' },
                { value: 'aurora', label: '오로라' },
                { value: 'sunset', label: '석양' },
                { value: 'ocean', label: '바다' },
                { value: 'fire', label: '불꽃' },
                { value: 'custom', label: '커스텀' }
              ]
            },
            {
              id: 'primaryColor',
              type: 'color',
              label: '주 색상',
              defaultValue: '#4444ff'
            },
            {
              id: 'secondaryColor',
              type: 'color',
              label: '보조 색상',
              defaultValue: '#ff44ff'
            },
            {
              id: 'showConnections',
              type: 'toggle',
              label: '연결선 표시',
              defaultValue: true
            },
            {
              id: 'connectionDistance',
              type: 'slider',
              label: '연결 거리',
              min: 2,
              max: 10,
              step: 0.5,
              defaultValue: 5
            },
            {
              id: 'trailEffect',
              type: 'toggle',
              label: '꼬리 효과',
              defaultValue: false
            }
          ]
        },
        {
          id: 'interaction',
          title: '인터랙션',
          fields: [
            {
              id: 'interactionStrength',
              type: 'slider',
              label: '마우스 인터랙션 강도',
              min: 0,
              max: 3,
              step: 0.1,
              defaultValue: 1
            }
          ]
        }
      ]
    },
    
    preview: {
      showGrid: false,
      showAxes: false,
      cameraPosition: [0, 0, 80], // 카메라를 더 멀리
      autoRotate: false
    },
    
    export: {
      formats: [
        {
          id: 'mp4',
          name: 'MP4 Video',
          extension: 'mp4',
          mimeType: 'video/mp4',
          settings: {
            resolution: [1920, 1080],
            frameRate: 60,
            bitrate: 10000000,
            codec: 'h264'
          }
        }
      ],
      defaultFormat: {
        id: 'mp4',
        name: 'MP4 Video',
        extension: 'mp4',
        mimeType: 'video/mp4',
        settings: {
          resolution: [1920, 1080],
          frameRate: 60
        }
      },
      qualityPresets: {
        high: {
          name: '고품질',
          settings: {
            resolution: [1920, 1080],
            frameRate: 60,
            bitrate: 10000000
          }
        },
        medium: {
          name: '표준',
          settings: {
            resolution: [1280, 720],
            frameRate: 30,
            bitrate: 5000000
          }
        },
        low: {
          name: '저용량',
          settings: {
            resolution: [854, 480],
            frameRate: 30,
            bitrate: 2500000
          }
        }
      }
    }
  },
  
  animations: {
    default: 'orbit',
    available: ['orbit', 'expand', 'collapse', 'swirl'],
    presets: {
      orbit: {
        duration: 15,
        easing: 'linear',
        keyframes: [
          { time: 0, action: 'start' },
          { time: 15, action: 'loop' }
        ]
      }
    }
  },
  
  defaultCustomization: {
    text: {
      title: '',
      subtitle: '',
      company: ''
    },
    colors: {
      primary: '#4444ff',
      secondary: '#ff44ff',
      accent: '#44ffff'
    },
    logo: null,
    options: {
      particleCount: 3000,
      particleType: ['star', 'planet'],
      gravityMode: 'galaxy',
      gravityStrength: 1,
      rotationSpeed: 1,
      colorTheme: 'cosmic',
      primaryColor: '#4444ff',
      secondaryColor: '#ff44ff',
      showConnections: true,
      connectionDistance: 5,
      particleSize: 1,
      trailEffect: false,
      interactionStrength: 1,
      autoRotate: true
    }
  }
}