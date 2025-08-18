import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * Matrix Digital Rain Template - Fixed Version
 * 영화 매트릭스의 아이코닉한 디지털 레인 효과
 * 
 * Fixed Issues:
 * - 실시간 문자셋 변경 지원
 * - 실시간 밀도 변경 지원
 * - 트레일 길이 실제 적용
 * - 3D 깊이감 실시간 토글
 * - secondaryColor 활용
 */

// 매트릭스 문자 세트
const MATRIX_CHARACTERS = {
  korean: '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후그느드르므브스으즈츠크트프흐기니디리미비시이지치키티피히',
  japanese: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
  katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
  matrix: '01' // 바이너리
}

interface MatrixColumn {
  x: number
  y: number
  z: number
  speed: number
  characters: string[]
  brightness: number
  glitchTime: number
  sprites?: THREE.Sprite[]
}

interface MatrixOptions {
  characterSet: string[]
  colorScheme: 'classic' | 'red' | 'blue' | 'purple' | 'golden' | 'custom'
  primaryColor: string
  secondaryColor: string
  speed: number
  density: number
  glitchIntensity: number
  depth: boolean
  trailLength: number
}

/**
 * 매트릭스 디지털 레인 씬 생성 (개선된 버전)
 */
export function createMatrixDigitalRainScene(
  scene: THREE.Scene,
  customization: TemplateCustomization
) {
  let options = customization.options as MatrixOptions
  
  // 메인 그룹
  const matrixGroup = new THREE.Group()
  matrixGroup.name = 'matrixRainGroup'
  
  // 배경 설정 (검은색)
  scene.background = new THREE.Color(0x000000)
  
  // 초기 컬럼 배열
  let columns: MatrixColumn[] = []
  
  // 글리치 효과를 위한 플레인
  const glitchGeometry = new THREE.PlaneGeometry(50, 40)
  const glitchMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glitchIntensity: { value: options.glitchIntensity || 0.1 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float glitchIntensity;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = vUv;
        
        // 글리치 라인
        float glitch = step(0.99, random(vec2(0.0, uv.y + time * 0.1)));
        
        // 색상 분리
        vec3 color = vec3(0.0);
        if (glitch > 0.5) {
          color.r = random(uv + time) * glitchIntensity;
          color.g = random(uv + time * 1.1) * glitchIntensity * 2.0;
          color.b = random(uv + time * 0.9) * glitchIntensity * 0.5;
        }
        
        gl_FragColor = vec4(color, glitch * 0.5);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  })
  
  const glitchPlane = new THREE.Mesh(glitchGeometry, glitchMaterial)
  glitchPlane.position.z = -5
  matrixGroup.add(glitchPlane)
  
  // 컬럼 생성 함수
  function createColumns() {
    // 기존 스프라이트 제거
    const spritesToRemove = matrixGroup.children.filter(child => 
      child instanceof THREE.Sprite
    )
    spritesToRemove.forEach(sprite => {
      if (sprite instanceof THREE.Sprite) {
        sprite.material.map?.dispose()
        sprite.material.dispose()
        matrixGroup.remove(sprite)
      }
    })
    
    // 문자 세트 준비
    const selectedCharacters = options.characterSet.flatMap(set => 
      MATRIX_CHARACTERS[set as keyof typeof MATRIX_CHARACTERS].split('')
    )
    
    // 컬럼 수 계산 (밀도에 따라)
    const columnCount = Math.floor(150 * (options.density || 1))
    columns = []
    
    // 컬럼 초기화
    const spacing = 0.8
    const rows = Math.floor(Math.sqrt(columnCount))
    const cols = Math.ceil(columnCount / rows)
    
    for (let i = 0; i < columnCount; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      const column: MatrixColumn = {
        x: (col - cols / 2) * spacing,
        y: Math.random() * 40 - 10,
        z: (row - rows / 2) * spacing * 0.5,
        speed: 0.15 + Math.random() * 0.35,
        characters: [],
        brightness: 0.5 + Math.random() * 0.5,
        glitchTime: 0,
        sprites: []
      }
      
      // 각 컬럼에 문자 배치
      const charCount = Math.floor(20 + Math.random() * 30)
      for (let j = 0; j < charCount; j++) {
        column.characters.push(
          selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)]
        )
      }
      
      // 스프라이트 생성
      column.characters.forEach((char, charIndex) => {
        const sprite = createCharacterSprite(
          char, charIndex, column, i, options
        )
        matrixGroup.add(sprite)
        column.sprites!.push(sprite)
      })
      
      columns.push(column)
    }
  }
  
  // 문자 스프라이트 생성 함수
  function createCharacterSprite(
    char: string,
    charIndex: number,
    column: MatrixColumn,
    columnIndex: number,
    options: MatrixOptions
  ): THREE.Sprite {
    const charCanvas = document.createElement('canvas')
    charCanvas.width = 128
    charCanvas.height = 128
    const charCtx = charCanvas.getContext('2d')!
    
    charCtx.font = 'bold 64px monospace'
    charCtx.textAlign = 'center'
    charCtx.textBaseline = 'middle'
    
    // 색상 결정
    let currentColor = getColorForScheme(options.colorScheme, options.primaryColor)
    let secondaryColor = options.colorScheme === 'custom' 
      ? (options.secondaryColor || currentColor) 
      : currentColor
    
    // 트레일 효과를 위한 투명도
    const trailFactor = Math.min(1, (options.trailLength || 15) / 30)
    const alpha = charIndex === 0 ? 1 : Math.max(0.05, 1 - (charIndex / Math.min(column.characters.length, options.trailLength || 15)) * 0.95 * trailFactor)
    
    // 그라디언트 생성 (secondaryColor 활용)
    const gradient = charCtx.createLinearGradient(0, 0, 0, 128)
    gradient.addColorStop(0, currentColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
    gradient.addColorStop(0.5, secondaryColor + Math.floor(alpha * 200).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, currentColor + '00')
    
    charCtx.fillStyle = gradient
    charCtx.shadowColor = currentColor
    charCtx.shadowBlur = 20
    charCtx.fillText(char, 64, 64)
    
    const texture = new THREE.CanvasTexture(charCanvas)
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: alpha,
      blending: THREE.AdditiveBlending
    })
    
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.position.set(
      column.x,
      column.y - charIndex * 0.8,
      column.z
    )
    sprite.scale.set(0.8, 0.8, 1)
    
    sprite.userData = {
      columnIndex: columnIndex,
      charIndex: charIndex,
      originalY: sprite.position.y,
      character: char,
      column: column
    }
    
    return sprite
  }
  
  // 색상 스키마에서 색상 가져오기
  function getColorForScheme(scheme: string, primaryColor?: string): string {
    switch (scheme) {
      case 'classic': return '#00ff00'
      case 'red': return '#ff0000'
      case 'blue': return '#00ffff'
      case 'purple': return '#ff00ff'
      case 'golden': return '#ffd700'
      case 'custom': return primaryColor || '#00ff00'
      default: return primaryColor || '#00ff00'
    }
  }
  
  // 초기 컬럼 생성
  createColumns()
  
  // 조명 설정
  const ambientLight = new THREE.AmbientLight(0x001100, 0.2)
  scene.add(ambientLight)
  
  // 포그 효과로 깊이감 추가
  if (options.depth) {
    scene.fog = new THREE.FogExp2(0x000000, 0.05)
  }
  
  // 타이틀 텍스트
  let titleSprite: THREE.Sprite | null = null
  if (customization.text.title) {
    titleSprite = createTitleSprite(customization.text.title, options)
    matrixGroup.add(titleSprite)
  }
  
  scene.add(matrixGroup)
  
  // 이전 상태 추적
  let lastOptions = JSON.stringify(options)
  
  return {
    animate: (time: number) => {
      // 현재 옵션 다시 읽기
      options = customization.options as MatrixOptions
      const currentOptions = JSON.stringify(options)
      
      // 옵션이 변경되었는지 확인
      if (currentOptions !== lastOptions) {
        const oldOptions = JSON.parse(lastOptions)
        lastOptions = currentOptions
        
        // 문자셋이나 밀도가 변경되면 컬럼 재생성
        if (JSON.stringify(options.characterSet) !== JSON.stringify(oldOptions.characterSet) ||
            options.density !== oldOptions.density) {
          createColumns()
        }
        
        // 3D 깊이감 토글
        if (options.depth !== oldOptions.depth) {
          if (options.depth) {
            scene.fog = new THREE.FogExp2(0x000000, 0.05)
          } else {
            scene.fog = null
          }
        }
        
        // 색상이나 트레일 길이가 변경되면 모든 스프라이트 업데이트
        if (options.colorScheme !== oldOptions.colorScheme ||
            options.primaryColor !== oldOptions.primaryColor ||
            options.secondaryColor !== oldOptions.secondaryColor ||
            options.trailLength !== oldOptions.trailLength) {
          updateAllSprites()
        }
      }
      
      // 글리치 셰이더 업데이트
      glitchMaterial.uniforms.time.value = time
      glitchMaterial.uniforms.glitchIntensity.value = options.glitchIntensity || 0.1
      
      // 각 스프라이트 애니메이션
      columns.forEach((column, columnIndex) => {
        column.sprites?.forEach((sprite, charIndex) => {
          // 떨어지는 애니메이션
          sprite.position.y -= column.speed * (options.speed || 1)
          
          // 화면 아래로 나가면 위로 재배치
          if (sprite.position.y < -25) {
            sprite.position.y = 25 + Math.random() * 10
            
            // 문자 랜덤 변경
            const selectedCharacters = options.characterSet.flatMap(set => 
              MATRIX_CHARACTERS[set as keyof typeof MATRIX_CHARACTERS].split('')
            )
            const newChar = selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)]
            sprite.userData.character = newChar
            column.characters[charIndex] = newChar
            
            // 텍스처 업데이트
            updateSpriteTexture(sprite, newChar, charIndex, options)
          }
          
          // 글리치 효과
          if (Math.random() < (options.glitchIntensity || 0.1) * 0.02) {
            sprite.position.x += (Math.random() - 0.5) * 0.8
            const glitchOpacity = Math.random() > 0.5 ? 1 : Math.random() * 0.3
            ;(sprite.material as THREE.SpriteMaterial).opacity = glitchOpacity
            
            // 글리치 후 복구
            setTimeout(() => {
              sprite.position.x = column.x
              const trailFactor = Math.min(1, (options.trailLength || 15) / 30)
              const normalAlpha = charIndex === 0 ? 1 : Math.max(0.05, 1 - (charIndex / Math.min(column.characters.length, options.trailLength || 15)) * 0.95 * trailFactor)
              ;(sprite.material as THREE.SpriteMaterial).opacity = normalAlpha
            }, 50 + Math.random() * 100)
          }
          
          // 브라이트니스 변화
          const brightness = 0.5 + Math.sin(time * 2 + columnIndex) * 0.5
          ;(sprite.material as THREE.SpriteMaterial).opacity *= brightness
        })
      })
      
      // 카메라 미세 움직임
      matrixGroup.rotation.y = Math.sin(time * 0.1) * 0.02
      matrixGroup.rotation.x = Math.cos(time * 0.15) * 0.01
    }
  }
  
  // 스프라이트 텍스처 업데이트 함수
  function updateSpriteTexture(
    sprite: THREE.Sprite,
    char: string,
    charIndex: number,
    options: MatrixOptions
  ) {
    const charCanvas = document.createElement('canvas')
    charCanvas.width = 128
    charCanvas.height = 128
    const charCtx = charCanvas.getContext('2d')!
    
    charCtx.font = 'bold 64px monospace'
    charCtx.textAlign = 'center'
    charCtx.textBaseline = 'middle'
    
    const currentColor = getColorForScheme(options.colorScheme, options.primaryColor)
    const secondaryColor = options.colorScheme === 'custom' 
      ? (options.secondaryColor || currentColor) 
      : currentColor
    
    const trailFactor = Math.min(1, (options.trailLength || 15) / 30)
    const alpha = charIndex === 0 ? 1 : Math.max(0.05, 1 - (charIndex / Math.min(sprite.userData.column.characters.length, options.trailLength || 15)) * 0.95 * trailFactor)
    
    const gradient = charCtx.createLinearGradient(0, 0, 0, 128)
    gradient.addColorStop(0, currentColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
    gradient.addColorStop(0.5, secondaryColor + Math.floor(alpha * 200).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, currentColor + '00')
    
    charCtx.fillStyle = gradient
    charCtx.shadowColor = currentColor
    charCtx.shadowBlur = 20
    charCtx.fillText(char, 64, 64)
    
    const texture = new THREE.CanvasTexture(charCanvas)
    const material = sprite.material as THREE.SpriteMaterial
    material.map?.dispose()
    material.map = texture
    material.needsUpdate = true
  }
  
  // 모든 스프라이트 업데이트
  function updateAllSprites() {
    columns.forEach((column) => {
      column.sprites?.forEach((sprite, charIndex) => {
        updateSpriteTexture(sprite, sprite.userData.character, charIndex, options)
      })
    })
  }
  
  // 타이틀 스프라이트 생성
  function createTitleSprite(title: string, options: MatrixOptions): THREE.Sprite {
    const titleCanvas = document.createElement('canvas')
    titleCanvas.width = 1024
    titleCanvas.height = 256
    const titleCtx = titleCanvas.getContext('2d')!
    
    titleCtx.font = 'bold 120px monospace'
    titleCtx.textAlign = 'center'
    titleCtx.textBaseline = 'middle'
    titleCtx.fillStyle = options.primaryColor || '#00ff00'
    titleCtx.shadowColor = options.primaryColor || '#00ff00'
    titleCtx.shadowBlur = 30
    titleCtx.fillText(title, 512, 128)
    
    const titleTexture = new THREE.CanvasTexture(titleCanvas)
    const titleMaterial = new THREE.SpriteMaterial({
      map: titleTexture,
      transparent: true,
      opacity: 0.8
    })
    
    const titleSprite = new THREE.Sprite(titleMaterial)
    titleSprite.position.set(0, 0, 5)
    titleSprite.scale.set(20, 5, 1)
    
    return titleSprite
  }
}

