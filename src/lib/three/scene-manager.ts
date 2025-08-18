import * as THREE from 'three'
import { TemplateCustomization, getTemplateById } from './templates'
import { exampleScenes, animateTemplate } from './example-scenes'
import { templateScenes } from './template-scenes'

export class SceneManager {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private animationId: number | null = null
  private clock: THREE.Clock
  private currentTemplate: string | null = null
  private templateObjects: any = null
  private templateAnimator: ((time: number) => void) | null = null
  private uiElementsData: Map<string, any> = new Map() // UI 요소 데이터 저장
  
  constructor(canvas: HTMLCanvasElement) {
    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf0f0f0)
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    this.camera.position.z = 5
    
    // Initialize clock for animations
    this.clock = new THREE.Clock()
    
    // Add basic lighting
    this.setupLighting()
    
    // Handle resize
    this.handleResize()
    window.addEventListener('resize', this.handleResize.bind(this))
  }
  
  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    this.scene.add(directionalLight)
  }
  
  private handleResize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    
    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
  }
  
  public clearScene() {
    // Reset template animator
    this.templateAnimator = null
    
    // Remove all objects except lights
    const objectsToRemove: THREE.Object3D[] = []
    this.scene.traverse((child) => {
      // Skip lights but remove everything else
      if (!(child instanceof THREE.Light) && child !== this.scene) {
        objectsToRemove.push(child)
      }
    })
    
    objectsToRemove.forEach((obj) => {
      // Remove from parent (could be scene or a group)
      if (obj.parent) {
        obj.parent.remove(obj)
      }
      
      // Dispose of geometries and materials
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        } else if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose())
        }
      } else if (obj instanceof THREE.Points) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        }
      } else if (obj instanceof THREE.Line) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        }
      }
      
      // Recursively clear children
      while (obj.children.length > 0) {
        obj.remove(obj.children[0])
      }
    })
    
    // Reset template state
    this.currentTemplate = null
    this.templateObjects = null
  }
  
  public async loadTemplate(templateId: string, customization: TemplateCustomization) {
    this.clearScene()
    this.currentTemplate = templateId
    
    // Get template definition
    const template = getTemplateById(templateId)
    
    if (template) {
      // Check if we have a specific scene implementation
      if (templateScenes[templateId as keyof typeof templateScenes]) {
        const sceneSetup = templateScenes[templateId as keyof typeof templateScenes]
        const result = await sceneSetup(this.scene, customization)
        this.templateAnimator = result.animate
      } else {
        // Use the template's own scene setup
        const result = template.sceneSetup(this.scene, customization)
        this.templateAnimator = result.animate
      }
    } else {
      // Fallback to legacy templates
      switch (templateId) {
        case 'modern-intro':
          this.setupModernIntro(customization)
          break
        case 'logo-reveal':
          this.setupLogoReveal(customization)
          break
        case 'social-callout':
          this.setupSocialCallout(customization)
          break
        default:
          this.setupDefaultScene(customization)
      }
    }
  }
  
  private setupModernIntro(customization: TemplateCustomization) {
    this.currentTemplate = 'modernIntro'
    this.templateObjects = exampleScenes.modernIntro(this.scene, customization)
  }
  
  private setupLogoReveal(customization: TemplateCustomization) {
    this.currentTemplate = 'logoReveal'
    this.templateObjects = exampleScenes.logoReveal(this.scene, customization)
  }
  
  private setupSocialCallout(customization: TemplateCustomization) {
    this.currentTemplate = 'socialCallout'
    this.templateObjects = exampleScenes.socialCallout(this.scene, customization)
  }
  
  private setupDefaultScene(customization: TemplateCustomization) {
    // Default scene with basic shapes
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({ 
      color: customization.colors.primary 
    })
    const cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
    
    this.currentTemplate = 'default'
    this.templateObjects = { cube }
  }
  
  public startAnimation() {
    if (this.animationId !== null) return
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      
      const elapsedTime = this.clock.getElapsedTime()
      
      // Animate objects based on template
      if (this.templateAnimator) {
        this.templateAnimator(elapsedTime)
      } else if (this.currentTemplate && this.templateObjects) {
        // Fallback to legacy animation
        if (this.currentTemplate === 'modernIntro') {
          animateTemplate.modernIntro(this.templateObjects, elapsedTime)
        } else if (this.currentTemplate === 'logoReveal') {
          animateTemplate.logoReveal(this.templateObjects, elapsedTime)
        } else if (this.currentTemplate === 'socialCallout') {
          animateTemplate.socialCallout(this.templateObjects, elapsedTime)
        } else if (this.currentTemplate === 'default' && this.templateObjects.cube) {
          this.templateObjects.cube.rotation.y = elapsedTime * 0.5
          this.templateObjects.cube.position.y = Math.sin(elapsedTime) * 0.2
        }
      }
      
      this.renderer.render(this.scene, this.camera)
    }
    
    animate()
  }
  
  public stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
  
  public dispose() {
    this.stopAnimation()
    this.clearScene()
    this.renderer.dispose()
    window.removeEventListener('resize', this.handleResize.bind(this))
  }
  
  public exportFrame(): string {
    this.renderer.render(this.scene, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  public renderAtTime(time: number): void {
    // Temporarily stop animation
    const wasAnimating = this.animationId !== null
    if (wasAnimating) {
      this.stopAnimation()
    }

    // Set clock to specific time
    this.clock.elapsedTime = time

    // Render frame at specific time
    if (this.templateAnimator) {
      this.templateAnimator(time)
    } else if (this.currentTemplate && this.templateObjects) {
      // Fallback to legacy animation
      if (this.currentTemplate === 'modernIntro') {
        animateTemplate.modernIntro(this.templateObjects, time)
      } else if (this.currentTemplate === 'logoReveal') {
        animateTemplate.logoReveal(this.templateObjects, time)
      } else if (this.currentTemplate === 'socialCallout') {
        animateTemplate.socialCallout(this.templateObjects, time)
      } else if (this.currentTemplate === 'default' && this.templateObjects.cube) {
        this.templateObjects.cube.rotation.y = time * 0.5
        this.templateObjects.cube.position.y = Math.sin(time) * 0.2
      }
    }

    this.renderer.render(this.scene, this.camera)

    // Restart animation if it was running
    if (wasAnimating) {
      this.startAnimation()
    }
  }

  public setCanvasSize(width: number, height: number): void {
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
  
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }
  
  public getScene(): THREE.Scene {
    return this.scene
  }
  
  public getCamera(): THREE.Camera {
    return this.camera
  }

  // 드래그로 추가된 UI 요소들을 관리하는 메서드들
  public addUIElement(element: any): void {
    // 요소 데이터 저장
    this.uiElementsData.set(element.id, element)
    
    const mesh = this.createUIElementMesh(element)
    if (mesh) {
      mesh.name = element.id
      this.scene.add(mesh)
    }
  }

  private createUIElementMesh(element: any): THREE.Object3D | null {
    switch (element.type) {
      case 'text':
        return this.createTextMesh(element)
      case 'rectangle':
        return this.createRectangleMesh(element)
      case 'circle':
        return this.createCircleMesh(element)
      case 'arrow':
        return this.createArrowMesh(element)
      case 'triangle':
        return this.createTriangleMesh(element)
      default:
        return null
    }
  }

  private createTextMesh(element: any): THREE.Object3D {
    // Canvas를 사용하여 텍스트 텍스처 생성
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    canvas.width = 512
    canvas.height = 256
    
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = element.style.color
    context.font = `${element.style.fontSize || 24}px Arial`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(element.content || 'New Text', canvas.width / 2, canvas.height / 2)
    
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: element.style.opacity || 1
    })
    const sprite = new THREE.Sprite(material)
    
    // 뷰포트 좌표를 3D 좌표로 변환
    const worldPos = this.screenToWorld(element.position.x, element.position.y)
    sprite.position.set(worldPos.x, worldPos.y, 2) // Z=2로 앞쪽에 배치
    sprite.scale.set(element.size.width / 100, element.size.height / 100, 1)
    
    return sprite
  }

  private createRectangleMesh(element: any): THREE.Object3D {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity || 1,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    const worldPos = this.screenToWorld(element.position.x, element.position.y)
    mesh.position.set(worldPos.x, worldPos.y, 2)
    mesh.scale.set(element.size.width / 100, element.size.height / 100, 1)
    
    return mesh
  }

  private createCircleMesh(element: any): THREE.Object3D {
    const geometry = new THREE.CircleGeometry(1, 32)
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity || 1,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    const worldPos = this.screenToWorld(element.position.x, element.position.y)
    mesh.position.set(worldPos.x, worldPos.y, 2)
    const size = Math.max(element.size.width, element.size.height) / 100
    mesh.scale.set(size, size, 1)
    
    return mesh
  }

  private createArrowMesh(element: any): THREE.Object3D {
    const group = new THREE.Group()
    
    // 화살표 몸체
    const shaftGeometry = new THREE.PlaneGeometry(1.5, 0.2)
    const shaftMaterial = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity || 1
    })
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial)
    group.add(shaft)
    
    // 화살표 머리
    const headGeometry = new THREE.ConeGeometry(0.3, 0.6, 3)
    const headMaterial = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity || 1
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.rotation.z = -Math.PI / 2
    head.position.x = 1
    group.add(head)
    
    const worldPos = this.screenToWorld(element.position.x, element.position.y)
    group.position.set(worldPos.x, worldPos.y, 2)
    group.scale.set(element.size.width / 100, element.size.height / 100, 1)
    
    return group
  }

  private createTriangleMesh(element: any): THREE.Object3D {
    const geometry = new THREE.ConeGeometry(1, 2, 3)
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity || 1
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    const worldPos = this.screenToWorld(element.position.x, element.position.y)
    mesh.position.set(worldPos.x, worldPos.y, 2)
    mesh.scale.set(element.size.width / 100, element.size.height / 100, 1)
    
    return mesh
  }

  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const canvas = this.renderer.domElement
    const rect = canvas.getBoundingClientRect()
    
    // 정규화된 디바이스 좌표(-1 to 1)로 변환
    const x = (screenX / rect.width) * 2 - 1
    const y = -(screenY / rect.height) * 2 + 1
    
    // 카메라 거리를 고려한 월드 좌표 계산
    const vector = new THREE.Vector3(x, y, 0.5)
    vector.unproject(this.camera)
    
    const dir = vector.sub(this.camera.position).normalize()
    const distance = -this.camera.position.z / dir.z
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance))
    
    return { x: pos.x, y: pos.y }
  }

  public updateUIElement(elementId: string, updates: any): void {
    const object = this.scene.getObjectByName(elementId)
    if (!object) return

    // 저장된 요소 데이터 업데이트
    const currentData = this.uiElementsData.get(elementId)
    if (currentData) {
      const updatedData = {
        ...currentData,
        ...updates,
        style: { ...currentData.style, ...updates.style },
        position: { ...currentData.position, ...updates.position },
        size: { ...currentData.size, ...updates.size }
      }
      this.uiElementsData.set(elementId, updatedData)
    }

    // 위치 업데이트
    if (updates.position) {
      const worldPos = this.screenToWorld(updates.position.x, updates.position.y)
      object.position.set(worldPos.x, worldPos.y, 2)
    }

    // 크기 업데이트
    if (updates.size) {
      object.scale.set(
        updates.size.width / 100, 
        updates.size.height / 100, 
        1
      )
    }

    // 색상 업데이트 (텍스트와 도형 모두 처리)
    if (updates.style?.color) {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
        object.material.color.set(updates.style.color)
      } else if (object instanceof THREE.Sprite) {
        // 텍스트 스프라이트의 경우 새로운 캔버스 텍스처를 생성해야 함
        this.updateTextSprite(object, elementId)
      }
    }

    // 투명도 업데이트
    if (updates.style?.opacity !== undefined) {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
        object.material.opacity = updates.style.opacity
      } else if (object instanceof THREE.Sprite && object.material instanceof THREE.SpriteMaterial) {
        object.material.opacity = updates.style.opacity
      }
    }

    // 텍스트 관련 업데이트 (내용, 색상, 폰트 크기)
    if ((updates.content !== undefined || updates.style?.color || updates.style?.fontSize) && object instanceof THREE.Sprite) {
      this.updateTextSprite(object, elementId)
    }
  }


  private updateTextSprite(sprite: THREE.Sprite, elementId: string): void {
    // 저장된 요소 데이터 사용
    const elementData = this.uiElementsData.get(elementId)
    if (!elementData) return
    
    // 새로운 캔버스 텍스처 생성
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    canvas.width = 512
    canvas.height = 256
    
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = elementData.style?.color || '#3B82F6'
    context.font = `${elementData.style?.fontSize || 24}px Arial`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(
      elementData.content || 'New Text', 
      canvas.width / 2, 
      canvas.height / 2
    )
    
    const texture = new THREE.CanvasTexture(canvas)
    if (sprite.material instanceof THREE.SpriteMaterial) {
      // 이전 텍스처 정리
      if (sprite.material.map) {
        sprite.material.map.dispose()
      }
      sprite.material.map = texture
      sprite.material.needsUpdate = true
      
      // 투명도도 업데이트
      if (elementData.style?.opacity !== undefined) {
        sprite.material.opacity = elementData.style.opacity
      }
    }
  }

  public removeUIElement(elementId: string): void {
    // 저장된 데이터 제거
    this.uiElementsData.delete(elementId)
    
    const object = this.scene.getObjectByName(elementId)
    if (object) {
      this.scene.remove(object)
      
      // 메모리 정리
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        }
      } else if (object instanceof THREE.Sprite) {
        if (object.material instanceof THREE.SpriteMaterial) {
          if (object.material.map) {
            object.material.map.dispose()
          }
          object.material.dispose()
        }
      }
    }
  }
}