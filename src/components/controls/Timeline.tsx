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
    <div className={`border-t border-gray-700 bg-gray-900 ${className}`}>
      {/* Timeline Header */}
      <div className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={project.isPlaying ? pause : play}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            {project.isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={stop}
            className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
          >
            ⏹️
          </button>
        </div>

        <div className="font-mono text-sm text-white">
          {formatTime(project.currentTime)} / {formatTime(project.duration)}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Duration:</label>
          <input
            type="number"
            value={Math.floor(project.duration / 1000)}
            onChange={(e) => setDuration(Number(e.target.value) * 1000)}
            min="1"
            max="180"
            className="w-16 rounded bg-gray-700 px-2 py-1 text-sm text-white"
          />
          <span className="text-sm text-gray-400">s</span>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="relative h-8 overflow-hidden border-b border-gray-700 bg-gray-800">
        {timeMarks.map((mark, index) => (
          <div
            key={index}
            className="absolute top-0 text-xs text-gray-400 select-none"
            style={{ left: mark.position }}
          >
            <div className="mb-1 h-2 w-px bg-gray-600" />
            <div className="-translate-x-1/2 transform whitespace-nowrap">{mark.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline Track */}
      <div
        ref={timelineRef}
        className="relative h-24 cursor-pointer bg-gray-900 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Keyframe Markers */}
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute top-4 h-2 w-2 -translate-x-1/2 transform cursor-pointer rounded-full bg-yellow-500 hover:bg-yellow-400"
            style={{ left: timeToPixels(marker.time) }}
            title={`${marker.label} at ${formatTime(marker.time)}`}
          />
        ))}

        {/* Timeline Grid */}
        {timeMarks.map((mark, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-gray-700 opacity-30"
            style={{ left: mark.position }}
          />
        ))}

        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-red-500"
          style={{ left: playheadPosition }}
        >
          <div className="absolute -top-1 -left-1 h-2 w-2 rotate-45 bg-red-500" />
        </div>

        {/* Current Time Indicator */}
        <div
          className="pointer-events-none absolute -top-6 -translate-x-1/2 transform rounded bg-red-500 px-1 py-0.5 text-xs text-white"
          style={{ left: playheadPosition }}
        >
          {formatTime(project.currentTime)}
        </div>
      </div>

      {/* Layer Tracks */}
      <div className="max-h-48 overflow-y-auto">
        {project.layers.map((layer) => (
          <div key={layer.id} className="flex h-12 border-b border-gray-700">
            {/* Layer Label */}
            <div className="flex w-32 items-center border-r border-gray-700 bg-gray-800 px-3">
              <span className="truncate text-sm text-white">{layer.name}</span>
            </div>

            {/* Layer Timeline */}
            <div className="relative flex-1 bg-gray-900">
              {layer.shapes.map((shape) => (
                <div key={shape.id} className="absolute top-1 h-10">
                  {shape.animations.map((animation) => (
                    <div
                      key={animation.id}
                      className="bg-opacity-60 mb-1 h-6 rounded border border-blue-400 bg-blue-600"
                      style={{
                        left: timeToPixels(animation.startTime),
                        width: timeToPixels(animation.duration),
                      }}
                      title={`${shape.type} - ${animation.property}`}
                    >
                      <div className="truncate px-1 text-xs text-white">{animation.property}</div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Layer Grid */}
              {timeMarks.map((mark, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-px bg-gray-700 opacity-20"
                  style={{ left: mark.position }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Footer */}
      <div className="flex h-8 items-center justify-between border-t border-gray-700 bg-gray-800 px-4">
        <div className="text-xs text-gray-400">{markers.length} keyframes</div>
        <div className="text-xs text-gray-400">{project.fps} FPS</div>
      </div>
    </div>
  );
}
