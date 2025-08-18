import * as THREE from 'three'

// Post-processing effects for enhanced visual quality
export class PostProcessingManager {
  private composer: any = null
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.Camera
  private passes: any[] = []

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.initializeComposer()
  }

  private async initializeComposer() {
    try {
      // Dynamically import post-processing modules
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js')
      const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js')
      const { TAARenderPass } = await import('three/examples/jsm/postprocessing/TAARenderPass.js')
      
      this.composer = new EffectComposer(this.renderer)
      
      // Base render pass
      const renderPass = new RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)
      this.passes.push(renderPass)

      // Anti-aliasing
      const taaRenderPass = new TAARenderPass(this.scene, this.camera)
      taaRenderPass.sampleLevel = 2
      this.composer.addPass(taaRenderPass)
      this.passes.push(taaRenderPass)

      // Ambient occlusion
      const ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight)
      ssaoPass.kernelRadius = 16
      ssaoPass.minDistance = 0.005
      ssaoPass.maxDistance = 0.1
      this.composer.addPass(ssaoPass)
      this.passes.push(ssaoPass)

      // Bloom effect
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // strength
        0.4, // radius
        0.85 // threshold
      )
      this.composer.addPass(bloomPass)
      this.passes.push(bloomPass)

      console.log('Post-processing initialized successfully')
    } catch (error) {
      console.warn('Post-processing not available:', error)
    }
  }

  public render() {
    if (this.composer) {
      this.composer.render()
    } else {
      // Fallback to basic rendering
      this.renderer.render(this.scene, this.camera)
    }
  }

  public setSize(width: number, height: number) {
    if (this.composer) {
      this.composer.setSize(width, height)
    }
  }

  public dispose() {
    this.passes.forEach(pass => {
      if (pass.dispose) pass.dispose()
    })
    this.passes = []
    this.composer = null
  }

  // Bloom configuration
  public setBloomStrength(strength: number) {
    const bloomPass = this.passes.find(pass => pass.constructor.name === 'UnrealBloomPass')
    if (bloomPass) {
      bloomPass.strength = strength
    }
  }

  public setBloomRadius(radius: number) {
    const bloomPass = this.passes.find(pass => pass.constructor.name === 'UnrealBloomPass')
    if (bloomPass) {
      bloomPass.radius = radius
    }
  }

  public setBloomThreshold(threshold: number) {
    const bloomPass = this.passes.find(pass => pass.constructor.name === 'UnrealBloomPass')
    if (bloomPass) {
      bloomPass.threshold = threshold
    }
  }

  // SSAO configuration
  public setSSAOIntensity(intensity: number) {
    const ssaoPass = this.passes.find(pass => pass.constructor.name === 'SSAOPass')
    if (ssaoPass) {
      ssaoPass.kernelRadius = intensity * 16
    }
  }
}

// Shader library for custom effects
export const shaderLibrary = {
  // Iridescent material shader
  iridescent: {
    uniforms: {
      time: { value: 0 },
      fresnelPower: { value: 2.0 },
      color1: { value: new THREE.Color(0xff0080) },
      color2: { value: new THREE.Color(0x00ff80) },
      color3: { value: new THREE.Color(0x8000ff) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vViewPosition = -vPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float fresnelPower;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        float fresnel = pow(1.0 - dot(normal, viewDir), fresnelPower);
        
        // Iridescent color cycling
        float t = fresnel + time * 0.5;
        vec3 iridColor = color1;
        
        if (t < 0.33) {
          iridColor = mix(color1, color2, t * 3.0);
        } else if (t < 0.66) {
          iridColor = mix(color2, color3, (t - 0.33) * 3.0);
        } else {
          iridColor = mix(color3, color1, (t - 0.66) * 3.0);
        }
        
        gl_FragColor = vec4(iridColor, 1.0);
      }
    `
  },

  // Holographic effect shader
  holographic: {
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.8 },
      color: { value: new THREE.Color(0x00ffff) },
      scanlineSpeed: { value: 2.0 },
      scanlineWidth: { value: 0.1 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform vec3 color;
      uniform float scanlineSpeed;
      uniform float scanlineWidth;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        // Scanline effect
        float scanline = sin((vUv.y + time * scanlineSpeed) * 20.0);
        scanline = smoothstep(-scanlineWidth, scanlineWidth, scanline);
        
        // Interference pattern
        float interference = sin(vUv.x * 30.0 + time * 3.0) * 0.1;
        
        // Edge glow
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float edgeGlow = 1.0 - abs(dot(viewDirection, vNormal));
        edgeGlow = pow(edgeGlow, 2.0);
        
        vec3 finalColor = color * (scanline + interference + edgeGlow);
        float alpha = opacity * (scanline * 0.5 + edgeGlow);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  },

  // Energy field shader
  energyField: {
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: new THREE.Color(0x00ff00) },
      color2: { value: new THREE.Color(0x0000ff) },
      frequency: { value: 5.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Vertex displacement for energy waves
        vec3 pos = position;
        pos.z += sin(pos.x * 5.0 + time * 2.0) * 0.1;
        pos.z += cos(pos.y * 3.0 + time * 1.5) * 0.05;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float frequency;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Animated noise pattern
        float noise1 = sin(vUv.x * frequency + time * 2.0);
        float noise2 = cos(vUv.y * frequency * 0.7 + time * 1.3);
        float noise = (noise1 + noise2) * 0.5;
        
        // Color mixing based on noise
        vec3 finalColor = mix(color1, color2, noise * 0.5 + 0.5);
        
        // Pulsing intensity
        float pulse = sin(time * 3.0) * 0.3 + 0.7;
        finalColor *= intensity * pulse;
        
        // Transparency based on noise
        float alpha = smoothstep(-0.2, 0.8, noise) * 0.8;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  }
}

// Utility functions for creating enhanced materials
export const MaterialFactory = {
  createIridescentMaterial: (options: any = {}) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...shaderLibrary.iridescent.uniforms,
        ...options.uniforms
      },
      vertexShader: shaderLibrary.iridescent.vertexShader,
      fragmentShader: shaderLibrary.iridescent.fragmentShader,
      transparent: true,
      side: options.side || THREE.FrontSide,
    })
  },

  createHolographicMaterial: (options: any = {}) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...shaderLibrary.holographic.uniforms,
        ...options.uniforms
      },
      vertexShader: shaderLibrary.holographic.vertexShader,
      fragmentShader: shaderLibrary.holographic.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  },

  createEnergyFieldMaterial: (options: any = {}) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...shaderLibrary.energyField.uniforms,
        ...options.uniforms
      },
      vertexShader: shaderLibrary.energyField.vertexShader,
      fragmentShader: shaderLibrary.energyField.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    })
  },

  createGlassMaterial: (options: any = {}) => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0,
      ...options
    })
  },

  createMetallicMaterial: (options: any = {}) => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0,
      ...options
    })
  }
}

// Animation utilities
export const AnimationUtils = {
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  easeOutBounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },

  easeInOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  },

  lerp: (a: number, b: number, t: number): number => {
    return a + (b - a) * t
  },

  smoothstep: (edge0: number, edge1: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }
}