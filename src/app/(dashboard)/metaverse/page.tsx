'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MultiplayerProvider } from '@/components/multiplayer/MultiplayerProvider'
import { MultiplayerScene } from '@/components/multiplayer/MultiplayerScene'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AvatarManager } from '@/components/avatar/AvatarManager'
import { WorldBuilder } from '@/components/world-builder/WorldBuilder'
import { Users, Globe, Gamepad2 } from 'lucide-react'

export default function MetaversePage() {
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)
  const [username, setUsername] = useState('')
  const [worldId, setWorldId] = useState('default-world')
  const [activeMode, setActiveMode] = useState<'join' | 'avatar' | 'world'>('join')
  
  // Generate unique user ID (in production, this would come from auth)
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('userId') || `user-${Math.random().toString(36).substr(2, 9)}`
    : ''

  // Save userId to localStorage
  if (typeof window !== 'undefined' && !localStorage.getItem('userId')) {
    localStorage.setItem('userId', userId)
  }

  const handleJoin = () => {
    if (username.trim()) {
      setIsJoined(true)
    }
  }

  if (!isJoined) {
    // Show Avatar Manager
    if (activeMode === 'avatar') {
      return (
        <div className="min-h-screen animated-gradient p-4">
          <div className="mb-4">
            <Button
              onClick={() => setActiveMode('join')}
              variant="outline"
              className="neu-button"
            >
              ← Back to Join
            </Button>
          </div>
          <AvatarManager
            onSelectAvatar={(avatar) => {
              console.log('Avatar selected:', avatar)
              setActiveMode('join')
            }}
          />
        </div>
      )
    }

    // Show World Builder
    if (activeMode === 'world') {
      return (
        <div className="min-h-screen animated-gradient">
          <div className="p-4">
            <Button
              onClick={() => setActiveMode('join')}
              variant="outline"
              className="neu-button mb-4"
            >
              ← Back to Join
            </Button>
          </div>
          <div className="h-[calc(100vh-80px)]">
            <WorldBuilder />
          </div>
        </div>
      )
    }

    // Show Join Screen
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 animated-gradient opacity-80" />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          
          {/* Glass Card */}
          <div className="relative z-10 p-8 w-full max-w-md glass-card-dark floating-card">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">
                Join Metaverse
              </h1>
              <p className="text-gray-300 text-sm">Enter a world of infinite possibilities</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                <input
                  type="text"
                  placeholder="Choose your identity"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={20}
                  className="w-full soft-input text-white placeholder:text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">World ID</label>
                <input
                  type="text"
                  placeholder="Enter world code"
                  value={worldId}
                  onChange={(e) => setWorldId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  className="w-full soft-input text-white placeholder:text-gray-500"
                />
              </div>
              
              <button
                onClick={handleJoin} 
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!username.trim()}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Enter World</span>
                  <span className="text-xl">→</span>
                </span>
              </button>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setActiveMode('avatar')}
                  className="py-2 px-4 glass-card text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-all"
                >
                  👤 Edit Avatar
                </button>
                <button
                  onClick={() => setActiveMode('world')}
                  className="py-2 px-4 glass-card text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-all"
                >
                  🏗️ Build World
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-400">Server Online</span>
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
    <MultiplayerProvider
      worldId={worldId}
      userId={userId}
      username={username}
      onPlayerJoined={(player) => {
        console.log('Player joined:', player.username)
      }}
      onPlayerLeft={(playerId) => {
        console.log('Player left:', playerId)
      }}
      onChatMessage={(message) => {
        console.log('Chat message:', message)
      }}
    >
      <div className="relative w-full h-screen">
        <MultiplayerScene className="w-full h-full" />
        
        {/* UI Overlay */}
        <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Flux Metaverse</h2>
          <p className="text-sm mt-1">World: {worldId}</p>
          <p className="text-sm">User: {username}</p>
        </div>
        
        {/* Leave button */}
        <Button
          onClick={() => setIsJoined(false)}
          className="absolute top-4 right-4"
          variant="destructive"
        >
          Leave World
        </Button>
      </div>
    </MultiplayerProvider>
  )
}