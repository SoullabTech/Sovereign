'use client';

type VoiceMode = 'talk' | 'care' | 'note';

interface VoiceModeConfig {
  mode: VoiceMode;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const VOICE_MODES: VoiceModeConfig[] = [
  {
    mode: 'talk',
    label: 'Talk',
    description: 'Peer dialogue • 1-2 sentences • Mirror, not lamp',
    icon: '💬',
    color: 'violet',
  },
  {
    mode: 'care',
    label: 'Care',
    description: 'Therapeutic guide • 2-4 sentences • Pattern-naming',
    icon: '🌿',
    color: 'emerald',
  },
  {
    mode: 'note',
    label: 'Note',
    description: 'Witnessing observer • 2-3 sentences • Temporal tracking',
    icon: '📝',
    color: 'amber',
  },
];

interface VoiceModeSelectorProps {
  currentMode: VoiceMode;
  onModeChange: (mode: VoiceMode) => void;
  disabled?: boolean;
}

export function VoiceModeSelector({ currentMode, onModeChange, disabled }: VoiceModeSelectorProps) {
  return (
    <div className="bg-slate-900/50 border border-violet-500/30 rounded-lg p-6">
      <h2 className="text-white text-lg font-semibold mb-4">Choose Voice Mode</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VOICE_MODES.map((config) => {
          const isActive = currentMode === config.mode;

          return (
            <button
              key={config.mode}
              onClick={() => onModeChange(config.mode)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isActive
                  ? `border-${config.color}-500 bg-${config.color}-500/10`
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{config.icon}</span>
                <span className={`font-semibold ${isActive ? `text-${config.color}-400` : 'text-white'}`}>
                  {config.label}
                </span>
              </div>

              <p className="text-xs text-slate-400 text-left">
                {config.description}
              </p>

              {isActive && (
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${config.color}-500 animate-pulse`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
