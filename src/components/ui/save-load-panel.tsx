'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Save, FolderOpen, Download, Upload, Trash2, Copy } from 'lucide-react'

interface SaveLoadPanelProps {
  type: 'avatar' | 'world'
  onSave: (name: string) => void
  onLoad: (id: string) => void
  onExport: (id: string) => void
  onImport: (file: File) => void
  onDelete: (id: string) => void
  items: Array<{
    id: string
    name: string
    createdAt: string
    updatedAt: string
    thumbnail?: string
  }>
  className?: string
}

export function SaveLoadPanel({
  type,
  onSave,
  onLoad,
  onExport,
  onImport,
  onDelete,
  items,
  className
}: SaveLoadPanelProps) {
  const [saveName, setSaveName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSaveForm, setShowSaveForm] = useState(false)

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim())
      setSaveName('')
      setShowSaveForm(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
    }
  }

  return (
    <div className={cn("glass-card p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {type === 'avatar' ? '🎭 My Avatars' : '🌍 My Worlds'}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="neu-button"
          >
            <Save className="w-4 h-4 mr-1" />
            Save New
          </Button>
          <label htmlFor={`import-${type}`}>
            <Button
              size="sm"
              variant="outline"
              as="span"
              className="neu-button cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
          </label>
          <input
            id={`import-${type}`}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Save Form */}
      {showSaveForm && (
        <div className="bg-white/10 rounded-lg p-3 space-y-2">
          <Label>Name</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={`Enter ${type} name...`}
              className="soft-input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!saveName.trim()}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowSaveForm(false)
                setSaveName('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No saved {type}s yet. Create your first one!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative p-3 rounded-lg transition-all cursor-pointer",
                "hover:bg-white/10",
                selectedId === item.id && "bg-white/20 ring-2 ring-blue-500"
              )}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Thumbnail */}
                {item.thumbnail && (
                  <div className="w-12 h-12 rounded bg-gray-700 ml-2">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedId === item.id && (
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLoad(item.id)
                    }}
                  >
                    <FolderOpen className="w-3 h-3 mr-1" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExport(item.id)
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Clone functionality could be added
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete ${item.name}?`)) {
                        onDelete(item.id)
                        if (selectedId === item.id) {
                          setSelectedId(null)
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Storage Info */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>💾 {items.length} {type}s saved</p>
        <p>📁 Data is stored locally in your browser</p>
      </div>
    </div>
  )
}