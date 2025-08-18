import type * as THREE from 'three'
import { templateScenes } from './template-scenes'
import { textBoxTemplate } from './text-box-demo'
import { 
  TEMPLATE_REGISTRY, 
  getTemplatesByCategory as getNewTemplatesByCategory,
  getTemplateById as getNewTemplateById,
  getTemplateCategories as getNewTemplateCategories
} from './templates/index'

export interface Template3D {
  id: string
  name: string
  description: string
  thumbnail: string
  category: 'business' | 'social' | 'event' | 'personal' | 'intro' | 'outro' | 'transition' | 'title' | 'logo' | 'effects'
  subcategory?: string
  duration: number // in seconds
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5' // for platform optimization
  platform?: 'instagram' | 'youtube' | 'tiktok' | 'general'
  defaultCustomization: TemplateCustomization
  sceneSetup: (scene: THREE.Scene, customization: TemplateCustomization) => { animate: (time: number) => void }
}

export interface TemplateCustomization {
  text: {
    title: string
    subtitle: string
    company: string
    [key: string]: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    [key: string]: string
  }
  logo: File | null
  options: {
    speed: number
    style: string
    duration: number
    [key: string]: any
  }
}

// 레거시 템플릿들 (마이그레이션 필요)
const legacyTemplates: Template3D[] = [

  // Social Media Templates
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: 'Trendy vertical gradients',
    thumbnail: '/templates/instagram-story.jpg',
    category: 'social',
    platform: 'instagram',
    aspectRatio: '9:16',
    duration: 15,
    defaultCustomization: {
      text: {
        title: 'Swipe Up',
        subtitle: 'New Content Alert',
        company: '@yourusername',
      },
      colors: {
        primary: '#E1306C', // Instagram pink
        secondary: '#F77737', // Instagram orange
        accent: '#833AB4', // Instagram purple
      },
      logo: null,
      options: {
        speed: 1.5,
        style: 'vibrant',
        duration: 15,
        gradient: 'instagram',
        stickers: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['instagram-story'](scene, customization)
    },
  },
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Animated subscribe button',
    thumbnail: '/templates/youtube-intro.jpg',
    category: 'social',
    platform: 'youtube',
    aspectRatio: '16:9',
    duration: 5,
    defaultCustomization: {
      text: {
        title: 'Channel Name',
        subtitle: 'Subscribe for More',
        company: 'Hit the Bell',
      },
      colors: {
        primary: '#FF0000', // YouTube red
        secondary: '#282828', // YouTube dark
        accent: '#FFFFFF', // YouTube white
      },
      logo: null,
      options: {
        speed: 1,
        style: 'dynamic',
        duration: 5,
        subscribeButton: true,
        bellAnimation: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['youtube-intro'](scene, customization)
    },
  },
  {
    id: 'tiktok-effect',
    name: 'TikTok Effect',
    description: 'Viral glitch effects',
    thumbnail: '/templates/tiktok-effect.jpg',
    category: 'social',
    platform: 'tiktok',
    aspectRatio: '9:16',
    duration: 10,
    defaultCustomization: {
      text: {
        title: 'Wait for it...',
        subtitle: 'Mind = Blown',
        company: '#ForYou',
      },
      colors: {
        primary: '#000000', // TikTok black
        secondary: '#FF0050', // TikTok pink
        accent: '#00F2EA', // TikTok cyan
      },
      logo: null,
      options: {
        speed: 2,
        style: 'trendy',
        duration: 10,
        glitch: true,
        neon: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['tiktok-effect'](scene, customization)
    },
  },
  {
    id: 'birthday-celebration',
    name: 'Birthday Celebration',
    description: 'Festive party animation',
    thumbnail: '/templates/birthday-celebration.jpg',
    category: 'social',
    subcategory: 'celebration',
    duration: 8,
    aspectRatio: '1:1',
    defaultCustomization: {
      text: {
        title: 'Happy Birthday!',
        subtitle: 'Make a Wish',
        company: 'Celebrate with Us',
      },
      colors: {
        primary: '#FF69B4', // Party pink
        secondary: '#FFD700', // Festive gold
        accent: '#00CED1', // Celebration turquoise
      },
      logo: null,
      options: {
        speed: 1,
        style: 'festive',
        duration: 8,
        balloons: true,
        confetti: true,
        cake: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['birthday-celebration'](scene, customization)
    },
  },

  // Event Templates
  {
    id: 'wedding-invitation',
    name: 'Wedding Invitation',
    description: 'Elegant romantic effects',
    thumbnail: '/templates/wedding-invitation.jpg',
    category: 'event',
    subcategory: 'wedding',
    duration: 10,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Sarah & John',
        subtitle: 'Are Getting Married',
        company: 'June 15, 2025',
      },
      colors: {
        primary: '#FFD700', // Gold
        secondary: '#FFF8E7', // Ivory
        accent: '#FF69B4', // Rose
      },
      logo: null,
      options: {
        speed: 0.7,
        style: 'elegant',
        duration: 10,
        particles: 'rose-petals',
        hearts: true,
        rings: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['wedding-invitation'](scene, customization)
    },
  },
  {
    id: 'party-announcement',
    name: 'Party Announcement',
    description: 'Neon music visualizer',
    thumbnail: '/templates/party-announcement.jpg',
    category: 'event',
    subcategory: 'party',
    duration: 6,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Friday Night Party',
        subtitle: "Don't Miss Out",
        company: 'RSVP Now',
      },
      colors: {
        primary: '#FF006E', // Neon pink
        secondary: '#00F5FF', // Neon cyan
        accent: '#FFFC00', // Neon yellow
      },
      logo: null,
      options: {
        speed: 1.5,
        style: 'vibrant',
        duration: 6,
        neonLights: true,
        musicBars: true,
        strobeEffect: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['party-announcement'](scene, customization)
    },
  },
  {
    id: 'sale-notice',
    name: 'Sale Notice',
    description: 'Explosive price reveal',
    thumbnail: '/templates/sale-notice.jpg',
    category: 'event',
    subcategory: 'promotion',
    duration: 5,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: '50% OFF',
        subtitle: 'Limited Time Only',
        company: 'Shop Now',
      },
      colors: {
        primary: '#DC2626', // Sale red
        secondary: '#FBBF24', // Attention yellow
        accent: '#059669', // Action green
      },
      logo: null,
      options: {
        speed: 1.2,
        style: 'explosive',
        duration: 5,
        explosion: true,
        countdown: true,
        priceReveal: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['sale-notice'](scene, customization)
    },
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Anticipation countdown',
    thumbnail: '/templates/coming-soon.jpg',
    category: 'event',
    subcategory: 'announcement',
    duration: 8,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Coming Soon',
        subtitle: 'Something Big is Coming',
        company: 'Stay Tuned',
      },
      colors: {
        primary: '#6366F1', // Mystery indigo
        secondary: '#8B5CF6', // Anticipation purple
        accent: '#EC4899', // Excitement pink
      },
      logo: null,
      options: {
        speed: 0.9,
        style: 'mysterious',
        duration: 8,
        countdown: true,
        pulseEffect: true,
        fogEffect: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['coming-soon'](scene, customization)
    },
  },

  // Personal Templates
  {
    id: 'self-introduction',
    name: 'Self Introduction',
    description: 'Professional name card',
    thumbnail: '/templates/self-introduction.jpg',
    category: 'personal',
    subcategory: 'professional',
    duration: 6,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'John Doe',
        subtitle: 'Creative Director',
        company: 'Contact: john@example.com',
      },
      colors: {
        primary: '#1F2937', // Professional gray
        secondary: '#3B82F6', // Trust blue
        accent: '#10B981', // Success green
      },
      logo: null,
      options: {
        speed: 1,
        style: 'minimal',
        duration: 6,
        cardFlip: true,
        typewriter: true,
        socialIcons: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['self-introduction'](scene, customization)
    },
  },
  {
    id: 'portfolio-showcase',
    name: 'Portfolio Showcase',
    description: 'Creative work transitions',
    thumbnail: '/templates/portfolio-showcase.jpg',
    category: 'personal',
    subcategory: 'creative',
    duration: 10,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'My Portfolio',
        subtitle: 'Selected Works 2024',
        company: 'View More',
      },
      colors: {
        primary: '#7C3AED', // Creative purple
        secondary: '#EC4899', // Artistic pink
        accent: '#F59E0B', // Highlight amber
      },
      logo: null,
      options: {
        speed: 1,
        style: 'creative',
        duration: 10,
        slideTransition: 'morph',
        gridLayout: true,
        hoverEffects: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['portfolio-showcase'](scene, customization)
    },
  },
  {
    id: 'thank-you-message',
    name: 'Thank You Message',
    description: 'Heartfelt gratitude',
    thumbnail: '/templates/thank-you-message.jpg',
    category: 'personal',
    subcategory: 'gratitude',
    duration: 5,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Thank You!',
        subtitle: 'Your Support Means Everything',
        company: 'With Love',
      },
      colors: {
        primary: '#EF4444', // Heart red
        secondary: '#F472B6', // Soft pink
        accent: '#FBBF24', // Warm yellow
      },
      logo: null,
      options: {
        speed: 0.8,
        style: 'heartfelt',
        duration: 5,
        hearts: true,
        sparkles: true,
        handwriting: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['thank-you-message'](scene, customization)
    },
  },
  {
    id: 'new-year-greeting',
    name: 'New Year Greeting',
    description: 'Fireworks celebration',
    thumbnail: '/templates/new-year-greeting.jpg',
    category: 'personal',
    subcategory: 'seasonal',
    duration: 12,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Happy New Year 2025',
        subtitle: 'New Dreams, New Adventures',
        company: 'Best Wishes',
      },
      colors: {
        primary: '#FFD700', // Celebration gold
        secondary: '#FF4500', // Firework orange
        accent: '#4169E1', // Night sky blue
      },
      logo: null,
      options: {
        speed: 1,
        style: 'celebratory',
        duration: 12,
        fireworks: true,
        countdown: true,
        champagne: true,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['new-year-greeting'](scene, customization)
    },
  },
  
  // DNA Template Only
  {
    id: 'dna-helix-data',
    name: 'DNA Helix',
    description: 'DNA visualization',
    thumbnail: '🧬',
    category: 'business',
    subcategory: 'science',
    duration: 8,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Genetic Data Analysis',
        subtitle: 'DNA Sequence Visualization',
        company: 'Biotech Research',
      },
      colors: {
        primary: '#00FFFF', // Cyan for DNA backbone
        secondary: '#FF1493', // Deep pink for second backbone  
        accent: '#32CD32', // Lime green for connections
      },
      logo: null,
      options: {
        speed: 1,
        style: 'scientific',
        duration: 8,
        basePairs: 120,
        helixTurns: 3,
        dataParticles: 300,
        hologramPanels: false,
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['dna-helix-data'](scene, customization)
    },
  },
  
  {
    id: 'mathematical-beauty',
    name: 'Math Curves',
    description: 'Math curves animation',
    thumbnail: '∫',
    category: 'business',
    subcategory: 'education',
    duration: 8,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Mathematical Beauty',
        subtitle: 'Parametric Curves',
        company: 'Mathematics',
      },
      colors: {
        primary: '#1E88E5', // 3Blue1Brown Blue
        secondary: '#D84315', // Brown
        accent: '#FDD835', // Yellow for equations
      },
      logo: null,
      options: {
        speed: 1,
        style: 'educational',
        duration: 8,
        showGrid: true,
        showAxes: true,
        showEquations: true,
        curveComplexity: 'medium',
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['mathematical-beauty'](scene, customization)
    },
  },
  
  {
    id: 'lofi-glass-panels',
    name: 'Lo-fi Glass',
    description: 'Aesthetic glass panels with sunset',
    thumbnail: '🌅',
    category: 'social',
    subcategory: 'aesthetic',
    duration: 8,
    aspectRatio: '16:9',
    defaultCustomization: {
      text: {
        title: 'Lo-fi Vibes',
        subtitle: 'Chill & Relax',
        company: 'Aesthetic',
      },
      colors: {
        primary: '#FF6B9D', // Sunset pink
        secondary: '#FFB347', // Warm orange
        accent: '#87CEEB', // Sky blue
      },
      logo: null,
      options: {
        speed: 1,
        style: 'aesthetic',
        duration: 8,
        panelCount: 9,
        glassOpacity: 0.12,
        sunsetIntensity: 'medium',
      },
    },
    sceneSetup: (scene, customization) => {
      return templateScenes['lofi-glass-panels'](scene, customization)
    },
  },
  
  // Text & Box Demo Template
  textBoxTemplate,
]

