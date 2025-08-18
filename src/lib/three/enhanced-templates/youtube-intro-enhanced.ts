import * as THREE from 'three'
import { TemplateCustomization } from '../templates'

export const youtubeIntroEnhanced = (scene: THREE.Scene, customization: TemplateCustomization) => {
  // Create main logo group
  const logoGroup = new THREE.Group()
  
  // 3D YouTube play button with depth
  const playButtonShape = new THREE.Shape()
  playButtonShape.moveTo(-1, -0.7)
  playButtonShape.lineTo(-1, 0.7)
  playButtonShape.lineTo(0.8, 0)
  playButtonShape.closePath()
  
  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 10,
  }
  
  const playButtonGeometry = new THREE.ExtrudeGeometry(playButtonShape, extrudeSettings)
  
  // Glossy material with subsurface scattering effect
  const playButtonMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0,
    emissive: 0xff0000,
    emissiveIntensity: 0.1,
  })
  
  const playButton = new THREE.Mesh(playButtonGeometry, playButtonMaterial)
  playButton.position.z = -0.2
  logoGroup.add(playButton)
  
  // Outer ring with energy flow
  const ringGeometry = new THREE.TorusGeometry(2.5, 0.3, 16, 100)
  const ringShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      primaryColor: { value: new THREE.Color(customization.colors.primary) },
      secondaryColor: { value: new THREE.Color(customization.colors.secondary) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Energy flow effect
        float flow = sin(vUv.x * 20.0 - time * 3.0) * 0.5 + 0.5;
        flow *= sin(vUv.y * 10.0 + time * 2.0) * 0.5 + 0.5;
        
        vec3 color = mix(primaryColor, secondaryColor, flow);
        
        // Pulse effect
        float pulse = sin(time * 4.0) * 0.2 + 0.8;
        color *= pulse;
        
        // Edge glow
        float edgeGlow = pow(abs(sin(vUv.x * 3.14159)), 3.0);
        color += vec3(edgeGlow * 0.3);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })
  
  const ring = new THREE.Mesh(ringGeometry, ringShaderMaterial)
  logoGroup.add(ring)
  
  scene.add(logoGroup)

  // Subscribe button with animation
  const subscribeGroup = new THREE.Group()
  
  const buttonGeometry = new THREE.BoxGeometry(4, 1, 0.3)
  const buttonMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.5,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0,
  })
  
  const subscribeButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
  subscribeGroup.add(subscribeButton)
  
  // Bell icon
  const bellGroup = new THREE.Group()
  
  const bellBodyGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8)
  const bellMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    emissive: 0xffd700,
    emissiveIntensity: 0.3,
  })
  const bellBody = new THREE.Mesh(bellBodyGeometry, bellMaterial)
  bellGroup.add(bellBody)
  
  const bellHandleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2)
  const bellHandle = new THREE.Mesh(bellHandleGeometry, bellMaterial)
  bellHandle.position.y = 0.35
  bellGroup.add(bellHandle)
  
  bellGroup.position.x = 3
  subscribeGroup.add(bellGroup)
  
  subscribeGroup.position.y = -3
  scene.add(subscribeGroup)

  // Particle system for dynamic background
  const bgParticleCount = 1000
  const bgGeometry = new THREE.BufferGeometry()
  const bgPositions = new Float32Array(bgParticleCount * 3)
  const bgColors = new Float32Array(bgParticleCount * 3)
  const bgSizes = new Float32Array(bgParticleCount)
  const bgVelocities = new Float32Array(bgParticleCount * 3)
  
  const color1 = new THREE.Color(customization.colors.primary)
  const color2 = new THREE.Color(customization.colors.secondary)
  
  for (let i = 0; i < bgParticleCount; i++) {
    bgPositions[i * 3] = (Math.random() - 0.5) * 20
    bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 20
    bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 20
    
    bgVelocities[i * 3] = (Math.random() - 0.5) * 0.02
    bgVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
    bgVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    
    const color = Math.random() > 0.5 ? color1 : color2
    bgColors[i * 3] = color.r
    bgColors[i * 3 + 1] = color.g
    bgColors[i * 3 + 2] = color.b
    
    bgSizes[i] = Math.random() * 0.1 + 0.05
  }
  
  bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3))
  bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3))
  bgGeometry.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1))
  
  const bgParticleShader = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vColor = color;
        vec3 pos = position;
        
        // Distance from center for alpha
        float dist = length(pos);
        vAlpha = smoothstep(10.0, 5.0, dist);
        
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
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * 0.6;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })
  
  const bgParticles = new THREE.Points(bgGeometry, bgParticleShader)
  scene.add(bgParticles)

  // Light streaks
  const streakCount = 20
  const streaks: THREE.Mesh[] = []
  
  for (let i = 0; i < streakCount; i++) {
    const streakGeometry = new THREE.PlaneGeometry(0.1, Math.random() * 5 + 2)
    const streakMaterial = new THREE.MeshBasicMaterial({
      color: customization.colors.accent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    
    const streak = new THREE.Mesh(streakGeometry, streakMaterial)
    streak.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5
    )
    streak.rotation.z = Math.random() * Math.PI
    streak.userData = {
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }
    
    streaks.push(streak)
    scene.add(streak)
  }

  // Dynamic lighting
  const keyLight = new THREE.SpotLight(0xffffff, 2)
  keyLight.position.set(5, 5, 5)
  keyLight.angle = Math.PI / 4
  keyLight.penumbra = 0.5
  keyLight.castShadow = true
  scene.add(keyLight)
  
  const rimLight = new THREE.PointLight(customization.colors.accent, 1.5)
  rimLight.position.set(-5, 0, 3)
  scene.add(rimLight)
  
  const fillLight = new THREE.HemisphereLight(
    customization.colors.secondary,
    customization.colors.primary,
    0.5
  )
  scene.add(fillLight)

  let animationPhase = 0

  return {
    animate: (time: number) => {
      // Update animation phase
      animationPhase = time % 10 // Reset every 10 seconds
      
      // Logo animation
      if (animationPhase < 3) {
        // Entry animation
        const t = animationPhase / 3
        logoGroup.scale.setScalar(t)
        logoGroup.rotation.z = (1 - t) * Math.PI * 2
        playButton.rotation.y = t * Math.PI * 2
      } else {
        // Idle animation
        logoGroup.rotation.y = Math.sin(time) * 0.1
        logoGroup.position.y = Math.sin(time * 2) * 0.1
        playButton.rotation.y = time * 0.2
      }
      
      // Ring shader update
      ringShaderMaterial.uniforms.time.value = time
      
      // Subscribe button animation
      if (animationPhase > 2 && animationPhase < 5) {
        const t = (animationPhase - 2) / 3
        subscribeGroup.position.y = -3 + t * 3
        subscribeGroup.scale.setScalar(1 + Math.sin(time * 10) * 0.05)
      }
      
      // Bell animation
      if (animationPhase > 4) {
        bellGroup.rotation.z = Math.sin(time * 8) * 0.3
      }
      
      // Background particles
      const bgPos = bgGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < bgParticleCount; i++) {
        bgPos[i * 3] += bgVelocities[i * 3]
        bgPos[i * 3 + 1] += bgVelocities[i * 3 + 1]
        bgPos[i * 3 + 2] += bgVelocities[i * 3 + 2]
        
        // Wrap around
        for (let j = 0; j < 3; j++) {
          if (Math.abs(bgPos[i * 3 + j]) > 10) {
            bgPos[i * 3 + j] *= -0.9
          }
        }
      }
      bgGeometry.attributes.position.needsUpdate = true
      bgParticleShader.uniforms.time.value = time
      
      // Light streaks animation
      streaks.forEach((streak) => {
        const progress = ((time * streak.userData.speed + streak.userData.delay) % 5) / 5
        
        if (progress < 0.2) {
          // Fade in
          (streak.material as THREE.MeshBasicMaterial).opacity = progress * 5
        } else if (progress > 0.8) {
          // Fade out
          (streak.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 5
        } else {
          // Full opacity
          (streak.material as THREE.MeshBasicMaterial).opacity = 1
        }
        
        // Move streak
        streak.position.x += streak.userData.speed * 0.1
        if (streak.position.x > 10) {
          streak.position.x = -10
        }
      })
      
      // Dynamic lighting
      keyLight.position.x = Math.cos(time * 0.5) * 5
      keyLight.position.z = Math.sin(time * 0.5) * 5
      rimLight.intensity = 1.5 + Math.sin(time * 3) * 0.5
    }
  }
}