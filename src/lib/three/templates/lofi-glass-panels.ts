import * as THREE from 'three'
import { TemplateCustomization } from '../templates'

/**
 * Lo-fi Glass Panels Template
 * 스크린샷에서 영감을 받은 일몰 배경의 투명 유리 패널들
 */
export function createLofiGlassPanelsScene(scene: THREE.Scene, customization: TemplateCustomization) {
  const mainGroup = new THREE.Group()

  // 배경 그라디언트 (일몰 색상)
  const bgGeometry = new THREE.PlaneGeometry(20, 15)
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      topColor: { value: new THREE.Color('#FF6B9D') }, // 핑크
      middleColor: { value: new THREE.Color('#FF8E53') }, // 오렌지  
      bottomColor: { value: new THREE.Color('#4FACFE') }, // 블루
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 middleColor;
      uniform vec3 bottomColor;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        float gradient = vUv.y;
        vec3 color;
        
        if (gradient > 0.6) {
          color = mix(middleColor, topColor, (gradient - 0.6) / 0.4);
        } else {
          color = mix(bottomColor, middleColor, gradient / 0.6);
        }
        
        // 구름 효과
        float cloud = sin(vUv.x * 10.0 + time * 0.5) * sin(vUv.y * 5.0 + time * 0.3) * 0.1;
        color += cloud * 0.2;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  })
  const background = new THREE.Mesh(bgGeometry, bgMaterial)
  background.position.z = -10
  mainGroup.add(background)

  // 투명 유리 패널들 생성 (스크린샷과 유사한 배치)
  const panelSizes = [
    { w: 2, h: 3, pos: { x: -4, y: 1, z: 0 }, color: '#FF6B9D' },
    { w: 1.5, h: 2, pos: { x: -2, y: -1, z: 1 }, color: '#FFB347' },
    { w: 2.5, h: 1.8, pos: { x: 0, y: 2, z: 0.5 }, color: '#87CEEB' },
    { w: 1.8, h: 2.5, pos: { x: 2, y: 0, z: 1.5 }, color: '#DDA0DD' },
    { w: 3, h: 2, pos: { x: 4, y: -2, z: 0.8 }, color: '#F0E68C' },
    { w: 1.2, h: 1.5, pos: { x: -1, y: -3, z: 2 }, color: '#FFA07A' },
    { w: 2, h: 1.2, pos: { x: 1.5, y: 3, z: 1 }, color: '#98FB98' },
    { w: 1.6, h: 1.8, pos: { x: -3.5, y: 3, z: 1.2 }, color: '#F0E68C' },
    { w: 1.3, h: 2.2, pos: { x: 3.5, y: 1.5, z: 0.3 }, color: '#FFB6C1' },
  ]

  const panels: THREE.Mesh[] = []
  panelSizes.forEach((panel, index) => {
    const geometry = new THREE.PlaneGeometry(panel.w, panel.h)
    
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(panel.color),
      transparent: true,
      opacity: 0.3,  // 더 진하게
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.45,  // 유리 굴절률
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(panel.pos.x, panel.pos.y, panel.pos.z)
    mesh.rotation.y = (Math.random() - 0.5) * 0.3
    mesh.rotation.x = (Math.random() - 0.5) * 0.2
    
    panels.push(mesh)
    mainGroup.add(mesh)
  })

  // 여러 개의 전선 효과
  const wires = []
  for (let w = 0; w < 3; w++) {
    const wireGeometry = new THREE.BufferGeometry()
    const wirePoints = []
    const yOffset = 3 - w * 1.5
    
    for (let i = 0; i < 30; i++) {
      const x = -8 + (i / 29) * 16
      const y = yOffset + Math.sin(i * 0.3 + w) * 0.4 * (1 + Math.sin(i * 0.1) * 0.5)
      wirePoints.push(new THREE.Vector3(x, y, -2 + w * 0.3))
    }
    wireGeometry.setFromPoints(wirePoints)
    
    const wireMaterial = new THREE.LineBasicMaterial({
      color: w === 0 ? '#1a1a1a' : w === 1 ? '#2a2a2a' : '#3a3a3a',
      transparent: true,
      opacity: 0.9 - w * 0.2,
      linewidth: 4 - w
    })
    const wire = new THREE.Line(wireGeometry, wireMaterial)
    wires.push(wire)
    mainGroup.add(wire)
  }

  // 전봇대 추가
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 8, 8)
  const poleMaterial = new THREE.MeshLambertMaterial({ 
    color: '#2a2a2a',
    emissive: '#1a1a1a',
    emissiveIntensity: 0.2
  })
  
  // 왼쪽 전봇대
  const leftPole = new THREE.Mesh(poleGeometry, poleMaterial)
  leftPole.position.set(-8.5, 0, -2)
  mainGroup.add(leftPole)
  
  // 오른쪽 전봇대
  const rightPole = new THREE.Mesh(poleGeometry, poleMaterial)
  rightPole.position.set(8.5, 0, -2)
  mainGroup.add(rightPole)

  // 텍스트 (로파이 스타일)
  const createLofiText = (text: string, size: number, position: THREE.Vector3) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 512
    canvas.height = 256

    context.fillStyle = customization.colors.primary
    context.font = `${size}px 'Courier New', monospace`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    // 글로우 효과
    context.shadowColor = customization.colors.primary
    context.shadowBlur = 20
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: 0.9
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(position)
    sprite.scale.set(4, 2, 1)
    
    return sprite
  }

  const titleSprite = createLofiText(customization.text.title, 48, new THREE.Vector3(0, 1, 3))
  const subtitleSprite = createLofiText(customization.text.subtitle, 32, new THREE.Vector3(0, -0.5, 3))
  mainGroup.add(titleSprite)
  mainGroup.add(subtitleSprite)

  scene.add(mainGroup)

  // 먼지 파티클 효과
  const particleCount = 200
  const particleGeometry = new THREE.BufferGeometry()
  const particlePositions = new Float32Array(particleCount * 3)
  const particleSizes = new Float32Array(particleCount)
  
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 20
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 15
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10
    particleSizes[i] = Math.random() * 0.05 + 0.02
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  mainGroup.add(particles)

  // 조명 - 더 드라마틱하게
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffa500, 1.5)
  sunLight.position.set(-5, 5, 5)
  sunLight.castShadow = true
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0xff6b9d, 0.8)
  rimLight.position.set(5, -2, 3)
  scene.add(rimLight)
  
  // 포인트 라이트로 글로우 효과
  const glowLight = new THREE.PointLight(0xff8e53, 2, 20)
  glowLight.position.set(0, 0, 5)
  mainGroup.add(glowLight)

  return {
    animate: (time: number) => {
      // 배경 그라디언트 애니메이션
      if (bgMaterial.uniforms) {
        bgMaterial.uniforms.time.value = time * 0.5
      }

      // 패널들의 부드러운 회전과 움직임
      panels.forEach((panel, index) => {
        const baseY = panel.userData.originalY || panel.position.y
        panel.userData.originalY = panel.userData.originalY || panel.position.y
        
        panel.rotation.y = Math.sin(time * 0.5 + index) * 0.3
        panel.rotation.x = Math.cos(time * 0.3 + index) * 0.2
        panel.position.y = baseY + Math.sin(time * 0.5 + index * 0.5) * 0.3
        panel.position.x += Math.sin(time * 0.2 + index) * 0.005
        
        // 반짝임 효과
        const material = panel.material as THREE.MeshPhysicalMaterial
        material.opacity = 0.3 + Math.sin(time * 2 + index) * 0.1
      })

      // 텍스트 부드러운 움직임
      titleSprite.position.y = 1 + Math.sin(time * 0.8) * 0.1
      subtitleSprite.position.y = -0.5 + Math.cos(time * 0.6) * 0.08

      // 전체 그룹 미세한 회전
      mainGroup.rotation.y = Math.sin(time * 0.1) * 0.02
      
      // 파티클 애니메이션
      if (particles) {
        const positions = particles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.001
          positions[i] += Math.cos(time + i) * 0.0005
        }
        particles.geometry.attributes.position.needsUpdate = true
        particles.rotation.y = time * 0.05
      }
      
      // 글로우 라이트 펄스
      glowLight.intensity = 2 + Math.sin(time * 2) * 0.5
      glowLight.position.y = Math.sin(time * 0.5) * 2
      
      // 전선 흔들림
      wires.forEach((wire, index) => {
        const positions = wire.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i]
          const baseY = 3 - index * 1.5 + Math.sin((x + 8) * 0.3 + index) * 0.4
          positions[i + 1] = baseY + Math.sin(time * 2 + x * 0.5) * 0.05
        }
        wire.geometry.attributes.position.needsUpdate = true
      })
    }
  }
}

// 템플릿 정의
export const lofiGlassPanelsTemplate = {
  id: 'lofi-glass-panels',
  name: 'Lo-fi Glass',
  description: 'Aesthetic glass panels with sunset',
  thumbnail: '🌅',
  category: 'social' as const,
  subcategory: 'aesthetic',
  duration: 8,
  aspectRatio: '16:9' as const,
  defaultCustomization: {
    text: {
      title: 'Lo-fi Vibes',
      subtitle: 'Chill & Relax',
      company: 'Aesthetic',
    },
    colors: {
      primary: '#FF6B9D', // Sunset pink
      secondary: '#FFB347', // Warm orange
      accent: '#87CEEB', // Sky blue
    },
    logo: null,
    options: {
      speed: 1,
      style: 'aesthetic',
      duration: 8,
      panelCount: 9,
      glassOpacity: 0.12,
      sunsetIntensity: 'medium',
    },
  },
  sceneSetup: (scene: THREE.Scene, customization: any) => {
    return createLofiGlassPanelsScene(scene, customization)
  }
}