// Coin Collection Game Implementation
import * as THREE from 'three';

import { CollisionSystem } from '../core/CollisionSystem';
import { GameManager } from '../core/GameManager';
import { GameObject, GameConfig, GameCategory } from '../types';

import { Coin } from './objects/Coin';

export interface CoinCollectorData {
  coins: GameObject[];
  totalCoins: number;
  collectedCoins: number;
  spawnRadius: number;
  coinValue: number;
}

export class CoinCollectorGame extends GameManager {
  private collisionSystem: CollisionSystem;
  private scene: THREE.Scene;
  private coinContainer: THREE.Group;
  private gameData: CoinCollectorData;

  static readonly CONFIG: GameConfig = {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: 'Collect as many coins as possible before time runs out!',
    icon: '🪙',
    minPlayers: 1,
    maxPlayers: 4,
    duration: 60, // 60 seconds
    category: GameCategory.COLLECTION,
  };

  constructor(scene: THREE.Scene) {
    super(CoinCollectorGame.CONFIG);
    this.scene = scene;
    this.collisionSystem = new CollisionSystem();
    this.coinContainer = new THREE.Group();
    this.gameData = {
      coins: [],
      totalCoins: 20,
      collectedCoins: 0,
      spawnRadius: 10,
      coinValue: 10,
    };
  }

  async initialize(): Promise<void> {
    // Add coin container to scene
    this.scene.add(this.coinContainer);

    // Spawn coins
    this.spawnCoins();

    // Setup collision handlers
    this.setupCollisions();
  }

  update(deltaTime: number): void {
    // Update collision detection
    this.collisionSystem.update();

    // Animate coins
    this.gameData.coins.forEach((coin) => {
      if (coin.mesh) {
        coin.mesh.rotation.y += deltaTime * 2;
        coin.mesh.position.y = coin.position.y + Math.sin(Date.now() * 0.002) * 0.1;
      }
    });

    // Check win condition
    if (this.gameData.collectedCoins >= this.gameData.totalCoins) {
      this.end();
    }
  }

  cleanup(): void {
    // Remove all coins from scene
    this.coinContainer.clear();
    this.scene.remove(this.coinContainer);

    // Clear collision system
    this.collisionSystem.clear();

    // Reset game data
    this.gameData.coins = [];
    this.gameData.collectedCoins = 0;
  }

  handlePlayerAction(playerId: string, action: any): void {
    // Handle player-specific actions if needed
    // For coin collector, collision detection handles most interactions
  }

  private spawnCoins(): void {
    for (let i = 0; i < this.gameData.totalCoins; i++) {
      const angle = (i / this.gameData.totalCoins) * Math.PI * 2;
      const radius = this.gameData.spawnRadius * (0.5 + Math.random() * 0.5);

      const position = {
        x: Math.cos(angle) * radius,
        y: 0.5 + Math.random() * 2,
        z: Math.sin(angle) * radius,
      };

      const coin = new Coin(`coin-${i}`, position);
      const coinObject: GameObject = {
        id: coin.id,
        type: 'coin',
        position,
        mesh: coin.mesh,
      };

      this.gameData.coins.push(coinObject);
      this.coinContainer.add(coin.mesh);
      this.collisionSystem.addObject(coinObject);
    }
  }

  private setupCollisions(): void {
    // Handle player-coin collisions
    this.collisionSystem.onCollision('player', 'coin', (event) => {
      const coin = event.objectB;
      const playerId = event.objectA.data?.playerId;

      if (!playerId || !coin.mesh) return;

      // Collect the coin
      this.collectCoin(coin, playerId);
    });
  }

  private collectCoin(coin: GameObject, playerId: string): void {
    // Remove coin from scene
    if (coin.mesh) {
      // Add collection effect
      this.addCollectionEffect(coin.position);

      // Remove from container
      this.coinContainer.remove(coin.mesh);
      coin.mesh.geometry.dispose();
      if (coin.mesh.material instanceof THREE.Material) {
        coin.mesh.material.dispose();
      }
    }

    // Remove from collision system
    this.collisionSystem.removeObject(coin.id);

    // Remove from game data
    const index = this.gameData.coins.findIndex((c) => c.id === coin.id);
    if (index !== -1) {
      this.gameData.coins.splice(index, 1);
    }

    // Update score and stats
    this.gameData.collectedCoins++;
    this.updateScore(playerId, this.gameData.coinValue);

    // Emit coin collected event
    this.emit('coinCollected', {
      playerId,
      coinId: coin.id,
      totalCollected: this.gameData.collectedCoins,
      remaining: this.gameData.totalCoins - this.gameData.collectedCoins,
    });
  }

  private addCollectionEffect(position: { x: number; y: number; z: number }): void {
    // Create a simple particle effect
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 1,
    });

    for (let i = 0; i < 8; i++) {
      const particle = new THREE.Mesh(geometry, material.clone());
      particle.position.set(position.x, position.y, position.z);

      const angle = (i / 8) * Math.PI * 2;
      const speed = 2;
      const velocity = new THREE.Vector3(Math.cos(angle) * speed, 2, Math.sin(angle) * speed);

      this.scene.add(particle);

      // Animate particle
      const startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 1) {
          this.scene.remove(particle);
          particle.geometry.dispose();
          if (particle.material instanceof THREE.Material) {
            particle.material.dispose();
          }
          return;
        }

        particle.position.add(velocity.clone().multiplyScalar(0.016));
        velocity.y -= 9.8 * 0.016;
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = 1 - elapsed;
        }

        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  // Public methods for external control
  addPlayerAvatar(playerId: string, avatar: THREE.Object3D): void {
    const playerObject: GameObject = {
      id: `player-${playerId}`,
      type: 'player',
      position: { x: 0, y: 0, z: 0 },
      mesh: avatar,
      data: { playerId },
    };
    this.collisionSystem.addObject(playerObject);
  }

  removePlayerAvatar(playerId: string): void {
    this.collisionSystem.removeObject(`player-${playerId}`);
  }

  getRemainingTime(): number {
    if (!this.instance.startTime || !this.instance.config.duration) return 0;
    const elapsed = (Date.now() - this.instance.startTime) / 1000;
    return Math.max(0, this.instance.config.duration - elapsed);
  }

  getGameStats() {
    return {
      collected: this.gameData.collectedCoins,
      total: this.gameData.totalCoins,
      remaining: this.gameData.totalCoins - this.gameData.collectedCoins,
      timeRemaining: this.getRemainingTime(),
    };
  }
}
