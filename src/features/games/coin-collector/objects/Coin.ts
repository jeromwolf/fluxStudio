// Coin object for the game
import * as THREE from 'three';

export class Coin {
  id: string;
  mesh: THREE.Mesh;
  value: number;

  constructor(id: string, position: { x: number; y: number; z: number }, value: number = 10) {
    this.id = id;
    this.value = value;

    // Create coin geometry (cylinder for coin shape)
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);

    // Create golden material
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffd700,
      emissiveIntensity: 0.2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);

    // Add coin details
    this.addCoinDetails();

    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  private addCoinDetails(): void {
    // Add a star symbol on the coin
    const starShape = new THREE.Shape();
    const outerRadius = 0.2;
    const innerRadius = 0.1;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    };

    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffed4e,
      metalness: 0.9,
      roughness: 0.1,
    });

    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.rotation.x = Math.PI / 2;
    starMesh.position.y = 0.05;

    this.mesh.add(starMesh);

    // Add the same star on the bottom
    const starMeshBottom = starMesh.clone();
    starMeshBottom.position.y = -0.05;
    starMeshBottom.rotation.x = -Math.PI / 2;
    this.mesh.add(starMeshBottom);
  }

  update(deltaTime: number): void {
    // Rotation is handled by the game manager
    // Additional animations can be added here
  }

  dispose(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}
