import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * Neon City Template
 * 사이버펑크 스타일의 네온 도시 애니메이션
 * 
 * Features:
 * - 3D 도시 건물들
 * - 네온 사인과 홀로그램
 * - 비 내리는 효과
 * - 반사 효과
 * - 글리치 효과
 */

// 도시 스타일
export type CityStyle = 'cyberpunk' | 'tokyo' | 'hongkong' | 'miami' | 'blade-runner'

// 날씨 효과
export type WeatherEffect = 'rain' | 'fog' | 'clear' | 'storm'

// 네온 색상 테마
export type NeonTheme = 'classic' | 'vaporwave' | 'matrix' | 'rainbow' | 'custom'

interface Building {
  mesh: THREE.Mesh
  windows: THREE.Mesh[]
  neonSigns: THREE.Group[]
  height: number
  glowIntensity: number
}

interface NeonCityOptions {
  cityStyle: CityStyle
  buildingDensity: number
  buildingHeight: number
  neonIntensity: number
  neonTheme: NeonTheme
  primaryNeonColor: string
  secondaryNeonColor: string
  weatherEffect: WeatherEffect
  rainIntensity: number
  fogDensity: number
  reflectionIntensity: number
  glitchEffect: boolean
  glitchIntensity: number
  cameraMovement: boolean
  cameraSpeed: number
}

/**
 * 네온 시티 씬 생성
 */
