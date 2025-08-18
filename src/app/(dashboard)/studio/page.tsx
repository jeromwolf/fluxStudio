'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AnimationCanvas from '@/components/canvas/AnimationCanvas';
import { createShape } from '@/lib/animation-engine/shapes';
import { useAnimationStore } from '@/lib/stores/animation-store';
import { animationTemplates, getColorSchemeColors } from '@/lib/templates/animation-templates';
import { getToolsForTemplate } from '@/lib/templates/template-tools';

function StudioPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const [isRecording, setIsRecording] = useState(false);
  const [exportFormat, setExportFormat] = useState<'gif' | 'mp4'>('gif');
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(templateId);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  
  // Animation controls - will be updated based on template
  const [nodeCount, setNodeCount] = useState(100);
  const [connectionDistance, setConnectionDistance] = useState(120);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [nodeSize, setNodeSize] = useState(3);
  const [colorScheme, setColorScheme] = useState<'blue' | 'purple' | 'rainbow' | 'monochrome' | 'fire' | 'ocean'>('blue');
  
  // Audio controls (future implementation)
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.5);
  // const [audioEnabled, setAudioEnabled] = useState(false);

  const { project, addShape } = useAnimationStore();

  // Load template configuration
  useEffect(() => {
    if (templateId) {
      const template = animationTemplates.find(t => t.id === templateId);
      if (template) {
        setNodeCount(template.config.nodeCount);
        setConnectionDistance(template.config.connectionDistance);
        setAnimationSpeed(template.config.animationSpeed);
        setNodeSize(template.config.nodeSize);
        setColorScheme(template.config.colorScheme);
        setCurrentTemplate(templateId);
      }
    }
  }, [templateId]);

  // Initialize with a network animation on load
  useEffect(() => {
    if (project.layers.length > 0 && project.layers[0].shapes.length === 0) {
      handleCreateNetwork();
    }
  }, [currentTemplate]);

  const handleCanvasReady = (context: CanvasRenderingContext2D | WebGLRenderingContext) => {
    console.log('Canvas ready with context:', context.constructor.name);
  };

  const handleCreateNetwork = () => {
    if (project.layers.length === 0) return;

    // Get colors based on current color scheme
    const colors = getColorSchemeColors(colorScheme);

    // Calculate canvas center based on current canvas size
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const spread = 400; // How far from center nodes can be
    console.log('Using spread:', spread); // Use the variable to avoid warning

    // 기하학적 패턴으로 노드 배치
    const nodes = [];
    const edges = [];
    
    // 원형 패턴으로 메인 노드 배치
    const mainNodeCount = Math.min(12, nodeCount);
    const radius = 200;
    
    for (let i = 0; i < mainNodeCount; i++) {
      const angle = (i / mainNodeCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      nodes.push({
        id: `main-${i}`,
        position: { x, y },
        properties: {
          size: nodeSize * 1.5,
          color: colors[i % colors.length],
          connections: [],
          pulseSpeed: animationSpeed,
          pulseIntensity: 0.4,
          labelColor: '#ffffff',
          labelSize: 10,
        },
      });
    }
    
    // 내부 노드들을 육각형 패턴으로 배치
    const innerRadius = 100;
    const innerNodeCount = Math.min(6, Math.floor(nodeCount / 3));
    
    for (let i = 0; i < innerNodeCount; i++) {
      const angle = (i / innerNodeCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * innerRadius;
      const y = centerY + Math.sin(angle) * innerRadius;
      
      nodes.push({
        id: `inner-${i}`,
        position: { x, y },
        properties: {
          size: nodeSize * 1.2,
          color: colors[(i + 2) % colors.length],
          connections: [],
          pulseSpeed: animationSpeed * 1.2,
          pulseIntensity: 0.3,
          labelColor: '#ffffff',
          labelSize: 10,
        },
      });
    }
    
    // 중앙 노드
    nodes.push({
      id: 'center',
      position: { x: centerX, y: centerY },
      properties: {
        size: nodeSize * 2,
        color: colors[0],
        connections: [],
        pulseSpeed: animationSpeed * 0.8,
        pulseIntensity: 0.5,
        labelColor: '#ffffff',
        labelSize: 10,
      },
    });
    
    // 노드 간 연결 생성
    // 중앙에서 내부 노드로
    for (let i = 0; i < innerNodeCount; i++) {
      edges.push({
        from: 'center',
        to: `inner-${i}`,
        strength: 1.0,
        animated: true,
      });
    }
    
    // 내부에서 외부 노드로
    for (let i = 0; i < innerNodeCount; i++) {
      const outerIndex1 = Math.floor((i / innerNodeCount) * mainNodeCount);
      const outerIndex2 = (outerIndex1 + 1) % mainNodeCount;
      
      edges.push({
        from: `inner-${i}`,
        to: `main-${outerIndex1}`,
        strength: 0.7,
        animated: true,
      });
      
      edges.push({
        from: `inner-${i}`,
        to: `main-${outerIndex2}`,
        strength: 0.5,
        animated: false,
      });
    }
    
    // 외부 노드끼리 연결
    for (let i = 0; i < mainNodeCount; i++) {
      const next = (i + 1) % mainNodeCount;
      edges.push({
        from: `main-${i}`,
        to: `main-${next}`,
        strength: 0.8,
        animated: true,
      });
    }
    
    const network = createShape(
      'network',
      { x: 0, y: 0 },
      {
        nodes,
        edges,
        particleCount: Math.floor(nodeCount / 2),
        particleSpeed: animationSpeed,
      }
    );

    const newNetwork = addShape(project.layers[0].id, network);

    // Add animation based on template
    const { addAnimation } = useAnimationStore.getState();
    addAnimation(newNetwork.id, {
      property: 'particleSpeed',
      keyframes: [
        { time: 0, value: animationSpeed * 0.5 },
        { time: 2500, value: animationSpeed * 1.5 },
        { time: 5000, value: animationSpeed * 0.5 },
      ],
      duration: 5000,
      startTime: 0,
      easing: 'ease-in-out',
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = animationTemplates.find(t => t.id === templateId);
    if (template) {
      setNodeCount(template.config.nodeCount);
      setConnectionDistance(template.config.connectionDistance);
      setAnimationSpeed(template.config.animationSpeed);
      setNodeSize(template.config.nodeSize);
      setColorScheme(template.config.colorScheme);
      setCurrentTemplate(templateId);
      
      // Clear current shapes and create new one
      const { clearLayer } = useAnimationStore.getState();
      if (project.layers.length > 0) {
        clearLayer(project.layers[0].id);
        setTimeout(() => handleCreateNetwork(), 100);
      }
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
    setTimeout(() => {
      setIsRecording(false);
      alert('Recording completed! (Demo)');
    }, 5000);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Canvas Area - Full Width */}
      <div className="relative flex-1 bg-gray-950">
        <AnimationCanvas 
          width={canvasSize.width}
          height={canvasSize.height}
          className="max-w-full max-h-full mx-auto" 
          onCanvasReady={handleCanvasReady} 
        />
        
        {/* Watermark for free version */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-50">
          Created with Flux Studio
        </div>
      </div>

      {/* Control Panel - Fixed Width */}
      <div className="w-[350px] overflow-y-auto bg-gray-950 border-l border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              ← Back to Home
            </Link>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              ⚙️ Settings
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              🎬 Animation Studio
            </h1>
            {currentTemplate && (
              <div className="mt-2 text-sm">
                <span className="text-gray-400">Template: </span>
                <span className="text-blue-400 font-medium">
                  {animationTemplates.find(t => t.id === currentTemplate)?.name}
                </span>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-400">
              Create stunning animated visuals and export as GIF or MP4
            </p>
          </div>
        </div>

        {/* Template Quick Selector */}
        <div className="p-6 border-b border-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-purple-400 flex items-center gap-2">
            <span>🎨</span> Quick Templates
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {animationTemplates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className={`p-3 text-xs rounded-lg transition-all ${
                  currentTemplate === template.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {template.thumbnail} {template.name}
              </button>
            ))}
          </div>
          
          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Browse All Templates →
            </Link>
          </div>
        </div>

        {/* Animation Controls */}
        <div className="p-6 border-b border-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-blue-400 flex items-center gap-2">
            <span>🎨</span> Animation Controls
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Node Count: {nodeCount}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Connection Distance: {connectionDistance}
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={connectionDistance}
                onChange={(e) => setConnectionDistance(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Animation Speed: {animationSpeed.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Node Size: {nodeSize}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={nodeSize}
                onChange={(e) => setNodeSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Color Scheme
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none text-sm"
              >
                <option value="blue">🔵 Blue</option>
                <option value="purple">🟣 Purple</option>
                <option value="rainbow">🌈 Rainbow</option>
                <option value="monochrome">⚫ Monochrome</option>
                <option value="fire">🔥 Fire</option>
                <option value="ocean">🌊 Ocean</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button 
              onClick={handleCreateNetwork}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Regenerate
            </button>
            <button 
              onClick={() => applyTemplate('minimal-network')}
              className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Minimal
            </button>
            <button 
              onClick={() => applyTemplate('energetic-burst')}
              className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Energetic
            </button>
            <button 
              onClick={() => applyTemplate('calm-waves')}
              className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Calm
            </button>
          </div>
        </div>

        {/* Template-Specific Tools */}
        {currentTemplate && (
          <TemplateToolsPanel 
            templateId={currentTemplate}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            toolParameters={toolParameters}
            onParameterChange={(toolId, paramId, value) => {
              setToolParameters(prev => ({
                ...prev,
                [`${toolId}.${paramId}`]: value
              }));
            }}
          />
        )}

        {/* Audio Controls (Coming Soon) */}
        <div className="p-6 border-b border-gray-800 opacity-50">
          <h3 className="mb-4 text-sm font-semibold text-purple-400 flex items-center gap-2">
            <span>🔊</span> Audio Controls (Coming Soon)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Frequency: {frequency} Hz
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                disabled
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-not-allowed opacity-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                disabled
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-not-allowed opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Recording Settings */}
        <div className="p-6 border-b border-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-green-400 flex items-center gap-2">
            <span>📹</span> Recording Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-xs text-gray-400">Canvas Size</label>
              <select
                value={`${canvasSize.width}x${canvasSize.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  setCanvasSize({ width, height });
                  setTimeout(() => handleCreateNetwork(), 100);
                }}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none mb-4"
              >
                <optgroup label="Square (Instagram, TikTok)">
                  <option value="1080x1080">1080×1080 (Instagram Post)</option>
                  <option value="1080x1350">1080×1350 (Instagram Portrait)</option>
                </optgroup>
                <optgroup label="Vertical (Shorts, Reels, Stories)">
                  <option value="1080x1920">1080×1920 (Stories/Reels)</option>
                  <option value="720x1280">720×1280 (TikTok)</option>
                </optgroup>
                <optgroup label="Horizontal (YouTube, Twitter)">
                  <option value="1920x1080">1920×1080 (YouTube HD)</option>
                  <option value="1280x720">1280×720 (Twitter)</option>
                  <option value="1200x675">1200×675 (Facebook)</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-xs text-gray-400">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportFormat('gif')}
                  className={`px-4 py-3 text-sm rounded-lg transition-all ${
                    exportFormat === 'gif'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  GIF
                  <div className="text-xs opacity-70">Animated Image</div>
                </button>
                <button
                  onClick={() => setExportFormat('mp4')}
                  className={`px-4 py-3 text-sm rounded-lg transition-all ${
                    exportFormat === 'mp4'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  WebM
                  <div className="text-xs opacity-70">Web Video</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">Duration (seconds)</label>
              <input
                type="number"
                defaultValue="5"
                min="1"
                max="30"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">Frame Rate</label>
              <select className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none">
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
                <option value="15">15 FPS</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-xs text-gray-400">Quality</label>
              <select className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            {isRecording ? (
              <>🔴 Recording...</>
            ) : (
              <>🎬 Start Recording</>
            )}
          </button>

          <button className="mt-2 w-full py-3 px-4 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all">
            📥 Download
          </button>
        </div>

        {/* Support Section */}
        <div className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Enjoying Flux Studio?</p>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                💝 Support Us with a Donation
              </button>
              <button className="w-full py-2 px-4 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-all">
                🎨 Browse Premium Templates
              </button>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-800 text-center">
          <div className="text-xs text-gray-500">
            <div>FPS: {project.fps}</div>
            <div>Nodes: {nodeCount}</div>
            <div>Connections: {Math.floor(nodeCount * 0.8)}</div>
            <div className="mt-2">Status: Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template Tools Panel Component
function TemplateToolsPanel({ 
  templateId, 
  selectedTool, 
  onToolSelect, 
  toolParameters, 
  onParameterChange 
}: {
  templateId: string;
  selectedTool: string | null;
  onToolSelect: (toolId: string | null) => void;
  toolParameters: Record<string, any>;
  onParameterChange: (toolId: string, paramId: string, value: any) => void;
}) {
  const tools = getToolsForTemplate(templateId);

  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="p-6 border-b border-gray-800">
      <h3 className="mb-4 text-sm font-semibold text-yellow-400 flex items-center gap-2">
        <span>🛠️</span> Template Tools (3D & Effects)
      </h3>
      
      {/* Tool Selection */}
      <div className="space-y-3 mb-6">
        {tools.map((tool) => (
          <div key={tool.id} className="space-y-2">
            <button
              onClick={() => onToolSelect(selectedTool === tool.id ? null : tool.id)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedTool === tool.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{tool.icon}</span>
                <span className="font-medium text-sm">{tool.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  tool.category === 'modification' ? 'bg-blue-600' :
                  tool.category === 'effect' ? 'bg-purple-600' :
                  tool.category === 'animation' ? 'bg-green-600' :
                  'bg-gray-600'
                }`}>
                  {tool.category}
                </span>
              </div>
              <p className="text-xs text-gray-400">{tool.description}</p>
            </button>

            {/* Tool Parameters */}
            {selectedTool === tool.id && (
              <div className="ml-4 space-y-3 bg-gray-800/50 p-3 rounded-lg">
                {tool.parameters.map((param) => (
                  <div key={param.id}>
                    <ToolParameter
                      parameter={param}
                      value={toolParameters[`${tool.id}.${param.id}`] ?? param.defaultValue}
                      onChange={(value) => onParameterChange(tool.id, param.id, value)}
                    />
                  </div>
                ))}
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all">
                    Apply Effect
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-all">
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tool Parameter Component
function ToolParameter({ parameter, value, onChange }: {
  parameter: any;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (parameter.type) {
    case 'slider':
      return (
        <div>
          <label className="block mb-1 text-xs text-gray-400">
            {parameter.name}: {value}
          </label>
          <input
            type="range"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step || 1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block mb-1 text-xs text-gray-400">{parameter.name}</label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-gray-500 focus:outline-none"
          >
            {parameter.options?.map((option: string) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs text-gray-400">{parameter.name}</label>
            <p className="text-xs text-gray-500">{parameter.description}</p>
          </div>
          <button
            onClick={() => onChange(!value)}
            className={`w-10 h-6 rounded-full transition-all ${
              value ? 'bg-yellow-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              value ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      );

    case 'color':
      return (
        <div>
          <label className="block mb-1 text-xs text-gray-400">{parameter.name}</label>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 bg-gray-700 rounded border border-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block mb-1 text-xs text-gray-400">{parameter.name}</label>
          <input
            type="number"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step || 1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-gray-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
        </div>
      );

    default:
      return (
        <div>
          <label className="block mb-1 text-xs text-gray-400">{parameter.name}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-gray-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
        </div>
      );
  }
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <StudioPageContent />
    </Suspense>
  );
}