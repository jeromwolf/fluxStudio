'use client';

import { useTheme } from 'next-themes';
import React, { useRef, useEffect, useState, useCallback } from 'react';

import { KeyframeSystem } from '@/lib/animation-engine/keyframes';
import { ShapeRenderer } from '@/lib/animation-engine/shapes';
import { useAnimationStore } from '@/lib/stores/animation-store';

interface AnimationCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (context: CanvasRenderingContext2D | WebGLRenderingContext) => void;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  lastFrameTime: number;
}

export default function AnimationCanvas({
  width = 800,
  height = 600,
  className = '',
  onCanvasReady,
}: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | undefined>(undefined);
  const [context, setContext] = useState<CanvasRenderingContext2D | WebGLRenderingContext | null>(
    null
  );
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    lastFrameTime: 0,
  });
  const { theme } = useTheme();

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());

  const initializeWebGL = useCallback((canvas: HTMLCanvasElement): WebGLRenderingContext | null => {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;

      const webgl = gl as WebGLRenderingContext;
      webgl.clearColor(0.0, 0.0, 0.0, 1.0);
      webgl.enable(webgl.DEPTH_TEST);
      webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

      return webgl;
    } catch (error) {
      console.warn('WebGL initialization failed:', error);
      return null;
    }
  }, []);

  const initialize2DContext = useCallback(
    (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return ctx;
    },
    [theme]
  );

  const updatePerformanceMetrics = useCallback((currentTime: number) => {
    frameCountRef.current++;

    if (currentTime - lastFpsUpdateRef.current >= 1000) {
      const fps = Math.round(
        (frameCountRef.current * 1000) / (currentTime - lastFpsUpdateRef.current)
      );
      const frameTime = (currentTime - lastFpsUpdateRef.current) / frameCountRef.current;

      setPerformance((prev) => ({
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        lastFrameTime: currentTime - prev.lastFrameTime,
      }));

      frameCountRef.current = 0;
      lastFpsUpdateRef.current = currentTime;
    }
  }, []);

  const project = useAnimationStore((state) => state.project);
  const setCurrentTime = useAnimationStore((state) => state.setCurrentTime);
  const shapeRenderer = useRef(new ShapeRenderer());
  const lastTimeRef = useRef(0);

  const renderLoop = useCallback(
    (currentTime: number) => {
      updatePerformanceMetrics(currentTime);

      if (context && canvasRef.current) {
        const canvas = canvasRef.current;
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;

        // Update animation time if playing
        if (project.isPlaying) {
          const newTime = Math.min(project.currentTime + deltaTime, project.duration);
          setCurrentTime(newTime);

          // Stop at end
          if (newTime >= project.duration) {
            const store = useAnimationStore.getState();
            store.pause();
            store.setCurrentTime(project.duration);
          }
        }

        // Clear canvas
        if (isWebGLSupported && context instanceof WebGLRenderingContext) {
          context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        } else if (context instanceof CanvasRenderingContext2D) {
          const bgColor = project.backgroundColor || (theme === 'dark' ? '#0a0a0a' : '#ffffff');
          context.fillStyle = bgColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Update shape renderer animation
        shapeRenderer.current.updateAnimation(deltaTime);

        // Render all shapes
        if (context instanceof CanvasRenderingContext2D) {
          const renderContext = {
            ctx: context,
            width: canvas.width,
            height: canvas.height,
            currentTime: project.currentTime,
            theme: (theme as 'light' | 'dark') || 'dark',
          };

          project.layers.forEach((layer) => {
            if (!layer.visible) return;

            context.save();
            context.globalAlpha *= layer.opacity;

            layer.shapes.forEach((shape) => {
              // Apply animations to shape properties
              const animatedShape = { ...shape };

              shape.animations.forEach((animation) => {
                const animatedValue = KeyframeSystem.getValueAtTime(
                  animation.keyframes,
                  project.currentTime - animation.startTime,
                  animation.property
                );

                if (animatedValue !== undefined) {
                  if (animation.property === 'position') {
                    animatedShape.position = animatedValue;
                  } else {
                    animatedShape.properties = {
                      ...animatedShape.properties,
                      [animation.property]: animatedValue,
                    };
                  }
                }
              });

              shapeRenderer.current.renderShape(animatedShape, renderContext);
            });

            context.restore();
          });
        }
      }

      animationIdRef.current = requestAnimationFrame(renderLoop);
    },
    [
      context,
      isWebGLSupported,
      theme,
      updatePerformanceMetrics,
      project.isPlaying,
      project.currentTime,
      project.duration,
      project.layers,
      project.backgroundColor,
      setCurrentTime,
    ]
  );

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const { clientWidth, clientHeight } = container;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;

    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;

    if (context) {
      if (isWebGLSupported && context instanceof WebGLRenderingContext) {
        context.viewport(0, 0, canvas.width, canvas.height);
      } else if (context instanceof CanvasRenderingContext2D) {
        context.scale(dpr, dpr);
      }
    }
  }, [context, isWebGLSupported]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // Use 2D context for now since shape rendering only supports 2D
    const ctx2d = initialize2DContext(canvas);
    setContext(ctx2d);
    setIsWebGLSupported(false);
    onCanvasReady?.(ctx2d);

    // TODO: WebGL support for better performance
    // const webglContext = initializeWebGL(canvas);
    // if (webglContext) {
    //   setContext(webglContext);
    //   setIsWebGLSupported(true);
    //   onCanvasReady?.(webglContext);
    // }

    handleResize();
  }, [width, height, initializeWebGL, initialize2DContext, handleResize, onCanvasReady]);

  useEffect(() => {
    if (context) {
      animationIdRef.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [context, renderLoop]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{
          imageRendering: 'pixelated',
          background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        }}
      />

      <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-xs text-white">
        <div>FPS: {performance.fps}</div>
        <div>Frame: {performance.frameTime}ms</div>
        <div>Context: {isWebGLSupported ? 'WebGL' : '2D'}</div>
      </div>
    </div>
  );
}
