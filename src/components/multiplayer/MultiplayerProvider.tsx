'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useMultiplayer } from '@/hooks/useMultiplayer'
import type { PlayerState, ChatMessage, Vector3, Quaternion } from '@/lib/multiplayer/types'

interface MultiplayerContextType {
  isConnected: boolean
  players: PlayerState[]
  error: Error | null
  updatePosition: (position: Vector3) => void
  updateRotation: (rotation: Quaternion) => void
  updateAnimation: (animation: string) => void
  sendChatMessage: (message: string) => void
  getPlayer: (playerId: string) => PlayerState | undefined
  getLocalPlayer: () => PlayerState | null
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null)

interface MultiplayerProviderProps {
  children: ReactNode
  worldId: string
  userId: string
  username: string
  serverUrl?: string
  onPlayerJoined?: (player: PlayerState) => void
  onPlayerLeft?: (playerId: string) => void
  onChatMessage?: (message: ChatMessage) => void
}

export function MultiplayerProvider({
  children,
  worldId,
  userId,
  username,
  serverUrl = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER || 'http://localhost:3001',
  onPlayerJoined,
  onPlayerLeft,
  onChatMessage
}: MultiplayerProviderProps) {
  const multiplayer = useMultiplayer({
    serverUrl,
    worldId,
    userId,
    username,
    onPlayerJoined,
    onPlayerLeft,
    onChatMessage
  })

  return (
    <MultiplayerContext.Provider value={multiplayer}>
      {children}
    </MultiplayerContext.Provider>
  )
}

export function useMultiplayerContext() {
  const context = useContext(MultiplayerContext)
  if (!context) {
    throw new Error('useMultiplayerContext must be used within MultiplayerProvider')
  }
  return context
}