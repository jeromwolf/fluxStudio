#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const migrations = [
  // Avatar system
  { from: 'src/components/avatar', to: 'src/features/avatar/components' },
  { from: 'src/lib/avatar', to: 'src/features/avatar/lib' },
  
  // World builder
  { from: 'src/lib/world-builder', to: 'src/features/world-builder/lib' },
  { from: 'src/components/world-builder', to: 'src/features/world-builder/components' },
  
  // Multiplayer
  { from: 'src/components/multiplayer', to: 'src/features/multiplayer/components' },
  { from: 'src/lib/webrtc', to: 'src/features/multiplayer/lib/webrtc' },
  
  // UI components
  { from: 'src/components/ui', to: 'src/shared/ui/components' },
  
  // Hooks
  { from: 'src/hooks', to: 'src/shared/hooks' },
  
  // Utils
  { from: 'src/utils', to: 'src/shared/utils' },
]

function moveDirectory(from: string, to: string) {
  const fromPath = path.join(process.cwd(), from)
  const toPath = path.join(process.cwd(), to)
  
  if (!fs.existsSync(fromPath)) {
    console.log(`⚠️  Source doesn't exist: ${from}`)
    return
  }
  
  // Create target directory
  const toDir = path.dirname(toPath)
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true })
  }
  
  // Move directory
  try {
    fs.renameSync(fromPath, toPath)
    console.log(`✅ Moved: ${from} → ${to}`)
  } catch (error) {
    console.error(`❌ Failed to move ${from}:`, error)
  }
}

console.log('🚀 Starting project structure migration...\n')

migrations.forEach(({ from, to }) => {
  moveDirectory(from, to)
})

console.log('\n✨ Migration complete!')