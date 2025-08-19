import { db } from '../client'
import { worlds, worldVisits, users } from '../schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { World, NewWorld, WorldVisit, NewWorldVisit } from '../types'

export class WorldService {
  // Create a new world
  async createWorld(creatorId: string, worldData: {
    name: string
    description?: string
    thumbnailUrl?: string
    visibility?: 'public' | 'private' | 'friends'
    maxPlayers?: number
    objects?: any
    settings?: any
  }): Promise<World> {
    const newWorld: NewWorld = {
      creatorId,
      name: worldData.name,
      description: worldData.description || '',
      thumbnailUrl: worldData.thumbnailUrl || null,
      visibility: worldData.visibility || 'private',
      maxPlayers: worldData.maxPlayers || 20,
      objects: worldData.objects || [],
      settings: worldData.settings || {}
    }

    const result = await db.insert(worlds).values(newWorld).returning()
    return result[0]
  }

  // Get all worlds for a user
  async getUserWorlds(userId: string): Promise<World[]> {
    return await db
      .select()
      .from(worlds)
      .where(eq(worlds.creatorId, userId))
      .orderBy(desc(worlds.updatedAt))
  }

  // Get a specific world by ID
  async getWorld(worldId: string, userId?: string): Promise<World | null> {
    const result = await db
      .select()
      .from(worlds)
      .where(eq(worlds.id, worldId))
      .limit(1)

    const world = result[0] || null
    
    // Check visibility permissions
    if (world && userId !== world.creatorId) {
      if (world.visibility === 'private') {
        return null // Private worlds not accessible
      }
      // TODO: Implement friends-only check
    }

    return world
  }

