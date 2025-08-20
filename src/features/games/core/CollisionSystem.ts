// Collision Detection System
import * as THREE from 'three';

import { GameObject, CollisionEvent } from '../types';

export interface CollisionHandler {
  (event: CollisionEvent): void;
}

export class CollisionSystem {
  private objects: Map<string, GameObject> = new Map();
  private handlers: Map<string, CollisionHandler[]> = new Map();
  private collisionPairs: Set<string> = new Set();

  addObject(object: GameObject): void {
    this.objects.set(object.id, object);
  }

  removeObject(objectId: string): void {
    this.objects.delete(objectId);
  }

  onCollision(objectTypeA: string, objectTypeB: string, handler: CollisionHandler): void {
    const key = this.getCollisionKey(objectTypeA, objectTypeB);
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push(handler);
  }

  update(): void {
    const objects = Array.from(this.objects.values());
    const newCollisionPairs = new Set<string>();

    // Check all pairs for collisions
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const objA = objects[i];
        const objB = objects[j];

        if (this.checkCollision(objA, objB)) {
          const pairKey = this.getPairKey(objA.id, objB.id);
          newCollisionPairs.add(pairKey);

          // Only trigger if this is a new collision
          if (!this.collisionPairs.has(pairKey)) {
            this.triggerCollisionHandlers(objA, objB);
          }
        }
      }
    }

    this.collisionPairs = newCollisionPairs;
  }

  private checkCollision(objA: GameObject, objB: GameObject): boolean {
    if (!objA.mesh || !objB.mesh) return false;

    // Simple sphere-based collision detection
    const boxA = new THREE.Box3().setFromObject(objA.mesh);
    const boxB = new THREE.Box3().setFromObject(objB.mesh);

    return boxA.intersectsBox(boxB);
  }

  private triggerCollisionHandlers(objA: GameObject, objB: GameObject): void {
    const event: CollisionEvent = {
      objectA: objA,
      objectB: objB,
      timestamp: Date.now(),
    };

    // Try both type combinations
    const handlers1 = this.handlers.get(this.getCollisionKey(objA.type, objB.type));
    const handlers2 = this.handlers.get(this.getCollisionKey(objB.type, objA.type));

    handlers1?.forEach((handler) => handler(event));
    handlers2?.forEach((handler) => handler({ ...event, objectA: objB, objectB: objA }));
  }

  private getCollisionKey(typeA: string, typeB: string): string {
    return `${typeA}:${typeB}`;
  }

  private getPairKey(idA: string, idB: string): string {
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }

  clear(): void {
    this.objects.clear();
    this.collisionPairs.clear();
  }
}
