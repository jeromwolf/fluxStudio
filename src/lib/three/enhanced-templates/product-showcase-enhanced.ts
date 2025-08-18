import * as THREE from 'three'
import { TemplateCustomization } from '../templates'

export const productShowcaseEnhanced = (scene: THREE.Scene, customization: TemplateCustomization) => {
  // Create environment for reflections
  const envMapRenderTarget = new THREE.WebGLCubeRenderTarget(512)
  const cubeCamera = new THREE.CubeCamera(0.1, 100, envMapRenderTarget)
  scene.add(cubeCamera)

  // Product pedestal with glass effect
  const pedestalGroup = new THREE.Group()
  
  // Glass pedestal
  const pedestalGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 64)
  const pedestalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 0.9,
    thickness: 0.5,
    envMap: envMapRenderTarget.texture,
    envMapIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
  })
  const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial)
  pedestal.position.y = -1
  pedestalGroup.add(pedestal)

  // Glowing ring around pedestal
  const ringGeometry = new THREE.TorusGeometry(2.2, 0.05, 16, 100)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: customization.colors.accent,
    transparent: true,
    opacity: 0.8,
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI / 2
  ring.position.y = -0.85
  pedestalGroup.add(ring)
  
  scene.add(pedestalGroup)

  // Main product (advanced material showcase)
  const productGeometry = new THREE.IcosahedronGeometry(1, 2)
  
  // Custom shader for iridescent effect
  const productShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      envMap: { value: envMapRenderTarget.texture },
      primaryColor: { value: new THREE.Color(customization.colors.primary) },
      secondaryColor: { value: new THREE.Color(customization.colors.secondary) },
      fresnelPower: { value: 2.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform samplerCube envMap;
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform float fresnelPower;
      
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      vec3 iridescence(vec3 normal, vec3 viewDir) {
        float NdotV = dot(normal, viewDir);
        float fresnel = pow(1.0 - NdotV, fresnelPower);
        
        // Iridescent colors based on viewing angle
        vec3 color1 = primaryColor;
        vec3 color2 = secondaryColor;
        vec3 color3 = vec3(0.5, 0.0, 1.0);
        
        float t = fresnel + time * 0.1;
        vec3 iridColor = mix(color1, color2, sin(t * 3.14159));
        iridColor = mix(iridColor, color3, sin(t * 6.28318) * 0.5 + 0.5);
        
        return iridColor;
      }
      
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Calculate reflection
        vec3 reflectDir = reflect(-viewDir, normal);
        vec3 envColor = textureCube(envMap, reflectDir).rgb;
        
        // Iridescent effect
        vec3 iridColor = iridescence(normal, viewDir);
        
        // Combine with Fresnel
        float fresnel = pow(1.0 - dot(normal, viewDir), 1.5);
        vec3 finalColor = mix(iridColor, envColor, fresnel * 0.8);
        
        // Add sparkle effect
        float sparkle = pow(max(0.0, dot(reflectDir, viewDir)), 50.0);
        finalColor += vec3(sparkle) * 0.5;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  })

  const product = new THREE.Mesh(productGeometry, productShaderMaterial)
  product.position.y = 1
  scene.add(product)

  // Floating particles around product
  const particleCount = 500
  const particlesGeometry = new THREE.BufferGeometry()
  const particlePositions = new Float32Array(particleCount * 3)
  const particleSizes = new Float32Array(particleCount)
  const particlePhases = new Float32Array(particleCount)
  
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 2 + Math.random() * 2
    const height = (Math.random() - 0.5) * 4
    
    particlePositions[i * 3] = Math.cos(angle) * radius
    particlePositions[i * 3 + 1] = height
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius
    
    particleSizes[i] = Math.random() * 0.05 + 0.02
    particlePhases[i] = Math.random() * Math.PI * 2
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
  
  const particleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(customization.colors.accent) },
    },
    vertexShader: `
      attribute float size;
      varying float vOpacity;
      uniform float time;
      
      void main() {
        vec3 pos = position;
        
        // Spiral motion
        float angle = atan(pos.z, pos.x);
        float radius = length(pos.xz);
        angle += time * 0.5;
        pos.x = cos(angle) * radius;
        pos.z = sin(angle) * radius;
        pos.y += sin(time * 2.0 + angle * 3.0) * 0.1;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        
        vOpacity = smoothstep(0.0, 2.0, radius) * smoothstep(4.0, 2.0, radius);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vOpacity;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  
  const particles = new THREE.Points(particlesGeometry, particleShaderMaterial)
  scene.add(particles)

  // Dynamic spotlights
  const spotlights: THREE.SpotLight[] = []
  const spotlightHelpers: THREE.Mesh[] = []
  
  for (let i = 0; i < 3; i++) {
    const spotlight = new THREE.SpotLight(
      i === 0 ? customization.colors.primary : 
      i === 1 ? customization.colors.secondary : 
      customization.colors.accent,
      2
    )
    spotlight.angle = Math.PI / 8
    spotlight.penumbra = 0.3
    spotlight.decay = 2
    spotlight.distance = 20
    spotlight.castShadow = true
    spotlight.shadow.mapSize.width = 1024
    spotlight.shadow.mapSize.height = 1024
    
    spotlights.push(spotlight)
    scene.add(spotlight)
    scene.add(spotlight.target)
    
    // Visible light beam
    const beamGeometry = new THREE.ConeGeometry(3, 8, 32, 1, true)
    const beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(spotlight.color) },
        opacity: { value: 0.1 },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vPosition;
        
        void main() {
          float intensity = 1.0 - smoothstep(0.0, 1.0, vPosition.y / 8.0);
          gl_FragColor = vec4(color, opacity * intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial)
    beam.position.copy(spotlight.position)
    spotlightHelpers.push(beam)
    scene.add(beam)
  }

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)

  // Floor reflection
  const floorGeometry = new THREE.PlaneGeometry(20, 20)
  const floorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x101010,
    metalness: 1,
    roughness: 0.1,
    envMap: envMapRenderTarget.texture,
    envMapIntensity: 0.5,
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.2
  scene.add(floor)

  return {
    animate: (time: number) => {
      // Update environment map
      product.visible = false
      cubeCamera.position.copy(product.position)
      cubeCamera.update(scene.renderer, scene)
      product.visible = true

      // Rotate product
      product.rotation.y = time * 0.5 * customization.options.speed
      product.rotation.x = Math.sin(time * 0.3) * 0.1
      product.position.y = 1 + Math.sin(time * 2) * 0.1

      // Update shader uniforms
      productShaderMaterial.uniforms.time.value = time
      particleShaderMaterial.uniforms.time.value = time

      // Animate spotlights
      spotlights.forEach((spotlight, i) => {
        const angle = time * (0.3 + i * 0.1) + i * Math.PI * 2 / 3
        const radius = 5
        
        spotlight.position.x = Math.cos(angle) * radius
        spotlight.position.z = Math.sin(angle) * radius
        spotlight.position.y = 5 + Math.sin(time + i) * 2
        
        spotlight.target.position.copy(product.position)
        
        // Update beam position and orientation
        const beam = spotlightHelpers[i]
        beam.position.copy(spotlight.position)
        beam.lookAt(product.position)
        beam.rotateX(-Math.PI / 2)
      })

      // Pulse ring
      const ringScale = 1 + Math.sin(time * 3) * 0.05
      ring.scale.set(ringScale, ringScale, 1)
      const ringMat = ring.material as THREE.MeshBasicMaterial
      ringMat.opacity = 0.4 + Math.sin(time * 4) * 0.2
    }
  }
}