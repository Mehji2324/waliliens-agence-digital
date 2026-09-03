import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useCursor } from '../../context/CursorContext';

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const { setCursorType, resetCursor } = useCursor();

  const handleToggle = () => {
    const unmuted = soundManager.toggleMute();
    setIsMuted(!unmuted);
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setCursorType('hover')}
      onMouseLeave={resetCursor}
      aria-label={isMuted ? 'Enable sound effects' : 'Disable sound effects'}
      className="relative flex items-center gap-2 rounded-full border border-white/10 bg-obsidian-900/80 px-3 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/10"
    >
      {isMuted ? (
        <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-cyber-cyan animate-pulse" />
      )}
      <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">
        {isMuted ? 'Sound Off' : 'Sound On'}
      </span>
    </button>
  );
};
