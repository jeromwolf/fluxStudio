'use client'

import { useState } from 'react'
import { AvatarCustomization, AvatarPreset } from '../types'
import { basicPresets, premiumPresets, seasonalPresets } from '../data/presets'
import { AvatarPreview3D } from './AvatarPreview3D'
import { 
  hairStyles, 
  hairColors, 
  skinColors, 
  eyeColors,
  clothingTops,
  clothingBottoms,
  shoes,
  headAccessories,
  faceAccessories,
  earAccessories,
  neckAccessories,
  backAccessories,
  handAccessories,
  specialEffects,
  faceFeatures,
  facialHair,
  bodyTypes,
  animationSets
} from '../data/customization-items'

interface AvatarCustomizerProps {
  avatar: AvatarCustomization
  onAvatarChange: (avatar: AvatarCustomization) => void
  onSave: () => void
  onCancel: () => void
}

type CustomizerTab = 
  | 'presets' 
  | 'body' 
  | 'face' 
  | 'hair' 
  | 'clothing' 
  | 'accessories' 
  | 'effects'
  | 'animations'

export function AvatarCustomizer({ 
  avatar, 
  onAvatarChange, 
  onSave, 
  onCancel 
}: AvatarCustomizerProps) {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('presets')
  const [selectedClothingType, setSelectedClothingType] = useState<'top' | 'bottom' | 'shoes'>('top')
  const [selectedAccessoryType, setSelectedAccessoryType] = useState<'head' | 'face' | 'ears' | 'neck' | 'back' | 'hands'>('head')
  const [selectedFaceFeature, setSelectedFaceFeature] = useState<'shape' | 'eyes' | 'eyebrows' | 'nose' | 'mouth' | 'makeup'>('shape')
  const [selectedHairCategory, setSelectedHairCategory] = useState<string>('all')

  const tabs = [
    { id: 'presets', name: '프리셋', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { id: 'body', name: '체형', icon: '💪', color: 'from-orange-500 to-red-500' },
    { id: 'face', name: '얼굴', icon: '😊', color: 'from-blue-500 to-cyan-500' },
    { id: 'hair', name: '헤어', icon: '💇', color: 'from-green-500 to-emerald-500' },
    { id: 'clothing', name: '의상', icon: '👔', color: 'from-indigo-500 to-purple-500' },
    { id: 'accessories', name: '액세서리', icon: '💎', color: 'from-yellow-500 to-orange-500' },
    { id: 'effects', name: '특수효과', icon: '✨', color: 'from-pink-500 to-rose-500' },
    { id: 'animations', name: '애니메이션', icon: '🎭', color: 'from-teal-500 to-cyan-500' }
  ]

  const updateAvatar = (updates: Partial<AvatarCustomization>) => {
    onAvatarChange({ ...avatar, ...updates })
  }

  const applyPreset = (preset: AvatarPreset) => {
    if (preset.customization) {
      onAvatarChange({ 
        ...avatar, 
        ...preset.customization,
        id: avatar.id,
        name: avatar.name
      })
    }
  }

  const ColorPicker = ({ colors, value, onChange, label }: { 
    colors: string[], 
    value: string, 
    onChange: (color: string) => void,
    label?: string 
  }) => (
    <div className="space-y-3">
      {label && <h4 className="text-sm font-medium text-gray-700">{label}</h4>}
      <div className="grid grid-cols-8 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              value === color 
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: value }}></div>
        <span>선택된 색상: {value}</span>
      </div>
    </div>
  )

  const renderPresets = () => (
    <div className="space-y-8">
      {/* Basic Presets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">기본 프리셋</h3>
          <span className="text-sm text-gray-500 bg-green-100 px-3 py-1 rounded-full">무료</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {basicPresets.map((preset) => (
            <button
              key={preset.id}
              className="group relative p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-center overflow-hidden"
              onClick={() => applyPreset(preset)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                  {preset.id === 'casual' ? '👕' : 
                   preset.id === 'formal' ? '🤵' : 
                   preset.id === 'sporty' ? '🏃' : '👤'}
                </div>
                <p className="text-sm font-semibold text-gray-800">{preset.name}</p>
                <p className="text-xs text-gray-500 mt-1">클릭하여 적용</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Presets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">프리미엄 프리셋</h3>
          <span className="text-sm text-gray-500 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">유료</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {premiumPresets.map((preset) => (
            <button
              key={preset.id}
              className="group relative p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl hover:shadow-2xl transition-all duration-300 text-center overflow-hidden"
              onClick={() => applyPreset(preset)}
            >
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {preset.price} FLUX
                </div>
              </div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg">
                  {preset.id === 'cyberpunk' ? '🤖' : 
                   preset.id === 'fantasy' ? '🧙' : 
                   preset.id === 'steampunk' ? '⚙️' : '✨'}
                </div>
                <p className="text-sm font-semibold text-gray-800">{preset.name}</p>
                <p className="text-xs text-gray-500 mt-1">프리미엄</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seasonal Presets */}
      <div>
        <h3 className="text-lg font-semibold mb-3">시즌 한정</h3>
        <div className="grid grid-cols-3 gap-4">
          {seasonalPresets.map((preset) => (
            <button
              key={preset.id}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center relative"
              onClick={() => applyPreset(preset)}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">{preset.name}</p>
              <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                시즌 한정
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBody = () => (
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">체형 선택</h4>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
            {bodyTypes.map((type) => (
            <button
              key={type.id}
              className={`p-4 border-2 rounded-xl transition-all text-center ${
                avatar.body?.type === type.id.replace('body-', '') 
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => updateAvatar({
                body: { ...avatar.body!, type: type.id.replace('body-', '') as any }
              })}
            >
              <div className="w-16 h-20 mx-auto mb-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg" 
                style={{
                  width: type.id === 'body-slim' ? '48px' :
                         type.id === 'body-athletic' ? '64px' :
                         type.id === 'body-bulky' ? '72px' : '56px'
                }}
              ></div>
              <p className="text-sm font-medium">{type.name}</p>
            </button>
            ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">세부 조정</h4>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">키</label>
              <span className="text-sm font-bold text-blue-600">
                {((avatar.body?.height || 1.0) * 170).toFixed(0)}cm
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.01"
              value={avatar.body?.height || 1.0}
              onChange={(e) => updateAvatar({
                body: { ...avatar.body!, height: parseFloat(e.target.value) }
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>150cm</span>
              <span>170cm</span>
              <span>190cm</span>
            </div>
          </div>

          <div>
            <ColorPicker
              label="피부색"
              colors={skinColors}
              value={avatar.body?.skinColor || '#FDBCB4'}
              onChange={(color) => updateAvatar({
                body: { ...avatar.body!, skinColor: color }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderFace = () => {
    const faceFeatureTabs = [
      { id: 'shape', label: '얼굴형', icon: '😊' },
      { id: 'eyes', label: '눈', icon: '👁️' },
      { id: 'eyebrows', label: '눈썹', icon: '🤨' },
      { id: 'nose', label: '코', icon: '👃' },
      { id: 'mouth', label: '입', icon: '👄' },
      { id: 'makeup', label: '메이크업', icon: '💄' }
    ]

    return (
      <div className="space-y-6">
        {/* Sub-category tabs */}
        <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-lg">
          {faceFeatureTabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedFaceFeature === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedFaceFeature(tab.id as any)}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Face Shape */}
        {selectedFaceFeature === 'shape' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">얼굴형 선택</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'round', name: '둥근형', icon: '😊' },
                { id: 'oval', name: '계란형', icon: '🥰' },
                { id: 'square', name: '사각형', icon: '😐' },
                { id: 'heart', name: '하트형', icon: '😍' },
                { id: 'diamond', name: '다이아몬드형', icon: '💎' }
              ].map((shape) => (
                <button
                  key={shape.id}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    avatar.face?.shape === shape.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => updateAvatar({
                    face: { ...avatar.face!, shape: shape.id as any }
                  })}
                >
                  <div className="text-2xl mb-2">{shape.icon}</div>
                  <p className="text-sm font-medium">{shape.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Eyes */}
        {selectedFaceFeature === 'eyes' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">눈 모양</h4>
              <div className="grid grid-cols-3 gap-3">
                {faceFeatures.eyeShapes.map((eye) => (
                  <button
                    key={eye.id}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      avatar.face?.eyes?.type === eye.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateAvatar({
                      face: { 
                        ...avatar.face!, 
                        eyes: { ...avatar.face!.eyes!, type: eye.id as any }
                      }
                    })}
                  >
                    <div className="w-12 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-8 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">{eye.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ColorPicker
                label="눈 색상"
                colors={eyeColors}
                value={avatar.face?.eyes?.color || '#4A5568'}
                onChange={(color) => updateAvatar({
                  face: {
                    ...avatar.face!,
                    eyes: { ...avatar.face!.eyes!, color }
                  }
                })}
              />
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={avatar.face?.eyes?.lashes || false}
                  onChange={(e) => updateAvatar({
                    face: {
                      ...avatar.face!,
                      eyes: { ...avatar.face!.eyes!, lashes: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">속눈썹 추가</span>
              </label>
            </div>
          </div>
        )}

        {/* Eyebrows */}
        {selectedFaceFeature === 'eyebrows' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">눈썹 스타일</h4>
              <div className="grid grid-cols-3 gap-3">
                {faceFeatures.eyebrows.map((eyebrow) => (
                  <button
                    key={eyebrow.id}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      avatar.face?.eyebrows?.type === eyebrow.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateAvatar({
                      face: { 
                        ...avatar.face!, 
                        eyebrows: { 
                          ...avatar.face!.eyebrows!,
                          type: eyebrow.id as any 
                        }
                      }
                    })}
                  >
                    <div className="w-16 h-8 mx-auto mb-2 flex items-center justify-center">
                      <div className={`w-12 h-1 bg-gray-700 rounded ${
                        eyebrow.id === 'thin' ? 'h-0.5' :
                        eyebrow.id === 'thick' ? 'h-2' : 'h-1'
                      }`}></div>
                    </div>
                    <p className="text-sm font-medium">{eyebrow.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ColorPicker
                label="눈썹 색상"
                colors={hairColors}
                value={avatar.face?.eyebrows?.color || '#000000'}
                onChange={(color) => updateAvatar({
                  face: {
                    ...avatar.face!,
                    eyebrows: { ...avatar.face!.eyebrows!, color }
                  }
                })}
              />
            </div>
          </div>
        )}

        {/* Nose */}
        {selectedFaceFeature === 'nose' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">코 모양</h4>
            <div className="grid grid-cols-3 gap-3">
              {faceFeatures.noseShapes.map((nose) => (
                <button
                  key={nose.id}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    avatar.face?.nose?.type === nose.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateAvatar({
                    face: { 
                      ...avatar.face!, 
                      nose: { type: nose.id as any }
                    }
                  })}
                >
                  <div className="w-8 h-12 mx-auto mb-2 bg-gray-100 rounded-full"></div>
                  <p className="text-sm font-medium">{nose.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mouth */}
        {selectedFaceFeature === 'mouth' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">입 모양</h4>
              <div className="grid grid-cols-3 gap-3">
                {faceFeatures.mouthShapes.map((mouth) => (
                  <button
                    key={mouth.id}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      avatar.face?.mouth?.type === mouth.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateAvatar({
                      face: { 
                        ...avatar.face!, 
                        mouth: { 
                          ...avatar.face!.mouth!,
                          type: mouth.id as any 
                        }
                      }
                    })}
                  >
                    <div className="w-12 h-8 mx-auto mb-2 flex items-center justify-center">
                      <div className="w-10 h-3 bg-pink-300 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">{mouth.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ColorPicker
                label="입술 색상"
                colors={['#E4967A', '#FFB6C1', '#DC143C', '#FF69B4', '#C71585', '#8B4513', '#D2691E', '#F08080']}
                value={avatar.face?.mouth?.lipColor || '#E4967A'}
                onChange={(color) => updateAvatar({
                  face: {
                    ...avatar.face!,
                    mouth: { ...avatar.face!.mouth!, lipColor: color }
                  }
                })}
              />
            </div>
          </div>
        )}

        {/* Makeup */}
        {selectedFaceFeature === 'makeup' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">메이크업 옵션</h4>
              
              {/* Blush */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">블러셔</span>
                  <input
                    type="checkbox"
                    checked={avatar.face?.makeup?.blush || false}
                    onChange={(e) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, blush: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                {avatar.face?.makeup?.blush && (
                  <ColorPicker
                    colors={['#FFB6C1', '#FFC0CB', '#FF69B4', '#DB7093', '#C71585', '#FFE4E1']}
                    value={avatar.face?.makeup?.blushColor || '#FFB6C1'}
                    onChange={(color) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, blushColor: color }
                      }
                    })}
                  />
                )}
              </div>

              {/* Eyeshadow */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">아이섬도</span>
                  <input
                    type="checkbox"
                    checked={avatar.face?.makeup?.eyeshadow || false}
                    onChange={(e) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, eyeshadow: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                {avatar.face?.makeup?.eyeshadow && (
                  <ColorPicker
                    colors={['#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3', '#9370DB', '#8B008B', '#4B0082']}
                    value={avatar.face?.makeup?.eyeshadowColor || '#DDA0DD'}
                    onChange={(color) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, eyeshadowColor: color }
                      }
                    })}
                  />
                )}
              </div>

              {/* Lipstick */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">립스틱</span>
                  <input
                    type="checkbox"
                    checked={avatar.face?.makeup?.lipstick || false}
                    onChange={(e) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, lipstick: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                {avatar.face?.makeup?.lipstick && (
                  <ColorPicker
                    colors={['#DC143C', '#FF1493', '#C71585', '#DB7093', '#FF69B4', '#FF6347', '#CD5C5C', '#F08080']}
                    value={avatar.face?.makeup?.lipstickColor || '#DC143C'}
                    onChange={(color) => updateAvatar({
                      face: {
                        ...avatar.face!,
                        makeup: { ...avatar.face!.makeup!, lipstickColor: color }
                      }
                    })}
                  />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">수염</h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className={`p-4 border-2 rounded-xl transition-all ${
                    !avatar.face?.facialHair 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateAvatar({
                    face: { ...avatar.face!, facialHair: undefined }
                  })}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full"></div>
                  <p className="text-sm font-medium">없음</p>
                </button>
                {facialHair.map((facial) => (
                  <button
                    key={facial.id}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      avatar.face?.facialHair === facial.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateAvatar({
                      face: { ...avatar.face!, facialHair: facial.id as any }
                    })}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-8 h-3 bg-gray-700 rounded"></div>
                    </div>
                    <p className="text-sm font-medium">{facial.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderHair = () => {
    const hairCategories = [
      { id: 'all', name: '전체', icon: '💇' },
      { id: 'short', name: '짧은 머리', icon: '👱' },
      { id: 'medium', name: '중간 길이', icon: '👩' },
      { id: 'long', name: '긴 머리', icon: '👸' },
      { id: 'special', name: '특별한', icon: '🌈' }
    ]
    
    const filteredHairStyles = selectedHairCategory === 'all' 
      ? hairStyles 
      : hairStyles.filter(style => (style as any).category === selectedHairCategory)
    
    return (
      <div className="space-y-8">
        {/* 카테고리 선택 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">헤어 카테고리</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {hairCategories.map((category) => (
              <button
                key={category.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedHairCategory === category.id 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedHairCategory(category.id)}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* 헤어스타일 선택 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            {selectedHairCategory === 'all' ? '모든 헤어스타일' : 
             hairCategories.find(c => c.id === selectedHairCategory)?.name}
          </h4>
          <div className="grid grid-cols-4 gap-4">
            {filteredHairStyles.map((style) => {
              const getHairPreview = (styleId: string) => {
                if (styleId === 'bald') return { height: '0px', opacity: 0 }
                if (styleId.includes('long') || styleId === 'beach-waves' || styleId === 'loose-curls') {
                  return { height: '80px', borderRadius: '50% 50% 20% 20%' }
                }
                if (styleId.includes('short') || styleId === 'pixie' || styleId === 'bob') {
                  return { height: '48px', borderRadius: '50% 50% 30% 30%' }
                }
                if (styleId === 'ponytail' || styleId.includes('ponytail')) {
                  return { height: '56px', borderRadius: '50% 50% 60% 20%' }
                }
                if (styleId === 'pigtails' || styleId === 'twin-buns' || styleId === 'space-buns') {
                  return { height: '52px', borderRadius: '50% 50% 40% 40%' }
                }
                if (styleId.includes('braid')) {
                  return { height: '64px', borderRadius: '50% 50% 15% 15%' }
                }
                if (styleId === 'afro' || styleId === 'dreadlocks') {
                  return { height: '72px', borderRadius: '50%' }
                }
                return { height: '56px', borderRadius: '50% 50% 25% 25%' }
              }
              
              const hairPreview = getHairPreview(style.id)
              
              return (
                <button
                  key={style.id}
                  className={`p-4 border-2 rounded-xl text-center transition-all hover:shadow-lg ${
                    avatar.hair?.style === style.id 
                      ? 'border-purple-500 bg-purple-50 shadow-md transform scale-105' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  onClick={() => updateAvatar({
                    hair: { ...avatar.hair!, style: style.id }
                  })}
                >
                  <div 
                    className="w-16 mx-auto mb-3 bg-gradient-to-b transition-all relative" 
                    style={{
                      height: hairPreview.height,
                      borderRadius: hairPreview.borderRadius,
                      background: style.id === 'bald' ? 'transparent' : 
                        `linear-gradient(to bottom, ${avatar.hair?.color || '#8B4513'}, ${avatar.hair?.color || '#654321'})`,
                      opacity: hairPreview.opacity || 1
                    }}
                  >
                    {/* 전용 스타일 이펙트 */}
                    {style.id === 'ponytail' && (
                      <div 
                        className="absolute w-2 h-8 rounded-full top-5 left-8" 
                        style={{
                          background: avatar.hair?.color || '#8B4513'
                        }}
                      />
                    )}
                    {style.id === 'pigtails' && (
                      <>
                        <div 
                          className="absolute w-1.5 h-6 rounded-full top-4 left-2" 
                          style={{
                            background: avatar.hair?.color || '#8B4513'
                          }}
                        />
                        <div 
                          className="absolute w-1.5 h-6 rounded-full top-4 right-2" 
                          style={{
                            background: avatar.hair?.color || '#8B4513'
                          }}
                        />
                      </>
                    )}
                    {(style.id === 'twin-buns' || style.id === 'space-buns') && (
                      <>
                        <div 
                          className="absolute w-3 h-3 rounded-full -top-1 left-3" 
                          style={{
                            background: avatar.hair?.color || '#8B4513'
                          }}
                        />
                        <div 
                          className="absolute w-3 h-3 rounded-full -top-1 right-3" 
                          style={{
                            background: avatar.hair?.color || '#8B4513'
                          }}
                        />
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{style.name}</p>
                  {(style as any).category && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(style as any).category === 'long' ? '긴 머리' :
                       (style as any).category === 'short' ? '짧은 머리' :
                       (style as any).category === 'medium' ? '중간 길이' :
                       (style as any).category === 'special' ? '특별한' : ''}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
          <div>
            <ColorPicker
              label="기본 머리색"
              colors={hairColors}
              value={avatar.hair?.color || '#2D3748'}
              onChange={(color) => updateAvatar({
                hair: { ...avatar.hair!, color }
              })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">하이라이트</h4>
              <button
                onClick={() => updateAvatar({
                  hair: { ...avatar.hair!, highlights: undefined }
                })}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                제거
              </button>
            </div>
            <ColorPicker
              colors={['#FFD700', '#FF69B4', '#9370DB', '#00CED1', '#FF6347', '#98FB98']}
              value={avatar.hair?.highlights || ''}
              onChange={(color) => updateAvatar({
                hair: { ...avatar.hair!, highlights: color }
              })}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderClothing = () => {
    const clothingItems = 
      selectedClothingType === 'top' ? clothingTops :
      selectedClothingType === 'bottom' ? clothingBottoms : shoes

    return (
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">의상 카테고리</h4>
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'top', label: '상의', icon: '👕' },
              { key: 'bottom', label: '하의', icon: '👖' },
              { key: 'shoes', label: '신발', icon: '👟' }
            ].map((type) => (
              <button
                key={type.key}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedClothingType === type.key 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedClothingType(type.key as any)}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* 제거 옵션 */}
            <button
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 text-center transition-all"
              onClick={() => updateAvatar({
                clothing: {
                  ...avatar.clothing!,
                  [selectedClothingType]: { id: '', name: '없음', type: '', style: '', color: '' }
                }
              })}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
              <p className="text-sm font-medium text-gray-600">제거</p>
            </button>

            {clothingItems.map((item) => (
              <button
                key={item.id}
                className={`p-4 border-2 rounded-xl text-center transition-all hover:shadow-md ${
                  avatar.clothing?.[selectedClothingType]?.id === item.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateAvatar({
                  clothing: {
                    ...avatar.clothing!,
                    [selectedClothingType]: item
                  }
                })}
              >
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.style}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAccessories = () => {
    const accessories = 
      selectedAccessoryType === 'head' ? headAccessories :
      selectedAccessoryType === 'face' ? faceAccessories :
      selectedAccessoryType === 'ears' ? earAccessories :
      selectedAccessoryType === 'neck' ? neckAccessories :
      selectedAccessoryType === 'back' ? backAccessories : handAccessories

    return (
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">액세서리 카테고리</h4>
          <div className="flex space-x-2 mb-6 flex-wrap gap-2">
            {[
              { key: 'head', label: '머리', icon: '🎩' },
              { key: 'face', label: '얼굴', icon: '👓' },
              { key: 'ears', label: '귀', icon: '👂' },
              { key: 'neck', label: '목', icon: '📿' },
              { key: 'back', label: '등', icon: '🎒' },
              { key: 'hands', label: '손', icon: '🧤' }
            ].map((type) => (
              <button
                key={type.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAccessoryType === type.key 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedAccessoryType(type.key as any)}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 text-center transition-all"
              onClick={() => updateAvatar({
                accessories: {
                  ...avatar.accessories!,
                  [selectedAccessoryType]: undefined
                }
              })}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
              <p className="text-sm font-medium text-gray-600">제거</p>
            </button>
            
            {accessories.map((accessory) => (
              <button
                key={accessory.id}
                className={`p-4 border-2 rounded-xl text-center transition-all hover:shadow-md ${
                  avatar.accessories?.[selectedAccessoryType]?.id === accessory.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateAvatar({
                  accessories: {
                    ...avatar.accessories!,
                    [selectedAccessoryType]: accessory
                  }
                })}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                  accessory.glow ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                }`}>
                  <span className="text-2xl">
                    {selectedAccessoryType === 'head' ? '🎩' :
                     selectedAccessoryType === 'face' ? '👓' :
                     selectedAccessoryType === 'ears' ? '👂' :
                     selectedAccessoryType === 'neck' ? '📿' :
                     selectedAccessoryType === 'back' ? '🎒' : '🧤'}
                  </span>
                </div>
                <p className="text-sm font-medium">{accessory.name}</p>
                <p className="text-xs text-gray-500">{accessory.type}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderEffects = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-6">특수 효과 선택</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* 효과 제거 */}
          <button
            className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all hover:shadow-lg group ${
              (!avatar.effects || avatar.effects.length === 0) 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => updateAvatar({
              effects: []
            })}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-3xl">🚫</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">효과 없음</p>
            <p className="text-xs text-gray-500 mt-1">모든 효과 제거</p>
          </button>

          {specialEffects.map((effect) => {
            const isSelected = avatar.effects?.some(e => e.id === effect.id)
            return (
              <button
                key={effect.id}
                className={`p-6 border-2 rounded-2xl text-center transition-all hover:shadow-lg group ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
                onClick={() => {
                  const currentEffects = avatar.effects || []
                  const newEffects = isSelected 
                    ? currentEffects.filter(e => e.id !== effect.id)
                    : [...currentEffects.filter(e => e.id !== effect.id), effect]
                  updateAvatar({ effects: newEffects })
                }}
              >
                <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all ${
                  effect.glow 
                    ? 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 ring-4 ring-yellow-300 shadow-2xl animate-pulse' 
                    : effect.particle
                    ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 ring-2 ring-blue-300 shadow-xl'
                    : effect.trail
                    ? 'bg-gradient-to-br from-green-400 via-teal-500 to-cyan-600 ring-2 ring-green-300 shadow-lg'
                    : 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-md'
                }`}>
                  <span className="text-3xl filter drop-shadow-sm">
                    {effect.glow ? '✨' : 
                     effect.particle ? '🌟' :
                     effect.trail ? '💫' : '🔮'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{effect.name}</p>
                <p className="text-xs text-gray-500 mt-1">{effect.description || '특수 효과'}</p>
                
                {/* 효과 강도 표시 */}
                <div className="mt-3 flex justify-center space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div 
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full ${
                        (effect.intensity || 2) >= level ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 효과 설정 */}
      {avatar.effects && avatar.effects.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-800 mb-4">🎭 적용된 효과</h4>
          <div className="space-y-3">
            {avatar.effects.map((effect, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">✨</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{effect.name}</span>
                </div>
                <button
                  onClick={() => {
                    const newEffects = avatar.effects!.filter((_, i) => i !== index)
                    updateAvatar({ effects: newEffects })
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 효과 정보 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">특수효과 가이드</p>
            <p className="text-xs text-blue-800">
              • ✨ 글로우: 아바타 주변에 빛나는 후광 효과<br/>
              • 🌟 파티클: 반짝이는 입자가 떠다니는 효과<br/>
              • 💫 트레일: 움직일 때 잔상이 남는 효과<br/>
              • 여러 효과를 동시에 적용할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnimations = () => (
    <div className="space-y-8">
      {/* 애니메이션 세트 선택 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-6">애니메이션 세트</h4>
        <div className="grid grid-cols-2 gap-4">
          {animationSets.map((anim) => {
            const isSelected = avatar.animationSet === anim.id
            return (
              <button
                key={anim.id}
                className={`p-6 border-2 rounded-2xl transition-all hover:shadow-lg group ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:border-teal-300 hover:bg-teal-25'
                }`}
                onClick={() => updateAvatar({
                  animationSet: anim.id as any
                })}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all ${
                    anim.id === 'casual' 
                      ? 'bg-gradient-to-br from-blue-400 to-cyan-600' 
                      : anim.id === 'elegant'
                      ? 'bg-gradient-to-br from-purple-400 to-pink-600'
                      : anim.id === 'sporty'
                      ? 'bg-gradient-to-br from-green-400 to-teal-600'
                      : anim.id === 'dramatic'
                      ? 'bg-gradient-to-br from-red-400 to-orange-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <span className="text-3xl text-white filter drop-shadow-sm">
                      {anim.id === 'casual' ? '🚁' :
                       anim.id === 'elegant' ? '🎭' :
                       anim.id === 'sporty' ? '🏃' :
                       anim.id === 'dramatic' ? '🎨' : '🕰'}
                    </span>
                  </div>
                  
                  <h5 className="text-lg font-bold text-gray-800 mb-2">{anim.name}</h5>
                  <p className="text-sm text-gray-600 mb-3">{anim.description}</p>
                  
                  {/* 애니메이션 예시 */}
                  <div className="flex justify-center space-x-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">대기</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">걸기</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">달리기</span>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="mt-4 flex justify-center">
                    <div className="bg-teal-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      ✓ 선택됨
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 이모티콘 선택 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-6">이모티콘 애니메이션</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'wave', name: '인사', icon: '👋', color: 'from-yellow-400 to-orange-500' },
            { id: 'clap', name: '박수', icon: '👏', color: 'from-green-400 to-teal-500' },
            { id: 'dance', name: '댄스', icon: '💃', color: 'from-pink-400 to-rose-500' },
            { id: 'thumbsup', name: '좋아요', icon: '👍', color: 'from-blue-400 to-cyan-500' },
            { id: 'thinking', name: '생각', icon: '🤔', color: 'from-purple-400 to-indigo-500' },
            { id: 'celebrate', name: '축하', icon: '🎉', color: 'from-red-400 to-pink-500' },
            { id: 'bow', name: '인사', icon: '🙇', color: 'from-indigo-400 to-purple-500' },
            { id: 'point', name: '가리기', icon: '👉', color: 'from-teal-400 to-green-500' }
          ].map((emote) => {
            const isSelected = avatar.animations?.emotes?.includes(emote.id as any)
            return (
              <button
                key={emote.id}
                className={`p-4 border-2 rounded-xl transition-all hover:shadow-md group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 transform scale-105'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  const currentEmotes = avatar.animations?.emotes || []
                  const newEmotes = isSelected
                    ? currentEmotes.filter(e => e !== emote.id)
                    : [...currentEmotes, emote.id as any]
                  updateAvatar({
                    animations: {
                      ...avatar.animations!,
                      emotes: newEmotes
                    }
                  })
                }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${emote.color} rounded-lg mx-auto mb-2 flex items-center justify-center shadow-sm`}>
                  <span className="text-xl text-white filter drop-shadow-sm">{emote.icon}</span>
                </div>
                <p className="text-xs font-medium text-gray-700">{emote.name}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 이모티콘 목록 */}
      {avatar.animations?.emotes && avatar.animations.emotes.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
          <h4 className="text-sm font-semibold text-teal-800 mb-4">🎭 선택된 이모티콘</h4>
          <div className="flex flex-wrap gap-2">
            {avatar.animations.emotes.map((emoteId, index) => {
              const emote = [
                { id: 'wave', name: '인사', icon: '👋' },
                { id: 'clap', name: '박수', icon: '👏' },
                { id: 'dance', name: '댄스', icon: '💃' },
                { id: 'thumbsup', name: '좋아요', icon: '👍' },
                { id: 'thinking', name: '생각', icon: '🤔' },
                { id: 'celebrate', name: '축하', icon: '🎉' },
                { id: 'bow', name: '인사', icon: '🙇' },
                { id: 'point', name: '가리기', icon: '👉' }
              ].find(e => e.id === emoteId)
              
              return emote ? (
                <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm">{emote.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{emote.name}</span>
                  <button
                    onClick={() => {
                      const newEmotes = avatar.animations!.emotes!.filter(e => e !== emoteId)
                      updateAvatar({
                        animations: {
                          ...avatar.animations!,
                          emotes: newEmotes
                        }
                      })
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
      
      {/* 애니메이션 정보 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">애니메이션 가이드</p>
            <p className="text-xs text-blue-800">
              • 애니메이션 세트: 기본 동작(대기/걸기/달리기) 스타일<br/>
              • 이모티콘: 소통과 상호작용용 제스처 애니메이션<br/>
              • 여러 이모티콘을 조합하여 다양한 표현 가능<br/>
              • 멀티플레이어에서 다른 사용자와 의사소통 지원
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'presets': return renderPresets()
      case 'body': return renderBody()
      case 'face': return renderFace()
      case 'hair': return renderHair()
      case 'clothing': return renderClothing()
      case 'accessories': return renderAccessories()
      case 'effects': return renderEffects()
      case 'animations': return renderAnimations()
      default: return null
    }
  }

  return (
    <div className="flex h-[800px] bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-md">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">커스터마이징 메뉴</h3>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105` 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as CustomizerTab)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
              {activeTab === tab.id && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="h-full">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'presets' && '미리 제작된 스타일을 선택하세요'}
              {activeTab === 'body' && '체형과 신체 비율을 조정하세요'}
              {activeTab === 'face' && '얼굴 특징을 세밀하게 조정하세요'}
              {activeTab === 'hair' && '헤어스타일과 색상을 선택하세요'}
              {activeTab === 'clothing' && '다양한 의상을 착용해보세요'}
              {activeTab === 'accessories' && '액세서리로 개성을 표현하세요'}
              {activeTab === 'effects' && '특별한 효과를 추가하세요'}
              {activeTab === 'animations' && '움직임과 제스처를 설정하세요'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm max-h-[calc(100%-100px)] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Preview & Actions */}
      <div className="w-96 bg-white p-6 shadow-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">미리보기</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl overflow-hidden shadow-inner">
            <AvatarPreview3D avatar={avatar} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Avatar Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">이름</span>
              <span className="text-sm font-bold text-gray-800">{avatar.name || '새 아바타'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">타입</span>
              <span className="text-sm font-bold text-gray-800">{avatar.type || 'humanoid'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onSave}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-md"
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              저장하기
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              취소
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">프로 팁</p>
                <p className="text-xs text-yellow-800">
                  오른쪽 마우스로 회전, 스크롤로 확대/축소할 수 있어요!
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              사용 가능한 FLUX: <span className="font-bold text-blue-600">1,250</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}