import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * Matrix Digital Rain Template
 * 영화 매트릭스의 아이코닉한 디지털 레인 효과
 * 
 * Features:
 * - 다양한 문자 세트 (한글, 일본어, 라틴, 숫자, 기호)
 * - 3D 깊이감과 원근감
 * - 글리치 및 번쩍임 효과
 * - 커스터마이징 가능한 색상과 속도
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
}

interface MatrixOptions {
  characterSet: string[]
  colorScheme: 'classic' | 'modern' | 'custom'
  primaryColor: string
  secondaryColor: string
  speed: number
  density: number
  glitchIntensity: number
  depth: boolean
  trailLength: number
}

/**
 * 매트릭스 디지털 레인 씬 생성
 */
export function createMatrixDigitalRainScene(
  scene: THREE.Scene,
  customization: TemplateCustomization
) {
  let options = customization.options as MatrixOptions
  
  // 메인 그룹
  const matrixGroup = new THREE.Group()
  
  // 배경 설정 (검은색)
  scene.background = new THREE.Color(0x000000)
  
  // 문자 세트 준비 - 기본값 설정
  const characterSets = options.characterSet || ['katakana', 'numbers', 'matrix']
  const selectedCharacters = characterSets.flatMap(set => 
    MATRIX_CHARACTERS[set as keyof typeof MATRIX_CHARACTERS]?.split('') || []
  ).filter(char => char) // 빈 문자 제거
  
  // 컬럼 수 계산 (밀도에 따라) - 훨씬 더 많이!
  const columnCount = Math.floor(150 * (options.density || 1))
  const columns: MatrixColumn[] = []
  
  // 텍스처 캔버스 생성
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 2048
  const ctx = canvas.getContext('2d')!
  
  // 폰트 설정
  ctx.font = 'bold 64px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 컬럼 초기화 - 더 촘촘하게 배치
  const spacing = 0.8 // 컬럼 간격
  const rows = Math.floor(Math.sqrt(columnCount))
  const cols = Math.ceil(columnCount / rows)
  
  for (let i = 0; i < columnCount; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    
    const column: MatrixColumn = {
      x: (col - cols / 2) * spacing,
      y: Math.random() * 40 - 10, // 더 높은 시작점
      z: (row - rows / 2) * spacing * 0.5,
      speed: 0.05 + Math.random() * 0.1, // 훨씬 느리게
      characters: [],
      brightness: 0.5 + Math.random() * 0.5,
      glitchTime: 0
    }
    
    // 각 컬럼에 더 많은 문자 배치
    const charCount = Math.floor(20 + Math.random() * 30)
    for (let j = 0; j < charCount; j++) {
      column.characters.push(
        selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)]
      )
    }
    
    columns.push(column)
  }
  
  // 각 컬럼을 위한 메시 생성
  const columnMeshes: THREE.Mesh[] = []
  
  columns.forEach((column, index) => {
    // 각 문자를 위한 스프라이트 생성
    column.characters.forEach((char, charIndex) => {
      const charCanvas = document.createElement('canvas')
      charCanvas.width = 128
      charCanvas.height = 128
      const charCtx = charCanvas.getContext('2d')!
      
      // 문자 그리기
      charCtx.font = 'bold 64px monospace'
      charCtx.textAlign = 'center'
      charCtx.textBaseline = 'middle'
      
      // 그라디언트 효과
      const gradient = charCtx.createLinearGradient(0, 0, 0, 128)
      const baseColor = options.colorScheme === 'classic' 
        ? '#00ff00' 
        : options.primaryColor || '#00ff00'
      
      // 트레일 효과를 위한 투명도 - 첫 문자는 밝게
      const alpha = charIndex === 0 ? 1 : Math.max(0.1, 1 - (charIndex / column.characters.length) * 0.9)
      gradient.addColorStop(0, baseColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
      gradient.addColorStop(1, baseColor + '00')
      
      charCtx.fillStyle = gradient
      charCtx.shadowColor = baseColor
      charCtx.shadowBlur = 20
      charCtx.fillText(char, 64, 64)
      
      // 스프라이트 생성
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
        column.y - charIndex * 0.8, // 더 촘촘한 간격
        column.z
      )
      sprite.scale.set(0.8, 0.8, 1) // 더 작은 크기
      
      // 사용자 데이터 저장
      sprite.userData = {
        columnIndex: index,
        charIndex: charIndex,
        originalY: sprite.position.y,
        character: char
      }
      
      matrixGroup.add(sprite)
    })
  })
  
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
  
  scene.add(matrixGroup)
  
  // 조명 설정
  const ambientLight = new THREE.AmbientLight(0x001100, 0.2)
  scene.add(ambientLight)
  
  // 포그 효과로 깊이감 추가
  if (options.depth) {
    scene.fog = new THREE.FogExp2(0x000000, 0.05)
  }
  
  // 타이틀 텍스트 (옵션)
  if (customization.text.title) {
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
    titleCtx.fillText(customization.text.title, 512, 128)
    
    const titleTexture = new THREE.CanvasTexture(titleCanvas)
    const titleMaterial = new THREE.SpriteMaterial({
      map: titleTexture,
      transparent: true,
      opacity: 0.8
    })
    
    const titleSprite = new THREE.Sprite(titleMaterial)
    titleSprite.position.set(0, 0, 5)
    titleSprite.scale.set(20, 5, 1)
    matrixGroup.add(titleSprite)
  }
  
  // 이전 설정 추적
  let lastPrimaryColor = options.primaryColor || '#00ff00'
  let lastColorScheme = options.colorScheme || 'classic'
  let lastDensity = options.density || 1
  let lastCharacterSet = options.characterSet || ['katakana', 'numbers', 'matrix']
  let lastDepth = options.depth !== undefined ? options.depth : true
  let lastTrailLength = options.trailLength || 15
  
  // 현재 문자셋 저장
  let currentCharacters = selectedCharacters
  
  return {
    animate: (time: number) => {
      // 현재 옵션 다시 읽기
      options = customization.options as MatrixOptions
      
      
      // 디버깅을 위한 로그 (간소화)
      if (time < 3) {
        console.log('Matrix Options Debug:', {
          speed: options.speed,
          density: options.density,
          colorScheme: options.colorScheme,
          time: time.toFixed(2)
        })
      }
      
      // 색상이 변경되었는지 확인
      let currentColor = '#00ff00'
      switch (options.colorScheme) {
        case 'classic':
          currentColor = '#00ff00'
          break
        case 'red':
          currentColor = '#ff0000'
          break
        case 'blue':
          currentColor = '#00ffff'
          break
        case 'purple':
          currentColor = '#ff00ff'
          break
        case 'golden':
          currentColor = '#ffd700'
          break
        case 'custom':
          currentColor = options.primaryColor || '#00ff00'
          break
        default:
          currentColor = options.primaryColor || '#00ff00'
      }
      
      const colorChanged = currentColor !== lastPrimaryColor || options.colorScheme !== lastColorScheme
      const depthChanged = options.depth !== lastDepth
      const characterSetChanged = JSON.stringify(options.characterSet) !== JSON.stringify(lastCharacterSet)
      const trailLengthChanged = (options.trailLength || 15) !== lastTrailLength
      const densityChanged = (options.density || 1) !== lastDensity
      
      
      // 문자셋이 변경되었을 때
      if (characterSetChanged) {
        lastCharacterSet = options.characterSet || ['katakana', 'numbers', 'matrix']
        const newCharacterSets = options.characterSet || ['katakana', 'numbers', 'matrix']
        currentCharacters = newCharacterSets.flatMap(set => 
          MATRIX_CHARACTERS[set as keyof typeof MATRIX_CHARACTERS]?.split('') || []
        ).filter(char => char)
        
        // 모든 스프라이트의 문자 업데이트
        matrixGroup.children.forEach(child => {
          if (child instanceof THREE.Sprite && child.userData.columnIndex !== undefined) {
            // 새로운 랜덤 문자 할당
            const newChar = currentCharacters[Math.floor(Math.random() * currentCharacters.length)]
            child.userData.character = newChar
          }
        })
      }
      
      // 3D 깊이감 실시간 토글
      if (depthChanged) {
        lastDepth = options.depth
        if (options.depth) {
          scene.fog = new THREE.FogExp2(0x000000, 0.05)
        } else {
          scene.fog = null
        }
      }
      
      // 밀도 변경 시 컬럼 재생성
      if (densityChanged) {
        lastDensity = options.density || 1
        
        // 기존 스프라이트 모두 제거
        const spritesToRemove: THREE.Object3D[] = []
        matrixGroup.children.forEach(child => {
          if (child instanceof THREE.Sprite && child.userData.columnIndex !== undefined) {
            spritesToRemove.push(child)
            if (child.material instanceof THREE.SpriteMaterial && child.material.map) {
              child.material.map.dispose()
            }
            child.material.dispose()
          }
        })
        spritesToRemove.forEach(sprite => matrixGroup.remove(sprite))
        
        // 새로운 밀도로 컬럼 재생성
        const newColumnCount = Math.floor(150 * (options.density || 1))
        const newRows = Math.floor(Math.sqrt(newColumnCount))
        const newCols = Math.ceil(newColumnCount / newRows)
        
        // columns 배열 재생성
        columns.length = 0
        for (let i = 0; i < newColumnCount; i++) {
          const row = Math.floor(i / newCols)
          const col = i % newCols
          
          const column: MatrixColumn = {
            x: (col - newCols / 2) * spacing,
            y: Math.random() * 40 - 10,
            z: (row - newRows / 2) * spacing * 0.5,
            speed: 0.05 + Math.random() * 0.1,
            characters: [],
            brightness: 0.5 + Math.random() * 0.5,
            glitchTime: 0
          }
          
          const charCount = Math.floor(20 + Math.random() * 30)
          for (let j = 0; j < charCount; j++) {
            column.characters.push(
              currentCharacters[Math.floor(Math.random() * currentCharacters.length)]
            )
          }
          
          columns.push(column)
        }
        
        // 새 스프라이트 생성
        columns.forEach((column, index) => {
          column.characters.forEach((char, charIndex) => {
            const charCanvas = document.createElement('canvas')
            charCanvas.width = 128
            charCanvas.height = 128
            const charCtx = charCanvas.getContext('2d')!
            
            charCtx.font = 'bold 64px monospace'
            charCtx.textAlign = 'center'
            charCtx.textBaseline = 'middle'
            
            const visibleLength = options.trailLength || 15
            const fadeStart = Math.max(0, charIndex - 1)
            const alpha = charIndex === 0 ? 1 : 
              charIndex < visibleLength ? Math.max(0.1, 1 - (fadeStart / visibleLength) * 0.9) : 0
            
            const gradient = charCtx.createLinearGradient(0, 0, 0, 128)
            gradient.addColorStop(0, currentColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
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
              columnIndex: index,
              charIndex: charIndex,
              originalY: sprite.position.y,
              character: char
            }
            
            matrixGroup.add(sprite)
          })
        })
      }
      
      // 트레일 길이 변경 시 모든 문자 투명도 재계산
      if (trailLengthChanged || colorChanged) {
        lastTrailLength = options.trailLength || 15
      }
      
      if (colorChanged || trailLengthChanged) {
        lastPrimaryColor = currentColor
        lastColorScheme = options.colorScheme
        
        // 모든 스프라이트의 색상 업데이트
        matrixGroup.children.forEach(child => {
          if (child instanceof THREE.Sprite && child.userData.columnIndex !== undefined) {
            const charIndex = child.userData.charIndex
            const character = child.userData.character
            
            // 새 텍스처 생성
            const charCanvas = document.createElement('canvas')
            charCanvas.width = 128
            charCanvas.height = 128
            const charCtx = charCanvas.getContext('2d')!
            
            charCtx.font = 'bold 64px monospace'
            charCtx.textAlign = 'center'
            charCtx.textBaseline = 'middle'
            
            // 트레일 길이에 따른 투명도 계산
            const visibleLength = options.trailLength || 15
            const fadeStart = Math.max(0, charIndex - 1)
            const alpha = charIndex === 0 ? 1 : 
              charIndex < visibleLength ? Math.max(0.1, 1 - (fadeStart / visibleLength) * 0.9) : 0
            
            const gradient = charCtx.createLinearGradient(0, 0, 0, 128)
            gradient.addColorStop(0, currentColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
            gradient.addColorStop(1, currentColor + '00')
            
            charCtx.fillStyle = gradient
            charCtx.shadowColor = currentColor
            charCtx.shadowBlur = 20
            charCtx.fillText(character, 64, 64)
            
            const texture = new THREE.CanvasTexture(charCanvas)
            ;(child.material as THREE.SpriteMaterial).map?.dispose() // 이전 텍스처 정리
            ;(child.material as THREE.SpriteMaterial).map = texture
            ;(child.material as THREE.SpriteMaterial).needsUpdate = true
          }
        })
      }
      
      // 글리치 셰이더 업데이트
      glitchMaterial.uniforms.time.value = time
      
      // 각 스프라이트 애니메이션
      matrixGroup.children.forEach(child => {
        if (child instanceof THREE.Sprite && child.userData.columnIndex !== undefined) {
          const columnIndex = child.userData.columnIndex
          const charIndex = child.userData.charIndex
          const column = columns[columnIndex]
          
          // 떨어지는 애니메이션 - 실시간 속도 반영 (수정됨)
          const speedMultiplier = options.speed || 1
          const actualSpeed = column.speed * speedMultiplier
          child.position.y -= actualSpeed
          
          // 화면 아래로 나가면 위로 재배치
          if (child.position.y < -25) {
            child.position.y = 25 + Math.random() * 10
            
            // 문자 랜덤 변경
            const newChar = currentCharacters[Math.floor(Math.random() * currentCharacters.length)]
            child.userData.character = newChar
            
            // 텍스처 업데이트
            const charCanvas = document.createElement('canvas')
            charCanvas.width = 128
            charCanvas.height = 128
            const charCtx = charCanvas.getContext('2d')!
            
            charCtx.font = 'bold 64px monospace'
            charCtx.textAlign = 'center'
            charCtx.textBaseline = 'middle'
            
            // 현재 색상 사용
            let newColor = '#00ff00'
            switch (options.colorScheme) {
              case 'classic':
                newColor = '#00ff00'
                break
              case 'red':
                newColor = '#ff0000'
                break
              case 'blue':
                newColor = '#00ffff'
                break
              case 'purple':
                newColor = '#ff00ff'
                break
              case 'golden':
                newColor = '#ffd700'
                break
              case 'custom':
                newColor = options.primaryColor || '#00ff00'
                break
              default:
                newColor = options.primaryColor || '#00ff00'
            }
            
            // 트레일 길이 적용
            const visibleLength = options.trailLength || 15
            const fadeStart = Math.max(0, charIndex - 1)
            const alpha = charIndex === 0 ? 1 : 
              charIndex < visibleLength ? Math.max(0.1, 1 - (fadeStart / visibleLength) * 0.9) : 0
            
            charCtx.fillStyle = newColor + Math.floor(alpha * 255).toString(16).padStart(2, '0')
            charCtx.shadowColor = newColor
            charCtx.shadowBlur = 20
            charCtx.fillText(newChar, 64, 64)
            
            const texture = new THREE.CanvasTexture(charCanvas)
            ;(child.material as THREE.SpriteMaterial).map = texture
            ;(child.material as THREE.SpriteMaterial).needsUpdate = true
          }
          
          // 글리치 효과 - 실시간 강도 반영
          const glitchChance = (options.glitchIntensity || 0.1) * 0.02
          if (Math.random() < glitchChance) {
            child.position.x += (Math.random() - 0.5) * 0.8
            const glitchOpacity = Math.random() > 0.5 ? 1 : Math.random() * 0.3
            ;(child.material as THREE.SpriteMaterial).opacity = glitchOpacity
            
            // 글리치 후 복구
            setTimeout(() => {
              child.position.x = column.x
              const normalAlpha = charIndex === 0 ? 1 : Math.max(0.1, 1 - (charIndex / column.characters.length) * 0.9)
              ;(child.material as THREE.SpriteMaterial).opacity = normalAlpha * brightness
            }, 50 + Math.random() * 100)
          }
          
          // 브라이트니스 변화
          const brightness = 0.5 + Math.sin(time * 2 + columnIndex) * 0.5
          ;(child.material as THREE.SpriteMaterial).opacity *= brightness
        }
      })
      
      // 카메라 미세 움직임
      matrixGroup.rotation.y = Math.sin(time * 0.1) * 0.02
      matrixGroup.rotation.x = Math.cos(time * 0.15) * 0.01
    }
  }
}

/**
 * Matrix Digital Rain 템플릿 정의
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
    version: '1.0.0',
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
                { value: 'modern', label: '모던 (그라디언트)' },
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
      cameraPosition: [0, 0, 30], // 더 멀리서 보기
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
      speed: 0.7,
      density: 1,
      glitchIntensity: 0.1,
      depth: true,
      trailLength: 15
    }
  }
}