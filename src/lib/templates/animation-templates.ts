export interface AnimationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'presentation' | 'web' | 'nft';
  thumbnail: string; // emoji for now
  isPremium: boolean;
  config: {
    nodeCount: number;
    connectionDistance: number;
    animationSpeed: number;
    nodeSize: number;
    colorScheme: 'blue' | 'purple' | 'rainbow' | 'monochrome' | 'fire' | 'ocean';
    particleStyle: 'dots' | 'lines' | 'bubbles' | 'stars';
    animationPattern: 'pulse' | 'wave' | 'spiral' | 'random' | 'flow';
  };
}

export const animationTemplates: AnimationTemplate[] = [
  // Free Templates
  {
    id: 'minimal-network',
    name: 'Minimal Network',
    description: 'Clean and simple particle network',
    category: 'web',
    thumbnail: '🔵',
    isPremium: false,
    config: {
      nodeCount: 50,
      connectionDistance: 100,
      animationSpeed: 0.5,
      nodeSize: 3,
      colorScheme: 'blue',
      particleStyle: 'dots',
      animationPattern: 'flow',
    },
  },
  {
    id: 'energetic-burst',
    name: 'Energetic Burst',
    description: 'High-energy particle explosion',
    category: 'social',
    thumbnail: '💥',
    isPremium: false,
    config: {
      nodeCount: 150,
      connectionDistance: 80,
      animationSpeed: 2.0,
      nodeSize: 2,
      colorScheme: 'fire',
      particleStyle: 'stars',
      animationPattern: 'pulse',
    },
  },
  {
    id: 'calm-waves',
    name: 'Calm Waves',
    description: 'Relaxing wave-like motion',
    category: 'presentation',
    thumbnail: '🌊',
    isPremium: false,
    config: {
      nodeCount: 80,
      connectionDistance: 120,
      animationSpeed: 0.3,
      nodeSize: 4,
      colorScheme: 'ocean',
      particleStyle: 'bubbles',
      animationPattern: 'wave',
    },
  },
  {
    id: 'tech-grid',
    name: 'Tech Grid',
    description: 'Futuristic grid pattern',
    category: 'presentation',
    thumbnail: '⚡',
    isPremium: false,
    config: {
      nodeCount: 100,
      connectionDistance: 150,
      animationSpeed: 1.0,
      nodeSize: 2,
      colorScheme: 'monochrome',
      particleStyle: 'lines',
      animationPattern: 'flow',
    },
  },
  {
    id: 'social-splash',
    name: 'Social Splash',
    description: 'Perfect for Instagram stories',
    category: 'social',
    thumbnail: '🎨',
    isPremium: false,
    config: {
      nodeCount: 120,
      connectionDistance: 90,
      animationSpeed: 1.5,
      nodeSize: 3,
      colorScheme: 'rainbow',
      particleStyle: 'dots',
      animationPattern: 'spiral',
    },
  },

  // Premium Templates
  {
    id: 'nft-reveal',
    name: 'NFT Reveal',
    description: 'Stunning reveal animation for NFTs',
    category: 'nft',
    thumbnail: '💎',
    isPremium: true,
    config: {
      nodeCount: 200,
      connectionDistance: 100,
      animationSpeed: 1.2,
      nodeSize: 3,
      colorScheme: 'purple',
      particleStyle: 'stars',
      animationPattern: 'spiral',
    },
  },
  {
    id: 'viral-vortex',
    name: 'Viral Vortex',
    description: 'Eye-catching swirl effect',
    category: 'social',
    thumbnail: '🌀',
    isPremium: true,
    config: {
      nodeCount: 180,
      connectionDistance: 110,
      animationSpeed: 1.8,
      nodeSize: 2,
      colorScheme: 'fire',
      particleStyle: 'lines',
      animationPattern: 'spiral',
    },
  },
  {
    id: 'corporate-flow',
    name: 'Corporate Flow',
    description: 'Professional presentation background',
    category: 'presentation',
    thumbnail: '💼',
    isPremium: true,
    config: {
      nodeCount: 90,
      connectionDistance: 140,
      animationSpeed: 0.6,
      nodeSize: 3,
      colorScheme: 'blue',
      particleStyle: 'dots',
      animationPattern: 'wave',
    },
  },
  {
    id: 'metaverse-portal',
    name: 'Metaverse Portal',
    description: 'Web3 ready portal effect',
    category: 'nft',
    thumbnail: '🌐',
    isPremium: true,
    config: {
      nodeCount: 160,
      connectionDistance: 130,
      animationSpeed: 1.4,
      nodeSize: 4,
      colorScheme: 'purple',
      particleStyle: 'bubbles',
      animationPattern: 'pulse',
    },
  },
  {
    id: 'quantum-field',
    name: 'Quantum Field',
    description: 'Advanced particle physics simulation',
    category: 'web',
    thumbnail: '⚛️',
    isPremium: true,
    config: {
      nodeCount: 140,
      connectionDistance: 100,
      animationSpeed: 1.0,
      nodeSize: 2,
      colorScheme: 'rainbow',
      particleStyle: 'stars',
      animationPattern: 'random',
    },
  },
];

export function getColorSchemeColors(scheme: AnimationTemplate['config']['colorScheme']) {
  switch (scheme) {
    case 'blue':
      return ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8'];
    case 'purple':
      return ['#a855f7', '#c084fc', '#9333ea', '#7e22ce'];
    case 'rainbow':
      return ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];
    case 'monochrome':
      return ['#ffffff', '#d1d5db', '#9ca3af', '#6b7280'];
    case 'fire':
      return ['#ef4444', '#f59e0b', '#fb923c', '#fbbf24'];
    case 'ocean':
      return ['#06b6d4', '#0891b2', '#0284c7', '#0369a1'];
    default:
      return ['#3b82f6'];
  }
}