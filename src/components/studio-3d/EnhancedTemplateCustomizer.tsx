'use client'

import { useState, useEffect } from 'react'
import { Template3D, TemplateCustomization, getTemplateCategories, getTemplatesByCategory } from '@/lib/three/templates'
import { getTemplateUISchema, validateFormData, getDefaultValuesFromSchema } from '@/lib/three/template-ui-schemas'
import { DynamicSection } from './DynamicTemplateControls'
import ExportPanel from './ExportPanel'
import InteractiveEditor from './InteractiveEditor'
import { SceneManager } from '@/lib/three/scene-manager'

interface EnhancedTemplateCustomizerProps {
  template: Template3D | null
  customization: TemplateCustomization
  onCustomizationChange: (customization: TemplateCustomization) => void
  onTemplateSelect: (template: Template3D) => void
  sceneManager?: SceneManager | null
  onToolSelect?: (tool: string | null) => void
  uiElements?: any[]
  onElementUpdate?: (elementId: string, updates: any) => void
  onElementDelete?: (elementId: string) => void
}

export default function EnhancedTemplateCustomizer({
  template,
  customization,
  onCustomizationChange,
  onTemplateSelect,
  sceneManager,
  onToolSelect,
  uiElements = [],
  onElementUpdate,
  onElementDelete,
}: EnhancedTemplateCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'customize' | 'editor'>('templates')
  const [selectedCategory, setSelectedCategory] = useState<Template3D['category']>('business')
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  
  const categories = getTemplateCategories()
  const uiSchema = template ? getTemplateUISchema(template.id) : null

  // Initialize form values when template changes
  useEffect(() => {
    if (template && uiSchema) {
      const defaults = getDefaultValuesFromSchema(uiSchema)
      const initialValues = {
        ...defaults,
        // Map from customization structure to flat form values
        title: customization.text.title,
        subtitle: customization.text.subtitle,
        company: customization.text.company,
        primary: customization.colors.primary,
        secondary: customization.colors.secondary,
        accent: customization.colors.accent,
        logo: customization.logo,
        ...customization.options,
      }
      setFormValues(initialValues)
    }
  }, [template?.id])

  const handleValueChange = (category: string, key: string, value: any) => {
    // Update form values
    const newFormValues = {
      ...formValues,
      [key]: value,
    }
    setFormValues(newFormValues)

    // Map back to customization structure
    const newCustomization = { ...customization }

    if (category === 'text') {
      newCustomization.text = {
        ...customization.text,
        [key]: value,
      }
    } else if (category === 'colors') {
      if (key === 'colorScheme') {
        // Apply color scheme preset
        applyColorScheme(value, newCustomization)
      } else {
        newCustomization.colors = {
          ...customization.colors,
          [key]: value,
        }
      }
    } else if (category === 'media') {
      if (key === 'logo') {
        newCustomization.logo = value
      }
    } else {
      newCustomization.options = {
        ...customization.options,
        [key]: value,
      }
    }

    onCustomizationChange(newCustomization)

    // Validate if schema has validation rules
    if (uiSchema?.validation) {
      const validation = validateFormData(newFormValues, uiSchema)
      setValidationErrors(validation.errors)
    }
  }

  const applyColorScheme = (scheme: string, customization: TemplateCustomization) => {
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string }> = {
      professional: { primary: '#1E40AF', secondary: '#059669', accent: '#DC2626' },
      vibrant: { primary: '#F59E0B', secondary: '#EC4899', accent: '#8B5CF6' },
      elegant: { primary: '#FFD700', secondary: '#FFF8E7', accent: '#FF69B4' },
      playful: { primary: '#10B981', secondary: '#F472B6', accent: '#60A5FA' },
      tech: { primary: '#06B6D4', secondary: '#8B5CF6', accent: '#F97316' },
      warm: { primary: '#EF4444', secondary: '#F59E0B', accent: '#FB923C' },
      cool: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#8B5CF6' },
      monochrome: { primary: '#000000', secondary: '#6B7280', accent: '#E5E7EB' },
    }

    const colors = colorSchemes[scheme]
    if (colors) {
      customization.colors = colors
    }
  }

  const handleExport = () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before exporting')
      return
    }
    setIsExportPanelOpen(true)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'customize'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('customize')}
          disabled={!template}
        >
          Customize
        </button>
        <button
          className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('editor')}
          disabled={!template}
        >
          Editor
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'templates' ? (
          <div className="flex h-full">
            {/* Category Sidebar */}
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {cat.count} templates
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-1 gap-4">
                {getTemplatesByCategory(selectedCategory).map((t) => (
                  <button
                    key={t.id}
                    className={`text-left p-3 rounded-lg border-2 transition-all overflow-hidden ${
                      template?.id === t.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => onTemplateSelect(t)}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{t.thumbnail || '🎬'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base truncate">{t.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {t.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {t.subcategory || t.category}
                      </span>
                      <span>{t.aspectRatio && `${t.aspectRatio} • `}{t.duration}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'customize' ? (
          <div className="p-4">
            {uiSchema ? (
              <div className="space-y-4">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Please fix the following errors:
                    </h4>
                    <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                      {validationErrors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Layout-specific rendering */}
                {uiSchema.layout === 'wizard' ? (
                  // Wizard layout with step navigation
                  <WizardLayout
                    schema={uiSchema}
                    values={formValues}
                    onChange={handleValueChange}
                  />
                ) : (
                  // Default layout - show all sections
                  <div className="space-y-4">
                    {uiSchema.sections.map((section) => (
                      <DynamicSection
                        key={section.id}
                        section={section}
                        values={formValues}
                        onChange={handleValueChange}
                      />
                    ))}
                  </div>
                )}

                {/* Template-specific tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    💡 Tips for {template?.name}
                  </h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                    {getTemplateTips(template?.id).map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              // Fallback to generic controls if no schema defined
              <div className="text-center py-8 text-gray-500">
                <p>No custom controls available for this template.</p>
                <p className="text-sm mt-2">Using default customization options.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'editor' ? (
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">인터랙티브 에디터</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                도구를 선택한 후 왼쪽 3D 뷰포트에 직접 드래그하여 요소를 추가하세요
              </p>
            </div>

            <InteractiveEditor 
              sceneManager={sceneManager || null}
              onElementsChange={(elements) => {
                console.log('Editor elements updated:', elements);
              }}
              onToolSelect={onToolSelect}
              uiElements={uiElements}
              onElementUpdate={onElementUpdate}
              onElementDelete={onElementDelete}
            />
          </div>
        ) : null}
      </div>

      {/* Export Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleExport}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!template || validationErrors.length > 0}
        >
          Export Animation
        </button>
      </div>

      {/* Export Panel */}
      <ExportPanel
        isOpen={isExportPanelOpen}
        onClose={() => setIsExportPanelOpen(false)}
        template={template}
        customization={customization}
        sceneManager={sceneManager || null}
      />
    </div>
  )
}

// Wizard layout component for step-by-step customization
function WizardLayout({ 
  schema, 
  values, 
  onChange 
}: { 
  schema: any; 
  values: Record<string, any>; 
  onChange: (category: string, key: string, value: any) => void 
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = schema.sections.length

  return (
    <div>
      {/* Step indicators */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {schema.sections.map((section: any, index: number) => (
            <div
              key={section.id}
              className={`flex items-center ${
                index < totalSteps - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {schema.sections.map((section: any, index: number) => (
            <div
              key={section.id}
              className={`text-xs ${
                index === currentStep
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {section.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <DynamicSection
        section={schema.sections[currentStep]}
        values={values}
        onChange={onChange}
      />

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={currentStep === totalSteps - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// Get template-specific tips
function getTemplateTips(templateId?: string): string[] {
  const tips: Record<string, string[]> = {
    'corporate-logo-intro': [
      'Use your brand colors for consistency',
      'Keep text concise and impactful',
      'Upload a high-resolution logo for best quality',
    ],
    'instagram-story': [
      'Use bright, eye-catching colors',
      'Keep text large and readable on mobile',
      'First 3 seconds are crucial for engagement',
    ],
    'wedding-invitation': [
      'Choose elegant, readable fonts',
      'Soft, romantic colors work best',
      'Include all essential wedding details',
    ],
    'youtube-intro': [
      'Keep it short - 5-10 seconds max',
      'Include clear call-to-action',
      'Match your channel branding',
    ],
    'product-showcase': [
      'Use high-quality product images',
      'Highlight key features',
      'Keep rotation smooth and professional',
    ],
  }

  return tips[templateId || ''] || ['Customize to match your brand', 'Preview before exporting']
}