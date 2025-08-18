'use client'

import { useState } from 'react'
import { Template3D, TemplateCustomization, getTemplateCategories, getTemplatesByCategory } from '@/lib/three/templates'
import ExportPanel from './ExportPanel'
import { SceneManager } from '@/lib/three/scene-manager'

interface TemplateCustomizerProps {
  template: Template3D | null
  customization: TemplateCustomization
  onCustomizationChange: (customization: TemplateCustomization) => void
  onTemplateSelect: (template: Template3D) => void
  sceneManager?: SceneManager | null
}

export default function TemplateCustomizer({
  template,
  customization,
  onCustomizationChange,
  onTemplateSelect,
  sceneManager,
}: TemplateCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'customize'>('templates')
  const [selectedCategory, setSelectedCategory] = useState<Template3D['category']>('business')
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false)
  const categories = getTemplateCategories()

  const handleTextChange = (key: string, value: string) => {
    onCustomizationChange({
      ...customization,
      text: {
        ...customization.text,
        [key]: value,
      },
    })
  }

  const handleColorChange = (key: string, value: string) => {
    onCustomizationChange({
      ...customization,
      colors: {
        ...customization.colors,
        [key]: value,
      },
    })
  }

  const handleOptionChange = (key: string, value: any) => {
    onCustomizationChange({
      ...customization,
      options: {
        ...customization.options,
        [key]: value,
      },
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onCustomizationChange({
        ...customization,
        logo: file,
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'customize'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('customize')}
          disabled={!template}
        >
          Customize
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name} Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {getTemplatesByCategory(selectedCategory).map((t) => (
                  <button
                    key={t.id}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      template?.id === t.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => onTemplateSelect(t)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded mb-3 relative overflow-hidden">
                      {/* Platform badge */}
                      {t.platform && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-xs rounded">
                          {t.platform}
                        </div>
                      )}
                      {/* Aspect ratio indicator */}
                      {t.aspectRatio && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-xs rounded">
                          {t.aspectRatio}
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{t.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {t.subcategory || t.category}
                      </span>
                      <span>{t.duration}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Text Customization */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Text Content
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={customization.text.title}
                    onChange={(e) => handleTextChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={customization.text.subtitle}
                    onChange={(e) => handleTextChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={customization.text.company}
                    onChange={(e) => handleTextChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Color Customization */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Colors
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customization.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={customization.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customization.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={customization.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customization.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={customization.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Logo
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {customization.logo ? customization.logo.name : 'Upload Logo'}
                  </span>
                </label>
              </div>
            </div>

            {/* Animation Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Animation Options
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Speed
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={customization.options.speed}
                    onChange={(e) => handleOptionChange('speed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>{customization.options.speed}x</span>
                    <span>Fast</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Style
                  </label>
                  <select
                    value={customization.options.style}
                    onChange={(e) => handleOptionChange('style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExportPanelOpen(true)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!template}
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