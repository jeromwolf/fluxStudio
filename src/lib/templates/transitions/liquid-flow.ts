import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * Liquid Flow Transitions Template
 * 2024년 가장 트렌디한 유체 애니메이션 트랜지션
 * 
 * Features:
 * - 물리 기반 유체 시뮬레이션
 * - 10가지 액체 스타일 (물, 페인트, 잉크, 용암 등)
 * - 실시간 색상 커스터마이징
 * - GPU 가속 렌더링
 */

// 유체 스타일 타입
export type LiquidStyle = 
  | 'water'      // 맑은 물
  | 'paint'      // 진한 페인트
  | 'ink'        // 잉크 번짐
  | 'oil'        // 오일
  | 'lava'       // 용암
  | 'honey'      // 꿀
  | 'milk'       // 우유
  | 'metal'      // 액체 금속
  | 'plasma'     // 플라즈마
  | 'magic'      // 마법 효과

// 트랜지션 방향
export type TransitionDirection = 
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'center-out'
  | 'random'

interface LiquidFlowOptions {
  style: LiquidStyle
  direction: TransitionDirection
  duration: number
  viscosity: number // 점성 (0-1)
  turbulence: number // 난류 강도 (0-1)
  colorA: string
  colorB: string
  glowIntensity: number
}

/**
 * 유체 트랜지션 씬 생성
 */