// 확장 가능한 템플릿 시스템과 레거시 시스템 통합
const allTemplates = [...TEMPLATE_REGISTRY, ...legacyTemplates, textBoxTemplate]

export const getTemplateById = (id: string): Template3D | undefined => {
  // 새로운 시스템에서 먼저 찾기
  const newTemplate = getNewTemplateById(id)
  if (newTemplate) return newTemplate
  
  // 레거시 시스템에서 찾기
  return allTemplates.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: Template3D['category']): Template3D[] => {
  // 새로운 시스템과 레거시 시스템 결합
  const newTemplates = getNewTemplatesByCategory(category)
  const legacyTemplates = allTemplates.filter(template => template.category === category)
  
  // 중복 제거
  const allByCategory = [...newTemplates, ...legacyTemplates]
  const uniqueTemplates = allByCategory.filter((template, index, arr) => 
    arr.findIndex(t => t.id === template.id) === index
  )
  
  return uniqueTemplates
}

export const getTemplateCategories = (): Array<{
  id: Template3D['category']
  name: string
  description: string
  count: number
}> => {
  // 새로운 시스템 사용 (자동으로 확장 가능)
  return getNewTemplateCategories()
}

export const getTemplatesByPlatform = (platform: string): Template3D[] => {
  return allTemplates.filter(template => template.platform === platform)
}

// 새로운 확장 가능한 시스템을 위한 export
export { TEMPLATE_REGISTRY, registerTemplate, unregisterTemplate } from './templates/index'

// 모든 템플릿 목록 (호환성)
export const templates = allTemplates