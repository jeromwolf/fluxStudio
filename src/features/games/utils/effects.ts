// Visual effects utilities for games
import * as THREE from 'three';

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    lifetime: number;
    age: number;
  }> = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createBurst(
    position: THREE.Vector3,
    count: number,
    color: number,
    speed: number = 5,
    lifetime: number = 1
  ): void {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // Random velocity
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * speed,
        Math.sin(angle) * speed
      );

      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        velocity,
        lifetime,
        age: 0,
      });
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += deltaTime;

      if (particle.age >= particle.lifetime) {
        // Remove particle
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        if (particle.mesh.material instanceof THREE.Material) {
          particle.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

      // Apply gravity
      particle.velocity.y -= 9.8 * deltaTime;

      // Update opacity
      const lifePercent = particle.age / particle.lifetime;
      if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
        particle.mesh.material.opacity = 1 - lifePercent;
      }
    }
  }

  clear(): void {
    this.particles.forEach((particle) => {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      if (particle.mesh.material instanceof THREE.Material) {
        particle.mesh.material.dispose();
      }
    });
    this.particles = [];
  }
}

export function createFloatingText(
  scene: THREE.Scene,
  text: string,
  position: THREE.Vector3,
  color: number = 0xffffff,
  duration: number = 2
): void {
  // Create canvas for text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 64;

  // Draw text
  context.fillStyle = '#' + color.toString(16).padStart(6, '0');
  context.font = 'bold 48px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 32);

  // Create texture and sprite
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(2, 0.5, 1);

  scene.add(sprite);

  // Animate
  const startTime = Date.now();
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed >= duration) {
      scene.remove(sprite);
      material.dispose();
      texture.dispose();
      return;
    }

    // Float upward and fade
    sprite.position.y += 0.02;
    material.opacity = 1 - elapsed / duration;

    requestAnimationFrame(animate);
  };
  animate();
}
