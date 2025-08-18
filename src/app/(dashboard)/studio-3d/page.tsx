'use client'

import { useState } from 'react'
import type { Template3D, TemplateCustomization } from '@/lib/three/templates'
import Viewport3D from '@/components/studio-3d/Viewport3D'
import EnhancedTemplateCustomizer from '@/components/studio-3d/EnhancedTemplateCustomizer'
import ExportPanel from '@/components/studio-3d/ExportPanel'
import { SceneManager } from '@/lib/three/scene-manager'

import Link from 'next/link'

export default function Studio3DPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template3D | null>(null)
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null)
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [isDragMode, setIsDragMode] = useState(false)
  const [uiElements, setUIElements] = useState<any[]>([])
  const [customization, setCustomization] = useState<TemplateCustomization>({
    text: {
      title: 'Sample Title',
      subtitle: 'Sample Subtitle', 
      company: 'Your Company'
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B'
    },
    logo: null,
    options: {
      speed: 1,
      style: 'modern',
      duration: 5
    }
  })

  const handleTemplateSelect = (template: Template3D) => {
    setSelectedTemplate(template)
    setCustomization(template.defaultCustomization)
  }

  const handleSceneManagerReady = (manager: SceneManager) => {
    setSceneManager(manager)
  }

  const handleExportClick = () => {
    setIsExportPanelOpen(true)
  }

  const handleToolSelect = (tool: string | null) => {
    setSelectedTool(tool)
    setIsDragMode(!!tool)
  }

  const handleElementAdd = (element: any) => {
    console.log('Element added to viewport:', element)
    
    // SceneManager에 UI 요소 추가
    if (sceneManager) {
      sceneManager.addUIElement(element)
      console.log('✅ Element added to 3D scene:', element.type, element.id)
    } else {
      console.warn('❌ SceneManager not available')
    }

    // UI 요소 리스트에 추가
    setUIElements(prev => [...prev, element])
  }

  const handleElementUpdate = (elementId: string, updates: any) => {
    setUIElements(prev => 
      prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
    )
    
    // SceneManager에도 업데이트 전달
    if (sceneManager) {
      sceneManager.updateUIElement(elementId, updates)
    }
  }

  const handleElementDelete = (elementId: string) => {
    setUIElements(prev => prev.filter(el => el.id !== elementId))
    
    // SceneManager에서도 제거
    if (sceneManager) {
      sceneManager.removeUIElement(elementId)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              ← 홈으로
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">3D 스튜디오</h1>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTemplate ? `현재 템플릿: ${selectedTemplate.name}` : '템플릿을 선택하세요'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Viewport */}
        <div className="flex-1">
          <Viewport3D 
            template={selectedTemplate}
            customization={customization}
            onSceneManagerReady={handleSceneManagerReady}
            onExportClick={handleExportClick}
            isDragMode={isDragMode}
            selectedTool={selectedTool}
            onElementAdd={handleElementAdd}
          />
        </div>

        {/* Right Panel - Template Selection & Customization */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <EnhancedTemplateCustomizer
            template={selectedTemplate}
            customization={customization}
            onTemplateSelect={handleTemplateSelect}
            onCustomizationChange={setCustomization}
            sceneManager={sceneManager}
            onToolSelect={handleToolSelect}
            uiElements={uiElements}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleElementDelete}
          />
        </div>
      </div>

      {/* Export Panel */}
      <ExportPanel
        isOpen={isExportPanelOpen}
        onClose={() => setIsExportPanelOpen(false)}
        template={selectedTemplate}
        customization={customization}
        sceneManager={sceneManager}
      />
    </div>
  )
}