export function createNeonCityScene(
  scene: THREE.Scene,
  customization: TemplateCustomization
) {
  const options = customization.options as NeonCityOptions
  
  // 씬 설정
  scene.background = new THREE.Color(0x0a0a0f)
  
  // 안개 효과
  if (options.weatherEffect === 'fog' || options.fogDensity > 0) {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.005 * (options.fogDensity || 1))
  }
  
  // 메인 그룹
  const cityGroup = new THREE.Group()
  const buildings: Building[] = []
  
  // 지면 생성 (반사 효과를 위한)
  const groundGeometry = new THREE.PlaneGeometry(200, 200)
  const groundMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0f,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: options.reflectionIntensity || 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = 0
  cityGroup.add(ground)
  
  // 건물 생성
  const buildingCount = Math.floor(30 * (options.buildingDensity || 1))
  const cityRadius = 50
  
  for (let i = 0; i < buildingCount; i++) {
    const building = createBuilding(options, i)
    
    // 도시 레이아웃에 따른 배치
    let x, z
    if (options.cityStyle === 'tokyo' || options.cityStyle === 'hongkong') {
      // 격자 형태
      const gridSize = Math.ceil(Math.sqrt(buildingCount))
      const gridX = (i % gridSize) - gridSize / 2
      const gridZ = Math.floor(i / gridSize) - gridSize / 2
      x = gridX * 8 + (Math.random() - 0.5) * 2
      z = gridZ * 8 + (Math.random() - 0.5) * 2
    } else {
      // 원형 분포
      const angle = (i / buildingCount) * Math.PI * 2
      const radius = cityRadius * (0.3 + Math.random() * 0.7)
      x = Math.cos(angle) * radius
      z = Math.sin(angle) * radius
    }
    
    building.mesh.position.set(x, building.height / 2, z)
    cityGroup.add(building.mesh)
    
    // 네온 사인 추가
    if (Math.random() > 0.3) {
      const neonSign = createNeonSign(options, building.height)
      neonSign.position.set(x, building.height, z)
      building.neonSigns.push(neonSign)
      cityGroup.add(neonSign)
    }
    
    buildings.push(building)
  }
  
  // 홀로그램 광고판
  const hologramCount = 5
  for (let i = 0; i < hologramCount; i++) {
    const hologram = createHologram(options)
    const angle = (i / hologramCount) * Math.PI * 2
    hologram.position.set(
      Math.cos(angle) * 30,
      15 + Math.random() * 10,
      Math.sin(angle) * 30
    )
    cityGroup.add(hologram)
  }
  
  // 비 효과
  let rainSystem: THREE.Points | null = null
  if (options.weatherEffect === 'rain' || options.weatherEffect === 'storm') {
    rainSystem = createRainEffect(options)
    scene.add(rainSystem) // 도시 그룹이 아닌 씬에 직접 추가
  }
  
  // 조명 시스템
  setupLighting(scene, options)
  
  // 글리치 포스트 프로세싱을 위한 플레인
  let glitchPlane: THREE.Mesh | null = null
  if (options.glitchEffect) {
    glitchPlane = createGlitchPlane(options)
    scene.add(glitchPlane)
  }
  
  scene.add(cityGroup)
  
  // 애니메이션 변수
  let time = 0
  
  return {
    animate: (deltaTime: number) => {
      time += deltaTime
      
      // 건물 애니메이션
      buildings.forEach((building, index) => {
        // 창문 깜빡임
        building.windows.forEach((window, windowIndex) => {
          const flickerChance = Math.random()
          if (flickerChance < 0.01) {
            const mat = window.material as THREE.MeshBasicMaterial
            mat.emissiveIntensity = mat.emissiveIntensity > 0 ? 0 : 1
          }
        })
        
        // 네온 사인 애니메이션
        building.neonSigns.forEach(sign => {
          // 네온 깜빡임
          if (Math.random() < 0.005) {
            sign.visible = !sign.visible
            setTimeout(() => { sign.visible = true }, 100)
          }
          
          // 부드러운 발광 효과
          sign.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              const mat = child.material as THREE.MeshBasicMaterial
              mat.opacity = 0.8 + Math.sin(time * 3 + index) * 0.2
            }
          })
        })
      })
      
      // 홀로그램 애니메이션
      cityGroup.children.forEach(child => {
        if (child.userData.isHologram) {
          child.rotation.y += 0.01
          child.position.y += Math.sin(time * 2) * 0.05
          
          const mat = child.material as THREE.ShaderMaterial
          if (mat.uniforms) {
            mat.uniforms.time.value = time
          }
        }
      })
      
      // 비 애니메이션
      if (rainSystem) {
        const positions = rainSystem.geometry.attributes.position as THREE.BufferAttribute
        const velocities = rainSystem.geometry.attributes.velocity as THREE.BufferAttribute
        
        for (let i = 0; i < positions.count; i++) {
          let y = positions.getY(i)
          const velocity = velocities.getY(i)
          
          y += velocity
          
          if (y < 0) {
            y = 50
            positions.setX(i, (Math.random() - 0.5) * 100)
            positions.setZ(i, (Math.random() - 0.5) * 100)
          }
          
          positions.setY(i, y)
        }
        
        positions.needsUpdate = true
      }
      
      // 글리치 효과
      if (glitchPlane && options.glitchEffect) {
        const mat = glitchPlane.material as THREE.ShaderMaterial
        mat.uniforms.time.value = time
        mat.uniforms.glitchIntensity.value = options.glitchIntensity
      }
      
      // 카메라 움직임
      if (options.cameraMovement) {
        const cameraRadius = 40
        const cameraSpeed = options.cameraSpeed || 0.5
        const cameraAngle = time * cameraSpeed * 0.1
        
        cityGroup.rotation.y = cameraAngle
      }
    }
  }
}

// 건물 생성 함수
function createBuilding(options: NeonCityOptions, index: number): Building {
  const baseHeight = 10
  const height = baseHeight + Math.random() * (options.buildingHeight || 30)
  const width = 3 + Math.random() * 4
  const depth = 3 + Math.random() * 4
  
  // 건물 본체
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a1a,
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 1.5,
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  const windows: THREE.Mesh[] = []
  
  // 창문 생성
  const floors = Math.floor(height / 3)
  const windowsPerFloor = Math.floor(width / 1.5)
  
  for (let floor = 0; floor < floors; floor++) {
    for (let w = 0; w < windowsPerFloor; w++) {
      const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2)
      const isLit = Math.random() > 0.3
      
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: isLit ? getNeonColor(options.neonTheme, options.primaryNeonColor) : 0x000000,
        emissive: isLit ? getNeonColor(options.neonTheme, options.primaryNeonColor) : 0x000000,
        emissiveIntensity: isLit ? 1 : 0,
      })
      
      const window = new THREE.Mesh(windowGeometry, windowMaterial)
      
      // 앞면 창문
      const windowFront = window.clone()
      windowFront.position.set(
        (w - windowsPerFloor / 2 + 0.5) * 1.5,
        floor * 3 - height / 2 + 1.5,
        depth / 2 + 0.01
      )
      mesh.add(windowFront)
      windows.push(windowFront)
      
      // 뒷면 창문
      const windowBack = window.clone()
      windowBack.position.set(
        (w - windowsPerFloor / 2 + 0.5) * 1.5,
        floor * 3 - height / 2 + 1.5,
        -depth / 2 - 0.01
      )
      windowBack.rotation.y = Math.PI
      mesh.add(windowBack)
      windows.push(windowBack)
    }
  }
  
  return {
    mesh,
    windows,
    neonSigns: [],
    height,
    glowIntensity: 1
  }
}

