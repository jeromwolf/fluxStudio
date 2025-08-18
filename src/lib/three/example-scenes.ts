import * as THREE from 'three'

// Example scene setups for different templates
export const exampleScenes = {
  // Modern Intro Scene
  modernIntro: (scene: THREE.Scene, customization: any) => {
    // Create animated text placeholder
    const textGroup = new THREE.Group()
    
    // Title text (placeholder box)
    const titleGeometry = new THREE.BoxGeometry(4, 0.8, 0.2)
    const titleMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.primary,
      emissive: customization.colors.primary,
      emissiveIntensity: 0.2,
    })
    const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial)
    titleMesh.position.y = 1
    textGroup.add(titleMesh)
    
    // Subtitle text (placeholder box)
    const subtitleGeometry = new THREE.BoxGeometry(3, 0.5, 0.1)
    const subtitleMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.secondary,
      emissive: customization.colors.secondary,
      emissiveIntensity: 0.1,
    })
    const subtitleMesh = new THREE.Mesh(subtitleGeometry, subtitleMaterial)
    subtitleMesh.position.y = -0.5
    textGroup.add(subtitleMesh)
    
    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 10
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: customization.colors.accent,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    
    scene.add(textGroup)
    scene.add(particles)
    
    return { textGroup, particles }
  },
  
  // Logo Reveal Scene
  logoReveal: (scene: THREE.Scene, customization: any) => {
    // Create logo placeholder
    const logoGroup = new THREE.Group()
    
    // Main logo shape (cylinder)
    const logoGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 32)
    const logoMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.primary,
      shininess: 100,
    })
    const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial)
    logoMesh.rotation.x = Math.PI / 2
    logoGroup.add(logoMesh)
    
    // Ring around logo
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100)
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.secondary,
      emissive: customization.colors.secondary,
      emissiveIntensity: 0.3,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    logoGroup.add(ring)
    
    // Particle explosion effect
    const explosionParticles = new THREE.Group()
    for (let i = 0; i < 50; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: customization.colors.accent,
        transparent: true,
        opacity: 0.8,
      })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      
      const angle = (i / 50) * Math.PI * 2
      particle.position.x = Math.cos(angle) * 0.5
      particle.position.z = Math.sin(angle) * 0.5
      particle.userData = { angle, radius: 0.5 }
      
      explosionParticles.add(particle)
    }
    logoGroup.add(explosionParticles)
    
    scene.add(logoGroup)
    
    return { logoGroup, ring, explosionParticles }
  },
  
  // Social Media Callout Scene
  socialCallout: (scene: THREE.Scene, customization: any) => {
    const socialGroup = new THREE.Group()
    
    // Social icon sphere
    const iconGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const iconMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.primary,
      emissive: customization.colors.primary,
      emissiveIntensity: 0.2,
    })
    const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial)
    socialGroup.add(iconMesh)
    
    // Animated rings
    const rings = []
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.2 + i * 0.3, 0.05, 16, 100)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: customization.colors.secondary,
        transparent: true,
        opacity: 0.5 - i * 0.15,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      ring.userData = { index: i }
      rings.push(ring)
      socialGroup.add(ring)
    }
    
    // Floating hearts/likes
    const likeGroup = new THREE.Group()
    for (let i = 0; i < 10; i++) {
      const heartGeometry = new THREE.SphereGeometry(0.1, 8, 8)
      const heartMaterial = new THREE.MeshBasicMaterial({
        color: customization.colors.accent,
      })
      const heart = new THREE.Mesh(heartGeometry, heartMaterial)
      
      heart.position.x = (Math.random() - 0.5) * 3
      heart.position.y = Math.random() * 2 - 1
      heart.position.z = (Math.random() - 0.5) * 3
      heart.userData = { 
        originalY: heart.position.y,
        speed: Math.random() * 0.5 + 0.5 
      }
      
      likeGroup.add(heart)
    }
    socialGroup.add(likeGroup)
    
    scene.add(socialGroup)
    
    return { socialGroup, iconMesh, rings, likeGroup }
  },
}

// Animation functions for each template
export const animateTemplate = {
  modernIntro: (objects: any, time: number) => {
    if (objects.textGroup) {
      objects.textGroup.rotation.y = Math.sin(time * 0.5) * 0.1
      objects.textGroup.position.y = Math.sin(time) * 0.1
    }
    
    if (objects.particles) {
      objects.particles.rotation.y = time * 0.1
    }
  },
  
  logoReveal: (objects: any, time: number) => {
    if (objects.logoGroup) {
      objects.logoGroup.rotation.y = time * 0.5
    }
    
    if (objects.ring) {
      objects.ring.rotation.z = time
      objects.ring.scale.set(
        1 + Math.sin(time * 2) * 0.1,
        1 + Math.sin(time * 2) * 0.1,
        1
      )
    }
    
    if (objects.explosionParticles) {
      objects.explosionParticles.children.forEach((particle: any) => {
        const radius = particle.userData.radius + Math.sin(time * 3) * 0.2
        particle.position.x = Math.cos(particle.userData.angle + time) * radius
        particle.position.z = Math.sin(particle.userData.angle + time) * radius
      })
    }
  },
  
  socialCallout: (objects: any, time: number) => {
    if (objects.iconMesh) {
      objects.iconMesh.rotation.y = time * 0.5
      objects.iconMesh.scale.set(
        1 + Math.sin(time * 2) * 0.05,
        1 + Math.sin(time * 2) * 0.05,
        1 + Math.sin(time * 2) * 0.05
      )
    }
    
    if (objects.rings) {
      objects.rings.forEach((ring: any, index: number) => {
        ring.rotation.z = time * (0.5 + index * 0.2)
        const scale = 1 + Math.sin(time * 2 + index) * 0.1
        ring.scale.set(scale, scale, 1)
      })
    }
    
    if (objects.likeGroup) {
      objects.likeGroup.children.forEach((heart: any) => {
        heart.position.y = heart.userData.originalY + 
          Math.sin(time * heart.userData.speed) * 0.3
        heart.rotation.y = time * 2
      })
    }
  },
}