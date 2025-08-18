import * as THREE from 'three'
import { TemplateCustomization } from './templates'

/**
 * 3D 텍스트와 박스 데모
 * Three.js로 텍스트와 박스를 그리는 방법을 보여줍니다
 */
export function createTextBoxDemo(scene: THREE.Scene, customization: TemplateCustomization) {
  const group = new THREE.Group()

  // 1. 3D 박스 생성
  const boxGeometry = new THREE.BoxGeometry(4, 2, 0.5)
  const boxMaterial = new THREE.MeshLambertMaterial({
    color: customization.colors.primary,
    transparent: true,
    opacity: 0.8
  })
  const box = new THREE.Mesh(boxGeometry, boxMaterial)
  box.position.set(0, 0, 0)
  group.add(box)

  // 2. Canvas를 사용한 2D 텍스트 (텍스처로 적용)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 512
  canvas.height = 256

  // 배경
  context.fillStyle = customization.colors.secondary
  context.fillRect(0, 0, canvas.width, canvas.height)

  // 텍스트
  context.fillStyle = '#FFFFFF'
  context.font = 'bold 48px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(customization.text.title, canvas.width / 2, canvas.height / 2 - 30)
  
  context.font = '32px Arial'
  context.fillText(customization.text.subtitle, canvas.width / 2, canvas.height / 2 + 30)

  // 텍스처 생성
  const texture = new THREE.CanvasTexture(canvas)
  const textMaterial = new THREE.MeshLambertMaterial({ map: texture })
  const textPlane = new THREE.PlaneGeometry(4, 2)
  const textMesh = new THREE.Mesh(textPlane, textMaterial)
  textMesh.position.set(0, 0, 0.26) // 박스 앞면에 배치
  group.add(textMesh)

  // 3. CSS3D 텍스트 (HTML 기반) - 더 선명한 텍스트
  const createHtmlText = (text: string, className: string = '') => {
    const div = document.createElement('div')
    div.textContent = text
    div.style.cssText = `
      color: white;
      font-family: Arial, sans-serif;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      background: rgba(0,0,0,0.7);
      padding: 10px 20px;
      border-radius: 8px;
      ${className}
    `
    return div
  }

  // 4. 여러 박스들 배열
  const colors = [
    customization.colors.primary,
    customization.colors.secondary, 
    customization.colors.accent
  ]

  for (let i = 0; i < 3; i++) {
    const smallBox = new THREE.BoxGeometry(1, 1, 1)
    const smallBoxMaterial = new THREE.MeshLambertMaterial({
      color: colors[i],
      transparent: true,
      opacity: 0.9
    })
    const smallBoxMesh = new THREE.Mesh(smallBox, smallBoxMaterial)
    smallBoxMesh.position.set((i - 1) * 2, -3, 0)
    group.add(smallBoxMesh)
  }

  // 5. 와이어프레임 박스
  const wireframeGeometry = new THREE.BoxGeometry(6, 4, 2)
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: customization.colors.accent,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  })
  const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
  wireframeMesh.position.set(0, 0, 0)
  group.add(wireframeMesh)

  // 6. 텍스트 스프라이트 (항상 카메라를 향함)
  const createTextSprite = (text: string, color: string = '#ffffff') => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    context.font = 'bold 64px Arial'
    const metrics = context.measureText(text)
    canvas.width = metrics.width + 40
    canvas.height = 80
    
    // 투명 배경
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // 텍스트
    context.fillStyle = color
    context.font = 'bold 64px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
    return new THREE.Sprite(material)
  }

  const titleSprite = createTextSprite(customization.text.title, customization.colors.primary)
  titleSprite.position.set(0, 3, 0)
  titleSprite.scale.set(4, 1, 1)
  group.add(titleSprite)

  const subtitleSprite = createTextSprite(customization.text.subtitle, customization.colors.secondary)
  subtitleSprite.position.set(0, 2, 0)
  subtitleSprite.scale.set(3, 0.8, 1)
  group.add(subtitleSprite)

  scene.add(group)

  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 애니메이션 함수
  const animate = (time: number) => {
    // 메인 그룹 회전
    group.rotation.y = time * 0.5
    
    // 작은 박스들 개별 회전
    group.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry && child.geometry.parameters.width === 1) {
        child.rotation.x = time * (1 + index * 0.5)
        child.rotation.z = time * (0.8 + index * 0.3)
      }
    })

    // 텍스트 스프라이트 애니메이션
    if (titleSprite) {
      titleSprite.position.y = 3 + Math.sin(time * 2) * 0.2
    }
    if (subtitleSprite) {
      subtitleSprite.position.y = 2 + Math.cos(time * 2.5) * 0.15
    }

    // 와이어프레임 박스 회전
    wireframeMesh.rotation.x = time * 0.3
    wireframeMesh.rotation.y = time * 0.2
  }

  return { animate }
}

// 템플릿에 추가할 수 있는 예제
export const textBoxTemplate = {
  id: 'text-box-demo',
  name: 'Text & Box Demo',
  description: '3D text and box examples',
  thumbnail: '📝',
  category: 'business' as const,
  subcategory: 'demo',
  duration: 10,
  aspectRatio: '16:9' as const,
  defaultCustomization: {
    text: {
      title: 'Hello 3D World!',
      subtitle: 'Text & Boxes Demo',
      company: 'Three.js Magic'
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981', 
      accent: '#F59E0B'
    },
    logo: null,
    options: {
      speed: 1,
      style: 'demo',
      duration: 10
    }
  },
  sceneSetup: (scene: THREE.Scene, customization: any) => {
    return createTextBoxDemo(scene, customization)
  }
}