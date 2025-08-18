export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Quaternion {
  x: number
  y: number
  z: number
  w: number
}

export interface PlayerState {
  id: string
  username: string
  position: Vector3
  rotation: Quaternion
  avatarUrl?: string
  animation?: string
  lastUpdate: number
}

export interface WorldState {
  worldId: string
  players: Map<string, PlayerState>
  maxPlayers: number
  createdAt: number
}

export interface NetworkMessage {
  type: 'position' | 'rotation' | 'animation' | 'chat' | 'join' | 'leave'
  playerId: string
  data: any
  timestamp: number
}

export interface ChatMessage {
  id: string
  playerId: string
  username: string
  message: string
  timestamp: number
}

export interface MultiplayerConfig {
  serverUrl: string
  worldId: string
  maxPlayers?: number
  tickRate?: number
  interpolation?: boolean
}