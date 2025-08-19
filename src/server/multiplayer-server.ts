import { createServer } from 'http'
import { Server } from 'socket.io'
import * as dotenv from 'dotenv'
import * as path from 'path'
import type { PlayerState, ChatMessage } from '@/lib/multiplayer/types'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

interface World {
  id: string
  players: Map<string, PlayerState>
  maxPlayers: number
}

const worlds = new Map<string, World>()
const PORT = process.env.MULTIPLAYER_PORT ? parseInt(process.env.MULTIPLAYER_PORT) : 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3456', 'http://localhost:3000', process.env.NEXT_PUBLIC_APP_URL].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Get or create world
function getWorld(worldId: string): World {
  if (!worlds.has(worldId)) {
    worlds.set(worldId, {
      id: worldId,
      players: new Map(),
      maxPlayers: 50
    })
  }
  return worlds.get(worldId)!
}

io.on('connection', (socket) => {
  const { worldId, userId, username } = socket.handshake.query as {
    worldId: string
    userId: string
    username: string
  }

  if (!worldId || !userId || !username) {
    socket.disconnect()
    return
  }

  const world = getWorld(worldId)
  
  // Check if world is full
  if (world.players.size >= world.maxPlayers) {
    socket.emit('error', 'World is full')
    socket.disconnect()
    return
  }

  // Join world room
  socket.join(worldId)

  // Create player state
  const player: PlayerState = {
    id: userId,
    username,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    lastUpdate: Date.now()
  }

  // Add player to world
  world.players.set(userId, player)

  // Send current world state to new player
  const playersArray = Array.from(world.players.values())
  socket.emit('world_state', playersArray.filter(p => p.id !== userId))

  // Notify other players
  socket.to(worldId).emit('player_joined', player)

  console.log(`Player ${username} (${userId}) joined world ${worldId}`)

  // Handle position updates
  socket.on('update_position', (position) => {
    const player = world.players.get(userId)
    if (player) {
      player.position = position
      player.lastUpdate = Date.now()
      socket.to(worldId).emit('player_position', { playerId: userId, position })
    }
  })

  // Handle rotation updates
  socket.on('update_rotation', (rotation) => {
    const player = world.players.get(userId)
    if (player) {
      player.rotation = rotation
      player.lastUpdate = Date.now()
      socket.to(worldId).emit('player_rotation', { playerId: userId, rotation })
    }
  })

  // Handle animation updates
  socket.on('update_animation', (animation) => {
    const player = world.players.get(userId)
    if (player) {
      player.animation = animation
      socket.to(worldId).emit('player_animation', { playerId: userId, animation })
    }
  })

  // Handle chat messages
  socket.on('chat_message', (message) => {
    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${userId}`,
      playerId: userId,
      username,
      message,
      timestamp: Date.now()
    }
    io.to(worldId).emit('chat_message', chatMessage)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    world.players.delete(userId)
    socket.to(worldId).emit('player_left', userId)
    console.log(`Player ${username} (${userId}) left world ${worldId}`)

    // Clean up empty worlds
    if (world.players.size === 0) {
      worlds.delete(worldId)
    }
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ Multiplayer server running on port ${PORT}`)
  console.log(`✅ CORS enabled for: ${['http://localhost:3456', 'http://localhost:3000', process.env.NEXT_PUBLIC_APP_URL].filter(Boolean).join(', ')}`)
  console.log(`✅ Environment: MULTIPLAYER_PORT=${process.env.MULTIPLAYER_PORT}, NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL}`)
})

// Clean up inactive players periodically
setInterval(() => {
  const now = Date.now()
  const timeout = 30000 // 30 seconds

  worlds.forEach((world) => {
    world.players.forEach((player, playerId) => {
      if (now - player.lastUpdate > timeout) {
        world.players.delete(playerId)
        io.to(world.id).emit('player_left', playerId)
      }
    })

    // Remove empty worlds
    if (world.players.size === 0) {
      worlds.delete(world.id)
    }
  })
}, 10000) // Check every 10 seconds