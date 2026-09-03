import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  glow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 36,
  showText = true,
  glow = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Waliliens Emblem: Volubilis Arch + Cosmic Alien Orbit */}
      <div
        style={{ width: size, height: size }}
        className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-obsidian-900 to-obsidian-800 p-1.5 border border-white/15 transition-all duration-300 ${
          glow ? 'shadow-[0_0_20px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.45)] group-hover:border-cyber-cyan/50' : ''
        }`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="waliliGrad" x1="10" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#00F0FF" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Roman Arch of Volubilis (Left) */}
          {/* Base and plinth */}
          <path
            d="M12 96 H56 M16 96 V80 H42 V96"
            stroke="url(#waliliGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main Left Pillar & Outer Arch Capital */}
          <path
            d="M26 80 V36 H64 M20 36 H70 M16 26 H72"
            stroke="url(#waliliGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Arch Column and Capital Detail */}
          <path
            d="M40 80 V58 H54 M34 58 H58"
            stroke="url(#waliliGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arch Curve seamlessly morphing into Alien Head Profile */}
          <path
            d="M42 58 C42 42 56 34 72 34 C94 34 104 50 102 68 C100 82 86 92 78 96 C72 99 66 98 64 92 L64 88"
            stroke="url(#waliliGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Slanted Alien Eye */}
          <path
            d="M74 54 C79 48 87 46 88 52 C89 58 81 64 76 66 C73 64 72 58 74 54 Z"
            fill="url(#waliliGrad)"
          />

          {/* Planetary Orbit Ring encircling the head */}
          <path
            d="M52 74 C46 76 44 80 50 82 C64 86 98 72 108 52 C113 42 109 36 102 38 C94 40 80 48 68 58"
            stroke="#00F0FF"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className="font-display text-lg font-black tracking-wider text-white sm:text-xl">
          WALILIENS
        </span>
      )}
    </div>
  );
};
