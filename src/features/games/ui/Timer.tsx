// Timer Display Component
import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // Total duration in seconds
  startTime?: number; // Start timestamp
  onTimeUp?: () => void;
  className?: string;
}

export function Timer({ duration, startTime, onTimeUp, className = '' }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    if (!startTime) return;

    const updateTimer = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [duration, startTime, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const percentage = timeRemaining / duration;
    if (percentage > 0.5) return 'text-green-400';
    if (percentage > 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm ${className}`}>
      <div className="text-center">
        <p className="text-sm text-white/70">Time Remaining</p>
        <p className={`text-3xl font-bold ${getTimerColor()}`}>{formatTime(timeRemaining)}</p>
      </div>
    </div>
  );
}
