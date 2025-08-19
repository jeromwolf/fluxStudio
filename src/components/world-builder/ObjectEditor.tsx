'use client'

import React from 'react'
import { PhysicsObjectEditor } from './PhysicsObjectEditor'
import type { WorldObject } from '@/lib/world-builder/object-system/types'
import * as THREE from 'three'

interface ObjectEditorProps {
  object: WorldObject
  onUpdate: (updates: Partial<WorldObject>) => void
  onDelete: () => void
  physicsEnabled: boolean
  onApplyForce?: (objectId: string, force: THREE.Vector3) => void
  onApplyImpulse?: (objectId: string, impulse: THREE.Vector3) => void
  className?: string
}

export function ObjectEditor({ 
  object,
  onUpdate, 
  onDelete,
  physicsEnabled,
  onApplyForce,
  onApplyImpulse,
  className 
}: ObjectEditorProps) {
  const handleApplyForce = (force: THREE.Vector3) => {
    if (onApplyForce) {
      onApplyForce(object.id, force)
    }
  }

  const handleApplyImpulse = (impulse: THREE.Vector3) => {
    if (onApplyImpulse) {
      onApplyImpulse(object.id, impulse)
    }
  }

  return (
    <div className={className}>
      <PhysicsObjectEditor
        object={object}
        onUpdate={onUpdate}
        onDelete={onDelete}
        physicsEnabled={physicsEnabled}
        onApplyForce={handleApplyForce}
        onApplyImpulse={handleApplyImpulse}
      />
    </div>
  )
}