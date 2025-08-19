// Avatar customization types
export interface AvatarCustomization {
  // Basic Info
  id: string
  name: string
  type: 'humanoid' | 'creature' | 'robot' | 'fantasy'
  
  // Body
  body: {
    type: 'slim' | 'average' | 'athletic' | 'curvy' | 'muscular'
    height: number // 0.8 - 1.2
    skinColor: string
  }
  
  // Head & Face
  face: {
    shape: 'round' | 'oval' | 'square' | 'heart' | 'diamond'
    eyes: {
      type: 'normal' | 'big' | 'narrow' | 'anime' | 'cat'
      color: string
      lashes: boolean
    }
    eyebrows: {
      type: 'thin' | 'normal' | 'thick' | 'arched' | 'straight'
      color: string
    }
    nose: {
      type: 'small' | 'normal' | 'big' | 'pointed' | 'flat'
    }
    mouth: {
      type: 'small' | 'normal' | 'wide' | 'heart'
      lipColor: string
    }
    makeup: {
      blush: boolean
      blushColor?: string
      eyeshadow: boolean
      eyeshadowColor?: string
      lipstick: boolean
      lipstickColor?: string
    }
  }
  
  // Hair
  hair: {
    style: HairStyle
    color: string
    highlights?: string
    accessories?: HairAccessory[]
  }
  
  // Clothing
  clothing: {
    top: ClothingItem
    bottom: ClothingItem
    shoes: ClothingItem
    outerwear?: ClothingItem
    gloves?: ClothingItem
  }
  
  // Accessories
  accessories: {
    head?: Accessory // 모자, 왕관, 헤드밴드
    face?: Accessory // 안경, 선글라스, 마스크
    ears?: Accessory // 귀걸이, 헤드폰
    neck?: Accessory // 목걸이, 스카프
    wrist?: Accessory[] // 팔찌, 시계
    back?: Accessory // 날개, 망토, 가방
    waist?: Accessory // 벨트, 주머니
    special?: Accessory[] // 특수 효과, 오라
  }
  
  // Special Effects
  effects?: SpecialEffect[]
  
  // Animations & Emotes
  animations: {
    idle: AnimationType
    walk: AnimationType
    run: AnimationType
    emotes: string[] // 사용 가능한 이모트 목록
  }
  
  // Animation Set
  animationSet?: string
  
  // Stats (for gamification)
  stats?: {
    level: number
    experience: number
    achievements: string[]
    unlockedItems: string[]
  }
}

// Hair Styles
export type HairStyle = 
  | 'short' | 'medium' | 'long' | 'ponytail' | 'pigtails' 
  | 'bob' | 'pixie' | 'mohawk' | 'afro' | 'braids'
  | 'bun' | 'spiky' | 'wavy' | 'curly' | 'bald'

// Hair Accessories
export interface HairAccessory {
  type: 'ribbon' | 'clip' | 'band' | 'flower' | 'crown'
  color: string
  position?: 'left' | 'right' | 'center' | 'back'
}

// Clothing Item
export interface ClothingItem {
  id: string
  name: string
  type: string
  style: string
  color: string
  pattern?: 'solid' | 'striped' | 'dotted' | 'floral' | 'plaid' | 'custom'
  patternColor?: string
  material?: 'cotton' | 'denim' | 'leather' | 'silk' | 'metal' | 'fur'
}

// Accessory
export interface Accessory {
  id: string
  name: string
  type: string
  model: string
  color?: string
  glow?: boolean
  animation?: string
}

// Special Effect
export interface SpecialEffect {
  id: string
  name: string
  type: 'glow' | 'particle' | 'trail' | 'aura' | 'lightning'
  intensity?: number // 1-3
  color?: string
  glow?: boolean
  particle?: boolean
  trail?: boolean
  animation?: string
  description?: string
}

// Animation Type
export interface AnimationType {
  id: string
  name: string
  speed: number
  loop: boolean
}

// Preset Avatars
export interface AvatarPreset {
  id: string
  name: string
  category: 'basic' | 'premium' | 'seasonal' | 'special'
  thumbnail: string
  customization: Partial<AvatarCustomization>
  price?: number // For premium presets
  requirements?: {
    level?: number
    achievement?: string
  }
}