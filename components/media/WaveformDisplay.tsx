'use client';

interface WaveformDisplayProps {
  assetId: string;
  projectId: string;
  currentTime?: number;
  duration?: number;
  onClick?: (time: number) => void;
}

export function WaveformDisplay({ assetId, projectId, currentTime = 0, duration = 0, onClick }: WaveformDisplayProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full h-[50px] bg-[#0d0d1a] rounded overflow-hidden cursor-pointer"
      onClick={(e) => {
        if (!onClick || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;
        onClick(ratio * duration);
      }}
    >
      {/* Waveform image */}
      <img
        src={`/api/media/projects/${projectId}/assets/${assetId}/serve`}
        alt="Waveform"
        className="w-full h-full object-cover"
      />

      {/* Playhead overlay */}
      {duration > 0 && (
        <div
          className="absolute top-0 bottom-0 left-0 bg-amber-500/20 pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
