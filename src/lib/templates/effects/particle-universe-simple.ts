import * as THREE from 'three'
import { Template3D, TemplateCustomization } from '@/lib/templates/core/types'

/**
 * 간단한 파티클 유니버스 테스트
 */
export function createSimpleParticleScene(
  scene: THREE.Scene,
  customization: TemplateCustomization
) {
  // 배경색
  scene.background = new THREE.Color(0x000033)
  
  // 간단한 파티클 생성
  const particleCount = 5000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    // 랜덤 위치
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    
    // 랜덤 색상
    colors[i * 3] = Math.random()
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = Math.random()
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })
  
  const particles = new THREE.Points(geometry, material)
  scene.add(particles)
  
  // 조명
  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)
  
  console.log('✨ Simple Particle Scene Created!', {
    particleCount,
    sceneChildren: scene.children.length
  })
  
  return {
    animate: (time: number) => {
      particles.rotation.y = time * 0.1
      particles.rotation.x = time * 0.05
    }
  }
}