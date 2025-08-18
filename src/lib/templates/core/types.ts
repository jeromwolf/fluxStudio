import * as THREE from 'three'

/**
 * 확장 가능한 템플릿 시스템의 핵심 타입 정의
 */

export type TemplateCategory = 
  | 'social' 
  | 'business' 
  | 'events' 
  | 'personal' 
  | 'intro' 
  | 'outro' 
  | 'transition' 
  | 'title' 
  | 'logo'
  | 'effects'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5'
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'general'

export interface TemplateMetadata {
  readonly name: string
  readonly description: string
  readonly category: TemplateCategory
  readonly subcategory?: string
  readonly tags: readonly string[]
  readonly thumbnail: string
  readonly aspectRatio: AspectRatio
  readonly duration: number
  readonly platform?: Platform
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly author?: string
  readonly version: string
  readonly createdAt?: Date
  readonly updatedAt?: Date
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

export interface TemplateScene {
  setup: (scene: THREE.Scene, customization: TemplateCustomization) => TemplateSceneResult
}

export interface TemplateSceneResult {
  animate: (time: number) => void
  cleanup?: () => void
  objects?: THREE.Object3D[]
}

export interface TemplateAnimations {
  default: string
  available: readonly string[]
  presets: Record<string, AnimationPreset>
}

export interface AnimationPreset {
  duration: number
  easing: string
  keyframes: Record<string, any>[]
}

export interface TemplateUI {
  customization: TemplateCustomizationSchema
  preview?: TemplatePreviewConfig
  export?: TemplateExportConfig
}

export interface TemplateCustomizationSchema {
  sections: readonly TemplateUISection[]
  layout?: 'default' | 'wizard' | 'tabs'
  validation?: TemplateValidationRules
}

export interface TemplateUISection {
  id: string
  title: string
  description?: string
  fields: readonly TemplateUIField[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface TemplateUIField {
  id: string
  type: 'text' | 'color' | 'number' | 'select' | 'slider' | 'toggle' | 'file'
  label: string
  description?: string
  defaultValue?: any
  validation?: FieldValidation
  options?: readonly string[] | Record<string, string>
  min?: number
  max?: number
  step?: number
}

export interface FieldValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  custom?: (value: any) => string | null
}

export interface TemplateValidationRules {
  rules: readonly ValidationRule[]
  onError?: (errors: string[]) => void
}

export interface ValidationRule {
  field: string
  validate: (value: any, allValues: Record<string, any>) => string | null
}

export interface TemplatePreviewConfig {
  showGrid?: boolean
  showAxes?: boolean
  cameraPosition?: [number, number, number]
  autoRotate?: boolean
}

export interface TemplateExportConfig {
  formats: readonly ExportFormat[]
  defaultFormat: ExportFormat
  qualityPresets: Record<string, ExportQuality>
}

export interface ExportFormat {
  id: string
  name: string
  extension: string
  mimeType: string
  settings: ExportSettings
}

export interface ExportSettings {
  resolution: readonly [number, number]
  frameRate: number
  bitrate?: number
  quality?: number
  codec?: string
}

export interface ExportQuality {
  name: string
  settings: Partial<ExportSettings>
}

/**
 * 메인 템플릿 인터페이스
 */
export interface Template3D {
  readonly id: string
  readonly metadata: TemplateMetadata
  readonly scene: TemplateScene
  readonly ui: TemplateUI
  readonly animations: TemplateAnimations
  readonly defaultCustomization: TemplateCustomization
}

/**
 * 템플릿 플러그인 인터페이스
 */
export interface TemplatePlugin {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly templates: readonly Template3D[]
  readonly categories?: readonly TemplateCategory[]
  initialize?(): Promise<void>
  cleanup?(): Promise<void>
}

/**
 * 템플릿 검색 및 필터링
 */
export interface TemplateSearchCriteria {
  query?: string
  category?: TemplateCategory
  tags?: readonly string[]
  platform?: Platform
  difficulty?: 'easy' | 'medium' | 'hard'
  aspectRatio?: AspectRatio
  duration?: { min?: number; max?: number }
}

export interface TemplateSearchResult {
  templates: readonly Template3D[]
  total: number
  categories: ReadonlyMap<TemplateCategory, number>
  tags: ReadonlyMap<string, number>
}