/**
 * Matrix Digital Rain 템플릿 정의 (수정된 버전)
 */
export const matrixDigitalRainTemplate: Template3D = {
  id: 'matrix-digital-rain',
  metadata: {
    name: 'Matrix Digital Rain',
    description: '영화 매트릭스의 아이코닉한 디지털 레인 효과',
    category: 'effects',
    subcategory: 'cinematic',
    tags: ['matrix', 'digital', 'rain', 'code', 'sci-fi', 'glitch'],
    thumbnail: '🟢',
    aspectRatio: '16:9',
    duration: 10,
    platform: 'general',
    difficulty: 'medium',
    author: 'Flux Studio',
    version: '1.1.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  scene: {
    setup: (scene: THREE.Scene, customization: TemplateCustomization) => {
      return createMatrixDigitalRainScene(scene, customization)
    }
  },
  
  ui: {
    customization: {
      sections: [
        {
          id: 'characters',
          title: '문자 설정',
          description: '매트릭스 레인에 사용할 문자를 선택하세요',
          fields: [
            {
              id: 'characterSet',
              type: 'multiSelect',
              label: '문자 세트',
              defaultValue: ['katakana', 'numbers', 'matrix'],
              options: [
                { value: 'korean', label: '한글' },
                { value: 'japanese', label: '히라가나' },
                { value: 'katakana', label: '카타카나' },
                { value: 'latin', label: '영문' },
                { value: 'numbers', label: '숫자' },
                { value: 'symbols', label: '기호' },
                { value: 'matrix', label: '바이너리 (0,1)' }
              ]
            }
          ]
        },
        {
          id: 'appearance',
          title: '시각 효과',
          fields: [
            {
              id: 'colorScheme',
              type: 'select',
              label: '색상 테마',
              defaultValue: 'classic',
              options: [
                { value: 'classic', label: '클래식 (초록색)' },
                { value: 'red', label: '레드 매트릭스' },
                { value: 'blue', label: '블루 매트릭스' },
                { value: 'purple', label: '퍼플 매트릭스' },
                { value: 'golden', label: '골든 매트릭스' },
                { value: 'custom', label: '커스텀' }
              ]
            },
            {
              id: 'primaryColor',
              type: 'color',
              label: '메인 색상',
              defaultValue: '#00ff00'
            },
            {
              id: 'secondaryColor',
              type: 'color',
              label: '보조 색상',
              defaultValue: '#00cc00'
            },
            {
              id: 'glitchIntensity',
              type: 'slider',
              label: '글리치 강도',
              min: 0,
              max: 1,
              step: 0.1,
              defaultValue: 0.1
            }
          ]
        },
        {
          id: 'animation',
          title: '애니메이션',
          fields: [
            {
              id: 'speed',
              type: 'slider',
              label: '떨어지는 속도',
              min: 0.5,
              max: 3,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'density',
              type: 'slider',
              label: '문자 밀도',
              min: 0.5,
              max: 2,
              step: 0.1,
              defaultValue: 1
            },
            {
              id: 'trailLength',
              type: 'slider',
              label: '트레일 길이',
              min: 5,
              max: 30,
              step: 1,
              defaultValue: 15
            },
            {
              id: 'depth',
              type: 'toggle',
              label: '3D 깊이감',
              defaultValue: true
            }
          ]
        }
      ]
    },
    
    preview: {
      showGrid: false,
      showAxes: false,
      cameraPosition: [0, 0, 30],
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
    default: 'rain',
    available: ['rain', 'cascade', 'burst', 'wave'],
    presets: {
      rain: {
        duration: 10,
        easing: 'linear',
        keyframes: [
          { time: 0, action: 'start' },
          { time: 10, action: 'loop' }
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
      primary: '#00ff00',
      secondary: '#00cc00',
      accent: '#00ff00'
    },
    logo: null,
    options: {
      characterSet: ['katakana', 'numbers', 'matrix'],
      colorScheme: 'classic',
      primaryColor: '#00ff00',
      secondaryColor: '#00cc00',
      speed: 1,
      density: 1,
      glitchIntensity: 0.1,
      depth: true,
      trailLength: 15
    }
  }
}