// 네온 사인 생성
function createNeonSign(options: NeonCityOptions, buildingHeight: number): THREE.Group {
  const group = new THREE.Group()
  
  const signTypes = ['text', 'shape', 'logo']
  const type = signTypes[Math.floor(Math.random() * signTypes.length)]
  
  switch (type) {
    case 'text':
      // 네온 텍스트
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const texts = ['NEON', 'CYBER', '2077', 'FLUX', 'CITY', 'TOKYO']
      const text = texts[Math.floor(Math.random() * texts.length)]
      
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = getNeonColor(options.neonTheme, options.primaryNeonColor)
      ctx.shadowColor = getNeonColor(options.neonTheme, options.primaryNeonColor)
      ctx.shadowBlur = 20
      ctx.fillText(text, 10, 48)
      
      const texture = new THREE.CanvasTexture(canvas)
      const signMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      })
      
      const signGeometry = new THREE.PlaneGeometry(8, 2)
      const signMesh = new THREE.Mesh(signGeometry, signMaterial)
      signMesh.position.y = 2
      group.add(signMesh)
      break
      
    case 'shape':
      // 네온 도형
      const ringGeometry = new THREE.TorusGeometry(2, 0.3, 8, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: getNeonColor(options.neonTheme, options.secondaryNeonColor),
        emissive: getNeonColor(options.neonTheme, options.secondaryNeonColor),
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.y = 3
      group.add(ring)
      break
  }
  
  // 네온 글로우 효과
  const glowGeometry = new THREE.SphereGeometry(3, 8, 8)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: getNeonColor(options.neonTheme, options.primaryNeonColor),
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.scale.set(1.5, 1.5, 1.5)
  group.add(glow)
  
  return group
}

// 홀로그램 생성
function createHologram(options: NeonCityOptions): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(10, 15)
  
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      vec3 pos = position;
      pos.x += sin(pos.y * 0.5 + time) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
  
  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float glitchIntensity;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // 홀로그램 스캔라인
      float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.04;
      uv.x += scanline;
      
      // 글리치 효과
      if (random(vec2(time * 0.1, uv.y)) < glitchIntensity * 0.1) {
        uv.x += (random(uv) - 0.5) * 0.1;
      }
      
      // 색상 그라디언트
      vec3 color = mix(color1, color2, uv.y);
      
      // 투명도
      float alpha = 0.8 - abs(uv.x - 0.5) * 2.0;
      alpha *= 1.0 - abs(uv.y - 0.5) * 0.5;
      
      // 깜빡임
      alpha *= 0.8 + sin(time * 20.0) * 0.2;
      
      gl_FragColor = vec4(color, alpha * 0.6);
    }
  `
  
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(getNeonColor(options.neonTheme, options.primaryNeonColor)) },
      color2: { value: new THREE.Color(getNeonColor(options.neonTheme, options.secondaryNeonColor)) },
      glitchIntensity: { value: options.glitchIntensity || 0.5 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.isHologram = true
  
  return mesh
}

// 비 효과 생성
function createRainEffect(options: NeonCityOptions): THREE.Points {
  const rainCount = 5000 * (options.rainIntensity || 1)
  const geometry = new THREE.BufferGeometry()
  
  const positions = new Float32Array(rainCount * 3)
  const velocities = new Float32Array(rainCount * 3)
  const colors = new Float32Array(rainCount * 3)
  
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = Math.random() * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    
    velocities[i * 3] = 0
    velocities[i * 3 + 1] = -0.5 - Math.random() * 0.5
    velocities[i * 3 + 2] = 0
    
    // 비의 색상 (약간 푸른빛)
    colors[i * 3] = 0.6
    colors[i * 3 + 1] = 0.7
    colors[i * 3 + 2] = 0.8
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  })
  
  return new THREE.Points(geometry, material)
}

// 글리치 플레인 생성
function createGlitchPlane(options: NeonCityOptions): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(2, 2)
  
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `
  
  const fragmentShader = `
    varying vec2 vUv;
    uniform float time;
    uniform float glitchIntensity;
    uniform sampler2D tDiffuse;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // 글리치 디스토션
      float glitch = step(0.99, random(vec2(time * 0.1, uv.y)));
      uv.x += glitch * (random(uv) - 0.5) * glitchIntensity * 0.1;
      
      // RGB 시프트
      float r = texture2D(tDiffuse, uv + vec2(0.01, 0) * glitchIntensity).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(0.01, 0) * glitchIntensity).b;
      
      vec4 color = vec4(r, g, b, 1.0);
      
      // 노이즈
      float noise = random(uv + time) * 0.1 * glitchIntensity;
      color.rgb += noise;
      
      gl_FragColor = color;
    }
  `
  
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      glitchIntensity: { value: options.glitchIntensity || 0.5 },
      tDiffuse: { value: null }
    },
    transparent: true,
    visible: false // 포스트 프로세싱용이므로 기본적으로 숨김
  })
  
  return new THREE.Mesh(geometry, material)
}

