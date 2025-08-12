'use client';

import { useState } from 'react';

import AnimationCanvas from '@/components/canvas/AnimationCanvas';
import Timeline from '@/components/controls/Timeline';
import ExportPanel from '@/components/export/ExportPanel';
import { createShape } from '@/lib/animation-engine/shapes';
import { useAnimationStore } from '@/lib/stores/animation-store';

export default function StudioPage() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  const { project, addShape } = useAnimationStore();

  const handleCanvasReady = (context: CanvasRenderingContext2D | WebGLRenderingContext) => {
    // Canvas initialized successfully
    if (process.env.NODE_ENV === 'development') {
      console.warn('Canvas initialized with context:', context.constructor.name);
    }
  };

  const handleAddCircle = () => {
    if (project.layers.length === 0) return;

    // Random position to avoid overlap
    const x = 100 + Math.random() * 300;
    const y = 100 + Math.random() * 200;

    const circle = createShape(
      'circle',
      { x, y },
      {
        radius: 50,
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
        strokeWidth: 2,
      }
    );

    const newShape = addShape(project.layers[0].id, circle);

    // Add a simple scale animation for demo
    const { addAnimation } = useAnimationStore.getState();
    addAnimation(newShape.id, {
      property: 'radius',
      keyframes: [
        { time: 0, value: 30 },
        { time: 2500, value: 80 },
        { time: 5000, value: 30 },
      ],
      duration: 5000,
      startTime: 0,
      easing: 'ease-in-out',
    });

    setShowCanvas(true);
  };

  const handleAddNetwork = () => {
    if (project.layers.length === 0) return;

    // Random position to avoid overlap
    const x = 150 + Math.random() * 250;
    const y = 150 + Math.random() * 150;

    const network = createShape(
      'network',
      { x, y },
      {
        nodes: [
          {
            id: 'node1',
            position: { x: 0, y: 0 },
            properties: {
              size: 20,
              color: '#3b82f6',
              connections: [],
              pulseSpeed: 1,
              pulseIntensity: 0.3,
              labelColor: '#ffffff',
              labelSize: 12,
            },
          },
          {
            id: 'node2',
            position: { x: 80, y: 40 },
            properties: {
              size: 25,
              color: '#10b981',
              connections: [],
              pulseSpeed: 1,
              pulseIntensity: 0.3,
              labelColor: '#ffffff',
              labelSize: 12,
            },
          },
          {
            id: 'node3',
            position: { x: -40, y: 60 },
            properties: {
              size: 30,
              color: '#f59e0b',
              connections: [],
              pulseSpeed: 1,
              pulseIntensity: 0.3,
              labelColor: '#ffffff',
              labelSize: 12,
            },
          },
        ],
        edges: [
          { from: 'node1', to: 'node2', strength: 0.8, animated: true },
          { from: 'node2', to: 'node3', strength: 0.6, animated: false },
          { from: 'node3', to: 'node1', strength: 0.7, animated: true },
        ],
        particleCount: 15,
        particleSpeed: 0.5,
      }
    );

    const newNetwork = addShape(project.layers[0].id, network);

    // Add rotation animation for demo
    const { addAnimation } = useAnimationStore.getState();
    addAnimation(newNetwork.id, {
      property: 'particleSpeed',
      keyframes: [
        { time: 0, value: 0.2 },
        { time: 2500, value: 1.0 },
        { time: 5000, value: 0.2 },
      ],
      duration: 5000,
      startTime: 0,
      easing: 'ease-in-out',
    });

    setShowCanvas(true);
  };

  const handleClear = () => {
    if (project.layers.length === 0) return;

    const { updateLayer } = useAnimationStore.getState();
    project.layers.forEach((layer) => {
      updateLayer(layer.id, { shapes: [] });
    });
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-700 bg-gray-800">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">Flux Studio</h1>
        </div>
        <nav className="mt-8">
          <div className="space-y-2 px-4">
            <button className="w-full rounded-md px-3 py-2 text-left text-gray-300 hover:bg-gray-700">
              Projects
            </button>
            <button className="w-full rounded-md px-3 py-2 text-left text-gray-300 hover:bg-gray-700">
              Templates
            </button>
            <button className="w-full rounded-md px-3 py-2 text-left text-gray-300 hover:bg-gray-700">
              Export History
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex h-16 items-center border-b border-gray-700 bg-gray-800 px-4">
          <div className="flex gap-2">
            <button
              onClick={handleAddCircle}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Circle
            </button>
            <button
              onClick={handleAddNetwork}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Network
            </button>
            <button
              onClick={handleClear}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={`rounded-md px-4 py-2 text-white ${showExportPanel ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Export
            </button>
          </div>

          <div className="ml-auto text-sm text-white">
            Project: {project.name} | {project.layers.length} layers |{' '}
            {project.layers.reduce((acc, layer) => acc + layer.shapes.length, 0)} shapes
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1">
          {/* Animation Canvas */}
          <div className="relative flex-1 bg-gray-950">
            {showCanvas ? (
              <AnimationCanvas className="h-full w-full" onCanvasReady={handleCanvasReady} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-2 text-lg">Animation Canvas</p>
                  <p className="text-sm">
                    Click &quot;Add Circle&quot; or &quot;Add Network&quot; to start creating
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Properties/Export Panel */}
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            {showExportPanel ? (
              <ExportPanel />
            ) : (
              <div className="p-4">
                <h2 className="mb-4 font-semibold text-white">Properties</h2>
                <div className="text-sm text-gray-400">
                  <p>No element selected</p>
                  <p className="mt-2 text-xs">Click &quot;Export&quot; to access export options</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <Timeline className="h-48" />
      </main>
    </div>
  );
}
