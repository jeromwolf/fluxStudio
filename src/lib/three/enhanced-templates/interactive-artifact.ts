import * as THREE from 'three'
import { TemplateCustomization } from '../templates'
import { MaterialFactory, AnimationUtils } from '../post-processing'

export const interactiveArtifact = (scene: THREE.Scene, customization: TemplateCustomization) => {
  // Create the main artifact group
  const artifactGroup = new THREE.Group()
  
  // Central crystal/artifact
  const crystalGeometry = new THREE.OctahedronGeometry(1.5, 2)
  const crystalMaterial = MaterialFactory.createIridescentMaterial({
    uniforms: {
      color1: { value: new THREE.Color(customization.colors.primary) },
      color2: { value: new THREE.Color(customization.colors.secondary) },
      color3: { value: new THREE.Color(customization.colors.accent) },
      fresnelPower: { value: 1.5 },
    }
  })
  
  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
  artifactGroup.add(crystal)
  
  // Orbiting runes/symbols
  const runeGroup = new THREE.Group()
  const runes: THREE.Mesh[] = []
  const runeTexts = ['◊', '△', '○', '◇', '▢', '☆', '◈', '◯']
  
  for (let i = 0; i < 8; i++) {
    // Create text texture for rune
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = customization.colors.accent
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(runeTexts[i], 64, 64)
    
    const texture = new THREE.CanvasTexture(canvas)
    
    const runePlaneGeometry = new THREE.PlaneGeometry(0.5, 0.5)
    const runeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    })
    
    const rune = new THREE.Mesh(runePlaneGeometry, runeMaterial)
    
    const angle = (i / 8) * Math.PI * 2
    const radius = 3
    rune.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.5) * 0.5,
      Math.sin(angle) * radius
    )
    
    rune.userData = {
      originalPosition: rune.position.clone(),
      angle: angle,
      offset: i * 0.5,
    }
    
    runes.push(rune)
    runeGroup.add(rune)
  }
  
  artifactGroup.add(runeGroup)
  scene.add(artifactGroup)
  
  // Energy field around the artifact
  const fieldGeometry = new THREE.SphereGeometry(2.5, 64, 32)
  const fieldMaterial = MaterialFactory.createEnergyFieldMaterial({
    uniforms: {
      color1: { value: new THREE.Color(customization.colors.primary) },
      color2: { value: new THREE.Color(customization.colors.secondary) },
      intensity: { value: 0.3 },
      frequency: { value: 3.0 },
    }
  })
  
  const energyField = new THREE.Mesh(fieldGeometry, fieldMaterial)
  scene.add(energyField)
  
  // Particle system for magical effects
  const particleCount = 2000
  const particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  const velocities = new Float32Array(particleCount * 3)
  const lifetimes = new Float32Array(particleCount)
  
  const color1 = new THREE.Color(customization.colors.primary)
  const color2 = new THREE.Color(customization.colors.secondary)
  const color3 = new THREE.Color(customization.colors.accent)
  
  for (let i = 0; i < particleCount; i++) {
    // Start particles in a sphere around the artifact
    const radius = Math.random() * 5 + 2
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    
    // Random velocities for swirling motion
    velocities[i * 3] = (Math.random() - 0.5) * 0.02
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    
    // Random colors
    const colorChoice = Math.random()
    const color = colorChoice < 0.33 ? color1 : colorChoice < 0.66 ? color2 : color3
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
    
    sizes[i] = Math.random() * 0.1 + 0.05
    lifetimes[i] = Math.random() * 5
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pointSize: { value: 5.0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float time;
      
      void main() {
        vColor = color;
        
        vec3 pos = position;
        
        // Swirling motion around Y axis
        float angle = atan(pos.z, pos.x);
        float radius = length(pos.xz);
        angle += time * 0.5 + pos.y * 0.1;
        pos.x = cos(angle) * radius;
        pos.z = sin(angle) * radius;
        
        // Vertical oscillation
        pos.y += sin(time * 2.0 + radius) * 0.5;
        
        // Distance-based alpha
        float dist = length(pos);
        vAlpha = smoothstep(8.0, 3.0, dist);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })
  
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)
  
  // Holographic information panels
  const panelGroup = new THREE.Group()
  const panels: THREE.Mesh[] = []
  
  for (let i = 0; i < 4; i++) {
    const panelGeometry = new THREE.PlaneGeometry(2, 1.5)
    const panelMaterial = MaterialFactory.createHolographicMaterial({
      uniforms: {
        color: { value: new THREE.Color(customization.colors.accent) },
        opacity: { value: 0.6 },
        scanlineSpeed: { value: 1.5 + i * 0.2 },
      }
    })
    
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)
    
    const angle = (i / 4) * Math.PI * 2
    const radius = 5
    panel.position.set(
      Math.cos(angle) * radius,
      Math.sin(i * 1.5) * 2,
      Math.sin(angle) * radius
    )
    
    panel.lookAt(0, 0, 0)
    panel.userData = { angle: angle, offset: i }
    
    panels.push(panel)
    panelGroup.add(panel)
  }
  
  scene.add(panelGroup)
  
  // Scanning laser ring
  const scannerGeometry = new THREE.TorusGeometry(4, 0.05, 8, 100)
  const scannerMaterial = new THREE.MeshBasicMaterial({
    color: customization.colors.accent,
    transparent: true,
    opacity: 0.8,
  })
  const scanner = new THREE.Mesh(scannerGeometry, scannerMaterial)
  scanner.rotation.x = Math.PI / 2
  scene.add(scanner)
  
  // Atmospheric lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
  scene.add(ambientLight)
  
  // Point lights around the artifact
  const pointLights: THREE.PointLight[] = []
  for (let i = 0; i < 3; i++) {
    const color = i === 0 ? customization.colors.primary : 
                  i === 1 ? customization.colors.secondary : 
                  customization.colors.accent
    
    const pointLight = new THREE.PointLight(color, 2, 10)
    const angle = (i / 3) * Math.PI * 2
    pointLight.position.set(
      Math.cos(angle) * 6,
      2,
      Math.sin(angle) * 6
    )
    pointLights.push(pointLight)
    scene.add(pointLight)
  }
  
  // Volumetric lighting effect (fake volumetrics with planes)
  const volumetricLights: THREE.Mesh[] = []
  for (let i = 0; i < pointLights.length; i++) {
    const coneGeometry = new THREE.ConeGeometry(2, 8, 16, 1, true)
    const coneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(pointLights[i].color) },
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
          float intensity = 1.0 - smoothstep(0.0, 4.0, vPosition.y);
          gl_FragColor = vec4(color, opacity * intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    
    const volumetricLight = new THREE.Mesh(coneGeometry, coneMaterial)
    volumetricLight.position.copy(pointLights[i].position)
    volumetricLight.lookAt(0, 0, 0)
    volumetricLight.rotateX(-Math.PI / 2)
    volumetricLights.push(volumetricLight)
    scene.add(volumetricLight)
  }
  
  return {
    animate: (time: number) => {
      // Rotate the main artifact
      artifactGroup.rotation.y = time * 0.3 * customization.options.speed
      artifactGroup.position.y = Math.sin(time * 1.5) * 0.2
      
      // Update crystal material
      if (crystalMaterial.uniforms && crystalMaterial.uniforms.time) {
        crystalMaterial.uniforms.time.value = time
      }
      
      // Animate orbiting runes
      runes.forEach((rune, i) => {
        const data = rune.userData
        const angle = data.angle + time * 0.5 * customization.options.speed
        const radius = 3 + Math.sin(time * 2 + data.offset) * 0.5
        
        rune.position.x = Math.cos(angle) * radius
        rune.position.z = Math.sin(angle) * radius
        rune.position.y = Math.sin(time * 1.5 + data.offset) * 0.8
        
        rune.rotation.z = time + data.offset
        rune.lookAt(artifactGroup.position)
      })
      
      // Update energy field
      if (fieldMaterial.uniforms && fieldMaterial.uniforms.time) {
        fieldMaterial.uniforms.time.value = time
      }
      
      // Update particle system
      if (particleMaterial.uniforms && particleMaterial.uniforms.time) {
        particleMaterial.uniforms.time.value = time
      }
      
      // Animate holographic panels
      panels.forEach((panel, i) => {
        const data = panel.userData
        const angle = data.angle + time * 0.2
        const radius = 5 + Math.sin(time * 1.5 + data.offset) * 0.5
        
        panel.position.x = Math.cos(angle) * radius
        panel.position.z = Math.sin(angle) * radius
        panel.position.y = Math.sin(time * 0.8 + data.offset) * 2
        
        panel.lookAt(0, 0, 0)
        
        // Update holographic material
        const material = panel.material as THREE.ShaderMaterial
        if (material.uniforms && material.uniforms.time) {
          material.uniforms.time.value = time
        }
      })
      
      // Animate scanner ring
      scanner.position.y = Math.sin(time * 3) * 2
      scanner.scale.setScalar(1 + Math.sin(time * 4) * 0.1)
      const scannerMat = scanner.material as THREE.MeshBasicMaterial
      scannerMat.opacity = 0.4 + Math.sin(time * 6) * 0.4
      
      // Animate point lights
      pointLights.forEach((light, i) => {
        const angle = (i / 3) * Math.PI * 2 + time * 0.3
        light.position.x = Math.cos(angle) * 6
        light.position.z = Math.sin(angle) * 6
        light.position.y = 2 + Math.sin(time * 2 + i) * 1
        light.intensity = 1.5 + Math.sin(time * 4 + i) * 0.5
        
        // Update volumetric light position
        if (volumetricLights[i]) {
          volumetricLights[i].position.copy(light.position)
          volumetricLights[i].lookAt(0, 0, 0)
          volumetricLights[i].rotateX(-Math.PI / 2)
        }
      })
    }
  }
}