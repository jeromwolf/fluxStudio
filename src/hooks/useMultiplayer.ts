import { useEffect, useRef, useCallback, useState } from 'react'
import { MultiplayerClient } from '@/lib/multiplayer/client'
import type { PlayerState, ChatMessage, Vector3, Quaternion } from '@/lib/multiplayer/types'

interface UseMultiplayerOptions {
  serverUrl: string
  worldId: string
  userId: string
  username: string
  onPlayerJoined?: (player: PlayerState) => void
  onPlayerLeft?: (playerId: string) => void
  onChatMessage?: (message: ChatMessage) => void
}

export function useMultiplayer({
  serverUrl,
  worldId,
  userId,
  username,
  onPlayerJoined,
  onPlayerLeft,
  onChatMessage
}: UseMultiplayerOptions) {
  const clientRef = useRef<MultiplayerClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Initialize client
  useEffect(() => {
    const client = new MultiplayerClient({
      serverUrl,
      worldId,
      maxPlayers: 50,
      tickRate: 20,
      interpolation: true
    })

    clientRef.current = client

    // Setup event listeners
    client.on('playerJoined', (player: PlayerState) => {
      setPlayers(client.getPlayers())
      onPlayerJoined?.(player)
    })

    client.on('playerLeft', (playerId: string) => {
      setPlayers(client.getPlayers())
      onPlayerLeft?.(playerId)
    })

    client.on('worldStateUpdate', () => {
      setPlayers(client.getPlayers())
    })

    client.on('chatMessage', (message: ChatMessage) => {
      onChatMessage?.(message)
    })

    client.on('disconnected', () => {
      setIsConnected(false)
      setPlayers([])
    })

    // Connect to server
    client.connect(userId, username)
      .then(() => {
        setIsConnected(true)
        setError(null)
      })
      .catch((err) => {
        setError(err)
        setIsConnected(false)
      })

    // Cleanup
    return () => {
      client.disconnect()
    }
  }, [serverUrl, worldId, userId, username, onPlayerJoined, onPlayerLeft, onChatMessage])

  // Position update
  const updatePosition = useCallback((position: Vector3) => {
    clientRef.current?.updatePosition(position)
  }, [])

  // Rotation update
  const updateRotation = useCallback((rotation: Quaternion) => {
    clientRef.current?.updateRotation(rotation)
  }, [])

  // Animation update
  const updateAnimation = useCallback((animation: string) => {
    clientRef.current?.updateAnimation(animation)
  }, [])

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    clientRef.current?.sendChatMessage(message)
  }, [])

  // Get specific player
  const getPlayer = useCallback((playerId: string): PlayerState | undefined => {
    return clientRef.current?.getPlayer(playerId)
  }, [])

  // Get local player
  const getLocalPlayer = useCallback((): PlayerState | null => {
    return clientRef.current?.getLocalPlayer() || null
  }, [])

  return {
    isConnected,
    players,
    error,
    updatePosition,
    updateRotation,
    updateAnimation,
    sendChatMessage,
    getPlayer,
    getLocalPlayer
  }
}