'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { SceneManager } from '@/lib/three/scene-manager';

interface EditorElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'triangle';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  content?: string;
  style: {
    color: string;
    fontSize?: number;
    fontFamily?: string;
    opacity: number;
    borderWidth?: number;
    borderColor?: string;
  };
  animation?: {
    type: 'none' | 'rotate' | 'scale' | 'bounce' | 'fade';
    duration: number;
    delay: number;
  };
}

interface InteractiveEditorProps {
  sceneManager: SceneManager | null;
  onElementsChange?: (elements: EditorElement[]) => void;
  onToolSelect?: (tool: string | null) => void;
  onElementAdd?: (element: any) => void;
  uiElements?: any[];
  onElementUpdate?: (elementId: string, updates: any) => void;
  onElementDelete?: (elementId: string) => void;
}

const SHAPE_TOOLS = [
  { type: 'text', icon: '📝', label: 'Text' },
  { type: 'rectangle', icon: '⬜', label: 'Rectangle' },
  { type: 'circle', icon: '⭕', label: 'Circle' },
  { type: 'arrow', icon: '➡️', label: 'Arrow' },
  { type: 'triangle', icon: '🔺', label: 'Triangle' },
];

// const FONTS = [
//   'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
//   'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS'
// ];

export default function InteractiveEditor({ 
  sceneManager, 
  onElementsChange, 
  onToolSelect, 
  onElementAdd: _onElementAdd, 
  uiElements = [],
  onElementUpdate,
  onElementDelete 
}: InteractiveEditorProps) {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [previewDiv, setPreviewDiv] = useState<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // 외부에서 추가된 요소를 받아서 로컬 상태에 추가
  const _addExternalElement = useCallback((externalElement: any) => {
    const newElement: EditorElement = {
      id: externalElement.id,
      type: externalElement.type as EditorElement['type'],
      position: { x: externalElement.position.x, y: externalElement.position.y, z: externalElement.position.z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: externalElement.size.width / 100, y: externalElement.size.height / 100, z: 1 },
      content: externalElement.content,
      style: {
        color: externalElement.style.color,
        fontSize: externalElement.style.fontSize,
        fontFamily: 'Arial',
        opacity: externalElement.style.opacity || 1,
        borderWidth: 2,
        borderColor: '#1F2937',
      },
      animation: {
        type: 'none',
        duration: 2,
        delay: 0,
      }
    };

    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    onElementsChange?.(updatedElements);
    
    console.log('Element added to local state:', newElement);
  }, [elements, onElementsChange]);

  // 요소 추가 함수
  const addElement = useCallback((type: string, x: number, y: number, width: number = 100, height: number = 50) => {
    const newElement: EditorElement = {
      id: `${type}_${Date.now()}`,
      type: type as EditorElement['type'],
      position: { x: x - 250, y: 250 - y, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { 
        x: Math.max(width / 100, 0.5),
        y: Math.max(height / 100, 0.5), 
        z: 1 
      },
      content: type === 'text' ? 'New Text' : undefined,
      style: {
        color: '#3B82F6',
        fontSize: type === 'text' ? Math.max(Math.min(width / 8, 48), 16) : undefined,
        fontFamily: type === 'text' ? 'Arial' : undefined,
        opacity: 1,
        borderWidth: 2,
        borderColor: '#1F2937',
      },
      animation: {
        type: 'none',
        duration: 2,
        delay: 0,
      }
    };

    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    onElementsChange?.(updatedElements);
    
    // 3D 씬에 추가
    if (sceneManager) {
      add3DElement(newElement);
    }

    console.log('Element added:', newElement);
  }, [elements, sceneManager, onElementsChange]);

  // 3D 씬에 요소 추가
  const add3DElement = (element: EditorElement) => {
    if (!sceneManager) return;

    const scene = sceneManager.getScene();
    let mesh: THREE.Object3D;

    switch (element.type) {
      case 'text':
        mesh = createTextMesh(element);
        break;
      case 'rectangle':
        mesh = createRectangleMesh(element);
        break;
      case 'circle':
        mesh = createCircleMesh(element);
        break;
      case 'arrow':
        mesh = createArrowMesh(element);
        break;
      case 'triangle':
        mesh = createTriangleMesh(element);
        break;
      default:
        return;
    }

    mesh.name = element.id;
    mesh.position.set(element.position.x / 50, element.position.y / 50, element.position.z / 50);
    mesh.rotation.set(element.rotation.x, element.rotation.y, element.rotation.z);
    mesh.scale.set(element.scale.x, element.scale.y, element.scale.z);
    
    scene.add(mesh);
  };

  const createTextMesh = (element: EditorElement) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.width = 512;
    canvas.height = 256;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = element.style.color;
    context.font = `${element.style.fontSize}px ${element.style.fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(element.content || '', canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: element.style.opacity 
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 2, 1);
    
    return sprite;
  };

  const createRectangleMesh = (element: EditorElement) => {
    const geometry = new THREE.PlaneGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh(geometry, material);
  };

  const createCircleMesh = (element: EditorElement) => {
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh(geometry, material);
  };

  const createArrowMesh = (element: EditorElement) => {
    const group = new THREE.Group();
    
    const shaftGeometry = new THREE.PlaneGeometry(1.5, 0.2);
    const shaftMaterial = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity 
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    group.add(shaft);
    
    const headGeometry = new THREE.ConeGeometry(0.3, 0.6, 3);
    const headMaterial = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotation.z = -Math.PI / 2;
    head.position.x = 1;
    group.add(head);
    
    return group;
  };

  const createTriangleMesh = (element: EditorElement) => {
    const geometry = new THREE.ConeGeometry(1, 2, 3);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.style.color,
      transparent: true,
      opacity: element.style.opacity 
    });
    return new THREE.Mesh(geometry, material);
  };

  // 마우스 다운
  const handleMouseDown = useCallback((e: MouseEvent) => {
    console.log('🖱️ Mouse down event triggered!', e);
    
    if (!viewportRef.current || !selectedTool) {
      console.log('❌ Missing requirements:', { 
        viewport: !!viewportRef.current, 
        tool: selectedTool 
      });
      return;
    }
    
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('📍 Mouse down at:', { x, y, rect });
    
    setIsMouseDown(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    
    // 미리보기 div 생성
    const preview = document.createElement('div');
    preview.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0px;
      height: 0px;
      border: 3px solid #3B82F6;
      background-color: rgba(59, 130, 246, 0.2);
      pointer-events: none;
      z-index: 10000;
    `;
    preview.id = 'drag-preview';
    
    viewportRef.current.appendChild(preview);
    setPreviewDiv(preview);
    
    console.log('✅ Preview created and added');
    
    e.preventDefault();
  }, [selectedTool]);
  
  // 마우스 무브
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown || !previewDiv || !viewportRef.current) {
      return;
    }
    
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
    
    const left = Math.min(startPos.x, x);
    const top = Math.min(startPos.y, y);
    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    
    previewDiv.style.left = left + 'px';
    previewDiv.style.top = top + 'px';
    previewDiv.style.width = width + 'px';
    previewDiv.style.height = height + 'px';
    
    // 원형의 경우 정사각형으로
    if (selectedTool === 'circle') {
      const size = Math.min(width, height);
      previewDiv.style.width = size + 'px';
      previewDiv.style.height = size + 'px';
      previewDiv.style.borderRadius = '50%';
    } else {
      previewDiv.style.borderRadius = '0';
    }
    
    console.log('🏃 Dragging:', { width, height });
  }, [isMouseDown, previewDiv, startPos, selectedTool]);
  
  // 마우스 업
  const handleMouseUp = useCallback((e: MouseEvent) => {
    console.log('🖱️ Mouse up event triggered!');
    
    if (!isMouseDown || !selectedTool) {
      console.log('❌ Mouse up but not dragging or no tool');
      setIsMouseDown(false);
      return;
    }
    
    // 미리보기 제거
    if (previewDiv && viewportRef.current?.contains(previewDiv)) {
      viewportRef.current.removeChild(previewDiv);
    }
    setPreviewDiv(null);
    
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    // 요소 추가
    if (width < 10 && height < 10) {
      // 클릭만 한 경우 기본 크기
      addElement(selectedTool, startPos.x, startPos.y, 100, 50);
    } else {
      // 드래그한 경우 실제 크기
      const centerX = (startPos.x + currentPos.x) / 2;
      const centerY = (startPos.y + currentPos.y) / 2;
      addElement(selectedTool, centerX, centerY, width, height);
    }
    
    setIsMouseDown(false);
    console.log('✅ Drag completed, element added');
  }, [isMouseDown, selectedTool, previewDiv, currentPos, startPos, addElement]);

  // 속성 업데이트
  const updateElementProperty = (elementId: string, property: string, value: any) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        const updated = { ...el };
        if (property.includes('.')) {
          const [parent, child] = property.split('.');
          updated[parent as keyof EditorElement] = {
            ...updated[parent as keyof EditorElement],
            [child]: value
          };
        } else {
          updated[property as keyof EditorElement] = value;
        }
        
        // 3D 씬 업데이트
        if (sceneManager) {
          const scene = sceneManager.getScene();
          const mesh = scene.getObjectByName(elementId);
          if (mesh) {
            scene.remove(mesh);
            add3DElement(updated);
          }
        }
        
        return updated;
      }
      return el;
    });
    
    setElements(updatedElements);
    onElementsChange?.(updatedElements);
  };

  // DOM 이벤트 리스너 설정
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    console.log('📌 Setting up DOM event listeners');

    viewport.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);  
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('🗑️ Cleaning up event listeners');
      viewport.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const selectedElementData = uiElements.find(el => el.id === selectedElement);

  return (
    <div className="h-full">
      {/* 도구 패널 */}
      <div className="bg-white dark:bg-gray-800 p-4">
        <h3 className="text-lg font-semibold mb-4">도구</h3>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">추가</h4>
          <div className="grid grid-cols-2 gap-2">
            {SHAPE_TOOLS.map((tool) => (
              <button
                key={tool.type}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedTool === tool.type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() => {
                  console.log('Tool selected:', tool.type);
                  const newTool = selectedTool === tool.type ? null : tool.type;
                  setSelectedTool(newTool);
                  onToolSelect?.(newTool);
                }}
              >
                <div className="text-2xl mb-1">{tool.icon}</div>
                <div className="text-xs">{tool.label}</div>
              </button>
            ))}
          </div>
          
          {/* 현재 선택된 도구 표시 */}
          {selectedTool && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-center border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                {SHAPE_TOOLS.find(t => t.type === selectedTool)?.label} 선택됨
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                왼쪽 3D 뷰포트에서 드래그하세요
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">레이어 ({uiElements.length})</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {uiElements.map((element) => (
              <button
                key={element.id}
                className={`w-full p-2 text-left rounded border transition-all ${
                  selectedElement === element.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setSelectedElement(element.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{SHAPE_TOOLS.find(t => t.type === element.type)?.icon}</span>
                  <span className="text-sm truncate">
                    {element.content || `${element.type} ${element.id.split('_')[1]}`}
                  </span>
                </div>
              </button>
            ))}
            {uiElements.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                아직 요소가 없습니다
              </p>
            )}
          </div>
        </div>

        {/* 속성 패널 */}
        {selectedElementData && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">속성</h4>
            
            {selectedElementData.type === 'text' && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">텍스트</label>
                  <input
                    type="text"
                    value={selectedElementData.content || ''}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, { 
                          content: e.target.value,
                          style: { ...selectedElementData.style, fontSize: selectedElementData.style?.fontSize || 24 }
                        })
                      }
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">폰트 크기</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={selectedElementData.style?.fontSize || 24}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, {
                          style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) },
                          content: selectedElementData.content
                        })
                      }
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {selectedElementData.style?.fontSize || 24}px
                  </div>
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">위치</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X</label>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    value={selectedElementData.position?.x || 400}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, {
                          position: { 
                            ...selectedElementData.position, 
                            x: parseInt(e.target.value) 
                          }
                        })
                      }
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {selectedElementData.position?.x || 400}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y</label>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    value={selectedElementData.position?.y || 300}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, {
                          position: { 
                            ...selectedElementData.position, 
                            y: parseInt(e.target.value) 
                          }
                        })
                      }
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {selectedElementData.position?.y || 300}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">크기</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">너비</label>
                  <input
                    type="number"
                    value={selectedElementData.size?.width || 100}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, {
                          size: { 
                            ...selectedElementData.size, 
                            width: parseInt(e.target.value) 
                          }
                        })
                      }
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                    min="10"
                    max="500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">높이</label>
                  <input
                    type="number"
                    value={selectedElementData.size?.height || 50}
                    onChange={(e) => {
                      if (onElementUpdate) {
                        onElementUpdate(selectedElement!, {
                          size: { 
                            ...selectedElementData.size, 
                            height: parseInt(e.target.value) 
                          }
                        })
                      }
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                    min="10"
                    max="300"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">색상</label>
              <input
                type="color"
                value={selectedElementData.style?.color || '#3B82F6'}
                onChange={(e) => {
                  if (onElementUpdate) {
                    onElementUpdate(selectedElement!, {
                      style: { ...selectedElementData.style, color: e.target.value }
                    })
                  }
                }}
                className="w-full h-8 rounded border"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">투명도</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElementData.style?.opacity || 1}
                onChange={(e) => {
                  if (onElementUpdate) {
                    onElementUpdate(selectedElement!, {
                      style: { ...selectedElementData.style, opacity: parseFloat(e.target.value) }
                    })
                  }
                }}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {Math.round((selectedElementData.style?.opacity || 1) * 100)}%
              </div>
            </div>

            <button
              onClick={() => {
                if (onElementDelete) {
                  onElementDelete(selectedElement!)
                  setSelectedElement(null)
                }
              }}
              className="w-full py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}