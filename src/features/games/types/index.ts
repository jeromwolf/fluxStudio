// Game System Types
import { Object3D } from 'three';

export enum GameState {
  IDLE = 'idle',
  STARTING = 'starting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  duration?: number; // in seconds
  category: GameCategory;
}

export enum GameCategory {
  COLLECTION = 'collection',
  RACING = 'racing',
  PUZZLE = 'puzzle',
  ACTION = 'action',
  SOCIAL = 'social',
}

export interface GameInstance {
  id: string;
  config: GameConfig;
  state: GameState;
  players: GamePlayer[];
  startTime?: number;
  endTime?: number;
  scores: Map<string, number>;
  data: any; // Game-specific data
}

export interface GamePlayer {
  id: string;
  name: string;
  avatar?: Object3D;
  score: number;
  isReady: boolean;
}

export interface GameEvents {
  onStart: () => void;
  onEnd: (results: GameResults) => void;
  onPause: () => void;
  onResume: () => void;
  onPlayerJoin: (player: GamePlayer) => void;
  onPlayerLeave: (playerId: string) => void;
  onScoreUpdate: (playerId: string, score: number) => void;
}

export interface GameResults {
  winner?: GamePlayer;
  scores: Array<{ player: GamePlayer; score: number }>;
  duration: number;
  timestamp: number;
}

export interface GameObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  mesh?: Object3D;
  data?: any;
}

export interface CollisionEvent {
  objectA: GameObject;
  objectB: GameObject;
  timestamp: number;
}
