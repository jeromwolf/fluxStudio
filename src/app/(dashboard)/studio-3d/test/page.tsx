'use client';

import { useEffect, useRef } from 'react';
import { SceneManager } from '@/lib/three/scene-manager';
import { getTemplateById } from '@/lib/three/templates';

export default function TestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sceneManager = new SceneManager(canvasRef.current);
    sceneManagerRef.current = sceneManager;

    // Load DNA template
    const template = getTemplateById('dna-helix-data');
    if (template) {
      sceneManager.loadTemplate('dna-helix-data', template.defaultCustomization);
      sceneManager.startAnimation();
    }

    // Test renderAtTime
    let time = 0;
    const interval = setInterval(() => {
      time += 0.1;
      console.log('Rendering at time:', time);
      sceneManager.renderAtTime(time);
    }, 100);

    return () => {
      clearInterval(interval);
      sceneManager.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-white">
        <h1>Animation Test Page</h1>
        <p>Testing renderAtTime method</p>
      </div>
    </div>
  );
}