  // Update a world
  async updateWorld(
    worldId: string, 
    userId: string, 
    updates: Partial<{
      name: string
      description: string
      thumbnailUrl: string
      visibility: 'public' | 'private' | 'friends'
      maxPlayers: number
      objects: any
      settings: any
    }>
  ): Promise<World | null> {
    const result = await db
      .update(worlds)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(worlds.id, worldId), eq(worlds.creatorId, userId)))
      .returning()

    return result[0] || null
  }

  // Delete a world
  async deleteWorld(worldId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(worlds)
      .where(and(eq(worlds.id, worldId), eq(worlds.creatorId, userId)))
      .returning()

    return result.length > 0
  }

  // Get public worlds (for exploration)
  async getPublicWorlds(limit = 20, offset = 0): Promise<World[]> {
    return await db
      .select()
      .from(worlds)
      .where(eq(worlds.visibility, 'public'))
      .orderBy(desc(worlds.updatedAt))
      .limit(limit)
      .offset(offset)
  }

  // Search worlds by name or description
  async searchWorlds(query: string, limit = 20): Promise<World[]> {
    return await db
      .select()
      .from(worlds)
      .where(
        and(
          eq(worlds.visibility, 'public'),
          sql`LOWER(${worlds.name}) LIKE LOWER(${'%' + query + '%'}) OR LOWER(${worlds.description}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .orderBy(desc(worlds.updatedAt))
      .limit(limit)
  }

  // Get popular worlds (by visit count)
  async getPopularWorlds(limit = 20): Promise<Array<World & { visitCount: number }>> {
    const result = await db
      .select({
        world: worlds,
        visitCount: sql<number>`COUNT(${worldVisits.id})`
      })
      .from(worlds)
      .leftJoin(worldVisits, eq(worlds.id, worldVisits.worldId))
      .where(eq(worlds.visibility, 'public'))
      .groupBy(worlds.id)
      .orderBy(desc(sql`COUNT(${worldVisits.id})`))
      .limit(limit)

    return result.map(row => ({
      ...row.world,
      visitCount: row.visitCount
    }))
  }

  // Record a world visit
  async recordVisit(worldId: string, userId: string, duration = 0): Promise<WorldVisit> {
    const newVisit: NewWorldVisit = {
      worldId,
      userId,
      duration
    }

    const result = await db.insert(worldVisits).values(newVisit).returning()
    return result[0]
  }

  // Get world visit statistics
  async getWorldStats(worldId: string): Promise<{
    totalVisits: number
    uniqueVisitors: number
    averageDuration: number
    recentVisits: WorldVisit[]
  }> {
    const [totalVisits] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(worldVisits)
      .where(eq(worldVisits.worldId, worldId))

    const [uniqueVisitors] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${worldVisits.userId})` })
      .from(worldVisits)
      .where(eq(worldVisits.worldId, worldId))

    const [averageDuration] = await db
      .select({ avg: sql<number>`AVG(${worldVisits.duration})` })
      .from(worldVisits)
      .where(eq(worldVisits.worldId, worldId))

    const recentVisits = await db
      .select()
      .from(worldVisits)
      .where(eq(worldVisits.worldId, worldId))
      .orderBy(desc(worldVisits.visitedAt))
      .limit(10)

    return {
      totalVisits: totalVisits.count,
      uniqueVisitors: uniqueVisitors.count,
      averageDuration: averageDuration.avg || 0,
      recentVisits
    }
  }

  // Get user's world visit history
  async getUserVisitHistory(userId: string, limit = 50): Promise<Array<WorldVisit & { world: World }>> {
    const result = await db
      .select({
        visit: worldVisits,
        world: worlds
      })
      .from(worldVisits)
      .innerJoin(worlds, eq(worldVisits.worldId, worlds.id))
      .where(eq(worldVisits.userId, userId))
      .orderBy(desc(worldVisits.visitedAt))
      .limit(limit)

    return result.map(row => ({
      ...row.visit,
      world: row.world
    }))
  }

  // Duplicate a world
  async duplicateWorld(worldId: string, userId: string, newName?: string): Promise<World | null> {
    const originalWorld = await this.getWorld(worldId, userId)
    if (!originalWorld) return null

    // Check if user has permission to duplicate (must be owner or world must be public)
    if (originalWorld.creatorId !== userId && originalWorld.visibility === 'private') {
      return null
    }

    const duplicatedWorld = await this.createWorld(userId, {
      name: newName || `${originalWorld.name} 복사본`,
      description: originalWorld.description || '',
      thumbnailUrl: originalWorld.thumbnailUrl || undefined,
      visibility: 'private', // Duplicated worlds start as private
      maxPlayers: originalWorld.maxPlayers || 20,
      objects: originalWorld.objects,
      settings: originalWorld.settings
    })

    return duplicatedWorld
  }

  // Migrate from localStorage data
  async migrateFromLocalStorage(
    userId: string, 
    localWorlds: Array<{
      name: string
      description?: string
      objects?: any
      settings?: any
    }>
  ): Promise<World[]> {
    const migratedWorlds: World[] = []

    for (const localWorld of localWorlds) {
      try {
        const world = await this.createWorld(userId, {
          name: localWorld.name,
          description: localWorld.description || '',
          objects: localWorld.objects || [],
          settings: localWorld.settings || {},
          visibility: 'private' // Migrated worlds start as private
        })
        migratedWorlds.push(world)
      } catch (error) {
        console.error(`Failed to migrate world ${localWorld.name}:`, error)
      }
    }

    return migratedWorlds
  }

  // Export user's worlds
  async exportWorlds(userId: string): Promise<string> {
    const userWorlds = await this.getUserWorlds(userId)
    return JSON.stringify({
      worlds: userWorlds,
      exportedAt: new Date().toISOString(),
      userId
    })
  }

  // Import worlds from export data
  async importWorlds(userId: string, exportData: string): Promise<World[]> {
    try {
      const parsed = JSON.parse(exportData)
      if (parsed.worlds && Array.isArray(parsed.worlds)) {
        const importedWorlds: World[] = []
        
        for (const worldData of parsed.worlds) {
          try {
            const world = await this.createWorld(userId, {
              name: `${worldData.name} (임포트됨)`,
              description: worldData.description || '',
              objects: worldData.objects || [],
              settings: worldData.settings || {},
              visibility: 'private' // Imported worlds start as private
            })
            importedWorlds.push(world)
          } catch (error) {
            console.error(`Failed to import world ${worldData.name}:`, error)
          }
        }
        
        return importedWorlds
      }
    } catch (error) {
      console.error('Failed to parse import data:', error)
    }
    
    return []
  }
}