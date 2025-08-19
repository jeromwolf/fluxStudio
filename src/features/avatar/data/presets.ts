import { AvatarPreset } from '../types'

// Basic Avatar Presets (무료)
export const basicPresets: AvatarPreset[] = [
  {
    id: 'casual-student',
    name: '캐주얼 학생',
    category: 'basic',
    thumbnail: '/avatars/presets/casual-student.png',
    customization: {
      type: 'humanoid',
      body: {
        type: 'slim',
        height: 1.0,
        skinColor: '#F5C6A0'
      },
      face: {
        shape: 'oval',
        eyes: { type: 'normal', color: '#4A5568', lashes: true },
        eyebrows: { type: 'normal', color: '#2D3748' },
        nose: { type: 'normal' },
        mouth: { type: 'normal', lipColor: '#E53E3E' }
      },
      hair: {
        style: 'medium',
        color: '#2D3748'
      },
      clothing: {
        top: { id: 'tshirt-1', name: '티셔츠', type: 'shirt', style: 'casual', color: '#3182CE' },
        bottom: { id: 'jeans-1', name: '청바지', type: 'pants', style: 'casual', color: '#2B6CB0' },
        shoes: { id: 'sneakers-1', name: '운동화', type: 'sneakers', style: 'casual', color: '#FFFFFF' }
      }
    }
  },
  {
    id: 'office-worker',
    name: '직장인',
    category: 'basic',
    thumbnail: '/avatars/presets/office-worker.png',
    customization: {
      type: 'humanoid',
      body: {
        type: 'normal',
        height: 1.1,
        skinColor: '#DEB887'
      },
      face: {
        shape: 'square',
        eyes: { type: 'normal', color: '#2D3748', lashes: false },
        eyebrows: { type: 'thick', color: '#1A202C' },
        nose: { type: 'normal' },
        mouth: { type: 'normal', lipColor: '#C53030' }
      },
      hair: {
        style: 'short',
        color: '#1A202C'
      },
      clothing: {
        top: { id: 'shirt-1', name: '셔츠', type: 'shirt', style: 'formal', color: '#FFFFFF' },
        bottom: { id: 'pants-1', name: '정장바지', type: 'pants', style: 'formal', color: '#1A202C' },
        shoes: { id: 'shoes-1', name: '구두', type: 'dress-shoes', style: 'formal', color: '#1A202C' }
      },
      accessories: {
        face: { id: 'glasses-1', name: '안경', type: 'glasses', model: 'rectangle' }
      }
    }
  },
  {
    id: 'gamer-girl',
    name: '게이머 걸',
    category: 'basic',
    thumbnail: '/avatars/presets/gamer-girl.png',
    customization: {
      type: 'humanoid',
      body: {
        type: 'slim',
        height: 0.95,
        skinColor: '#FFDAB9'
      },
      face: {
        shape: 'heart',
        eyes: { type: 'big', color: '#805AD5', lashes: true },
        eyebrows: { type: 'arched', color: '#553C9A' },
        nose: { type: 'small' },
        mouth: { type: 'small', lipColor: '#D69E2E' }
      },
      hair: {
        style: 'pigtails',
        color: '#553C9A',
        highlights: '#805AD5'
      },
      clothing: {
        top: { id: 'hoodie-1', name: '후드티', type: 'hoodie', style: 'casual', color: '#6B46C1' },
        bottom: { id: 'shorts-1', name: '반바지', type: 'shorts', style: 'casual', color: '#1A202C' },
        shoes: { id: 'boots-1', name: '부츠', type: 'boots', style: 'casual', color: '#2D3748' }
      },
      accessories: {
        ears: { id: 'headphones-1', name: '헤드폰', type: 'headphones', model: 'gaming', color: '#6B46C1' },
        back: { id: 'backpack-1', name: '백팩', type: 'backpack', model: 'gaming', color: '#1A202C' }
      }
    }
  }
]

