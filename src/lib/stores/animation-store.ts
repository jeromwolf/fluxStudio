'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AnimationLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  shapes: Shape[];
}

export interface Shape {
  id: string;
  type: 'circle' | 'line' | 'node' | 'network';
  position: { x: number; y: number };
  properties: Record<string, any>;
  animations: Animation[];
}

export interface Animation {
  id: string;
  property: string;
  keyframes: Keyframe[];
  duration: number;
  startTime: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Keyframe {
  time: number;
  value: any;
  easing?: string;
}

export interface AnimationProject {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  backgroundColor: string;
  layers: AnimationLayer[];
  currentTime: number;
  isPlaying: boolean;
  selectedShapeId: string | null;
  selectedLayerId: string | null;
}

interface AnimationStore {
  // State
  project: AnimationProject;

  // Actions
  createNewProject: (options?: Partial<AnimationProject>) => void;
  updateProject: (updates: Partial<AnimationProject>) => void;

  // Layer management
  addLayer: (name?: string) => AnimationLayer;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<AnimationLayer>) => void;
  reorderLayers: (layerIds: string[]) => void;

  // Shape management
  addShape: (layerId: string, shape: Omit<Shape, 'id'>) => Shape;
  removeShape: (shapeId: string) => void;
  updateShape: (shapeId: string, updates: Partial<Shape>) => void;
  selectShape: (shapeId: string | null) => void;

  // Animation management
  addAnimation: (shapeId: string, animation: Omit<Animation, 'id'>) => Animation;
  removeAnimation: (animationId: string) => void;
  updateAnimation: (animationId: string, updates: Partial<Animation>) => void;

  // Keyframe management
  addKeyframe: (animationId: string, keyframe: Keyframe) => void;
  removeKeyframe: (animationId: string, time: number) => void;
  updateKeyframe: (animationId: string, time: number, updates: Partial<Keyframe>) => void;

  // Timeline controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const defaultProject: AnimationProject = {
  id: 'default',
  name: 'Untitled Project',
  width: 1920,
  height: 1080,
  duration: 5000, // 5 seconds in ms
  fps: 60,
  backgroundColor: '#0a0a0a',
  layers: [
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1,
      shapes: [],
    },
  ],
  currentTime: 0,
  isPlaying: false,
  selectedShapeId: null,
  selectedLayerId: null,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAnimationStore = create<AnimationStore>()(
  devtools(
    (set, get) => ({
      project: {
        ...defaultProject,
        layers: [
          { id: 'layer-1', name: 'Layer 1', visible: true, locked: false, opacity: 1, shapes: [] },
        ],
      },

      createNewProject: (options = {}) => {
        const newProject: AnimationProject = {
          ...defaultProject,
          id: generateId(),
          ...options,
          layers: options.layers || [
            {
              id: generateId(),
              name: 'Layer 1',
              visible: true,
              locked: false,
              opacity: 1,
              shapes: [],
            },
          ],
        };
        set({ project: newProject });
      },

      updateProject: (updates) => {
        set((state) => ({
          project: { ...state.project, ...updates },
        }));
      },

      addLayer: (name = `Layer ${get().project.layers.length + 1}`) => {
        const newLayer: AnimationLayer = {
          id: generateId(),
          name,
          visible: true,
          locked: false,
          opacity: 1,
          shapes: [],
        };

        set((state) => ({
          project: {
            ...state.project,
            layers: [...state.project.layers, newLayer],
          },
        }));

        return newLayer;
      },

      removeLayer: (layerId) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.filter((layer) => layer.id !== layerId),
            selectedLayerId:
              state.project.selectedLayerId === layerId ? null : state.project.selectedLayerId,
          },
        }));
      },

      updateLayer: (layerId, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) =>
              layer.id === layerId ? { ...layer, ...updates } : layer
            ),
          },
        }));
      },

      reorderLayers: (layerIds) => {
        const { layers } = get().project;
        const reorderedLayers = layerIds
          .map((id) => layers.find((layer) => layer.id === id))
          .filter(Boolean) as AnimationLayer[];

        set((state) => ({
          project: {
            ...state.project,
            layers: reorderedLayers,
          },
        }));
      },

      addShape: (layerId, shapeData) => {
        const newShape: Shape = {
          ...shapeData,
          id: generateId(),
        };

        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) =>
              layer.id === layerId ? { ...layer, shapes: [...layer.shapes, newShape] } : layer
            ),
          },
        }));

        return newShape;
      },

      removeShape: (shapeId) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.filter((shape) => shape.id !== shapeId),
            })),
            selectedShapeId:
              state.project.selectedShapeId === shapeId ? null : state.project.selectedShapeId,
          },
        }));
      },

      updateShape: (shapeId, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) =>
                shape.id === shapeId ? { ...shape, ...updates } : shape
              ),
            })),
          },
        }));
      },

      selectShape: (shapeId) => {
        set((state) => ({
          project: {
            ...state.project,
            selectedShapeId: shapeId,
          },
        }));
      },

      addAnimation: (shapeId, animationData) => {
        const newAnimation: Animation = {
          ...animationData,
          id: generateId(),
        };

        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) =>
                shape.id === shapeId
                  ? { ...shape, animations: [...shape.animations, newAnimation] }
                  : shape
              ),
            })),
          },
        }));

        return newAnimation;
      },

      removeAnimation: (animationId) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) => ({
                ...shape,
                animations: shape.animations.filter((anim) => anim.id !== animationId),
              })),
            })),
          },
        }));
      },

      updateAnimation: (animationId, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) => ({
                ...shape,
                animations: shape.animations.map((anim) =>
                  anim.id === animationId ? { ...anim, ...updates } : anim
                ),
              })),
            })),
          },
        }));
      },

      addKeyframe: (animationId, keyframe) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) => ({
                ...shape,
                animations: shape.animations.map((anim) =>
                  anim.id === animationId
                    ? {
                        ...anim,
                        keyframes: [...anim.keyframes, keyframe].sort((a, b) => a.time - b.time),
                      }
                    : anim
                ),
              })),
            })),
          },
        }));
      },

      removeKeyframe: (animationId, time) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) => ({
                ...shape,
                animations: shape.animations.map((anim) =>
                  anim.id === animationId
                    ? {
                        ...anim,
                        keyframes: anim.keyframes.filter((kf) => kf.time !== time),
                      }
                    : anim
                ),
              })),
            })),
          },
        }));
      },

      updateKeyframe: (animationId, time, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            layers: state.project.layers.map((layer) => ({
              ...layer,
              shapes: layer.shapes.map((shape) => ({
                ...shape,
                animations: shape.animations.map((anim) =>
                  anim.id === animationId
                    ? {
                        ...anim,
                        keyframes: anim.keyframes.map((kf) =>
                          kf.time === time ? { ...kf, ...updates } : kf
                        ),
                      }
                    : anim
                ),
              })),
            })),
          },
        }));
      },

      play: () => {
        set((state) => ({
          project: { ...state.project, isPlaying: true },
        }));
      },

      pause: () => {
        set((state) => ({
          project: { ...state.project, isPlaying: false },
        }));
      },

      stop: () => {
        set((state) => ({
          project: { ...state.project, isPlaying: false, currentTime: 0 },
        }));
      },

      setCurrentTime: (time) => {
        set((state) => ({
          project: {
            ...state.project,
            currentTime: Math.max(0, Math.min(time, state.project.duration)),
          },
        }));
      },

      setDuration: (duration) => {
        set((state) => ({
          project: { ...state.project, duration: Math.max(1000, duration) },
        }));
      },
    }),
    { name: 'animation-store' }
  )
);
