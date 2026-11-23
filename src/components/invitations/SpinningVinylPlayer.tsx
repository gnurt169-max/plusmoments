'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SpinningVinylPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function SpinningVinylPlayer({ isPlaying, onToggle }: SpinningVinylPlayerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      {/* Mini Equalizer Waves when playing */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs shadow-xs animate-fade-in">
          <span className="w-1 bg-[#D4AF37] rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
          <span className="w-1 bg-[#D4AF37] rounded-full animate-[equalizer_1.2s_ease-in-out_infinite_0.2s]" style={{ height: '85%' }} />
          <span className="w-1 bg-[#D4AF37] rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_0.4s]" style={{ height: '60%' }} />
        </div>
      )}

      {/* Spinning Vinyl Record Disc */}
      <button
        type="button"
        onClick={onToggle}
        className="group relative w-12 h-12 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
      >
        {/* Vinyl Body */}
        <div
          className={`w-full h-full rounded-full border-2 border-[#333] shadow-inner flex items-center justify-center transition-all ${
            isPlaying ? 'animate-[spin_7s_linear_infinite]' : ''
          }`}
          style={{
            background: 'radial-gradient(circle, #2A2A2A 0%, #151515 70%, #0D0D0D 100%)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4), inset 0 0 4px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Concentric Grooves */}
          <div className="absolute inset-1.5 rounded-full border border-stone-800/80 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-stone-800/80 pointer-events-none" />

          {/* Golden Center Label */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center border border-[#A67C38]"
            style={{
              background: 'radial-gradient(circle, #E8C170 0%, #A67C38 100%)',
            }}
          >
            {/* Center Spindle Hole */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
          </div>
        </div>

        {/* Small floating badge status indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-xs">
          {isPlaying ? (
            <Volume2 className="w-2.5 h-2.5 text-[#8C6D46] animate-pulse" />
          ) : (
            <VolumeX className="w-2.5 h-2.5 text-stone-400" />
          )}
        </div>
      </button>

      <style jsx>{`
        @keyframes equalizer {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
