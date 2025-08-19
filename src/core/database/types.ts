import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { users, avatars, worlds, worldVisits, friendships } from './schema'

// Select types (for queries)
export type User = InferSelectModel<typeof users>
export type Avatar = InferSelectModel<typeof avatars>
export type World = InferSelectModel<typeof worlds>
export type WorldVisit = InferSelectModel<typeof worldVisits>
export type Friendship = InferSelectModel<typeof friendships>

// Insert types (for mutations)
export type NewUser = InferInsertModel<typeof users>
export type NewAvatar = InferInsertModel<typeof avatars>
export type NewWorld = InferInsertModel<typeof worlds>
export type NewWorldVisit = InferInsertModel<typeof worldVisits>
export type NewFriendship = InferInsertModel<typeof friendships>

// Avatar metadata types
export interface AvatarMetadata {
  type: 'humanoid' | 'creature' | 'robot'
  color: string
  accessories: string[]
  animations: string[]
}

// World settings types
export interface WorldSettings {
  theme: string
  lighting: 'day' | 'night' | 'sunset' | 'custom'
  weather: 'clear' | 'rain' | 'snow' | 'fog'
  physics: {
    gravity: number
    wind: number
  }
  audio: {
    ambientSound: string
    musicVolume: number
  }
}

// World object types
export interface WorldObject {
  id: string
  type: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  properties: Record<string, any>
}