// 조명 설정
function setupLighting(scene: THREE.Scene, options: NeonCityOptions) {
  // 앰비언트 라이트 (어둡게)
  const ambientLight = new THREE.AmbientLight(0x0a0a1a, 0.2)
  scene.add(ambientLight)
  
  // 메인 디렉셔널 라이트
  const dirLight = new THREE.DirectionalLight(0x4444ff, 0.5)
  dirLight.position.set(10, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.camera.near = 0.1
  dirLight.shadow.camera.far = 100
  dirLight.shadow.camera.left = -50
  dirLight.shadow.camera.right = 50
  dirLight.shadow.camera.top = 50
  dirLight.shadow.camera.bottom = -50
  scene.add(dirLight)
  
  // 네온 색상 포인트 라이트들
  const neonColors = [
    getNeonColor(options.neonTheme, options.primaryNeonColor),
    getNeonColor(options.neonTheme, options.secondaryNeonColor)
  ]
  
  neonColors.forEach((color, i) => {
    const pointLight = new THREE.PointLight(color, 1, 30)
    pointLight.position.set(
      (i - 0.5) * 40,
      10,
      0
    )
    scene.add(pointLight)
  })
}

// 네온 색상 팔레트
function getNeonColor(theme: NeonTheme, customColor?: string): string {
  switch (theme) {
    case 'classic':
      const classicColors = ['#ff0099', '#00ffff', '#ffff00', '#ff00ff', '#00ff00']
      return classicColors[Math.floor(Math.random() * classicColors.length)]
    
    case 'vaporwave':
      const vaporColors = ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96']
      return vaporColors[Math.floor(Math.random() * vaporColors.length)]
    
    case 'matrix':
      return '#00ff00'
    
    case 'rainbow':
      const hue = Math.random() * 360
      return `hsl(${hue}, 100%, 50%)`
    
    case 'custom':
      return customColor || '#ff0099'
    
    default:
      return '#ff0099'
  }
}

/**
 * Neon City 템플릿 정의
 */
export const neonCityTemplate: Template3D = {
  id: 'neon-city',
  name: 'Neon City',
  category: 'effects',
  subcategory: 'environment',
  description: '사이버펑크 스타일의 네온 도시 애니메이션',
  thumbnail: '/templates/neon-city.jpg',
  duration: 20,
  aspectRatio: '16:9',
  platform: 'general',
  
  sceneSetup: (scene: THREE.Scene, customization: TemplateCustomization) => {
    return createNeonCityScene(scene, customization)
  },
  
  ui: {
    customization: {
      sections: [
        {
          id: 'city',
          title: '도시 설정',
          description: '도시의 스타일과 구조를 설정합니다',
          fields: [
            {
              id: 'cityStyle',
              type: 'select',
              label: '도시 스타일',
              defaultValue: 'cyberpunk',
              options: [
                { value: 'cyberpunk', label: '사이버펑크' },
                { value: 'tokyo', label: '도쿄' },
                { value: 'hongkong', label: '홍콩' },
                { value: 'miami', label: '마이애미' },
                { value: 'blade-runner', label: '블레이드 러너' }
              ]
            },
            {
              id: 'buildingDensity',
              type: 'slider',
              label: '건물 밀도',
              min: 0.5,
              max: 2,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'buildingHeight',
              type: 'slider',
              label: '건물 높이',
              min: 10,
              max: 50,
              step: 5,
              defaultValue: 30
            }
          ]
        },
        {
          id: 'neon',
          title: '네온 효과',
          fields: [
            {
              id: 'neonIntensity',
              type: 'slider',
              label: '네온 강도',
              min: 0.5,
              max: 2,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'neonTheme',
              type: 'select',
              label: '네온 색상 테마',
              defaultValue: 'classic',
              options: [
                { value: 'classic', label: '클래식' },
                { value: 'vaporwave', label: '베이퍼웨이브' },
                { value: 'matrix', label: '매트릭스' },
                { value: 'rainbow', label: '레인보우' },
                { value: 'custom', label: '커스텀' }
              ]
            },
            {
              id: 'primaryNeonColor',
              type: 'color',
              label: '주 네온 색상',
              defaultValue: '#ff0099'
            },
            {
              id: 'secondaryNeonColor',
              type: 'color',
              label: '보조 네온 색상',
              defaultValue: '#00ffff'
            }
          ]
        },
        {
          id: 'weather',
          title: '날씨 효과',
          fields: [
            {
              id: 'weatherEffect',
              type: 'select',
              label: '날씨',
              defaultValue: 'rain',
              options: [
                { value: 'rain', label: '비' },
                { value: 'fog', label: '안개' },
                { value: 'clear', label: '맑음' },
                { value: 'storm', label: '폭풍' }
              ]
            },
            {
              id: 'rainIntensity',
              type: 'slider',
              label: '비 강도',
              min: 0,
              max: 2,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'fogDensity',
              type: 'slider',
              label: '안개 밀도',
              min: 0,
              max: 2,
              step: 0.1,
              defaultValue: 0.5
            }
          ]
        },
        {
          id: 'effects',
          title: '추가 효과',
          fields: [
            {
              id: 'reflectionIntensity',
              type: 'slider',
              label: '반사 강도',
              min: 0,
              max: 2,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'glitchEffect',
              type: 'toggle',
              label: '글리치 효과',
              defaultValue: true
            },
            {
              id: 'glitchIntensity',
              type: 'slider',
              label: '글리치 강도',
              min: 0,
              max: 1,
              step: 0.1,
              defaultValue: 0.3
            },
            {
              id: 'cameraMovement',
              type: 'toggle',
              label: '카메라 움직임',
              defaultValue: true
            },
            {
              id: 'cameraSpeed',
              type: 'slider',
              label: '카메라 속도',
              min: 0.1,
              max: 2,
              step: 0.1,
              defaultValue: 0.5
            }
          ]
        }
      ]
    },
    
    preview: {
      showGrid: false,
      showAxes: false,
      cameraPosition: [30, 20, 30],
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
    default: 'city-tour',
    available: ['city-tour', 'static', 'fly-through', 'ground-level'],
    presets: {
      'city-tour': {
        duration: 20,
        easing: 'ease-in-out',
        keyframes: [
          { time: 0, action: 'start' },
          { time: 20, action: 'loop' }
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
      primary: '#ff0099',
      secondary: '#00ffff',
      accent: '#ffff00'
    },
    logo: null,
    options: {
      cityStyle: 'cyberpunk',
      buildingDensity: 1,
      buildingHeight: 30,
      neonIntensity: 1,
      neonTheme: 'classic',
      primaryNeonColor: '#ff0099',
      secondaryNeonColor: '#00ffff',
      weatherEffect: 'rain',
      rainIntensity: 1,
      fogDensity: 0.5,
      reflectionIntensity: 1,
      glitchEffect: true,
      glitchIntensity: 0.3,
      cameraMovement: true,
      cameraSpeed: 0.5
    }
  }
}