export function createLiquidFlowScene(
  scene: THREE.Scene, 
  customization: TemplateCustomization
) {
  const options = customization.options as LiquidFlowOptions
  
  // 메인 그룹
  const liquidGroup = new THREE.Group()
  
  // 화면 크기 평면 (트랜지션 영역)
  const planeGeometry = new THREE.PlaneGeometry(20, 15, 128, 96)
  
  // 커스텀 셰이더 머티리얼
  const liquidMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      progress: { value: 0 }, // 트랜지션 진행도 (0-1)
      
      // 유체 속성
      viscosity: { value: options.viscosity || 0.5 },
      turbulence: { value: options.turbulence || 0.3 },
      
      // 색상
      colorA: { value: new THREE.Color(options.colorA || '#007AFF') },
      colorB: { value: new THREE.Color(options.colorB || '#5856D6') },
      
      // 효과
      glowIntensity: { value: options.glowIntensity || 0.5 },
      
      // 스타일별 파라미터
      styleParams: { value: getStyleParams(options.style) },
      
      // 방향
      direction: { value: getDirectionVector(options.direction) }
    },
    
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      uniform float time;
      uniform float progress;
      uniform float turbulence;
      
      // 노이즈 함수
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        vec3 pos = position;
        
        // 유체 변형 효과
        float noise = snoise(vec3(pos.x * 2.0, pos.y * 2.0, time * 0.5));
        float displacement = noise * turbulence * progress * 2.0;
        
        pos.z += displacement;
        
        // 파동 효과
        float wave = sin(pos.x * 3.0 + time * 2.0) * cos(pos.y * 3.0 + time * 1.5);
        pos.z += wave * 0.2 * progress;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      uniform float time;
      uniform float progress;
      uniform float viscosity;
      uniform float turbulence;
      uniform float glowIntensity;
      
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform vec4 styleParams; // x: metalness, y: roughness, z: opacity, w: refraction
      uniform vec2 direction;
      
      // 노이즈 함수 (fragment shader용)
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      void main() {
        vec2 uv = vUv;
        
        // 방향에 따른 진행도 계산
        float dirProgress = dot(uv - 0.5, direction) + 0.5;
        
        // 유체 경계 계산 (부드러운 곡선)
        float boundary = progress;
        
        // 노이즈로 경계 왜곡
        float n = noise(uv * 10.0 + time * 0.5) * 0.1;
        boundary += n * turbulence;
        
        // 점성에 따른 경계 부드러움
        float edge = smoothstep(boundary - viscosity * 0.5, boundary + viscosity * 0.5, dirProgress);
        
        // 색상 혼합
        vec3 color = mix(colorA, colorB, edge);
        
        // 스타일별 효과 적용
        float metalness = styleParams.x;
        float roughness = styleParams.y;
        float opacity = styleParams.z;
        float refraction = styleParams.w;
        
        // 메탈릭 효과
        if (metalness > 0.0) {
          vec3 metalColor = color * (1.0 + metalness * 2.0);
          float metalEdge = pow(1.0 - abs(edge - 0.5) * 2.0, 3.0);
          color = mix(color, metalColor, metalEdge * metalness);
        }
        
        // 글로우 효과
        float glow = pow(1.0 - abs(edge - 0.5) * 2.0, 2.0) * glowIntensity;
        color += glow * 0.5;
        
        // 굴절 효과
        if (refraction > 0.0) {
          float distortion = sin(uv.x * 20.0 + time * 3.0) * cos(uv.y * 20.0 + time * 2.0);
          color = mix(color, color * 1.5, distortion * refraction * edge);
        }
        
        // 최종 색상
        gl_FragColor = vec4(color, opacity);
      }
    `,
    
    transparent: true,
    side: THREE.DoubleSide
  })
  
  const liquidMesh = new THREE.Mesh(planeGeometry, liquidMaterial)
  liquidGroup.add(liquidMesh)
  
  // 파티클 효과 추가 (옵션)
  if (options.style === 'magic' || options.style === 'plasma') {
    const particleCount = 1000
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = Math.random() * 2
      
      const color = new THREE.Color(Math.random() > 0.5 ? options.colorA : options.colorB)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    liquidGroup.add(particles)
  }
  
  scene.add(liquidGroup)
  
  // 조명 설정
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)
  
  // 애니메이션 시간 추적
  let animationTime = 0
  
  return {
    animate: (time: number) => {
      animationTime += 0.016 // 60fps 기준
      
      // 셰이더 유니폼 업데이트
      liquidMaterial.uniforms.time.value = time
      
      // 트랜지션 진행도 계산 (루프)
      const duration = options.duration || 3
      const progress = (animationTime % duration) / duration
      liquidMaterial.uniforms.progress.value = progress
      
      // 파티클 애니메이션
      const particles = liquidGroup.children.find(child => child instanceof THREE.Points) as THREE.Points
      if (particles) {
        particles.rotation.z += 0.001
        const positions = particles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.01
        }
        particles.geometry.attributes.position.needsUpdate = true
      }
    }
  }
}

/**
 * 스타일별 셰이더 파라미터
 */
function getStyleParams(style: LiquidStyle): THREE.Vector4 {
  const params = {
    water: new THREE.Vector4(0.0, 0.0, 0.9, 0.3),      // 투명, 굴절
    paint: new THREE.Vector4(0.0, 0.8, 1.0, 0.0),      // 불투명, 거친 표면
    ink: new THREE.Vector4(0.0, 0.5, 0.95, 0.1),       // 약간 투명
    oil: new THREE.Vector4(0.3, 0.2, 0.98, 0.4),       // 약간 메탈릭, 굴절
    lava: new THREE.Vector4(0.0, 0.9, 1.0, 0.0),       // 불투명, 거친 표면
    honey: new THREE.Vector4(0.1, 0.3, 0.98, 0.2),     // 약간 투명, 끈적임
    milk: new THREE.Vector4(0.0, 0.1, 1.0, 0.0),       // 불투명, 부드러움
    metal: new THREE.Vector4(1.0, 0.1, 1.0, 0.0),      // 완전 메탈릭
    plasma: new THREE.Vector4(0.5, 0.0, 0.8, 0.5),     // 반투명, 에너지
    magic: new THREE.Vector4(0.3, 0.0, 0.7, 0.6)       // 마법 효과
  }
  
  return params[style] || params.water
}

/**
 * 방향별 벡터 계산
 */
function getDirectionVector(direction: TransitionDirection): THREE.Vector2 {
  const vectors = {
    'left-to-right': new THREE.Vector2(1, 0),
    'right-to-left': new THREE.Vector2(-1, 0),
    'top-to-bottom': new THREE.Vector2(0, -1),
    'bottom-to-top': new THREE.Vector2(0, 1),
    'center-out': new THREE.Vector2(0, 0),
    'random': new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize()
  }
  
  return vectors[direction] || vectors['left-to-right']
}

/**
 * Liquid Flow Transitions 템플릿 정의
 */
export const liquidFlowTemplate: Template3D = {
  id: 'liquid-flow-transitions',
  metadata: {
    name: 'Liquid Flow Transitions',
    description: '물리 기반 유체 애니메이션 트랜지션 효과',
    category: 'transition',
    subcategory: 'effects',
    tags: ['liquid', 'flow', 'transition', 'fluid', 'modern', 'trendy'],
    thumbnail: '💧',
    aspectRatio: '16:9',
    duration: 3,
    platform: 'general',
    difficulty: 'easy',
    author: 'Flux Studio',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  scene: {
    setup: (scene: THREE.Scene, customization: TemplateCustomization) => {
      return createLiquidFlowScene(scene, customization)
    }
  },
  
  ui: {
    customization: {
      sections: [
        {
          id: 'style',
          title: '액체 스타일',
          description: '트랜지션 효과의 액체 유형을 선택하세요',
          fields: [
            {
              id: 'style',
              type: 'select',
              label: '스타일',
              defaultValue: 'water',
              options: {
                water: '맑은 물 💧',
                paint: '페인트 🎨',
                ink: '잉크 🖋️',
                oil: '오일 🛢️',
                lava: '용암 🌋',
                honey: '꿀 🍯',
                milk: '우유 🥛',
                metal: '액체 금속 🔧',
                plasma: '플라즈마 ⚡',
                magic: '마법 ✨'
              }
            }
          ]
        },
        {
          id: 'colors',
          title: '색상 설정',
          fields: [
            {
              id: 'colorA',
              type: 'color',
              label: '시작 색상',
              defaultValue: '#007AFF'
            },
            {
              id: 'colorB',
              type: 'color',
              label: '종료 색상',
              defaultValue: '#5856D6'
            },
            {
              id: 'glowIntensity',
              type: 'slider',
              label: '글로우 강도',
              defaultValue: 0.5,
              min: 0,
              max: 1,
              step: 0.1
            }
          ]
        },
        {
          id: 'physics',
          title: '물리 속성',
          fields: [
            {
              id: 'viscosity',
              type: 'slider',
              label: '점성',
              description: '액체의 끈적임 정도',
              defaultValue: 0.5,
              min: 0,
              max: 1,
              step: 0.1
            },
            {
              id: 'turbulence',
              type: 'slider',
              label: '난류',
              description: '액체의 불규칙한 움직임',
              defaultValue: 0.3,
              min: 0,
              max: 1,
              step: 0.1
            }
          ]
        },
        {
          id: 'animation',
          title: '애니메이션',
          fields: [
            {
              id: 'direction',
              type: 'select',
              label: '방향',
              defaultValue: 'left-to-right',
              options: {
                'left-to-right': '왼쪽에서 오른쪽 →',
                'right-to-left': '오른쪽에서 왼쪽 ←',
                'top-to-bottom': '위에서 아래 ↓',
                'bottom-to-top': '아래에서 위 ↑',
                'center-out': '중앙에서 바깥 ⟲',
                'random': '랜덤 🎲'
              }
            },
            {
              id: 'duration',
              type: 'slider',
              label: '지속 시간',
              defaultValue: 3,
              min: 1,
              max: 10,
              step: 0.5
            }
          ]
        }
      ]
    },
    
    preview: {
      showGrid: false,
      showAxes: false,
      cameraPosition: [0, 0, 15],
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
    default: 'flow',
    available: ['flow', 'wave', 'splash', 'drip'],
    presets: {
      flow: {
        duration: 3,
        easing: 'easeInOutCubic',
        keyframes: [
          { progress: 0 },
          { progress: 1 }
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
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF3B30'
    },
    logo: null,
    options: {
      style: 'water',
      direction: 'left-to-right',
      duration: 3,
      viscosity: 0.5,
      turbulence: 0.3,
      colorA: '#007AFF',
      colorB: '#5856D6',
      glowIntensity: 0.5,
      speed: 1
    }
  }
}