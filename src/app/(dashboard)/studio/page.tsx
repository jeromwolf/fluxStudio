'use client';

import { useState } from 'react';

import AnimationCanvas from '@/components/canvas/AnimationCanvas';
import Timeline from '@/components/controls/Timeline';
import ExportPanel from '@/components/export/ExportPanel';
import { createShape } from '@/lib/animation-engine/shapes';
import { useAnimationStore } from '@/lib/stores/animation-store';

export default function StudioPage() {
  const [showCanvas, setShowCanvas] = useState(true); // 기본적으로 캔버스 표시
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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
      <aside className="w-64 border-r border-gray-800 bg-gray-950">
        <div className="border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold text-white">Flux Studio</h1>
          <p className="mt-1 text-xs text-gray-500">Animation Creator</p>
        </div>

        {/* Tools Section */}
        <div className="p-4">
          <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSelectedTool('circle');
                handleAddCircle();
              }}
              className={`rounded-lg border p-3 transition-all ${
                selectedTool === 'circle'
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="h-6 w-6 rounded-full bg-current opacity-50"></div>
                <span className="text-xs">Circle</span>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedTool('network');
                handleAddNetwork();
              }}
              className={`rounded-lg border p-3 transition-all ${
                selectedTool === 'network'
                  ? 'border-green-500 bg-green-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="relative h-6 w-6">
                  <div className="absolute top-0 left-0 h-2 w-2 rounded-full bg-current"></div>
                  <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-current"></div>
                  <div className="absolute bottom-0 left-2 h-2 w-2 rounded-full bg-current"></div>
                </div>
                <span className="text-xs">Network</span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase">Workspace</h3>
          </div>
          <div className="space-y-1 px-2">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Projects
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              Templates
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex h-14 items-center border-b border-gray-800 bg-gray-900 px-4">
          <div className="flex items-center gap-4">
            {/* Project Info */}
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-white">{project.name}</h2>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                {project.layers.length} {project.layers.length === 1 ? 'layer' : 'layers'}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                {project.layers.reduce((acc, layer) => acc + layer.shapes.length, 0)}{' '}
                {project.layers.reduce((acc, layer) => acc + layer.shapes.length, 0) === 1
                  ? 'shape'
                  : 'shapes'}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
              title="Clear All"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            <div className="h-6 w-px bg-gray-700" />

            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                showExportPanel
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1">
          {/* Animation Canvas */}
          <div className="relative flex-1 bg-gray-950">
            <AnimationCanvas className="h-full w-full" onCanvasReady={handleCanvasReady} />

            {/* Canvas Overlay Info */}
            {!showCanvas && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </div>
                  <p className="mb-2 text-lg font-medium text-white">Ready to Create</p>
                  <p className="text-sm text-gray-400">
                    Select a tool from the sidebar to start animating
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Properties/Export Panel */}
          <div className="w-80 border-l border-gray-800 bg-gray-950">
            {showExportPanel ? (
              <ExportPanel />
            ) : (
              <div className="flex h-full flex-col">
                <div className="border-b border-gray-800 p-4">
                  <h2 className="text-sm font-semibold text-white">Properties</h2>
                </div>
                <div className="flex-1 p-4">
                  <div className="py-8 text-center">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">No element selected</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Select a shape to edit its properties
                    </p>
                  </div>
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
