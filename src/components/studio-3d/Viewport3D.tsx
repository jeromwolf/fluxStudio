'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SceneManager } from '@/lib/three/scene-manager'
import { Template3D, TemplateCustomization } from '@/lib/three/templates'

interface Viewport3DProps {
  template: Template3D | null
  customization: TemplateCustomization
  onSceneManagerReady?: (sceneManager: SceneManager) => void
  onExportClick?: () => void
  isDragMode?: boolean
  selectedTool?: string | null
  onElementAdd?: (element: any) => void
}

export default function Viewport3D({ 
  template, 
  customization, 
  onSceneManagerReady, 
  onExportClick,
  isDragMode = false,
  selectedTool = null,
  onElementAdd
}: Viewport3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneManagerRef = useRef<SceneManager | null>(null)
  
  // 드래그 상태
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [previewDiv, setPreviewDiv] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize scene manager
    const sceneManager = new SceneManager(canvasRef.current)
    sceneManagerRef.current = sceneManager

    // Notify parent component that scene manager is ready
    onSceneManagerReady?.(sceneManager)

    // Load template if selected
    if (template) {
      sceneManager.loadTemplate(template.id, customization).catch(console.error)
    }

    // Start animation
    sceneManager.startAnimation()

    // Cleanup
    return () => {
      sceneManager.dispose()
    }
  }, [])

  useEffect(() => {
    if (!sceneManagerRef.current || !template) return
    
    // Update scene when template or customization changes
    sceneManagerRef.current.loadTemplate(template.id, customization).catch(console.error)
  }, [template, customization])

  // 드래그 이벤트 핸들러들
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isDragMode || !selectedTool || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    console.log('🖱️ Viewport 드래그 시작:', { tool: selectedTool, pos: { x, y } })

    setIsMouseDown(true)
    setStartPos({ x, y })
    setCurrentPos({ x, y })

    // 미리보기 생성
    const preview = document.createElement('div')
    preview.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0px;
      height: 0px;
      border: 2px solid #3B82F6;
      background-color: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 1000;
    `
    preview.id = 'viewport-drag-preview'
    
    containerRef.current.appendChild(preview)
    setPreviewDiv(preview)

    e.preventDefault()
  }, [isDragMode, selectedTool])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown || !previewDiv || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPos({ x, y })

    const left = Math.min(startPos.x, x)
    const top = Math.min(startPos.y, y)
    const width = Math.abs(x - startPos.x)
    const height = Math.abs(y - startPos.y)

    previewDiv.style.left = left + 'px'
    previewDiv.style.top = top + 'px'
    previewDiv.style.width = width + 'px'
    previewDiv.style.height = height + 'px'

    // 원형의 경우 정사각형으로
    if (selectedTool === 'circle') {
      const size = Math.min(width, height)
      previewDiv.style.width = size + 'px'
      previewDiv.style.height = size + 'px'
      previewDiv.style.borderRadius = '50%'
    } else {
      previewDiv.style.borderRadius = '0'
    }
  }, [isMouseDown, previewDiv, startPos, selectedTool])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isMouseDown || !selectedTool) return

    console.log('🖱️ Viewport 드래그 완료')

    // 미리보기 제거
    if (previewDiv && containerRef.current?.contains(previewDiv)) {
      containerRef.current.removeChild(previewDiv)
    }
    setPreviewDiv(null)

    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    // 요소 정보 생성
    const element = {
      id: `${selectedTool}_${Date.now()}`,
      type: selectedTool,
      position: {
        x: (startPos.x + currentPos.x) / 2,
        y: (startPos.y + currentPos.y) / 2,
        z: 0
      },
      size: { width: Math.max(width, 50), height: Math.max(height, 30) },
      content: selectedTool === 'text' ? 'New Text' : undefined,
      style: {
        color: '#3B82F6',
        fontSize: 24,
        opacity: 1
      }
    }

    // 요소 추가 콜백 호출
    onElementAdd?.(element)

    setIsMouseDown(false)
  }, [isMouseDown, selectedTool, previewDiv, currentPos, startPos, onElementAdd])

  // DOM 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isDragMode) return

    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragMode, handleMouseDown, handleMouseMove, handleMouseUp])

  // For now, using vanilla Three.js
  // Later we can switch to React Three Fiber for more complex interactions
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-gray-100 dark:bg-gray-800 ${
        isDragMode && selectedTool ? 'cursor-crosshair' : ''
      }`}
    >
      {/* 드래그 모드 안내 */}
      {isDragMode && selectedTool && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-lg">
              {selectedTool === 'text' && '📝'}
              {selectedTool === 'rectangle' && '⬜'}
              {selectedTool === 'circle' && '⭕'}
              {selectedTool === 'arrow' && '➡️'}
              {selectedTool === 'triangle' && '🔺'}
            </span>
            <span className="font-medium">{selectedTool} 도구 활성 - 드래그하여 추가</span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Overlay Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Reset Camera"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Export Quick Access */}
      {template && (
        <div className="absolute top-4 right-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-blue-600"
              title="Quick Export"
              onClick={onExportClick}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Timeline Preview */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <div className="flex-1">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              0:00 / {template?.duration || 0}:00
            </span>
          </div>
        </div>
      </div>
      
      {/* No Template Selected */}
      {!template && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Template Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a template from the right panel to get started
            </p>
          </div>
        </div>
      )}
    </div>
  )
}