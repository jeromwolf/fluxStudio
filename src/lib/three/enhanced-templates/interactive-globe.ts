import * as THREE from 'three'
import { TemplateCustomization } from '../templates'

export const interactiveGlobe = (scene: THREE.Scene, customization: TemplateCustomization) => {
  // Create globe
  const globeRadius = 2
  const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64)
  
  // Custom shader for globe with atmospheric glow
  const globeShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      primaryColor: { value: new THREE.Color(customization.colors.primary) },
      secondaryColor: { value: new THREE.Color(customization.colors.secondary) },
      atmosphereColor: { value: new THREE.Color(customization.colors.accent) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform vec3 atmosphereColor;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        // Create land masses pattern
        float landPattern = 0.0;
        vec2 coord = vUv * 10.0;
        
        // Continent-like noise
        for(float i = 1.0; i < 4.0; i++) {
          landPattern += abs(sin(coord.x * i + time * 0.1) * cos(coord.y * i)) / i;
        }
        
        landPattern = smoothstep(0.4, 0.6, landPattern);
        
        // Mix colors for land and ocean
        vec3 color = mix(secondaryColor, primaryColor, landPattern);
        
        // Add grid lines
        float grid = 0.0;
        grid += smoothstep(0.98, 1.0, abs(sin(vUv.x * 36.0)));
        grid += smoothstep(0.98, 1.0, abs(sin(vUv.y * 18.0)));
        color += vec3(grid * 0.2);
        
        // Fresnel effect for atmosphere
        vec3 viewDirection = normalize(-vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
        color += atmosphereColor * fresnel * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })

  const globe = new THREE.Mesh(globeGeometry, globeShaderMaterial)
  scene.add(globe)

  // Atmosphere glow
  const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64)
  const atmosphereShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(customization.colors.accent) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 viewDirection = normalize(-vPosition);
        float intensity = pow(0.7 - dot(vNormal, viewDirection), 2.0);
        gl_FragColor = vec4(color, intensity * 0.4);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  })

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereShaderMaterial)
  scene.add(atmosphere)

  // Connection points and arcs
  const connectionPoints: THREE.Vector3[] = []
  const pointMarkers: THREE.Mesh[] = []
  
  // Generate random connection points on globe surface
  for (let i = 0; i < 10; i++) {
    const phi = Math.random() * Math.PI
    const theta = Math.random() * Math.PI * 2
    
    const x = globeRadius * Math.sin(phi) * Math.cos(theta)
    const y = globeRadius * Math.sin(phi) * Math.sin(theta)
    const z = globeRadius * Math.cos(phi)
    
    const point = new THREE.Vector3(x, y, z)
    connectionPoints.push(point)
    
    // Create glowing marker
    const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: customization.colors.accent,
      emissive: customization.colors.accent,
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(point)
    pointMarkers.push(marker)
    globe.add(marker)
  }

  // Create connection arcs
  const arcs: THREE.Line[] = []
  for (let i = 0; i < 5; i++) {
    const start = connectionPoints[i * 2]
    const end = connectionPoints[i * 2 + 1]
    
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .normalize()
      .multiplyScalar(globeRadius * 1.3)
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = curve.getPoints(50)
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(points)
    
    const arcMaterial = new THREE.LineBasicMaterial({
      color: customization.colors.accent,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    
    const arc = new THREE.Line(arcGeometry, arcMaterial)
    arcs.push(arc)
    globe.add(arc)
  }

  // Orbiting satellites
  const satellites: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const satelliteGroup = new THREE.Group()
    
    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.05)
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: customization.colors.secondary,
      emissive: customization.colors.secondary,
      emissiveIntensity: 0.5,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    satelliteGroup.add(body)
    
    // Solar panels
    const panelGeometry = new THREE.PlaneGeometry(0.2, 0.1)
    const panelMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x0066cc,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    })
    
    const panel1 = new THREE.Mesh(panelGeometry, panelMaterial)
    panel1.position.x = 0.15
    satelliteGroup.add(panel1)
    
    const panel2 = new THREE.Mesh(panelGeometry, panelMaterial)
    panel2.position.x = -0.15
    satelliteGroup.add(panel2)
    
    satelliteGroup.position.set(
      (globeRadius + 0.5 + i * 0.2) * Math.cos(i * Math.PI * 2 / 3),
      i * 0.3,
      (globeRadius + 0.5 + i * 0.2) * Math.sin(i * Math.PI * 2 / 3)
    )
    
    satellites.push(satelliteGroup as any)
    scene.add(satelliteGroup)
  }

  // Data particles flowing between points
  const dataParticleCount = 200
  const dataGeometry = new THREE.BufferGeometry()
  const dataPositions = new Float32Array(dataParticleCount * 3)
  const dataVelocities = new Float32Array(dataParticleCount * 3)
  const dataProgress = new Float32Array(dataParticleCount)
  
  for (let i = 0; i < dataParticleCount; i++) {
    const arcIndex = Math.floor(Math.random() * arcs.length)
    dataProgress[i] = Math.random()
    
    dataPositions[i * 3] = 0
    dataPositions[i * 3 + 1] = 0
    dataPositions[i * 3 + 2] = 0
  }
  
  dataGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3))
  
  const dataParticleMaterial = new THREE.PointsMaterial({
    color: customization.colors.accent,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  })
  
  const dataParticles = new THREE.Points(dataGeometry, dataParticleMaterial)
  scene.add(dataParticles)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 3, 5)
  scene.add(directionalLight)

  return {
    animate: (time: number) => {
      // Rotate globe
      globe.rotation.y = time * 0.1 * customization.options.speed
      
      // Update shader uniforms
      globeShaderMaterial.uniforms.time.value = time
      
      // Animate satellites
      satellites.forEach((satellite, i) => {
        const angle = time * (0.5 + i * 0.1) * customization.options.speed
        const radius = globeRadius + 0.5 + i * 0.2
        const height = Math.sin(time + i) * 0.2
        
        satellite.position.x = radius * Math.cos(angle)
        satellite.position.z = radius * Math.sin(angle)
        satellite.position.y = height
        
        satellite.lookAt(0, 0, 0)
        satellite.rotateX(Math.PI / 2)
      })
      
      // Pulse markers
      pointMarkers.forEach((marker, i) => {
        const scale = 1 + Math.sin(time * 3 + i) * 0.3
        marker.scale.setScalar(scale)
      })
      
      // Animate data particles along arcs
      const positions = dataGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < dataParticleCount; i++) {
        dataProgress[i] += 0.01 * customization.options.speed
        if (dataProgress[i] > 1) {
          dataProgress[i] = 0
        }
        
        const arcIndex = i % arcs.length
        const arc = arcs[arcIndex]
        const arcPositions = (arc.geometry.attributes.position.array as Float32Array)
        const pointIndex = Math.floor(dataProgress[i] * (arcPositions.length / 3 - 1))
        
        positions[i * 3] = arcPositions[pointIndex * 3]
        positions[i * 3 + 1] = arcPositions[pointIndex * 3 + 1]
        positions[i * 3 + 2] = arcPositions[pointIndex * 3 + 2]
      }
      dataGeometry.attributes.position.needsUpdate = true
    }
  }
}