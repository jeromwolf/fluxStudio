export interface TemplateTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'modification' | 'effect' | 'animation' | 'style';
  parameters: ToolParameter[];
}

export interface ToolParameter {
  id: string;
  name: string;
  type: 'slider' | 'select' | 'color' | 'toggle' | 'vector' | 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  defaultValue: any;
  description: string;
}

// Template-specific tool configurations
export const templateTools: Record<string, TemplateTool[]> = {
  'minimal-network': [
    {
      id: 'depth-field',
      name: '3D Depth Field',
      description: 'Create depth illusion with layered nodes',
      icon: '🔍',
      category: 'modification',
      parameters: [
        {
          id: 'depth-layers',
          name: 'Depth Layers',
          type: 'slider',
          min: 1,
          max: 5,
          defaultValue: 3,
          description: 'Number of depth layers'
        },
        {
          id: 'perspective',
          name: 'Perspective',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 50,
          description: 'Perspective intensity'
        }
      ]
    },
    {
      id: 'node-morph',
      name: 'Node Morphing',
      description: 'Transform nodes into different shapes',
      icon: '🔄',
      category: 'animation',
      parameters: [
        {
          id: 'morph-shapes',
          name: 'Target Shapes',
          type: 'select',
          options: ['circle', 'square', 'triangle', 'hexagon', 'star'],
          defaultValue: 'circle',
          description: 'What to morph into'
        },
        {
          id: 'morph-speed',
          name: 'Morph Speed',
          type: 'slider',
          min: 0.1,
          max: 3.0,
          step: 0.1,
          defaultValue: 1.0,
          description: 'Animation speed'
        }
      ]
    }
  ],

  'energetic-burst': [
    {
      id: 'particle-trail',
      name: 'Particle Trails',
      description: 'Add glowing trails behind particles',
      icon: '✨',
      category: 'effect',
      parameters: [
        {
          id: 'trail-length',
          name: 'Trail Length',
          type: 'slider',
          min: 5,
          max: 50,
          defaultValue: 20,
          description: 'Length of particle trails'
        },
        {
          id: 'trail-opacity',
          name: 'Trail Opacity',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 60,
          description: 'Trail transparency'
        }
      ]
    },
    {
      id: 'explosion-force',
      name: 'Explosion Dynamics',
      description: 'Control burst intensity and direction',
      icon: '💥',
      category: 'modification',
      parameters: [
        {
          id: 'explosion-power',
          name: 'Explosion Power',
          type: 'slider',
          min: 1,
          max: 10,
          defaultValue: 5,
          description: 'Force of explosion'
        },
        {
          id: 'explosion-center',
          name: 'Explosion Center',
          type: 'vector',
          defaultValue: { x: 50, y: 50 },
          description: 'Center point of explosion'
        }
      ]
    },
    {
      id: 'chromatic-shift',
      name: 'Chromatic Shift',
      description: 'RGB color separation effect',
      icon: '🌈',
      category: 'effect',
      parameters: [
        {
          id: 'shift-intensity',
          name: 'Shift Intensity',
          type: 'slider',
          min: 0,
          max: 20,
          defaultValue: 5,
          description: 'RGB separation amount'
        }
      ]
    }
  ],

  'calm-waves': [
    {
      id: 'wave-distortion',
      name: 'Wave Distortion',
      description: 'Create ripple effects across the canvas',
      icon: '🌊',
      category: 'modification',
      parameters: [
        {
          id: 'wave-frequency',
          name: 'Wave Frequency',
          type: 'slider',
          min: 0.1,
          max: 5.0,
          step: 0.1,
          defaultValue: 1.0,
          description: 'Wave frequency'
        },
        {
          id: 'wave-amplitude',
          name: 'Wave Amplitude',
          type: 'slider',
          min: 1,
          max: 50,
          defaultValue: 10,
          description: 'Wave height'
        }
      ]
    },
    {
      id: 'fluid-simulation',
      name: 'Fluid Dynamics',
      description: 'Simulate liquid-like particle behavior',
      icon: '💧',
      category: 'animation',
      parameters: [
        {
          id: 'viscosity',
          name: 'Viscosity',
          type: 'slider',
          min: 0.1,
          max: 2.0,
          step: 0.1,
          defaultValue: 0.8,
          description: 'Fluid thickness'
        },
        {
          id: 'surface-tension',
          name: 'Surface Tension',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 30,
          description: 'Particle cohesion'
        }
      ]
    }
  ],

  'tech-grid': [
    {
      id: 'holographic-effect',
      name: 'Holographic Overlay',
      description: 'Add futuristic hologram effects',
      icon: '👁️',
      category: 'effect',
      parameters: [
        {
          id: 'hologram-intensity',
          name: 'Intensity',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 40,
          description: 'Holographic effect strength'
        },
        {
          id: 'scan-lines',
          name: 'Scan Lines',
          type: 'toggle',
          defaultValue: true,
          description: 'Enable scan line effect'
        }
      ]
    },
    {
      id: 'data-flow',
      name: 'Data Flow Animation',
      description: 'Animate data packets flowing through grid',
      icon: '📊',
      category: 'animation',
      parameters: [
        {
          id: 'flow-speed',
          name: 'Flow Speed',
          type: 'slider',
          min: 0.1,
          max: 3.0,
          step: 0.1,
          defaultValue: 1.5,
          description: 'Data packet speed'
        },
        {
          id: 'packet-size',
          name: 'Packet Size',
          type: 'slider',
          min: 1,
          max: 10,
          defaultValue: 3,
          description: 'Size of data packets'
        }
      ]
    }
  ],

  'social-splash': [
    {
      id: 'text-integration',
      name: 'Dynamic Text',
      description: 'Add animated text elements',
      icon: '📝',
      category: 'modification',
      parameters: [
        {
          id: 'text-content',
          name: 'Text Content',
          type: 'text',
          defaultValue: 'FLUX STUDIO',
          description: 'Text to display'
        },
        {
          id: 'text-animation',
          name: 'Text Animation',
          type: 'select',
          options: ['fade', 'typewriter', 'bounce', 'glow'],
          defaultValue: 'glow',
          description: 'Text animation style'
        }
      ]
    },
    {
      id: 'social-format',
      name: 'Social Media Optimizer',
      description: 'Optimize for specific platforms',
      icon: '📱',
      category: 'style',
      parameters: [
        {
          id: 'platform',
          name: 'Platform',
          type: 'select',
          options: ['instagram-story', 'instagram-post', 'tiktok', 'youtube-short', 'twitter'],
          defaultValue: 'instagram-story',
          description: 'Target platform'
        },
        {
          id: 'safe-area',
          name: 'Safe Area',
          type: 'toggle',
          defaultValue: true,
          description: 'Show safe area guidelines'
        }
      ]
    }
  ],

  // Premium Templates
  'nft-reveal': [
    {
      id: 'nft-frame',
      name: 'NFT Frame Effects',
      description: 'Add premium border and glow effects',
      icon: '🖼️',
      category: 'style',
      parameters: [
        {
          id: 'frame-style',
          name: 'Frame Style',
          type: 'select',
          options: ['gold', 'holographic', 'neon', 'crystal'],
          defaultValue: 'holographic',
          description: 'Frame appearance'
        },
        {
          id: 'glow-intensity',
          name: 'Glow Intensity',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 70,
          description: 'Frame glow strength'
        }
      ]
    },
    {
      id: 'reveal-animation',
      name: 'Reveal Mechanics',
      description: 'Control how the NFT is revealed',
      icon: '🎭',
      category: 'animation',
      parameters: [
        {
          id: 'reveal-style',
          name: 'Reveal Style',
          type: 'select',
          options: ['curtain', 'shatter', 'spiral', 'fade', 'zoom'],
          defaultValue: 'spiral',
          description: 'Reveal animation type'
        },
        {
          id: 'reveal-speed',
          name: 'Reveal Speed',
          type: 'slider',
          min: 0.5,
          max: 3.0,
          step: 0.1,
          defaultValue: 1.2,
          description: 'Animation timing'
        }
      ]
    }
  ],

  'viral-vortex': [
    {
      id: 'magnetic-field',
      name: 'Magnetic Attraction',
      description: 'Create magnetic field effects',
      icon: '🧲',
      category: 'modification',
      parameters: [
        {
          id: 'magnetic-strength',
          name: 'Magnetic Strength',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 60,
          description: 'Attraction force'
        },
        {
          id: 'magnetic-poles',
          name: 'Magnetic Poles',
          type: 'slider',
          min: 1,
          max: 5,
          defaultValue: 2,
          description: 'Number of attraction points'
        }
      ]
    }
  ],

  'metaverse-portal': [
    {
      id: 'portal-distortion',
      name: 'Space-Time Distortion',
      description: 'Warp space around the portal',
      icon: '🌀',
      category: 'effect',
      parameters: [
        {
          id: 'distortion-strength',
          name: 'Distortion Strength',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 45,
          description: 'Space warping intensity'
        },
        {
          id: 'portal-size',
          name: 'Portal Size',
          type: 'slider',
          min: 50,
          max: 300,
          defaultValue: 150,
          description: 'Portal diameter'
        }
      ]
    }
  ],

  'quantum-field': [
    {
      id: 'quantum-tunneling',
      name: 'Quantum Tunneling',
      description: 'Particles appear and disappear randomly',
      icon: '⚛️',
      category: 'effect',
      parameters: [
        {
          id: 'tunnel-probability',
          name: 'Tunnel Probability',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 15,
          description: 'Chance of tunneling'
        },
        {
          id: 'uncertainty-principle',
          name: 'Uncertainty',
          type: 'slider',
          min: 0,
          max: 50,
          defaultValue: 20,
          description: 'Position uncertainty'
        }
      ]
    }
  ]
};

export function getToolsForTemplate(templateId: string): TemplateTool[] {
  return templateTools[templateId] || [];
}

export function getToolById(templateId: string, toolId: string): TemplateTool | undefined {
  const tools = getToolsForTemplate(templateId);
  return tools.find(tool => tool.id === toolId);
}