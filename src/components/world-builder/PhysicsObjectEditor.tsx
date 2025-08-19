'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { WorldObject, PhysicsInteractions } from '@/lib/world-builder/object-system/types'
import { 
  Trash2, 
  Zap, 
  Settings, 
  Move3D,
  RotateCw,
  Maximize,
  Info,
  Square,
  Circle,
  Cylinder,
  Triangle
} from 'lucide-react'
import * as THREE from 'three'

interface PhysicsObjectEditorProps {
  object: WorldObject
  onUpdate: (updates: Partial<WorldObject>) => void
  onDelete: () => void
  physicsEnabled: boolean
  onApplyForce?: (force: THREE.Vector3) => void
  onApplyImpulse?: (impulse: THREE.Vector3) => void
}

export function PhysicsObjectEditor({ 
  object, 
  onUpdate, 
  onDelete, 
  physicsEnabled,
  onApplyForce,
  onApplyImpulse 
}: PhysicsObjectEditorProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'physics' | 'actions'>('properties')
  const [forceInput, setForceInput] = useState({ x: '0', y: '10', z: '0' })
  const [impulseInput, setImpulseInput] = useState({ x: '0', y: '5', z: '0' })

  const physics = object.config.interactions?.physics

  const handlePropertyUpdate = useCallback((property: string, value: any) => {
    const newObject = { ...object }
    
    if (property.startsWith('position.')) {
      const axis = property.split('.')[1] as 'x' | 'y' | 'z'
      newObject.properties.position[axis] = parseFloat(value) || 0
    } else if (property.startsWith('rotation.')) {
      const axis = property.split('.')[1] as 'x' | 'y' | 'z'
      newObject.properties.rotation[axis] = parseFloat(value) || 0
    } else if (property.startsWith('scale.')) {
      const axis = property.split('.')[1] as 'x' | 'y' | 'z'
      newObject.properties.scale[axis] = parseFloat(value) || 1
    }
    
    onUpdate(newObject)
  }, [object, onUpdate])

  const handlePhysicsUpdate = useCallback((property: string, value: any) => {
    const newObject = { ...object }
    
    if (!newObject.config.interactions) {
      newObject.config.interactions = {}
    }
    if (!newObject.config.interactions.physics) {
      newObject.config.interactions.physics = { enabled: false }
    }
    
    const physicsConfig = newObject.config.interactions.physics as PhysicsInteractions
    
    switch (property) {
      case 'enabled':
        physicsConfig.enabled = value
        break
      case 'type':
        physicsConfig.type = value
        break
      case 'mass':
        physicsConfig.mass = parseFloat(value) || 1
        break
      case 'friction':
        physicsConfig.friction = parseFloat(value) || 0.5
        break
      case 'restitution':
        physicsConfig.restitution = parseFloat(value) || 0.3
        break
      case 'density':
        physicsConfig.density = parseFloat(value) || 1
        break
      case 'isSensor':
        physicsConfig.isSensor = value
        break
      case 'shape.type':
        if (!physicsConfig.shape) {
          physicsConfig.shape = { type: 'box', size: new THREE.Vector3(1, 1, 1) }
        }
        physicsConfig.shape = { ...physicsConfig.shape, type: value }
        break
    }
    
    onUpdate(newObject)
  }, [object, onUpdate])

  const handleApplyForce = useCallback(() => {
    if (onApplyForce) {
      const force = new THREE.Vector3(
        parseFloat(forceInput.x) || 0,
        parseFloat(forceInput.y) || 0,
        parseFloat(forceInput.z) || 0
      )
      onApplyForce(force)
    }
  }, [forceInput, onApplyForce])

  const handleApplyImpulse = useCallback(() => {
    if (onApplyImpulse) {
      const impulse = new THREE.Vector3(
        parseFloat(impulseInput.x) || 0,
        parseFloat(impulseInput.y) || 0,
        parseFloat(impulseInput.z) || 0
      )
      onApplyImpulse(impulse)
    }
  }, [impulseInput, onApplyImpulse])

  const getShapeIcon = (shapeType?: string) => {
    switch (shapeType) {
      case 'box': return <Square className="w-4 h-4" />
      case 'sphere': return <Circle className="w-4 h-4" />
      case 'cylinder': return <Cylinder className="w-4 h-4" />
      case 'cone': return <Triangle className="w-4 h-4" />
      default: return <Square className="w-4 h-4" />
    }
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">오브젝트 편집</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">{object.metadata.name}</p>
        <p className="text-xs text-gray-500">ID: {object.id}</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'properties'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('properties')}
          >
            <div className="flex items-center gap-2">
              <Move3D className="w-4 h-4" />
              속성
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'physics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('physics')}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              물리
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'actions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('actions')}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              액션
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'properties' && (
          <>
            {/* Position */}
            <div>
              <Label className="text-sm font-medium text-gray-700">위치</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-gray-500">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.position.x.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('position.x', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.position.y.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('position.y', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.position.z.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('position.z', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-sm font-medium text-gray-700">회전 (라디안)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-gray-500">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.rotation.x.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('rotation.x', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.rotation.y.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('rotation.y', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={object.properties.rotation.z.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('rotation.z', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Scale */}
            <div>
              <Label className="text-sm font-medium text-gray-700">크기</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-gray-500">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={object.properties.scale.x.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('scale.x', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={object.properties.scale.y.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('scale.y', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={object.properties.scale.z.toFixed(2)}
                    onChange={(e) => handlePropertyUpdate('scale.z', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'physics' && (
          <>
            {/* Physics Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">물리 활성화</Label>
              <input
                type="checkbox"
                checked={physics?.enabled || false}
                onChange={(e) => handlePhysicsUpdate('enabled', e.target.checked)}
                className="rounded"
              />
            </div>

            {physics?.enabled && (
              <>
                {/* Physics Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">물리 타입</Label>
                  <select
                    value={physics.type || 'dynamic'}
                    onChange={(e) => handlePhysicsUpdate('type', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="static">고정 (Static)</option>
                    <option value="dynamic">동적 (Dynamic)</option>
                    <option value="kinematic">키네마틱 (Kinematic)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {physics.type === 'static' && '움직이지 않는 고정 오브젝트'}
                    {physics.type === 'dynamic' && '물리 법칙의 영향을 받는 오브젝트'}
                    {physics.type === 'kinematic' && '스크립트로 제어되는 오브젝트'}
                  </p>
                </div>

                {/* Collider Shape */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">충돌 형태</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getShapeIcon(physics.shape?.type)}
                    <select
                      value={physics.shape?.type || 'box'}
                      onChange={(e) => handlePhysicsUpdate('shape.type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="box">박스</option>
                      <option value="sphere">구</option>
                      <option value="cylinder">원통</option>
                      <option value="cone">원뿔</option>
                      <option value="capsule">캡슐</option>
                    </select>
                  </div>
                </div>

                {physics.type === 'dynamic' && (
                  <>
                    {/* Mass */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">질량</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={physics.mass?.toString() || '1'}
                        onChange={(e) => handlePhysicsUpdate('mass', e.target.value)}
                        className="text-sm mt-1"
                      />
                    </div>

                    {/* Friction */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">마찰</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={physics.friction?.toString() || '0.5'}
                        onChange={(e) => handlePhysicsUpdate('friction', e.target.value)}
                        className="text-sm mt-1"
                      />
                    </div>

                    {/* Restitution */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">탄성</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={physics.restitution?.toString() || '0.3'}
                        onChange={(e) => handlePhysicsUpdate('restitution', e.target.value)}
                        className="text-sm mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Sensor */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">센서 모드</Label>
                    <p className="text-xs text-gray-500">물리 충돌 없이 이벤트만 발생</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={physics.isSensor || false}
                    onChange={(e) => handlePhysicsUpdate('isSensor', e.target.checked)}
                    className="rounded"
                  />
                </div>

                {/* Physics Status */}
                {object.physicsBody && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">물리 활성</span>
                    </div>
                    <p className="text-xs text-green-600">
                      오브젝트에 물리가 적용되어 있습니다
                    </p>
                  </div>
                )}
              </>
            )}

            {!physicsEnabled && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-1">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">물리 시뮬레이션 비활성</span>
                </div>
                <p className="text-xs text-yellow-600">
                  월드 빌더에서 물리를 활성화해야 적용됩니다
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'actions' && (
          <>
            {physics?.enabled && physicsEnabled && physics.type === 'dynamic' && (
              <>
                {/* Apply Force */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">힘 적용</Label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      type="number"
                      step="1"
                      placeholder="X"
                      value={forceInput.x}
                      onChange={(e) => setForceInput(prev => ({ ...prev, x: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      step="1"
                      placeholder="Y"
                      value={forceInput.y}
                      onChange={(e) => setForceInput(prev => ({ ...prev, y: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      step="1"
                      placeholder="Z"
                      value={forceInput.z}
                      onChange={(e) => setForceInput(prev => ({ ...prev, z: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleApplyForce}
                    size="sm"
                    className="w-full"
                  >
                    힘 적용
                  </Button>
                </div>

                {/* Apply Impulse */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">충격량 적용</Label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      type="number"
                      step="1"
                      placeholder="X"
                      value={impulseInput.x}
                      onChange={(e) => setImpulseInput(prev => ({ ...prev, x: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      step="1"
                      placeholder="Y"
                      value={impulseInput.y}
                      onChange={(e) => setImpulseInput(prev => ({ ...prev, y: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      step="1"
                      placeholder="Z"
                      value={impulseInput.z}
                      onChange={(e) => setImpulseInput(prev => ({ ...prev, z: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleApplyImpulse}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    충격량 적용
                  </Button>
                </div>
              </>
            )}

            {!physics?.enabled && (
              <div className="text-center text-gray-500 py-8">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">물리가 비활성화되어 있습니다</p>
                <p className="text-xs">물리 탭에서 활성화하세요</p>
              </div>
            )}

            {physics?.enabled && physics.type !== 'dynamic' && (
              <div className="text-center text-gray-500 py-8">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">동적 물리 오브젝트만 조작 가능합니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}