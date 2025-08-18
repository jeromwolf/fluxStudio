import { io, Socket } from 'socket.io-client'
import { EventEmitter } from 'events'
import type {
  PlayerState,
  WorldState,
  NetworkMessage,
  ChatMessage,
  MultiplayerConfig,
  Vector3,
  Quaternion
} from './types'

export class MultiplayerClient extends EventEmitter {
  private socket: Socket | null = null
  private config: MultiplayerConfig
  private worldState: WorldState
  private localPlayer: PlayerState | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private lastUpdateTime: number = 0

  constructor(config: MultiplayerConfig) {
    super()
    this.config = {
      tickRate: 20,
      interpolation: true,
      ...config
    }
    this.worldState = {
      worldId: config.worldId,
      players: new Map(),
      maxPlayers: config.maxPlayers || 50,
      createdAt: Date.now()
    }
  }

  async connect(userId: string, username: string): Promise<void> {
    if (this.socket?.connected) {
      console.warn('Already connected to multiplayer server')
      return
    }

    this.socket = io(this.config.serverUrl, {
      transports: ['websocket', 'polling'],
      query: {
        worldId: this.config.worldId,
        userId,
        username
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.setupSocketListeners()

    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log('Connected to multiplayer server')
        this.localPlayer = {
          id: userId,
          username,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          lastUpdate: Date.now()
        }
        this.startUpdateLoop()
        resolve()
      })

      this.socket!.on('connect_error', (error) => {
        console.error('Connection error:', error)
        reject(error)
      })
    })
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    // Player joined
    this.socket.on('player_joined', (player: PlayerState) => {
      this.worldState.players.set(player.id, player)
      this.emit('playerJoined', player)
    })

    // Player left
    this.socket.on('player_left', (playerId: string) => {
      this.worldState.players.delete(playerId)
      this.emit('playerLeft', playerId)
    })

    // World state sync
    this.socket.on('world_state', (players: PlayerState[]) => {
      this.worldState.players.clear()
      players.forEach(player => {
        if (player.id !== this.localPlayer?.id) {
          this.worldState.players.set(player.id, player)
        }
      })
      this.emit('worldStateUpdate', this.worldState)
    })

    // Player position update
    this.socket.on('player_position', (data: { playerId: string; position: Vector3 }) => {
      const player = this.worldState.players.get(data.playerId)
      if (player) {
        player.position = data.position
        player.lastUpdate = Date.now()
        this.emit('playerPositionUpdate', data)
      }
    })

    // Player rotation update
    this.socket.on('player_rotation', (data: { playerId: string; rotation: Quaternion }) => {
      const player = this.worldState.players.get(data.playerId)
      if (player) {
        player.rotation = data.rotation
        player.lastUpdate = Date.now()
        this.emit('playerRotationUpdate', data)
      }
    })

    // Chat message
    this.socket.on('chat_message', (message: ChatMessage) => {
      this.emit('chatMessage', message)
    })

    // Animation update
    this.socket.on('player_animation', (data: { playerId: string; animation: string }) => {
      const player = this.worldState.players.get(data.playerId)
      if (player) {
        player.animation = data.animation
        this.emit('playerAnimationUpdate', data)
      }
    })
  }

  private startUpdateLoop(): void {
    const tickInterval = 1000 / this.config.tickRate!
    
    this.updateInterval = setInterval(() => {
      const now = Date.now()
      if (now - this.lastUpdateTime < tickInterval) return
      
      this.lastUpdateTime = now
      this.emit('tick', now)
    }, tickInterval)
  }

  updatePosition(position: Vector3): void {
    if (!this.localPlayer || !this.socket?.connected) return
    
    this.localPlayer.position = position
    this.socket.emit('update_position', position)
  }

  updateRotation(rotation: Quaternion): void {
    if (!this.localPlayer || !this.socket?.connected) return
    
    this.localPlayer.rotation = rotation
    this.socket.emit('update_rotation', rotation)
  }

  updateAnimation(animation: string): void {
    if (!this.localPlayer || !this.socket?.connected) return
    
    this.localPlayer.animation = animation
    this.socket.emit('update_animation', animation)
  }

  sendChatMessage(message: string): void {
    if (!this.socket?.connected) return
    
    this.socket.emit('chat_message', message)
  }

  getPlayers(): PlayerState[] {
    return Array.from(this.worldState.players.values())
  }

  getPlayer(playerId: string): PlayerState | undefined {
    return this.worldState.players.get(playerId)
  }

  getLocalPlayer(): PlayerState | null {
    return this.localPlayer
  }

  disconnect(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.worldState.players.clear()
    this.localPlayer = null
    this.emit('disconnected')
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}