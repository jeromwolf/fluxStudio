// Core Game Manager
import { EventEmitter } from 'events';

import { GameInstance, GameState, GameConfig, GamePlayer, GameResults, GameEvents } from '../types';

export abstract class GameManager extends EventEmitter {
  protected instance: GameInstance;
  protected events: Partial<GameEvents> = {};
  protected updateInterval?: NodeJS.Timeout;

  constructor(config: GameConfig) {
    super();
    this.instance = {
      id: `game-${Date.now()}`,
      config,
      state: GameState.IDLE,
      players: [],
      scores: new Map(),
      data: {},
    };
  }

  // Abstract methods that each game must implement
  abstract initialize(): Promise<void>;
  abstract update(deltaTime: number): void;
  abstract cleanup(): void;
  abstract handlePlayerAction(playerId: string, action: any): void;

  // Common game lifecycle methods
  async start(): Promise<void> {
    if (this.instance.state !== GameState.IDLE) {
      throw new Error('Game already started');
    }

    this.instance.state = GameState.STARTING;
    this.instance.startTime = Date.now();

    await this.initialize();

    this.instance.state = GameState.PLAYING;
    this.events.onStart?.();
    this.emit('gameStart', this.instance);

    // Start game update loop
    this.startUpdateLoop();
  }

  pause(): void {
    if (this.instance.state !== GameState.PLAYING) return;

    this.instance.state = GameState.PAUSED;
    this.stopUpdateLoop();
    this.events.onPause?.();
    this.emit('gamePause', this.instance);
  }

  resume(): void {
    if (this.instance.state !== GameState.PAUSED) return;

    this.instance.state = GameState.PLAYING;
    this.startUpdateLoop();
    this.events.onResume?.();
    this.emit('gameResume', this.instance);
  }

  end(): void {
    if (this.instance.state === GameState.ENDED) return;

    this.instance.state = GameState.ENDED;
    this.instance.endTime = Date.now();
    this.stopUpdateLoop();

    const results = this.calculateResults();
    this.events.onEnd?.(results);
    this.emit('gameEnd', results);

    this.cleanup();
  }

  // Player management
  addPlayer(player: GamePlayer): void {
    if (this.instance.players.length >= this.instance.config.maxPlayers) {
      throw new Error('Game is full');
    }

    this.instance.players.push(player);
    this.instance.scores.set(player.id, 0);
    this.events.onPlayerJoin?.(player);
    this.emit('playerJoin', player);
  }

  removePlayer(playerId: string): void {
    const index = this.instance.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      this.instance.players.splice(index, 1);
      this.instance.scores.delete(playerId);
      this.events.onPlayerLeave?.(playerId);
      this.emit('playerLeave', playerId);
    }
  }

  updateScore(playerId: string, score: number): void {
    const currentScore = this.instance.scores.get(playerId) || 0;
    const newScore = currentScore + score;
    this.instance.scores.set(playerId, newScore);

    const player = this.instance.players.find((p) => p.id === playerId);
    if (player) {
      player.score = newScore;
    }

    this.events.onScoreUpdate?.(playerId, newScore);
    this.emit('scoreUpdate', { playerId, score: newScore });
  }

  // Event handling
  on<K extends keyof GameEvents>(event: K, handler: GameEvents[K]): void {
    this.events[event] = handler;
  }

  // Getters
  getState(): GameState {
    return this.instance.state;
  }

  getPlayers(): GamePlayer[] {
    return this.instance.players;
  }

  getScores(): Map<string, number> {
    return this.instance.scores;
  }

  getInstance(): GameInstance {
    return this.instance;
  }

  // Protected methods
  protected startUpdateLoop(): void {
    let lastTime = Date.now();
    this.updateInterval = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.update(deltaTime);

      // Check for time-based game end
      if (this.instance.config.duration && this.instance.startTime) {
        const elapsed = (currentTime - this.instance.startTime) / 1000;
        if (elapsed >= this.instance.config.duration) {
          this.end();
        }
      }
    }, 16); // ~60 FPS
  }

  protected stopUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  protected calculateResults(): GameResults {
    const scores = Array.from(this.instance.scores.entries())
      .map(([playerId, score]) => ({
        player: this.instance.players.find((p) => p.id === playerId)!,
        score,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      winner: scores[0]?.player,
      scores,
      duration:
        this.instance.endTime && this.instance.startTime
          ? this.instance.endTime - this.instance.startTime
          : 0,
      timestamp: Date.now(),
    };
  }
}
