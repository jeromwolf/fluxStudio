'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export interface CanvasMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  isWebGL: boolean;
}

export interface UseCanvasOptions {
  width?: number;
  height?: number;
  enableWebGL?: boolean;
  targetFPS?: number;
  enableMetrics?: boolean;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const {
    width = 800,
    height = 600,
    enableWebGL = true,
    targetFPS = 60,
    enableMetrics = true,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | WebGLRenderingContext | null>(null);
  const animationIdRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const drawCallsRef = useRef(0);

  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState<CanvasMetrics>({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    isWebGL: false,
  });

  const initContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    if (enableWebGL) {
      try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const webgl = gl as WebGLRenderingContext;
          webgl.clearColor(0.0, 0.0, 0.0, 1.0);
          webgl.enable(webgl.DEPTH_TEST);
          webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
          return webgl;
        }
      } catch (error) {
        console.warn('WebGL not supported, falling back to 2D:', error);
      }
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    return ctx;
  }, [enableWebGL]);

  const updateMetrics = useCallback(
    (currentTime: number) => {
      if (!enableMetrics) return;

      frameCountRef.current++;
      const frameTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      if (currentTime - lastFpsUpdateRef.current >= 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (currentTime - lastFpsUpdateRef.current)
        );

        setMetrics((prev) => ({
          ...prev,
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          drawCalls: drawCallsRef.current,
        }));

        frameCountRef.current = 0;
        drawCallsRef.current = 0;
        lastFpsUpdateRef.current = currentTime;
      }
    },
    [enableMetrics]
  );

  const clear = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    if (context instanceof WebGLRenderingContext) {
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawCallsRef.current++;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context instanceof WebGLRenderingContext) {
      context.viewport(0, 0, canvas.width, canvas.height);
    } else {
      context.scale(dpr, dpr);
    }
  }, []);

  const startRenderLoop = useCallback(
    (
      renderCallback?: (
        context: CanvasRenderingContext2D | WebGLRenderingContext,
        deltaTime: number
      ) => void
    ) => {
      let lastTime = 0;
      const targetFrameTime = 1000 / targetFPS;

      const loop = (currentTime: number) => {
        const deltaTime = currentTime - lastTime;

        if (deltaTime >= targetFrameTime) {
          updateMetrics(currentTime);

          if (renderCallback && contextRef.current) {
            renderCallback(contextRef.current, deltaTime);
          } else {
            clear();
          }

          lastTime = currentTime;
        }

        animationIdRef.current = requestAnimationFrame(loop);
      };

      animationIdRef.current = requestAnimationFrame(loop);
    },
    [targetFPS, updateMetrics, clear]
  );

  const stopRenderLoop = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = initContext();
    if (context) {
      contextRef.current = context;
      setMetrics((prev) => ({
        ...prev,
        isWebGL: context instanceof WebGLRenderingContext,
      }));
      setIsReady(true);
    }

    resize();
  }, [width, height, initContext, resize]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      stopRenderLoop();
    };
  }, [resize, stopRenderLoop]);

  return {
    canvasRef,
    context: contextRef.current,
    isReady,
    metrics,
    clear,
    resize,
    startRenderLoop,
    stopRenderLoop,
  };
}
