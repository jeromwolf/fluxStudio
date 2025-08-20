// Math utility functions for games
import * as THREE from 'three';

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomPosition(radius: number, height: number = 0): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return new THREE.Vector3(r * Math.cos(angle), height, r * Math.sin(angle));
}

export function distance2D(a: { x: number; z: number }, b: { x: number; z: number }): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
