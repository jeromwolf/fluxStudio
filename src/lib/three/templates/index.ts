import { Template3D } from '../templates'
import { lofiGlassPanelsTemplate } from './lofi-glass-panels'
import { liquidFlowTemplate } from '@/lib/templates/transitions/liquid-flow'
import { matrixDigitalRainTemplate } from '@/lib/templates/effects/matrix-digital-rain'
import { particleUniverseTemplate } from '@/lib/templates/effects/particle-universe'
import { neonCityTemplate } from '@/lib/templates/effects/neon-city'

/**
 * 확장 가능한 템플릿 시스템
 * 
 * 새로운 템플릿을 추가하려면:
 * 1. templates/ 폴더에 새 파일 생성 (예: my-template.ts)
 * 2. 이 파일에서 import 후 TEMPLATE_REGISTRY에 추가
 * 3. 자동으로 UI에서 사용 가능
 */

// 모든 템플릿을 중앙에서 관리하는 레지스트리
export const TEMPLATE_REGISTRY: Template3D[] = [
  lofiGlassPanelsTemplate,
  liquidFlowTemplate, // 🌊 첫 번째 프로 템플릿!
  matrixDigitalRainTemplate, // 🟢 매트릭스 효과!
  particleUniverseTemplate, // 🌌 파티클 우주!
  neonCityTemplate, // 🌃 네온 시티!
  // 새 템플릿들을 여기에 추가하면 됩니다
]

// 템플릿 카테고리별 그룹화
export const getTemplatesByCategory = (category: Template3D['category']) => {
  return TEMPLATE_REGISTRY.filter(template => template.category === category)
}

// ID로 템플릿 찾기
export const getTemplateById = (id: string) => {
  return TEMPLATE_REGISTRY.find(template => template.id === id)
}

// 카테고리 목록 자동 생성
export const getTemplateCategories = () => {
  const categoryMap = new Map<string, { count: number; templates: Template3D[] }>()
  
  TEMPLATE_REGISTRY.forEach(template => {
    const key = template.category
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { count: 0, templates: [] })
    }
    const category = categoryMap.get(key)!
    category.count++
    category.templates.push(template)
  })

  const categoryInfo = {
    business: { name: 'Business', description: 'Professional templates for corporate use' },
    social: { name: 'Social Media', description: 'Optimized for social platforms' },
    event: { name: 'Events', description: 'Announcements and celebrations' },
    personal: { name: 'Personal', description: 'Express yourself creatively' },
    intro: { name: 'Intros', description: 'Opening sequences' },
    outro: { name: 'Outros', description: 'Closing sequences' },
    transition: { name: 'Transitions', description: 'Scene transitions' },
    title: { name: 'Titles', description: 'Title cards' },
    logo: { name: 'Logo', description: 'Logo animations' },
    effects: { name: 'Effects', description: 'Visual effects and animations' },
  }

  return Array.from(categoryMap.entries()).map(([id, data]) => ({
    id: id as Template3D['category'],
    name: categoryInfo[id as keyof typeof categoryInfo]?.name || id,
    description: categoryInfo[id as keyof typeof categoryInfo]?.description || '',
    count: data.count,
    templates: data.templates
  }))
}

// 플랫폼별 템플릿 필터링
export const getTemplatesByPlatform = (platform: string) => {
  return TEMPLATE_REGISTRY.filter(template => template.platform === platform)
}

// 모든 템플릿 ID 목록 (template-scenes.ts와의 호환성)
export const getAvailableTemplateIds = () => {
  return TEMPLATE_REGISTRY.map(template => template.id)
}

// 새 템플릿을 동적으로 등록하는 함수 (플러그인 시스템용)
export const registerTemplate = (template: Template3D) => {
  const existingIndex = TEMPLATE_REGISTRY.findIndex(t => t.id === template.id)
  if (existingIndex >= 0) {
    TEMPLATE_REGISTRY[existingIndex] = template // 덮어쓰기
  } else {
    TEMPLATE_REGISTRY.push(template) // 새로 추가
  }
}

// 템플릿 제거
export const unregisterTemplate = (id: string) => {
  const index = TEMPLATE_REGISTRY.findIndex(t => t.id === id)
  if (index >= 0) {
    TEMPLATE_REGISTRY.splice(index, 1)
  }
}