// Premium Avatar Presets (유료)
export const premiumPresets: AvatarPreset[] = [
  {
    id: 'cyber-ninja',
    name: '사이버 닌자',
    category: 'premium',
    thumbnail: '/avatars/presets/cyber-ninja.png',
    price: 500,
    customization: {
      type: 'humanoid',
      body: {
        type: 'athletic',
        height: 1.05,
        skinColor: '#2D3748'
      },
      face: {
        shape: 'diamond',
        eyes: { type: 'narrow', color: '#00FFFF', lashes: false },
        eyebrows: { type: 'straight', color: '#1A202C' },
        nose: { type: 'pointed' },
        mouth: { type: 'small', lipColor: '#4A5568' }
      },
      hair: {
        style: 'mohawk',
        color: '#00FFFF'
      },
      clothing: {
        top: { id: 'ninja-top', name: '닌자 상의', type: 'armor', style: 'futuristic', color: '#1A202C' },
        bottom: { id: 'ninja-pants', name: '닌자 하의', type: 'pants', style: 'futuristic', color: '#1A202C' },
        shoes: { id: 'ninja-boots', name: '닌자 부츠', type: 'boots', style: 'futuristic', color: '#2D3748' }
      },
      accessories: {
        face: { id: 'cyber-mask', name: '사이버 마스크', type: 'mask', model: 'cyber', glow: true },
        back: { id: 'energy-sword', name: '에너지 검', type: 'weapon', model: 'sword', glow: true },
        special: [
          { id: 'cyber-aura', name: '사이버 오라', type: 'aura', model: 'cyber', glow: true, animation: 'pulse' }
        ]
      }
    }
  },
  {
    id: 'magic-witch',
    name: '마법 마녀',
    category: 'premium',
    thumbnail: '/avatars/presets/magic-witch.png',
    price: 750,
    customization: {
      type: 'fantasy',
      body: {
        type: 'slim',
        height: 1.0,
        skinColor: '#E6FFFA'
      },
      face: {
        shape: 'oval',
        eyes: { type: 'anime', color: '#805AD5', lashes: true },
        eyebrows: { type: 'arched', color: '#553C9A' },
        nose: { type: 'small' },
        mouth: { type: 'heart', lipColor: '#9F7AEA' },
        makeup: {
          eyeshadow: true,
          eyeshadowColor: '#805AD5',
          lipstick: true,
          lipstickColor: '#9F7AEA'
        }
      },
      hair: {
        style: 'long',
        color: '#553C9A',
        accessories: [
          { type: 'crown', color: '#D69E2E', position: 'center' }
        ]
      },
      clothing: {
        top: { id: 'witch-robe', name: '마법사 로브', type: 'robe', style: 'fantasy', color: '#553C9A' },
        bottom: { id: 'witch-skirt', name: '마법사 치마', type: 'skirt', style: 'fantasy', color: '#6B46C1' },
        shoes: { id: 'witch-boots', name: '마법사 부츠', type: 'boots', style: 'fantasy', color: '#1A202C' }
      },
      accessories: {
        head: { id: 'witch-hat', name: '마녀 모자', type: 'hat', model: 'witch', color: '#553C9A' },
        back: { id: 'magic-staff', name: '마법 지팡이', type: 'staff', model: 'crystal', glow: true },
        special: [
          { id: 'magic-sparkles', name: '마법 반짝임', type: 'particles', model: 'sparkles', animation: 'float' }
        ]
      }
    }
  }
]

// Seasonal Avatar Presets (시즌 한정)
export const seasonalPresets: AvatarPreset[] = [
  {
    id: 'summer-beach',
    name: '여름 해변',
    category: 'seasonal',
    thumbnail: '/avatars/presets/summer-beach.png',
    customization: {
      type: 'humanoid',
      body: {
        type: 'normal',
        height: 1.0,
        skinColor: '#DEB887'
      },
      hair: {
        style: 'braids',
        color: '#D69E2E'
      },
      clothing: {
        top: { id: 'bikini-top', name: '비키니 상의', type: 'swimwear', style: 'beach', color: '#E53E3E' },
        bottom: { id: 'beach-shorts', name: '비치 반바지', type: 'shorts', style: 'beach', color: '#3182CE' },
        shoes: { id: 'flip-flops', name: '슬리퍼', type: 'sandals', style: 'beach', color: '#FFFFFF' }
      },
      accessories: {
        head: { id: 'sun-hat', name: '선햇', type: 'hat', model: 'sun-hat', color: '#F7FAFC' },
        face: { id: 'sunglasses', name: '선글라스', type: 'sunglasses', model: 'aviator' }
      }
    }
  }
]

// Special Achievement Presets (업적 보상)
export const achievementPresets: AvatarPreset[] = [
  {
    id: 'master-builder',
    name: '마스터 빌더',
    category: 'special',
    thumbnail: '/avatars/presets/master-builder.png',
    requirements: {
      achievement: 'build_100_worlds'
    },
    customization: {
      type: 'humanoid',
      clothing: {
        top: { id: 'builder-vest', name: '빌더 조끼', type: 'vest', style: 'work', color: '#D69E2E' },
        bottom: { id: 'work-pants', name: '작업복 바지', type: 'pants', style: 'work', color: '#2B6CB0' },
        shoes: { id: 'work-boots', name: '작업화', type: 'boots', style: 'work', color: '#744210' }
      },
      accessories: {
        head: { id: 'hard-hat', name: '안전모', type: 'helmet', model: 'construction', color: '#D69E2E' },
        waist: { id: 'tool-belt', name: '공구벨트', type: 'belt', model: 'tools' },
        special: [
          { id: 'golden-aura', name: '황금 오라', type: 'aura', model: 'golden', glow: true }
        ]
      }
    }
  }
]

export const allPresets = [
  ...basicPresets,
  ...premiumPresets,
  ...seasonalPresets,
  ...achievementPresets
]