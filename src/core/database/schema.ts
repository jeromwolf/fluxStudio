import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// NextAuth.js required tables
// Users table (compatible with NextAuth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  // Additional fields for our app
  username: text('username').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// NextAuth accounts table
export const accounts = pgTable('accounts', {
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}))

// NextAuth sessions table
export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// NextAuth verification tokens table
export const verificationTokens = pgTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

// Avatars table
export const avatars = pgTable('avatars', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  metadata: jsonb('metadata').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Worlds table
export const worlds = pgTable('worlds', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  visibility: text('visibility', { enum: ['public', 'private', 'friends'] }).default('public'),
  maxPlayers: integer('max_players').default(50),
  objects: jsonb('objects'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// World visits table
export const worldVisits = pgTable('world_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldId: uuid('world_id').references(() => worlds.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
  duration: integer('duration').default(0),
})

// Friendships table
export const friendships = pgTable('friendships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  friendId: uuid('friend_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'blocked'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  avatars: many(avatars),
  worlds: many(worlds),
  visits: many(worldVisits),
  friendships: many(friendships),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const avatarsRelations = relations(avatars, ({ one }) => ({
  user: one(users, {
    fields: [avatars.userId],
    references: [users.id],
  }),
}))

export const worldsRelations = relations(worlds, ({ one, many }) => ({
  creator: one(users, {
    fields: [worlds.creatorId],
    references: [users.id],
  }),
  visits: many(worldVisits),
}))

export const worldVisitsRelations = relations(worldVisits, ({ one }) => ({
  world: one(worlds, {
    fields: [worldVisits.worldId],
    references: [worlds.id],
  }),
  user: one(users, {
    fields: [worldVisits.userId],
    references: [users.id],
  }),
}))

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
  }),
}))