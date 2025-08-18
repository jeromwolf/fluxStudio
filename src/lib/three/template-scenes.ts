import * as THREE from 'three'
import { TemplateCustomization } from './templates'

// Scene setup functions for each template type
export const templateScenes = {
  'corporate-logo-intro': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // 메인 로고 그룹 (PBR 재질로 고급화)
    const logoGroup = new THREE.Group()
    
    // 향상된 로고 큐브 - 물리적 기반 렌더링
    const geometry = new THREE.BoxGeometry(3, 3, 0.5)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(customization.colors.primary),
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.name = 'main-cube'
    logoGroup.add(cube)
    
    // 글로우 효과를 위한 엣지 라인
    const edgeGeometry = new THREE.EdgesGeometry(geometry)
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: customization.colors.accent,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    logoGroup.add(edges)
    
    scene.add(logoGroup)
    
    // 향상된 파티클 시스템 (1000개 파티클)
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const color1 = new THREE.Color(customization.colors.primary)
    const color2 = new THREE.Color(customization.colors.secondary)
    
    for (let i = 0; i < particleCount; i++) {
      // 구형 분포로 파티클 배치
      const radius = 8 + Math.random() * 12
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) 
      positions[i * 3 + 2] = radius * Math.cos(theta)
      
      // 그라디언트 색상
      const color = color1.clone().lerp(color2, Math.random())
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = Math.random() * 0.3 + 0.1
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleMaterial = new THREE.PointsMaterial({ 
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
    
    // 에너지 빔 효과
    const beamGroup = new THREE.Group()
    for (let i = 0; i < 8; i++) {
      const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, 12, 8)
      const beamMaterial = new THREE.MeshLambertMaterial({
        color: customization.colors.accent,
        transparent: true,
        opacity: 0.4,
        emissive: new THREE.Color(customization.colors.accent),
        emissiveIntensity: 0.3
      })
      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      
      const angle = (i / 8) * Math.PI * 2
      beam.position.set(Math.cos(angle) * 5, 0, Math.sin(angle) * 5)
      beam.lookAt(0, 0, 0)
      beamGroup.add(beam)
    }
    scene.add(beamGroup)
    
    // 향상된 조명 시스템
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)
    
    // 메인 스포트라이트
    const spotLight = new THREE.SpotLight(customization.colors.primary, 3, 40, Math.PI / 8)
    spotLight.position.set(6, 10, 6)
    spotLight.target = cube
    spotLight.castShadow = true
    scene.add(spotLight)
    
    // 림 라이트 효과
    const rimLight = new THREE.DirectionalLight(customization.colors.accent, 1.5)
    rimLight.position.set(-8, 2, -8)
    scene.add(rimLight)
    
    // 채우기 조명
    const fillLight = new THREE.DirectionalLight(customization.colors.secondary, 0.8)
    fillLight.position.set(0, -5, 8)
    scene.add(fillLight)

    return {
      animate: (time: number) => {
        const speed = customization.options.speed
        
        // 메인 큐브 회전 (더 부드럽게)
        cube.rotation.x = Math.sin(time * 0.3) * 0.2 + time * 0.1 * speed
        cube.rotation.y = time * 0.4 * speed
        cube.rotation.z = Math.cos(time * 0.2) * 0.1
        
        // 엣지 글로우 펄스 효과
        const edgeMat = edges.material as THREE.LineBasicMaterial
        edgeMat.opacity = 0.5 + Math.sin(time * 2) * 0.3
        
        // 파티클 회전 및 펄스
        particles.rotation.y = time * 0.05 * speed
        particles.rotation.x = Math.sin(time * 0.1) * 0.1
        
        const particleMat = particles.material as THREE.PointsMaterial
        particleMat.opacity = 0.6 + Math.sin(time * 1.5) * 0.2
        
        // 빔 회전
        beamGroup.rotation.y = time * 0.2 * speed
        beamGroup.rotation.x = Math.cos(time * 0.3) * 0.1
        
        // 빔 투명도 애니메이션
        beamGroup.children.forEach((beam, index) => {
          const beamMat = (beam as THREE.Mesh).material as THREE.MeshLambertMaterial
          beamMat.opacity = 0.2 + Math.sin(time * 2 + index * 0.5) * 0.2
        })
        
        // 조명 변화
        spotLight.intensity = 2 + Math.sin(time * 1.2) * 0.5
        rimLight.intensity = 1 + Math.cos(time * 0.8) * 0.3
      }
    }
  },

  'instagram-story': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Vertical format with gradient background
    const planeGeometry = new THREE.PlaneGeometry(9, 16)
    const gradientTexture = createGradientTexture(
      customization.colors.primary,
      customization.colors.secondary,
      customization.colors.accent
    )
    const planeMaterial = new THREE.MeshBasicMaterial({ map: gradientTexture })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.z = -5
    scene.add(plane)

    // Add floating elements
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const spheres: THREE.Mesh[] = []
    
    for (let i = 0; i < 5; i++) {
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(customization.colors.accent),
        emissive: new THREE.Color(customization.colors.accent)
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 14,
        Math.random() * 2
      )
      spheres.push(sphere)
      scene.add(sphere)
    }

    return {
      animate: (time: number) => {
        spheres.forEach((sphere, i) => {
          sphere.position.y += Math.sin(time * 2 + i) * 0.02 * customization.options.speed
          sphere.rotation.y = time * 0.5 * customization.options.speed
        })
      }
    }
  },

  'wedding-invitation': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Golden particles effect
    const particleCount = 500
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const goldColor = new THREE.Color(customization.colors.primary)
    const roseColor = new THREE.Color(customization.colors.accent)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20
      positions[i + 1] = Math.random() * 10 - 5
      positions[i + 2] = (Math.random() - 0.5) * 10

      const color = Math.random() > 0.5 ? goldColor : roseColor
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    // Add romantic lighting
    const warmLight = new THREE.PointLight(0xffd700, 2, 100)
    warmLight.position.set(0, 5, 5)
    scene.add(warmLight)

    return {
      animate: (time: number) => {
        particleSystem.rotation.y = time * 0.1 * customization.options.speed
        
        // Make particles fall like rose petals
        const positions = particles.attributes.position.array as Float32Array
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.01 * customization.options.speed
          if (positions[i] < -5) {
            positions[i] = 5
          }
        }
        particles.attributes.position.needsUpdate = true;
      }
    }
  },

  'birthday-celebration': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Confetti and balloons
    const balloonColors = [
      customization.colors.primary,
      customization.colors.secondary,
      customization.colors.accent,
    ]

    // Create balloons
    const balloons: THREE.Mesh[] = []
    const balloonGeometry = new THREE.SphereGeometry(0.8, 16, 16)
    
    for (let i = 0; i < 5; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(balloonColors[i % balloonColors.length]),
        shininess: 100,
      })
      const balloon = new THREE.Mesh(balloonGeometry, material)
      balloon.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 3 - 5,
        Math.random() * 2 - 1
      )
      balloon.scale.y = 1.2
      balloons.push(balloon)
      scene.add(balloon)
    }

    // Create confetti
    const confettiCount = 200
    const confettiGeometry = new THREE.BufferGeometry()
    const confettiPositions = new Float32Array(confettiCount * 3)
    const confettiColors = new Float32Array(confettiCount * 3)

    for (let i = 0; i < confettiCount * 3; i += 3) {
      confettiPositions[i] = (Math.random() - 0.5) * 15
      confettiPositions[i + 1] = Math.random() * 10
      confettiPositions[i + 2] = (Math.random() - 0.5) * 5

      const color = new THREE.Color(balloonColors[Math.floor(Math.random() * balloonColors.length)])
      confettiColors[i] = color.r
      confettiColors[i + 1] = color.g
      confettiColors[i + 2] = color.b
    }

    confettiGeometry.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3))
    confettiGeometry.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3))

    const confettiMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })

    const confetti = new THREE.Points(confettiGeometry, confettiMaterial)
    scene.add(confetti)

    // Festive lighting
    const partyLight1 = new THREE.PointLight(0xff69b4, 1, 50)
    partyLight1.position.set(-5, 5, 5)
    scene.add(partyLight1)

    const partyLight2 = new THREE.PointLight(0x00ced1, 1, 50)
    partyLight2.position.set(5, 5, 5)
    scene.add(partyLight2)

    return {
      animate: (time: number) => {
        // Float balloons
        balloons.forEach((balloon, i) => {
          balloon.position.y += Math.sin(time * 2 + i * 0.5) * 0.02 * customization.options.speed
          balloon.rotation.y = Math.sin(time + i) * 0.1
        })

        // Fall confetti
        const positions = confettiGeometry.attributes.position.array as Float32Array
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.02 * customization.options.speed
          if (positions[i] < -5) {
            positions[i] = 10
            positions[i - 1] = (Math.random() - 0.5) * 15
          }
        }
        confettiGeometry.attributes.position.needsUpdate = true;

        // Rotate confetti for sparkle effect
        confetti.rotation.y = time * 0.5
      }
    }
  },

  'sale-notice': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Explosive price reveal
    const textGeometry = new THREE.PlaneGeometry(4, 2)
    const textMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(customization.colors.primary),
      side: THREE.DoubleSide,
    })
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textMesh.position.z = 0
    scene.add(textMesh)

    // Explosion particles
    const particleCount = 300
    const explosionGeometry = new THREE.BufferGeometry()
    const explosionPositions = new Float32Array(particleCount * 3)
    const explosionVelocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Start from center
      explosionPositions[i] = 0
      explosionPositions[i + 1] = 0
      explosionPositions[i + 2] = 0

      // Random velocities
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.5 + 0.5
      explosionVelocities[i] = Math.cos(angle) * speed
      explosionVelocities[i + 1] = Math.sin(angle) * speed
      explosionVelocities[i + 2] = (Math.random() - 0.5) * speed
    }

    explosionGeometry.setAttribute('position', new THREE.BufferAttribute(explosionPositions, 3))
    explosionGeometry.setAttribute('velocity', new THREE.BufferAttribute(explosionVelocities, 3))

    const explosionMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(customization.colors.secondary),
      size: 0.3,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    })

    const explosionParticles = new THREE.Points(explosionGeometry, explosionMaterial)
    scene.add(explosionParticles)

    let explosionTime = 0

    return {
      animate: (time: number) => {
        // Text pulse effect
        const scale = 1 + Math.sin(time * 10) * 0.1
        textMesh.scale.set(scale, scale, 1)

        // Explosion animation
        if (customization.options.explosion) {
          explosionTime += 0.016 * customization.options.speed
          
          const positions = explosionGeometry.attributes.position.array as Float32Array
          const velocities = explosionGeometry.attributes.velocity.array as Float32Array

          for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i] * 0.1;
            positions[i + 1] += velocities[i + 1] * 0.1;
            positions[i + 2] += velocities[i + 2] * 0.1;
          }

          explosionGeometry.attributes.position.needsUpdate = true;;
          
          // Fade out
          (explosionMaterial as THREE.PointsMaterial).opacity = Math.max(0, 1 - explosionTime * 0.5)

          // Reset explosion
          if (explosionTime > 2) {
            explosionTime = 0
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] = 0
              positions[i + 1] = 0
              positions[i + 2] = 0
            }
          }
        }
      }
    }
  },

  'product-showcase': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Elegant product turntable with premium lighting
    const productGeometry = new THREE.CylinderGeometry(1, 1, 2, 16)
    const productMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(customization.colors.primary),
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const product = new THREE.Mesh(productGeometry, productMaterial)
    product.position.y = 1
    scene.add(product)

    // Premium spotlights
    const spotlight1 = new THREE.SpotLight(0xffffff, 2)
    spotlight1.position.set(5, 8, 5)
    spotlight1.angle = Math.PI / 6
    spotlight1.penumbra = 0.2
    spotlight1.castShadow = true
    scene.add(spotlight1)

    const spotlight2 = new THREE.SpotLight(new THREE.Color(customization.colors.accent), 1.5)
    spotlight2.position.set(-3, 6, -3)
    spotlight2.angle = Math.PI / 8
    scene.add(spotlight2)

    // Pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32)
    const pedestalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.1,
    })
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial)
    pedestal.position.y = -0.1
    scene.add(pedestal)

    return {
      animate: (time: number) => {
        product.rotation.y = time * customization.options.speed
        product.position.y = 1 + Math.sin(time * 2) * 0.1
      }
    }
  },

  'year-end-greeting': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Celebration fireworks and golden particles
    const fireworksCount = 8
    const fireworks: THREE.Points[] = []
    
    for (let i = 0; i < fireworksCount; i++) {
      const particleCount = 150
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)
      
      const centerX = (Math.random() - 0.5) * 10
      const centerY = Math.random() * 5 + 2
      const centerZ = (Math.random() - 0.5) * 5
      
      const colorOptions = [
        new THREE.Color(customization.colors.primary),
        new THREE.Color(customization.colors.secondary),
        new THREE.Color(customization.colors.accent),
      ]
      
      for (let j = 0; j < particleCount; j++) {
          const idx = j * 3
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 3
        
        positions[idx] = centerX + Math.cos(angle) * radius
        positions[idx + 1] = centerY + Math.sin(angle) * radius * 0.5
        positions[idx + 2] = centerZ + (Math.random() - 0.5) * 2
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
        colors[idx] = color.r
        colors[idx + 1] = color.g
        colors[idx + 2] = color.b
        
        sizes[j] = Math.random() * 0.5 + 0.1
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      
      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      })
      
      const firework = new THREE.Points(geometry, material)
      firework.userData = { 
        startTime: Math.random() * 5,
        duration: 2 + Math.random(),
        exploded: false
      }
      fireworks.push(firework)
      scene.add(firework)
    }

    return {
      animate: (time: number) => {
        fireworks.forEach((firework) => {
          const data = firework.userData
          const localTime = time - data.startTime
          
          if (localTime > 0 && localTime < data.duration) {
            if (!data.exploded) {
              data.exploded = true
              const positions = firework.geometry.attributes.position.array as Float32Array
              for (let j = 0; j < positions.length; j += 3) {
                const angle = Math.random() * Math.PI * 2
                const speed = Math.random() * 2 + 1
                positions[j] += Math.cos(angle) * speed * localTime
                positions[j + 1] += Math.sin(angle) * speed * localTime - localTime * localTime * 0.5
                positions[j + 2] += (Math.random() - 0.5) * speed * localTime
              }
            }
            
            (firework.material as THREE.PointsMaterial).opacity = Math.max(0, 0.8 - (localTime / data.duration))
            firework.geometry.attributes.position.needsUpdate = true;
          } else if (localTime > data.duration) {
            // Reset firework
            data.exploded = false
            data.startTime = time + Math.random() * 3;
            (firework.material as THREE.PointsMaterial).opacity = 0.8;
          }
        })
      }
    }
  },

  'hiring-announcement': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Tech particles and code elements
    const codeParticles: THREE.Mesh[] = []
    const codeElements = ['{ }', '< />', '[ ]', '( )', '++', '--', '==', '!=']
    
    // Create floating code elements
    for (let i = 0; i < 20; i++) {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      
      ctx.fillStyle = customization.colors.primary
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(
        codeElements[Math.floor(Math.random() * codeElements.length)],
        64, 40
      )
      
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0.7
      })
      const geometry = new THREE.PlaneGeometry(2, 1)
      const codeMesh = new THREE.Mesh(geometry, material)
      
      codeMesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      )
      
      codeMesh.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          rotation: (Math.random() - 0.5) * 0.01
        }
      }
      
      codeParticles.push(codeMesh)
      scene.add(codeMesh)
    }

    // Binary rain effect
    const binaryCount = 100
    const binaryGeometry = new THREE.BufferGeometry()
    const binaryPositions = new Float32Array(binaryCount * 3)
    
    for (let i = 0; i < binaryCount; i++) {
      const index = i * 3
      binaryPositions[index] = (Math.random() - 0.5) * 20
      binaryPositions[index + 1] = Math.random() * 15
      binaryPositions[index + 2] = (Math.random() - 0.5) * 10
    }
    
    binaryGeometry.setAttribute('position', new THREE.BufferAttribute(binaryPositions, 3))
    const binaryMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(customization.colors.secondary),
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    })
    const binarySystem = new THREE.Points(binaryGeometry, binaryMaterial)
    scene.add(binarySystem)

    return {
      animate: () => {
        // Animate floating code
        codeParticles.forEach(particle => {
          const velocity = particle.userData.velocity
          particle.position.x += velocity.x * customization.options.speed
          particle.position.y += velocity.y * customization.options.speed
          particle.rotation.z += velocity.rotation * customization.options.speed
          
          // Wrap around screen
          if (Math.abs(particle.position.x) > 10) particle.position.x *= -0.8
          if (Math.abs(particle.position.y) > 5) particle.position.y *= -0.8
        })
        
        // Binary rain
        const positions = binaryGeometry.attributes.position.array as Float32Array
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.05 * customization.options.speed
          if (positions[i] < -8) {
            positions[i] = 15
            positions[i - 1] = (Math.random() - 0.5) * 20
          }
        }
        binaryGeometry.attributes.position.needsUpdate = true;
      }
    }
  },

  'youtube-intro': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Dynamic channel branding with motion graphics
    const channelGeometry = new THREE.RingGeometry(2, 3, 6)
    const channelMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(customization.colors.primary),
      emissive: new THREE.Color(customization.colors.primary),
      side: THREE.DoubleSide
    })
    const channelRing = new THREE.Mesh(channelGeometry, channelMaterial)
    scene.add(channelRing)

    // Subscribe button effect
    const buttonGeometry = new THREE.BoxGeometry(4, 1, 0.3)
    const buttonMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xff0000
    })
    const subscribeButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
    subscribeButton.position.z = -2
    scene.add(subscribeButton)

    // Motion trail particles
    const trailCount = 100
    const trailGeometry = new THREE.BufferGeometry()
    const trailPositions = new Float32Array(trailCount * 3)
    
    for (let i = 0; i < trailCount; i++) {
      const angle = (i / trailCount) * Math.PI * 2
      trailPositions[i * 3] = Math.cos(angle) * 3
      trailPositions[i * 3 + 1] = Math.sin(angle) * 3
      trailPositions[i * 3 + 2] = 0
    }
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
    const trailMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(customization.colors.accent),
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })
    const trail = new THREE.Points(trailGeometry, trailMaterial)
    scene.add(trail)

    // Dynamic lighting
    const rimLight = new THREE.PointLight(new THREE.Color(customization.colors.secondary), 2, 50)
    rimLight.position.set(0, 0, 5)
    scene.add(rimLight)

    return {
      animate: (time: number) => {
        channelRing.rotation.z = time * 2 * customization.options.speed
        channelRing.scale.set(
          1 + Math.sin(time * 3) * 0.1,
          1 + Math.sin(time * 3) * 0.1,
          1
        )

        // Subscribe button pulse
        const buttonScale = 1 + Math.sin(time * 5) * 0.05
        subscribeButton.scale.set(buttonScale, buttonScale, 1)

        // Animate trail
        trail.rotation.z = -time * customization.options.speed
        const positions = trailGeometry.attributes.position.array as Float32Array
        for (let i = 0; i < trailCount; i++) {
          const offset = Math.sin(time * 2 + i * 0.1) * 0.2
          const angle = (i / trailCount) * Math.PI * 2 + time
          positions[i * 3] = Math.cos(angle) * (3 + offset)
          positions[i * 3 + 1] = Math.sin(angle) * (3 + offset)
        }
        trailGeometry.attributes.position.needsUpdate = true;
      }
    }
  },

  'tiktok-effect': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Glitch and RGB split effect
    const glitchPlanes: THREE.Mesh[] = []
    const colors = ['#ff0050', '#00ff88', '#5500ff']
    
    // Create RGB split layers
    for (let i = 0; i < 3; i++) {
      const planeGeometry = new THREE.PlaneGeometry(10, 10)
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      })
      const plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.position.z = -2 + i * 0.1
      glitchPlanes.push(plane)
      scene.add(plane)
    }

    // Neon frame
    const frameThickness = 0.2
    const frameGroup = new THREE.Group()
    
    const topBottom = new THREE.BoxGeometry(6, frameThickness, frameThickness)
    const leftRight = new THREE.BoxGeometry(frameThickness, 8, frameThickness)
    
    const neonMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(customization.colors.primary),
      transparent: true,
      opacity: 0.8
    })

    const top = new THREE.Mesh(topBottom, neonMaterial)
    top.position.y = 4
    frameGroup.add(top)

    const bottom = new THREE.Mesh(topBottom, neonMaterial)
    bottom.position.y = -4
    frameGroup.add(bottom)

    const left = new THREE.Mesh(leftRight, neonMaterial)
    left.position.x = -3
    frameGroup.add(left)

    const right = new THREE.Mesh(leftRight, neonMaterial)
    right.position.x = 3
    frameGroup.add(right)

    scene.add(frameGroup)

    // Sparkle particles
    const sparkleCount = 50
    const sparkleGeometry = new THREE.BufferGeometry()
    const sparklePositions = new Float32Array(sparkleCount * 3)
    
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePositions[i] = (Math.random() - 0.5) * 8
      sparklePositions[i + 1] = (Math.random() - 0.5) * 10
      sparklePositions[i + 2] = Math.random() * 2
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3))
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    })
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial)
    scene.add(sparkles)

    let glitchTime = 0

    return {
      animate: (time: number) => {
        glitchTime += 0.016

        // Glitch effect
        if (Math.random() < customization.options.glitchIntensity) {
          glitchPlanes.forEach((plane) => {
            plane.position.x = (Math.random() - 0.5) * 0.2
            plane.position.y = (Math.random() - 0.5) * 0.2
            const material = plane.material as THREE.MeshBasicMaterial;
            material.opacity = Math.random() * 0.5;
          })
        } else {
          glitchPlanes.forEach((plane) => {
            plane.position.x *= 0.9
            plane.position.y *= 0.9
            const material = plane.material as THREE.MeshBasicMaterial;
            material.opacity = 0.3;
          })
        }

        // Neon frame pulse
        const pulse = Math.sin(time * 10) * 0.5 + 0.5
        // Update material opacity for pulse effect
        frameGroup.children.forEach(child => {
          const mesh = child as THREE.Mesh
          if (mesh.material && 'opacity' in mesh.material) {
            (mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 + pulse * 0.2
          }
        })

        // Sparkle animation
        sparkles.rotation.z = time * 0.5
        if (sparkles.material && 'opacity' in sparkles.material) {
          (sparkles.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(time * 20) * 0.5
        }
      }
    }
  },

  'party-announcement': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Disco ball and party lights
    const discoGeometry = new THREE.SphereGeometry(1.5, 16, 16)
    const discoMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      shininess: 100
    })
    const discoBall = new THREE.Mesh(discoGeometry, discoMaterial)
    discoBall.position.y = 3
    scene.add(discoBall)

    // Mirror facets on disco ball
    const facetGroup = new THREE.Group()
    const facetGeometry = new THREE.PlaneGeometry(0.2, 0.2)
    
    for (let i = 0; i < 100; i++) {
      const facetMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        shininess: 100,
        specular: 0xffffff,
      })
      const facet = new THREE.Mesh(facetGeometry, facetMaterial)
      
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      facet.position.set(
        1.5 * Math.sin(theta) * Math.cos(phi),
        1.5 * Math.sin(theta) * Math.sin(phi),
        1.5 * Math.cos(theta)
      )
      facet.lookAt(0, 0, 0)
      facetGroup.add(facet)
    }
    discoBall.add(facetGroup)

    // Party lights
    const lights: THREE.PointLight[] = []
    const lightColors = [0xff0080, 0x00ff80, 0x80ff00, 0xff8000, 0x0080ff]
    
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(lightColors[i], 2, 20)
      light.position.set(
        Math.cos(i * Math.PI * 2 / 5) * 5,
        0,
        Math.sin(i * Math.PI * 2 / 5) * 5
      )
      lights.push(light)
      scene.add(light)
    }

    // Confetti rain
    const confettiCount = 200
    const confettiGeometry = new THREE.BufferGeometry()
    const confettiPositions = new Float32Array(confettiCount * 3)
    const confettiColors = new Float32Array(confettiCount * 3)
    
    for (let i = 0; i < confettiCount; i++) {
      const index = i * 3
      confettiPositions[index] = (Math.random() - 0.5) * 10
      confettiPositions[index + 1] = Math.random() * 10
      confettiPositions[index + 2] = (Math.random() - 0.5) * 10
      
      const color = new THREE.Color().setHSL(Math.random(), 1, 0.7)
      confettiColors[index] = color.r
      confettiColors[index + 1] = color.g
      confettiColors[index + 2] = color.b
    }
    
    confettiGeometry.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3))
    confettiGeometry.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3))
    
    const confettiMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })
    const confetti = new THREE.Points(confettiGeometry, confettiMaterial)
    scene.add(confetti)

    return {
      animate: (time: number) => {
        // Rotate disco ball
        discoBall.rotation.y = time * customization.options.speed

        // Animate party lights
        lights.forEach((light, i) => {
          const angle = time * 2 + i * Math.PI * 2 / 5
          light.position.x = Math.cos(angle) * 5
          light.position.z = Math.sin(angle) * 5
          light.position.y = Math.sin(time * 3 + i) * 2
          light.intensity = 1.5 + Math.sin(time * 10 + i) * 0.5
        })

        // Confetti fall
        const positions = confettiGeometry.attributes.position.array as Float32Array
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.03 * customization.options.speed
          if (positions[i] < -5) {
            positions[i] = 10
            positions[i - 1] = (Math.random() - 0.5) * 10
          }
        }
        confettiGeometry.attributes.position.needsUpdate = true;
        confetti.rotation.y = time * 0.2
      }
    }
  },

  'coming-soon': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Countdown timer with futuristic elements
    const ringCount = 3
    const rings: THREE.Mesh[] = []
    
    // Create concentric rings
    for (let i = 0; i < ringCount; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.1, 16, 100)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(customization.colors.primary),
        transparent: true,
        opacity: 0.8 - i * 0.2,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      rings.push(ring)
      scene.add(ring)
    }

    // Holographic grid
    const gridHelper = new THREE.GridHelper(20, 20, 
      new THREE.Color(customization.colors.secondary), 
      new THREE.Color(customization.colors.secondary)
    )
    gridHelper.material.opacity = 0.3
    gridHelper.material.transparent = true
    gridHelper.position.y = -3
    scene.add(gridHelper)

    // Energy particles
    const particleCount = 200
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 5 + 1
      const angle = Math.random() * Math.PI * 2
      particlePositions[i] = Math.cos(angle) * radius
      particlePositions[i + 1] = (Math.random() - 0.5) * 4
      particlePositions[i + 2] = Math.sin(angle) * radius
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(customization.colors.accent),
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Scanning light beam
    const scanGeometry = new THREE.PlaneGeometry(20, 0.5)
    const scanMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(customization.colors.primary),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
    const scanBeam = new THREE.Mesh(scanGeometry, scanMaterial)
    scanBeam.rotation.x = Math.PI / 2
    scene.add(scanBeam)

    return {
      animate: (time: number) => {
        // Rotate rings at different speeds
        rings.forEach((ring, i) => {
          ring.rotation.z = time * (1 + i * 0.5) * customization.options.speed
          ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1)
        })

        // Rotate particles
        particles.rotation.y = time * 0.5 * customization.options.speed

        // Scan beam animation
        scanBeam.position.y = Math.sin(time * 2) * 3
        if (scanBeam.material && 'opacity' in scanBeam.material) {
          (scanBeam.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 10) * 0.3
        }

        // Grid pulse
        gridHelper.position.y = -3 + Math.sin(time * 3) * 0.2
      }
    }
  },

  'self-introduction': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Professional avatar showcase
    const avatarGeometry = new THREE.ConeGeometry(1, 2, 8)
    const avatarMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(customization.colors.primary),
      shininess: 100,
    })
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial)
    avatar.position.y = 1
    scene.add(avatar)

    // Skills orbiting around
    const skills: THREE.Mesh[] = []
    const skillCount = 6
    const skillGeometry = new THREE.OctahedronGeometry(0.3)
    
    for (let i = 0; i < skillCount; i++) {
      const skillMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / skillCount, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(i / skillCount, 0.7, 0.5)
      })
      const skill = new THREE.Mesh(skillGeometry, skillMaterial)
      skills.push(skill)
      scene.add(skill)
    }

    // Name plate
    const plateGeometry = new THREE.BoxGeometry(4, 0.8, 0.1)
    const plateMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(customization.colors.secondary),
      emissive: new THREE.Color(customization.colors.secondary)
    })
    const namePlate = new THREE.Mesh(plateGeometry, plateMaterial)
    namePlate.position.y = -2
    scene.add(namePlate)

    // Professional lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(
      new THREE.Color(customization.colors.accent), 0.5
    )
    fillLight.position.set(-5, 0, 5)
    scene.add(fillLight)

    return {
      animate: (time: number) => {
        // Gentle avatar rotation
        avatar.rotation.y = Math.sin(time) * 0.2

        // Orbit skills
        skills.forEach((skill, i) => {
          const angle = time * customization.options.speed + (i * Math.PI * 2 / skillCount)
          const radius = 2.5
          skill.position.x = Math.cos(angle) * radius
          skill.position.z = Math.sin(angle) * radius
          skill.position.y = 1 + Math.sin(time * 2 + i) * 0.3
          skill.rotation.x = time * 2
          skill.rotation.y = time * 3
        })

        // Name plate subtle animation
        namePlate.position.y = -2 + Math.sin(time * 2) * 0.05
        const scale = 1 + Math.sin(time * 3) * 0.02
        namePlate.scale.set(scale, scale, 1)
      }
    }
  },

  'portfolio-showcase': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Gallery wall with floating frames
    const frameCount = 6
    const frames: THREE.Group[] = []
    
    for (let i = 0; i < frameCount; i++) {
      const frameGroup = new THREE.Group()
      
      // Frame border
      const frameGeometry = new THREE.BoxGeometry(2.2, 1.7, 0.1)
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(customization.colors.secondary),
        shininess: 100
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frameGroup.add(frame)
      
      // Portfolio piece (image plane)
      const pieceGeometry = new THREE.PlaneGeometry(2, 1.5)
      const pieceMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / frameCount, 0.6, 0.6),
        side: THREE.DoubleSide,
      })
      const piece = new THREE.Mesh(pieceGeometry, pieceMaterial)
      piece.position.z = 0.06
      frameGroup.add(piece)
      
      // Position frames in a grid
      const row = Math.floor(i / 3)
      const col = i % 3
      frameGroup.position.set(
        (col - 1) * 3,
        (row - 0.5) * 2.5,
        0
      )
      
      frameGroup.userData = { 
        originalPos: frameGroup.position.clone(),
        offset: Math.random() * Math.PI * 2
      }
      
      frames.push(frameGroup)
      scene.add(frameGroup)
    }

    // Spotlight for featured work
    const spotlight = new THREE.SpotLight(0xffffff, 2)
    spotlight.position.set(0, 5, 5)
    spotlight.angle = Math.PI / 4
    spotlight.penumbra = 0.5
    spotlight.castShadow = true
    scene.add(spotlight)

    // Ambient particles for atmosphere
    const dustCount = 100
    const dustGeometry = new THREE.BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)
    
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 10
      dustPositions[i + 1] = (Math.random() - 0.5) * 8
      dustPositions[i + 2] = (Math.random() - 0.5) * 3
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dustMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(customization.colors.accent),
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    })
    const dust = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dust)

    return {
      animate: (time: number) => {
        // Floating frames animation
        frames.forEach((frame) => {
          const offset = frame.userData.offset
          frame.position.x = frame.userData.originalPos.x + Math.sin(time + offset) * 0.1
          frame.position.y = frame.userData.originalPos.y + Math.sin(time * 1.5 + offset) * 0.1
          frame.rotation.y = Math.sin(time * 0.5 + offset) * 0.05
          frame.rotation.x = Math.sin(time * 0.7 + offset) * 0.03
        })

        // Rotating spotlight
        spotlight.position.x = Math.sin(time * 0.5) * 3
        spotlight.position.z = 5 + Math.cos(time * 0.5) * 2

        // Floating dust
        dust.rotation.y = time * 0.1
        const positions = dustGeometry.attributes.position.array as Float32Array
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += Math.sin(time + i) * 0.001
        }
        dustGeometry.attributes.position.needsUpdate = true;
      }
    }
  },

  'thank-you-message': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Heart shape with particle burst
    const heartShape = new THREE.Shape()
    const x = 0, y = 0
    heartShape.moveTo(x + 0.5, y + 0.5)
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y)
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7)
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9)
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7)
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y)
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5)

    const heartGeometry = new THREE.ShapeGeometry(heartShape)
    const heartMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(customization.colors.primary),
      emissive: new THREE.Color(customization.colors.primary),
      side: THREE.DoubleSide
    })
    const heart = new THREE.Mesh(heartGeometry, heartMaterial)
    heart.scale.set(2, 2, 1)
    scene.add(heart)

    // Gratitude particles
    const gratitudeCount = 150
    const gratitudeGeometry = new THREE.BufferGeometry()
    const gratitudePositions = new Float32Array(gratitudeCount * 3)
    const gratitudeColors = new Float32Array(gratitudeCount * 3)
    const gratitudeSizes = new Float32Array(gratitudeCount)
    
    for (let i = 0; i < gratitudeCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.5
      gratitudePositions[i * 3] = Math.cos(angle) * radius
      gratitudePositions[i * 3 + 1] = Math.sin(angle) * radius
      gratitudePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      
      const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.9, 1, 0.7)
      gratitudeColors[i * 3] = color.r
      gratitudeColors[i * 3 + 1] = color.g
      gratitudeColors[i * 3 + 2] = color.b
      
      gratitudeSizes[i] = Math.random() * 0.3 + 0.1
    }
    
    gratitudeGeometry.setAttribute('position', new THREE.BufferAttribute(gratitudePositions, 3))
    gratitudeGeometry.setAttribute('color', new THREE.BufferAttribute(gratitudeColors, 3))
    gratitudeGeometry.setAttribute('size', new THREE.BufferAttribute(gratitudeSizes, 1))
    
    const gratitudeMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })
    const gratitudeParticles = new THREE.Points(gratitudeGeometry, gratitudeMaterial)
    scene.add(gratitudeParticles)

    // Warm lighting
    const warmLight1 = new THREE.PointLight(0xffaa88, 2, 50)
    warmLight1.position.set(3, 3, 3)
    scene.add(warmLight1)

    const warmLight2 = new THREE.PointLight(0xff88aa, 2, 50)
    warmLight2.position.set(-3, -3, 3)
    scene.add(warmLight2)

    return {
      animate: (time: number) => {
        // Heart beat animation
        const scale = 1 + Math.sin(time * 3) * 0.1
        heart.scale.set(scale * 2, scale * 2, 1)
        heart.rotation.z = Math.sin(time) * 0.05

        // Expanding gratitude particles
        const positions = gratitudeGeometry.attributes.position.array as Float32Array
        for (let i = 0; i < gratitudeCount; i++) {
          const index = i * 3
          const currentRadius = Math.sqrt(
            positions[index] * positions[index] + 
            positions[index + 1] * positions[index + 1]
          )
          
          if (currentRadius < 5) {
            positions[index] *= 1.01
            positions[index + 1] *= 1.01
          } else {
            // Reset to center
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 0.5
            positions[index] = Math.cos(angle) * radius
            positions[index + 1] = Math.sin(angle) * radius
          }
          
          // Float upward
          positions[index + 2] += 0.01 * customization.options.speed
          if (positions[index + 2] > 3) {
            positions[index + 2] = -3
          }
        }
        gratitudeGeometry.attributes.position.needsUpdate = true;

        // Rotate particle system
        gratitudeParticles.rotation.z = time * 0.2
      }
    }
  },

  'new-year-greeting': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // Fireworks and countdown celebration
    const fireworkSystems: {
      particles: THREE.Points,
      velocity: Float32Array,
      life: number,
      maxLife: number,
      exploded: boolean
    }[] = []
    
    // Create multiple firework systems
    for (let f = 0; f < 5; f++) {
      const particleCount = 200
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const velocities = new Float32Array(particleCount * 3)
      
      // Initialize at launch position
      const launchX = (Math.random() - 0.5) * 10
      const launchZ = (Math.random() - 0.5) * 5
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = launchX
        positions[i * 3 + 1] = -5
        positions[i * 3 + 2] = launchZ
        
        // Random colors for each particle
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.7)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
        
        // Explosion velocities (will be used after launch)
        const angle = Math.random() * Math.PI * 2
        const angle2 = Math.random() * Math.PI
        const speed = Math.random() * 2 + 1
        velocities[i * 3] = Math.sin(angle2) * Math.cos(angle) * speed
        velocities[i * 3 + 1] = Math.cos(angle2) * speed
        velocities[i * 3 + 2] = Math.sin(angle2) * Math.sin(angle) * speed
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      
      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      })
      
      const particles = new THREE.Points(geometry, material)
      scene.add(particles)
      
      fireworkSystems.push({
        particles,
        velocity: velocities,
        life: 0,
        maxLife: 3 + Math.random() * 2,
        exploded: false
      })
    }

    // Year numbers
    const yearGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.3)
    const yearMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(customization.colors.primary),
      emissive: new THREE.Color(customization.colors.primary)
    })
    
    const yearDigits: THREE.Mesh[] = []
    for (let i = 0; i < 4; i++) {
      const digit = new THREE.Mesh(yearGeometry, yearMaterial)
      digit.position.x = (i - 1.5) * 1.5
      yearDigits.push(digit)
      scene.add(digit)
    }

    // Celebration lights
    const celebrationLights: THREE.PointLight[] = []
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
    
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(lightColors[i], 0, 30)
      light.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 10,
        (Math.random() - 0.5) * 10
      )
      celebrationLights.push(light)
      scene.add(light)
    }

    let globalTime = 0

    return {
      animate: (time: number) => {
        globalTime += 0.016

        // Animate year digits
        yearDigits.forEach((digit, i) => {
          digit.rotation.y = Math.sin(time * 2 + i * 0.5) * 0.1
          digit.position.y = Math.sin(time * 3 + i * 0.3) * 0.2
        })

        // Fireworks animation
        fireworkSystems.forEach((system) => {
          system.life += 0.016 * customization.options.speed
          
          const positions = system.particles.geometry.attributes.position.array as Float32Array
          const launchHeight = 8
          const launchSpeed = 8
          
          if (system.life < 1 && !system.exploded) {
            // Launch phase
            for (let i = 1; i < positions.length; i += 3) {
              positions[i] += launchSpeed * 0.016 * customization.options.speed
            }
          } else if (!system.exploded && positions[1] >= launchHeight) {
            // Explode
            system.exploded = true
            const explodeX = positions[0]
            const explodeY = positions[1]
            const explodeZ = positions[2]
            
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] = explodeX
              positions[i + 1] = explodeY
              positions[i + 2] = explodeZ
            }
          } else if (system.exploded) {
            // Explosion phase
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] += system.velocity[i] * 0.1
              positions[i + 1] += system.velocity[i + 1] * 0.1 - 0.05 // gravity
              positions[i + 2] += system.velocity[i + 2] * 0.1
            }
            
            // Fade out
            (system.particles.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - (system.life - 1) / 2)
          }
          
          // Reset firework
          if (system.life > system.maxLife) {
            system.life = 0;
            system.exploded = false;
            (system.particles.material as THREE.PointsMaterial).opacity = 1;
            
            const newLaunchX = (Math.random() - 0.5) * 10
            const newLaunchZ = (Math.random() - 0.5) * 5
            
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] = newLaunchX
              positions[i + 1] = -5
              positions[i + 2] = newLaunchZ
            }
          }
          
          system.particles.geometry.attributes.position.needsUpdate = true;
        })

        // Flash celebration lights
        celebrationLights.forEach((light) => {
          light.intensity = Math.random() > 0.7 ? 2 : 0.5
        })
      }
    }
  },

  'interactive-globe': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // 메인 지구본 생성
    const globeRadius = 3
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 32)
    
    // 지구본 텍스처 생성 (임시로 절차적 생성)
    const globeTexture = createEarthTexture()
    
    const globeMaterial = new THREE.MeshPhysicalMaterial({
      map: globeTexture,
      metalness: 0.1,
      roughness: 0.8,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 0.95
    })
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)
    
    // 대기권 글로우 효과
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.1, 32, 16)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `
    })
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)
    
    // 글로벌 연결선 생성
    const connectionGroup = new THREE.Group()
    const connectionPoints = [
      { lat: 37.7749, lon: -122.4194, name: "San Francisco" },
      { lat: 51.5074, lon: -0.1278, name: "London" },
      { lat: 35.6762, lon: 139.6503, name: "Tokyo" },
      { lat: -33.8688, lon: 151.2093, name: "Sydney" },
      { lat: 40.7128, lon: -74.0060, name: "New York" },
      { lat: 55.7558, lon: 37.6173, name: "Moscow" }
    ]
    
    connectionPoints.forEach((point, i) => {
      // 지구 표면의 점으로 변환
      const phi = (90 - point.lat) * (Math.PI / 180)
      const theta = (point.lon + 180) * (Math.PI / 180)
      
      const x = -globeRadius * Math.sin(phi) * Math.cos(theta)
      const y = globeRadius * Math.cos(phi)
      const z = globeRadius * Math.sin(phi) * Math.sin(theta)
      
      // 연결점 표시
      const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const dotMaterial = new THREE.MeshLambertMaterial({
        color: customization.colors.accent,
        emissive: customization.colors.accent,
        emissiveIntensity: 0.5
      })
      const dot = new THREE.Mesh(dotGeometry, dotMaterial)
      dot.position.set(x, y, z)
      connectionGroup.add(dot)
      
      // 다른 점들과의 연결선
      for (let j = i + 1; j < connectionPoints.length; j++) {
        const otherPoint = connectionPoints[j]
        const otherPhi = (90 - otherPoint.lat) * (Math.PI / 180)
        const otherTheta = (otherPoint.lon + 180) * (Math.PI / 180)
        
        const otherX = -globeRadius * Math.sin(otherPhi) * Math.cos(otherTheta)
        const otherY = globeRadius * Math.cos(otherPhi)
        const otherZ = globeRadius * Math.sin(otherPhi) * Math.sin(otherTheta)
        
        // 호 곡선 생성
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x, y, z),
          new THREE.Vector3((x + otherX) * 0.7, (y + otherY) * 0.7 + 2, (z + otherZ) * 0.7),
          new THREE.Vector3(otherX, otherY, otherZ)
        )
        
        const points = curve.getPoints(50)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({
          color: customization.colors.secondary,
          transparent: true,
          opacity: 0.4,
          linewidth: 2
        })
        const line = new THREE.Line(lineGeometry, lineMaterial)
        connectionGroup.add(line)
      }
    })
    
    scene.add(connectionGroup)
    
    // 궤도 위성들
    const satelliteGroup = new THREE.Group()
    const satellites: THREE.Mesh[] = []
    
    for (let i = 0; i < 3; i++) {
      const satelliteGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      const satelliteMaterial = new THREE.MeshPhysicalMaterial({
        color: customization.colors.primary,
        metalness: 1.0,
        roughness: 0.2,
        emissive: customization.colors.primary,
        emissiveIntensity: 0.2
      })
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial)
      
      // 궤도 설정
      satellite.userData = {
        orbitRadius: 4.5 + i * 0.5,
        orbitSpeed: 0.5 + i * 0.2,
        orbitOffset: (i / 3) * Math.PI * 2
      }
      
      satellites.push(satellite)
      satelliteGroup.add(satellite)
    }
    
    scene.add(satelliteGroup)
    
    // 데이터 플로우 파티클
    const dataFlowGeometry = new THREE.BufferGeometry()
    const dataFlowCount = 500
    const dataPositions = new Float32Array(dataFlowCount * 3)
    const dataColors = new Float32Array(dataFlowCount * 3)
    const dataSizes = new Float32Array(dataFlowCount)
    
    const dataColor1 = new THREE.Color(customization.colors.primary)
    const dataColor2 = new THREE.Color(customization.colors.accent)
    
    for (let i = 0; i < dataFlowCount; i++) {
      const radius = 3.5 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      dataPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      dataPositions[i * 3 + 1] = radius * Math.cos(phi)
      dataPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      
      const color = dataColor1.clone().lerp(dataColor2, Math.random())
      dataColors[i * 3] = color.r
      dataColors[i * 3 + 1] = color.g
      dataColors[i * 3 + 2] = color.b
      
      dataSizes[i] = Math.random() * 0.1 + 0.05
    }
    
    dataFlowGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3))
    dataFlowGeometry.setAttribute('color', new THREE.BufferAttribute(dataColors, 3))
    dataFlowGeometry.setAttribute('size', new THREE.BufferAttribute(dataSizes, 1))
    
    const dataFlowMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    
    const dataFlow = new THREE.Points(dataFlowGeometry, dataFlowMaterial)
    scene.add(dataFlow)
    
    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(10, 5, 5)
    scene.add(sunLight)
    
    const moonLight = new THREE.DirectionalLight(0x4444ff, 0.5)
    moonLight.position.set(-10, -5, -5)
    scene.add(moonLight)

    return {
      animate: (time: number) => {
        const speed = customization.options.speed
        
        // 지구 자전
        globe.rotation.y = time * 0.1 * speed
        
        // 대기권 회전 (약간 다른 속도)
        atmosphere.rotation.y = time * 0.12 * speed
        atmosphere.rotation.x = Math.sin(time * 0.05) * 0.02
        
        // 연결선 글로우 효과
        connectionGroup.children.forEach((child, index) => {
          if (child instanceof THREE.Line) {
            const material = child.material as THREE.LineBasicMaterial
            material.opacity = 0.2 + Math.sin(time * 2 + index * 0.5) * 0.2
          } else if (child instanceof THREE.Mesh) {
            // 연결점 펄스
            const material = child.material as THREE.MeshLambertMaterial
            material.emissiveIntensity = 0.3 + Math.sin(time * 3 + index) * 0.2
            child.scale.setScalar(1 + Math.sin(time * 4 + index) * 0.3)
          }
        })
        
        // 위성 궤도 운동
        satellites.forEach((satellite) => {
          const userData = satellite.userData
          const orbitAngle = time * userData.orbitSpeed * speed + userData.orbitOffset
          
          satellite.position.x = Math.cos(orbitAngle) * userData.orbitRadius
          satellite.position.z = Math.sin(orbitAngle) * userData.orbitRadius
          satellite.position.y = Math.sin(orbitAngle * 2) * 0.5
          
          // 위성 자체 회전
          satellite.rotation.y = time * 2 * speed
          satellite.rotation.x = time * 1.5 * speed
        })
        
        // 데이터 플로우 애니메이션
        const positions = dataFlow.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < dataFlowCount; i++) {
          const i3 = i * 3
          // 데이터가 지구 주위를 흐르는 효과
          const currentRadius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)
          const flowSpeed = 0.02 * speed
          
          // 구형 좌표계에서 회전
          const theta = Math.atan2(positions[i3 + 2], positions[i3]) + flowSpeed
          const phi = Math.acos(positions[i3 + 1] / currentRadius)
          
          positions[i3] = currentRadius * Math.sin(phi) * Math.cos(theta)
          positions[i3 + 1] = currentRadius * Math.cos(phi)
          positions[i3 + 2] = currentRadius * Math.sin(phi) * Math.sin(theta)
        }
        dataFlow.geometry.attributes.position.needsUpdate = true
        
        // 데이터 플로우 투명도 애니메이션
        const dataFlowMat = dataFlow.material as THREE.PointsMaterial
        dataFlowMat.opacity = 0.5 + Math.sin(time * 1.5) * 0.2
      }
    }
  },

  'mathematical-beauty': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // 3Blue1Brown 스타일의 수학적 시각화
    const centerGroup = new THREE.Group()
    
    // 파라메트릭 곡선 생성 함수
    const createParametricCurve = (func: (t: number) => THREE.Vector3, samples: number = 200) => {
      const points: THREE.Vector3[] = []
      for (let i = 0; i <= samples; i++) {
        const t = i / samples
        points.push(func(t))
      }
      return points
    }
    
    // 주요 수학적 곡선들
    const curves: { points: THREE.Vector3[], color: string, width: number }[] = []
    
    // 1. 나선 곡선 (Helix)
    const helixPoints = createParametricCurve((t) => {
      const radius = 3
      const height = 8
      const turns = 2
      const angle = t * Math.PI * 2 * turns
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        (t - 0.5) * height,
        Math.sin(angle) * radius
      )
    }, 300)
    curves.push({ points: helixPoints, color: customization.colors.primary, width: 3 })
    
    // 2. 토러스 매듭 (Torus Knot)
    const torusKnotPoints = createParametricCurve((t) => {
      const p = 3, q = 2
      const angle = t * Math.PI * 2
      const r = 2
      const R = 4
      return new THREE.Vector3(
        (R + r * Math.cos(q * angle)) * Math.cos(p * angle),
        (R + r * Math.cos(q * angle)) * Math.sin(p * angle),
        r * Math.sin(q * angle)
      )
    }, 400)
    
    // 3. 리사주 곡선 (Lissajous Curve) 
    const lissajousPoints = createParametricCurve((t) => {
      const A = 3, B = 3
      const a = 3, b = 2
      const delta = Math.PI / 2
      const angle = t * Math.PI * 2
      return new THREE.Vector3(
        A * Math.sin(a * angle + delta),
        B * Math.sin(b * angle),
        2 * Math.sin(angle * 4)
      )
    }, 300)
    
    // 곡선 렌더링
    curves.forEach((curveData, index) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(curveData.points)
      const material = new THREE.LineBasicMaterial({
        color: curveData.color,
        linewidth: curveData.width,
        transparent: true,
        opacity: 0.8
      })
      const curve = new THREE.Line(geometry, material)
      centerGroup.add(curve)
    })
    
    // 움직이는 점들 (곡선을 따라가는)
    const movingDots: { mesh: THREE.Mesh, curveIndex: number, t: number, speed: number }[] = []
    
    curves.forEach((curveData, curveIndex) => {
      // 각 곡선마다 3-5개의 점
      const dotCount = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < dotCount; i++) {
        const dotGeometry = new THREE.SphereGeometry(0.15, 16, 16)
        const dotMaterial = new THREE.MeshPhysicalMaterial({
          color: curveData.color,
          emissive: curveData.color,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2
        })
        const dot = new THREE.Mesh(dotGeometry, dotMaterial)
        
        movingDots.push({
          mesh: dot,
          curveIndex,
          t: i / dotCount,
          speed: 0.2 + Math.random() * 0.3
        })
        
        centerGroup.add(dot)
      }
    })
    
    // 수학적 그리드 평면
    const gridHelper = new THREE.GridHelper(20, 40, 0x444444, 0x222222)
    gridHelper.position.y = -5
    scene.add(gridHelper)
    
    // 축 표시
    const axesGroup = new THREE.Group()
    
    // X축 (빨강)
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-8, 0, 0),
      new THREE.Vector3(8, 0, 0)
    ])
    const xAxis = new THREE.Line(xAxisGeometry, new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true }))
    axesGroup.add(xAxis)
    
    // Y축 (초록)
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -5, 0),
      new THREE.Vector3(0, 5, 0)
    ])
    const yAxis = new THREE.Line(yAxisGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true }))
    axesGroup.add(yAxis)
    
    // Z축 (파랑)
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -8),
      new THREE.Vector3(0, 0, 8)
    ])
    const zAxis = new THREE.Line(zAxisGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true }))
    axesGroup.add(zAxis)
    
    scene.add(axesGroup)
    
    // 함수 방정식 표시 (플로팅 텍스트 효과)
    const equationPanels: THREE.Mesh[] = []
    const equations = [
      'x = cos(θ) · r',
      'y = t · h',  
      'z = sin(θ) · r'
    ]
    
    equations.forEach((eq, i) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, 256, 64)
      
      ctx.font = '24px Courier New'
      ctx.fillStyle = customization.colors.accent
      ctx.fillText(eq, 20, 40)
      
      const texture = new THREE.CanvasTexture(canvas)
      const panelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
      })
      
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.5),
        panelMaterial
      )
      
      panel.position.set(5, 3 - i * 1, 0)
      equationPanels.push(panel)
      scene.add(panel)
    })
    
    scene.add(centerGroup)
    
    // 부드러운 조명
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(5, 10, 5)
    scene.add(mainLight)
    
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.4)
    fillLight.position.set(-5, -5, -5)
    scene.add(fillLight)

    return {
      animate: (time: number) => {
        const speed = customization.options.speed
        
        // 전체 그룹 천천히 회전
        centerGroup.rotation.y = time * 0.1 * speed
        
        // 움직이는 점들 업데이트
        movingDots.forEach((dotData) => {
          dotData.t = (dotData.t + 0.001 * dotData.speed * speed) % 1
          const curvePoints = curves[dotData.curveIndex].points
          const index = Math.floor(dotData.t * (curvePoints.length - 1))
          const nextIndex = (index + 1) % curvePoints.length
          const localT = (dotData.t * (curvePoints.length - 1)) - index
          
          // 부드러운 보간
          const position = new THREE.Vector3().lerpVectors(
            curvePoints[index],
            curvePoints[nextIndex],
            localT
          )
          
          dotData.mesh.position.copy(position)
          
          // 점 크기 펄스
          const pulse = Math.sin(time * 3 + dotData.t * Math.PI * 2) * 0.3 + 1
          dotData.mesh.scale.setScalar(pulse)
        })
        
        // 방정식 패널 부유 효과
        equationPanels.forEach((panel, i) => {
          panel.position.y = 3 - i * 1 + Math.sin(time * 0.8 + i * 0.5) * 0.2
          panel.rotation.y = Math.sin(time * 0.5 + i) * 0.1
        })
        
        // 축 투명도 변화
        axesGroup.children.forEach((axis, i) => {
          const material = (axis as THREE.Line).material as THREE.LineBasicMaterial
          material.opacity = 0.3 + Math.sin(time + i * 2) * 0.2
        })
      }
    }
  },

  'dna-helix-data': (scene: THREE.Scene, customization: TemplateCustomization) => {
    // DNA 나선 구조 매개변수
    const helixRadius = 2
    const helixHeight = 8
    const helixTurns = 3
    const baseCount = 120
    
    // 메인 DNA 구조 그룹
    const dnaGroup = new THREE.Group()
    
    // DNA 백본 나선 생성 (두 개의 나선)
    const backboneGeometry1 = new THREE.BufferGeometry()
    const backboneGeometry2 = new THREE.BufferGeometry()
    const backbonePoints1: THREE.Vector3[] = []
    const backbonePoints2: THREE.Vector3[] = []
    
    // 염기쌍 연결선 그룹
    const basePairGroup = new THREE.Group()
    const basePairs: { line: THREE.Line; sphere1: THREE.Mesh; sphere2: THREE.Mesh; angle: number }[] = []
    
    // DNA 나선 좌표 계산
    for (let i = 0; i <= baseCount; i++) {
      const t = i / baseCount
      const angle = t * Math.PI * 2 * helixTurns
      const y = (t - 0.5) * helixHeight
      
      // 첫 번째 나선 (외부)
      const x1 = Math.cos(angle) * helixRadius
      const z1 = Math.sin(angle) * helixRadius
      backbonePoints1.push(new THREE.Vector3(x1, y, z1))
      
      // 두 번째 나선 (180도 반대)
      const x2 = Math.cos(angle + Math.PI) * helixRadius
      const z2 = Math.sin(angle + Math.PI) * helixRadius
      backbonePoints2.push(new THREE.Vector3(x2, y, z2))
      
      // 염기쌍 연결선과 구체 생성
      if (i % 3 === 0) { // 일부만 표시해서 깔끔하게
        // 연결선
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2)
        ])
        const lineMaterial = new THREE.LineBasicMaterial({
          color: customization.colors.accent,
          transparent: true,
          opacity: 0.6,
          linewidth: 2
        })
        const line = new THREE.Line(lineGeometry, lineMaterial)
        
        // 염기 구체 (A, T, G, C 표현)
        const baseSize = 0.15
        const sphere1Geometry = new THREE.SphereGeometry(baseSize, 12, 8)
        const sphere2Geometry = new THREE.SphereGeometry(baseSize, 12, 8)
        
        // 염기쌍 색상 (A-T는 빨강-파랑, G-C는 초록-노랑)
        const baseType = i % 4
        let color1, color2
        switch (baseType) {
          case 0: // A-T
            color1 = '#FF4444' // A: 빨강
            color2 = '#4444FF' // T: 파랑
            break
          case 1: // T-A
            color1 = '#4444FF' // T: 파랑
            color2 = '#FF4444' // A: 빨강
            break
          case 2: // G-C
            color1 = '#44FF44' // G: 초록
            color2 = '#FFFF44' // C: 노랑
            break
          default: // C-G
            color1 = '#FFFF44' // C: 노랑
            color2 = '#44FF44' // G: 초록
        }
        
        const sphere1Material = new THREE.MeshLambertMaterial({
          color: color1,
          emissive: color1,
          emissiveIntensity: 0.3
        })
        const sphere2Material = new THREE.MeshLambertMaterial({
          color: color2,
          emissive: color2,
          emissiveIntensity: 0.3
        })
        
        const sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material)
        const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material)
        
        sphere1.position.set(x1, y, z1)
        sphere2.position.set(x2, y, z2)
        
        basePairGroup.add(line)
        basePairGroup.add(sphere1)
        basePairGroup.add(sphere2)
        
        basePairs.push({ line, sphere1, sphere2, angle })
      }
    }
    
    // DNA 백본 나선 생성
    backboneGeometry1.setFromPoints(backbonePoints1)
    backboneGeometry2.setFromPoints(backbonePoints2)
    
    const backboneMaterial1 = new THREE.LineBasicMaterial({
      color: customization.colors.primary,
      linewidth: 4,
      transparent: true,
      opacity: 0.8
    })
    const backboneMaterial2 = new THREE.LineBasicMaterial({
      color: customization.colors.secondary,
      linewidth: 4,
      transparent: true,
      opacity: 0.8
    })
    
    const backbone1 = new THREE.Line(backboneGeometry1, backboneMaterial1)
    const backbone2 = new THREE.Line(backboneGeometry2, backboneMaterial2)
    
    dnaGroup.add(backbone1)
    dnaGroup.add(backbone2)
    dnaGroup.add(basePairGroup)
    scene.add(dnaGroup)
    
    // 데이터 파티클 효과 (DNA 주변을 흐르는 데이터) - 수량 대폭 줄임
    const dataParticleGeometry = new THREE.BufferGeometry()
    const dataParticleCount = 50
    const dataPositions = new Float32Array(dataParticleCount * 3)
    const dataColors = new Float32Array(dataParticleCount * 3)
    const dataSizes = new Float32Array(dataParticleCount)
    const dataVelocities = new Float32Array(dataParticleCount * 3)
    
    const dataColor1 = new THREE.Color(customization.colors.primary)
    const dataColor2 = new THREE.Color(customization.colors.accent)
    
    for (let i = 0; i < dataParticleCount; i++) {
      const i3 = i * 3
      
      // DNA 주위에 분포
      const radius = helixRadius + 1 + Math.random() * 2
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * (helixHeight + 2)
      
      dataPositions[i3] = Math.cos(angle) * radius
      dataPositions[i3 + 1] = height
      dataPositions[i3 + 2] = Math.sin(angle) * radius
      
      // 나선형 움직임을 위한 속도
      dataVelocities[i3] = (Math.random() - 0.5) * 0.02
      dataVelocities[i3 + 1] = (Math.random() - 0.5) * 0.01
      dataVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02
      
      const color = dataColor1.clone().lerp(dataColor2, Math.random())
      dataColors[i3] = color.r
      dataColors[i3 + 1] = color.g
      dataColors[i3 + 2] = color.b
      
      dataSizes[i] = Math.random() * 0.1 + 0.05
    }
    
    dataParticleGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3))
    dataParticleGeometry.setAttribute('color', new THREE.BufferAttribute(dataColors, 3))
    dataParticleGeometry.setAttribute('size', new THREE.BufferAttribute(dataSizes, 1))
    
    const dataParticleMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    
    const dataParticles = new THREE.Points(dataParticleGeometry, dataParticleMaterial)
    scene.add(dataParticles)
    
    // 홀로그래픽 패널 완전 제거 - 그룹 자체도 제거
    
    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)
    
    // DNA를 위한 부드러운 조명
    const dnaLight1 = new THREE.PointLight(customization.colors.primary, 1.5, 15)
    dnaLight1.position.set(5, 2, 5)
    scene.add(dnaLight1)
    
    const dnaLight2 = new THREE.PointLight(customization.colors.secondary, 1.5, 15)
    dnaLight2.position.set(-5, -2, -5)
    scene.add(dnaLight2)
    
    // 림라이트 효과
    const rimLight = new THREE.DirectionalLight(customization.colors.accent, 0.8)
    rimLight.position.set(0, 10, 0)
    scene.add(rimLight)

    return {
      animate: (time: number) => {
        const speed = customization.options.speed
        
        // DNA 그룹 회전
        dnaGroup.rotation.y = time * 0.2 * speed
        dnaGroup.rotation.x = Math.sin(time * 0.1) * 0.1
        
        // 염기쌍 펄스 효과
        basePairs.forEach((basePair, index) => {
          const pulse = Math.sin(time * 3 + index * 0.2) * 0.3 + 0.7
          basePair.sphere1.scale.setScalar(pulse)
          basePair.sphere2.scale.setScalar(pulse)
          
          // 연결선 투명도 변화
          const lineMat = basePair.line.material as THREE.LineBasicMaterial
          lineMat.opacity = 0.4 + Math.sin(time * 2 + index * 0.3) * 0.2
        })
        
        // 데이터 파티클 나선형 움직임
        const positions = dataParticles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < dataParticleCount; i++) {
          const i3 = i * 3
          
          // 나선형 궤도로 움직임
          const currentRadius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2)
          const currentAngle = Math.atan2(positions[i3 + 2], positions[i3])
          const newAngle = currentAngle + 0.01 * speed
          
          positions[i3] = Math.cos(newAngle) * currentRadius
          positions[i3 + 2] = Math.sin(newAngle) * currentRadius
          
          // Y축 움직임 (위아래로 흔들림)
          positions[i3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.002 * speed
          
          // 경계를 넘으면 리셋
          if (positions[i3 + 1] > helixHeight / 2 + 2) {
            positions[i3 + 1] = -helixHeight / 2 - 2
          }
          if (positions[i3 + 1] < -helixHeight / 2 - 2) {
            positions[i3 + 1] = helixHeight / 2 + 2
          }
        }
        dataParticles.geometry.attributes.position.needsUpdate = true
        
        // 데이터 파티클 투명도 펄스
        const dataParticleMat = dataParticles.material as THREE.PointsMaterial
        dataParticleMat.opacity = 0.5 + Math.sin(time * 1.5) * 0.2
        
        // 홀로그래픽 패널 애니메이션 제거
        
        // 조명 변화
        dnaLight1.intensity = 1 + Math.sin(time * 1.3) * 0.5
        dnaLight2.intensity = 1 + Math.cos(time * 0.9) * 0.5
        
        // 조명 색상 변화
        dnaLight1.position.x = Math.cos(time * 0.5) * 6
        dnaLight1.position.z = Math.sin(time * 0.5) * 6
        dnaLight2.position.x = Math.cos(time * 0.3 + Math.PI) * 6
        dnaLight2.position.z = Math.sin(time * 0.3 + Math.PI) * 6
      }
    }
  },

  // 로파이 글래스 패널 템플릿 (스크린샷 스타일)
  'lofi-glass-panels': (scene: THREE.Scene, customization: TemplateCustomization) => {
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
        opacity: 0.12,
        roughness: 0,
        metalness: 0,
        transmission: 0.95,
        thickness: 0.1,
        ior: 1.5,
        side: THREE.DoubleSide
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(panel.pos.x, panel.pos.y, panel.pos.z)
      mesh.rotation.y = (Math.random() - 0.5) * 0.3
      mesh.rotation.x = (Math.random() - 0.5) * 0.2
      
      panels.push(mesh)
      mainGroup.add(mesh)
    })

    // 전선 효과 (스크린샷의 전봇대 전선 스타일)
    const wireGeometry = new THREE.BufferGeometry()
    const wirePoints = []
    for (let i = 0; i < 20; i++) {
      const x = -8 + (i / 19) * 16
      const y = 2 + Math.sin(i * 0.5) * 0.3
      wirePoints.push(new THREE.Vector3(x, y, -2))
    }
    wireGeometry.setFromPoints(wirePoints)
    
    const wireMaterial = new THREE.LineBasicMaterial({
      color: '#2C2C2C',
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    })
    const wire = new THREE.Line(wireGeometry, wireMaterial)
    mainGroup.add(wire)

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

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffa500, 1)
    sunLight.position.set(-5, 5, 5)
    scene.add(sunLight)

    const rimLight = new THREE.DirectionalLight(0xff6b9d, 0.5)
    rimLight.position.set(5, -2, 3)
    scene.add(rimLight)

    return {
      animate: (time: number) => {
        // 배경 그라디언트 애니메이션
        if (bgMaterial.uniforms) {
          bgMaterial.uniforms.time.value = time * 0.5
        }

        // 패널들의 부드러운 회전
        panels.forEach((panel, index) => {
          panel.rotation.y += Math.sin(time + index) * 0.002
          panel.rotation.x += Math.cos(time * 0.7 + index) * 0.001
          panel.position.y += Math.sin(time * 0.5 + index) * 0.005
        })

        // 텍스트 부드러운 움직임
        titleSprite.position.y = 1 + Math.sin(time * 0.8) * 0.1
        subtitleSprite.position.y = -0.5 + Math.cos(time * 0.6) * 0.08

        // 전체 그룹 미세한 회전
        mainGroup.rotation.y = Math.sin(time * 0.1) * 0.02
      }
    }
  },

  'liquid-flow-transitions': async (scene: THREE.Scene, customization: TemplateCustomization) => {
    // 새로운 liquid-flow 템플릿을 사용
    const { createLiquidFlowScene } = await import('@/lib/templates/transitions/liquid-flow')
    return createLiquidFlowScene(scene, customization)
  },

  'matrix-digital-rain': async (scene: THREE.Scene, customization: TemplateCustomization) => {
    // 매트릭스 디지털 레인 템플릿
    const { createMatrixDigitalRainScene } = await import('@/lib/templates/effects/matrix-digital-rain')
    return createMatrixDigitalRainScene(scene, customization)
  },
}

// Helper function to create gradient texture
function createGradientTexture(color1: string, color2: string, color3: string): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!

  const gradient = context.createLinearGradient(0, 0, 256, 256)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(0.5, color2)
  gradient.addColorStop(1, color3)

  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true;
  return texture
}

// Helper function to create Earth-like texture
function createEarthTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')!

  // Create earth-like texture with continents
  context.fillStyle = '#1E40AF' // Ocean blue
  context.fillRect(0, 0, 512, 256)

  // Add continent-like shapes (simplified)
  context.fillStyle = '#10B981' // Land green
  
  // North America
  context.beginPath()
  context.ellipse(120, 80, 40, 60, 0, 0, Math.PI * 2)
  context.fill()
  
  // Europe/Africa
  context.beginPath()
  context.ellipse(280, 90, 30, 80, 0, 0, Math.PI * 2)
  context.fill()
  
  // Asia
  context.beginPath()
  context.ellipse(380, 70, 50, 40, 0, 0, Math.PI * 2)
  context.fill()
  
  // Australia
  context.beginPath()
  context.ellipse(420, 180, 20, 15, 0, 0, Math.PI * 2)
  context.fill()
  
  // Add some noise/clouds
  context.fillStyle = 'rgba(255, 255, 255, 0.1)'
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    const size = Math.random() * 20 + 5
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}

// Export all template scene implementations for reference
export const availableTemplateScenes = [
  'corporate-logo-intro',
  'instagram-story', 
  'wedding-invitation',
  'birthday-celebration',
  'sale-notice',
  'product-showcase',
  'year-end-greeting',
  'hiring-announcement',
  'youtube-intro',
  'tiktok-effect',
  'party-announcement',
  'coming-soon',
  'self-introduction',
  'portfolio-showcase', 
  'thank-you-message',
  'new-year-greeting',
  'interactive-globe',
  'dna-helix-data',
  'mathematical-beauty',
  'lofi-glass-panels',
  'liquid-flow-transitions',
  'matrix-digital-rain',
  'particle-universe',
  'neon-city'
] as const