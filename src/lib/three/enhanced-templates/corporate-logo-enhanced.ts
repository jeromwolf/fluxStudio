import * as THREE from 'three'
import { TemplateCustomization } from '../templates'

export const corporateLogoEnhanced = (scene: THREE.Scene, customization: TemplateCustomization) => {
  // Advanced materials with reflections
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
  const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)
  scene.add(cubeCamera)

  // Create metallic cube with environment mapping
  const geometry = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32)
  
  // Custom shader material for advanced effects
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(customization.colors.primary),
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMap: cubeRenderTarget.texture,
    envMapIntensity: 1.5,
  })

  const mainCube = new THREE.Mesh(geometry, material)
  mainCube.name = 'main-cube'
  scene.add(mainCube)

  // Particle system orbiting the cube
  const particleCount = 1000
  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  
  const color1 = new THREE.Color(customization.colors.primary)
  const color2 = new THREE.Color(customization.colors.secondary)
  const color3 = new THREE.Color(customization.colors.accent)

  for (let i = 0; i < particleCount; i++) {
    const radius = 3 + Math.random() * 2
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // Gradient colors
    const mixAmount = i / particleCount
    const color = mixAmount < 0.33 ? color1 : mixAmount < 0.66 ? color2 : color3
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    sizes[i] = Math.random() * 0.1 + 0.05
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // Custom shader for particles
  const particleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.8 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      
      void main() {
        vColor = color;
        vec3 pos = position;
        
        // Orbital motion
        float angle = time * 0.5;
        mat3 rotation = mat3(
          cos(angle), 0.0, sin(angle),
          0.0, 1.0, 0.0,
          -sin(angle), 0.0, cos(angle)
        );
        pos = rotation * pos;
        
        // Pulsing effect
        pos *= 1.0 + sin(time * 2.0 + length(position)) * 0.1;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float opacity;
      varying vec3 vColor;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.0, dist) * opacity;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  const particles = new THREE.Points(particlesGeometry, particleShaderMaterial)
  scene.add(particles)

  // Energy beams
  const beamGeometry = new THREE.CylinderGeometry(0.01, 0.01, 10, 8)
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: customization.colors.accent,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  })

  const beams: THREE.Mesh[] = []
  for (let i = 0; i < 6; i++) {
    const beam = new THREE.Mesh(beamGeometry, beamMaterial.clone())
    beam.position.set(
      Math.cos(i * Math.PI / 3) * 3,
      0,
      Math.sin(i * Math.PI / 3) * 3
    )
    beams.push(beam)
    scene.add(beam)
  }

  // Advanced lighting setup
  const spotLight1 = new THREE.SpotLight(customization.colors.primary, 2)
  spotLight1.position.set(5, 5, 5)
  spotLight1.angle = Math.PI / 6
  spotLight1.penumbra = 0.2
  spotLight1.castShadow = true
  spotLight1.shadow.mapSize.width = 2048
  spotLight1.shadow.mapSize.height = 2048
  scene.add(spotLight1)

  const spotLight2 = new THREE.SpotLight(customization.colors.secondary, 1.5)
  spotLight2.position.set(-5, 5, -5)
  spotLight2.angle = Math.PI / 6
  spotLight2.penumbra = 0.2
  scene.add(spotLight2)

  // Rim lighting
  const rimLight = new THREE.DirectionalLight(customization.colors.accent, 0.5)
  rimLight.position.set(0, -5, 0)
  scene.add(rimLight)

  // Fog for depth
  scene.fog = new THREE.Fog(0x000000, 5, 15)

  return {
    animate: (time: number) => {
      // Update cube camera for reflections
      mainCube.visible = false
      cubeCamera.position.copy(mainCube.position)
      cubeCamera.update(scene.renderer, scene)
      mainCube.visible = true

      // Animate main cube
      mainCube.rotation.x = time * 0.5 * customization.options.speed
      mainCube.rotation.y = time * 0.7 * customization.options.speed
      mainCube.position.y = Math.sin(time * 2) * 0.2

      // Update particle shader
      particleShaderMaterial.uniforms.time.value = time

      // Animate beams
      beams.forEach((beam, i) => {
        const offset = i * Math.PI / 3
        beam.rotation.z = time * 2 + offset
        beam.scale.y = 1 + Math.sin(time * 3 + offset) * 0.3
        const beamMat = beam.material as THREE.MeshBasicMaterial
        beamMat.opacity = 0.3 + Math.sin(time * 4 + offset) * 0.3
      })

      // Animate lights
      spotLight1.position.x = Math.cos(time) * 5
      spotLight1.position.z = Math.sin(time) * 5
      spotLight2.position.x = Math.cos(time + Math.PI) * 5
      spotLight2.position.z = Math.sin(time + Math.PI) * 5
    }
  }
}