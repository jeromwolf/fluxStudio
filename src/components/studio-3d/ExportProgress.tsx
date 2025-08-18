'use client';

import { ExportProgress3D } from '@/lib/three/export-manager';

interface ExportProgressProps {
  progress: ExportProgress3D;
  onCancel?: () => void;
}

const STAGE_ICONS = {
  preparing: '⚙️',
  recording: '📹',
  encoding: '⚡',
  finalizing: '✨',
  complete: '✅',
  error: '❌',
};

// Stage descriptions for future use
// const STAGE_DESCRIPTIONS = {
//   preparing: 'Setting up export environment...',
//   recording: 'Capturing animation frames...',
//   encoding: 'Processing and compressing...',
//   finalizing: 'Preparing final file...',
//   complete: 'Export completed successfully!',
//   error: 'Export failed with errors.',
// };

export default function ExportProgress({ progress, onCancel }: ExportProgressProps) {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getStageColor = (stage: ExportProgress3D['stage']) => {
    switch (stage) {
      case 'preparing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'recording':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'encoding':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'finalizing':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'complete':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className={`rounded-lg p-4 ${getStageColor(progress.stage)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{STAGE_ICONS[progress.stage]}</span>
          <span className="font-semibold capitalize">{progress.stage}</span>
        </div>
        <div className="text-sm font-medium">
          {Math.round(progress.progress * 100)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-200 ${
              progress.stage === 'error' ? 'bg-red-500' : 'bg-current'
            }`}
            style={{ width: `${progress.progress * 100}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <p className="text-sm">{progress.message}</p>
        
        {progress.stage === 'recording' && progress.totalFrames > 0 && (
          <div className="text-xs opacity-75">
            Frame {progress.currentFrame} of {progress.totalFrames}
          </div>
        )}

        <div className="flex justify-between text-xs opacity-75">
          <span>
            Elapsed: {formatTime(progress.elapsedTime)}
          </span>
          {progress.estimatedTimeRemaining > 0 && progress.stage !== 'complete' && (
            <span>
              Remaining: {formatTime(progress.estimatedTimeRemaining)}
            </span>
          )}
        </div>
      </div>

      {/* Cancel Button */}
      {progress.stage !== 'complete' && progress.stage !== 'error' && onCancel && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1 rounded border border-current/30 hover:bg-current/10 transition-colors"
          >
            Cancel Export
          </button>
        </div>
      )}

      {/* Stage-specific Info */}
      {progress.stage === 'recording' && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-xs opacity-75">
            💡 The viewport will continue animating while recording in the background
          </div>
        </div>
      )}

      {progress.stage === 'encoding' && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-xs opacity-75">
            ⚡ Compressing frames for optimal file size and quality
          </div>
        </div>
      )}
    </div>
  );
}