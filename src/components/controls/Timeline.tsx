'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';

import { useAnimationStore } from '@/lib/stores/animation-store';

interface TimelineProps {
  className?: string;
}

interface TimelineMarker {
  time: number;
  type: 'keyframe' | 'marker' | 'selection';
  shapeId?: string;
  animationId?: string;
  label?: string;
}

export default function Timeline({ className = '' }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { project, setCurrentTime, setDuration, play, pause, stop } = useAnimationStore();

  const [markers, setMarkers] = useState<TimelineMarker[]>([]);

  // Calculate timeline markers from project data
  useEffect(() => {
    const newMarkers: TimelineMarker[] = [];

    project.layers.forEach((layer) => {
      layer.shapes.forEach((shape) => {
        shape.animations.forEach((animation) => {
          animation.keyframes.forEach((keyframe) => {
            newMarkers.push({
              time: keyframe.time,
              type: 'keyframe',
              shapeId: shape.id,
              animationId: animation.id,
              label: `${shape.type} - ${animation.property}`,
            });
          });
        });
      });
    });

    setMarkers(newMarkers);
  }, [project]);

  const timeToPixels = useCallback(
    (time: number) => {
      if (!timelineRef.current) return 0;
      const timelineWidth = timelineRef.current.clientWidth - 40; // Account for padding
      return (time / project.duration) * timelineWidth + 20;
    },
    [project.duration]
  );

  const pixelsToTime = useCallback(
    (pixels: number) => {
      if (!timelineRef.current) return 0;
      const timelineWidth = timelineRef.current.clientWidth - 40;
      return Math.max(
        0,
        Math.min(project.duration, ((pixels - 20) / timelineWidth) * project.duration)
      );
    },
    [project.duration]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = pixelsToTime(x);

      setCurrentTime(time);
      setIsDragging(true);
    },
    [pixelsToTime, setCurrentTime]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = pixelsToTime(x);

      setCurrentTime(time);
    },
    [isDragging, pixelsToTime, setCurrentTime]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const formatTime = useCallback((time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }, []);

  const generateTimeMarks = useCallback(() => {
    const marks = [];
    const interval = 1000; // 1 second intervals

    for (let time = 0; time <= project.duration; time += interval) {
      marks.push({
        time,
        position: timeToPixels(time),
        label: formatTime(time),
      });
    }

    return marks;
  }, [project.duration, timeToPixels, formatTime]);

  const timeMarks = generateTimeMarks();
  const playheadPosition = timeToPixels(project.currentTime);

  return (
    <div className={`border-t border-gray-800 bg-gray-900 ${className}`}>
      {/* Timeline Header */}
      <div className="flex h-10 items-center justify-between border-b border-gray-800 bg-gray-950 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={project.isPlaying ? pause : play}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-800 text-white transition-colors hover:bg-gray-700"
            title={project.isPlaying ? 'Pause' : 'Play'}
          >
            {project.isPlaying ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm6 0a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>
          <button
            onClick={stop}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-800 text-white transition-colors hover:bg-gray-700"
            title="Stop"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="5" width="10" height="10" />
            </svg>
          </button>

          <div className="mx-1 h-5 w-px bg-gray-700" />

          <div className="font-mono text-xs text-gray-400">{formatTime(project.currentTime)}</div>
          <span className="text-xs text-gray-600">/</span>
          <div className="font-mono text-xs text-gray-300">{formatTime(project.duration)}</div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Duration:</label>
          <input
            type="number"
            value={Math.floor(project.duration / 1000)}
            onChange={(e) => setDuration(Number(e.target.value) * 1000)}
            min="1"
            max="180"
            className="h-6 w-12 rounded border border-gray-700 bg-gray-800 px-2 text-xs text-white focus:border-gray-600 focus:outline-none"
          />
          <span className="text-xs text-gray-500">s</span>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="relative h-6 overflow-hidden border-b border-gray-800 bg-gray-950">
        {timeMarks.map((mark, index) => (
          <div key={index} className="absolute top-0 select-none" style={{ left: mark.position }}>
            <div className="h-1.5 w-px bg-gray-700" />
            <div className="mt-0.5 -translate-x-1/2 transform text-[10px] whitespace-nowrap text-gray-500">
              {mark.label}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Track */}
      <div
        ref={timelineRef}
        className="relative h-20 cursor-pointer bg-gray-950 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Timeline Grid */}
        {timeMarks.map((mark, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-gray-800 opacity-50"
            style={{ left: mark.position }}
          />
        ))}

        {/* Keyframe Markers */}
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute top-2 h-1.5 w-1.5 -translate-x-1/2 transform cursor-pointer rounded-full bg-yellow-500 transition-colors hover:bg-yellow-400"
            style={{ left: timeToPixels(marker.time) }}
            title={`${marker.label} at ${formatTime(marker.time)}`}
          />
        ))}

        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-red-500"
          style={{ left: playheadPosition }}
        >
          <div className="absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-t-[6px] border-r-[5px] border-l-[5px] border-t-red-500 border-r-transparent border-l-transparent" />
        </div>

        {/* Current Time Indicator */}
        <div
          className="pointer-events-none absolute -top-5 -translate-x-1/2 transform rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-[10px] text-white"
          style={{ left: playheadPosition }}
        >
          {formatTime(project.currentTime)}
        </div>
      </div>

      {/* Layer Tracks */}
      <div className="max-h-32 overflow-y-auto border-b border-gray-800">
        {project.layers.map((layer) => (
          <div key={layer.id} className="flex h-10 border-b border-gray-800">
            {/* Layer Label */}
            <div className="flex w-32 items-center gap-2 border-r border-gray-800 bg-gray-900 px-3">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <span className="truncate text-xs text-gray-300">{layer.name}</span>
            </div>

            {/* Layer Timeline */}
            <div className="relative flex-1 bg-gray-950">
              {layer.shapes.map((shape) => (
                <div key={shape.id} className="absolute top-1.5 h-7">
                  {shape.animations.map((animation) => (
                    <div
                      key={animation.id}
                      className="h-5 rounded-sm border border-blue-500/50 bg-blue-600/80 backdrop-blur-sm"
                      style={{
                        left: timeToPixels(animation.startTime),
                        width: timeToPixels(animation.duration),
                      }}
                      title={`${shape.type} - ${animation.property}`}
                    >
                      <div className="truncate px-1.5 text-[10px] leading-5 text-white/90">
                        {animation.property}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Layer Grid */}
              {timeMarks.map((mark, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-px bg-gray-800 opacity-30"
                  style={{ left: mark.position }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Footer */}
      <div className="flex h-6 items-center justify-between bg-gray-950 px-4">
        <div className="text-[10px] text-gray-500">{markers.length} keyframes</div>
        <div className="text-[10px] text-gray-500">{project.fps} FPS</div>
      </div>
    </div>
  );
}
