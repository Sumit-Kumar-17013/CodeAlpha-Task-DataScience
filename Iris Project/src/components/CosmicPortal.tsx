import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { IrisSpeciesName } from '../types';

interface CosmicPortalProps {
  activeSpecies?: IrisSpeciesName | null;
  interactiveGlow?: boolean;
}

export const CosmicPortal: React.FC<CosmicPortalProps> = ({
  activeSpecies,
  interactiveGlow = true
}) => {
  // Color palette shifts based on classified species
  const themeColors = useMemo(() => {
    switch (activeSpecies) {
      case 'Iris-setosa':
        return {
          ringPrimary: 'rgba(56, 189, 248, 0.85)', // Sky blue
          ringSecondary: 'rgba(129, 140, 248, 0.7)',
          planetCore: 'from-sky-900/80 via-indigo-950/90 to-[#070b14]',
          glowHue: 'rgba(56, 189, 248, 0.35)',
          tag: 'Setosa Resonance'
        };
      case 'Iris-versicolor':
        return {
          ringPrimary: 'rgba(52, 211, 153, 0.85)', // Emerald
          ringSecondary: 'rgba(234, 179, 8, 0.7)',  // Golden
          planetCore: 'from-emerald-950/80 via-teal-950/90 to-[#070b14]',
          glowHue: 'rgba(52, 211, 153, 0.35)',
          tag: 'Versicolor Resonance'
        };
      case 'Iris-virginica':
        return {
          ringPrimary: 'rgba(168, 85, 247, 0.9)', // Purple
          ringSecondary: 'rgba(236, 72, 153, 0.7)', // Pink
          planetCore: 'from-purple-950/80 via-fuchsia-950/90 to-[#070b14]',
          glowHue: 'rgba(168, 85, 247, 0.35)',
          tag: 'Virginica Resonance'
        };
      default:
        // Default Orchid golden-celestial ring aesthetic from video
        return {
          ringPrimary: 'rgba(245, 158, 11, 0.85)', // Warm Amber/Gold
          ringSecondary: 'rgba(147, 51, 234, 0.75)', // Violet
          planetCore: 'from-amber-950/50 via-indigo-950/80 to-[#06080E]',
          glowHue: 'rgba(245, 158, 11, 0.25)',
          tag: 'Observatory Feed'
        };
    }
  }, [activeSpecies]);

  return (
    <div className="relative w-full max-w-[620px] aspect-[16/11] sm:aspect-[16/10] mx-auto select-none overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl">
      {/* Outer beveled frame of the spaceship orbital portal */}
      <div className="relative w-full h-full rounded-[22px] bg-[#05070B] overflow-hidden border border-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]">
        
        {/* Background Starfield */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 120px 80px, #93c5fd, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 220px 180px, #fef08a, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 340px 110px, #e9d5ff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 480px 240px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 540px 60px, #60a5fa, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 270px, #ffffff, rgba(0,0,0,0))`,
            backgroundSize: '550px 320px'
          }}
        />

        {/* Ambient Nebula Cloud */}
        <motion.div 
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: themeColors.glowHue }}
        />

        {/* Deep Planet Body */}
        <div className={`absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr ${themeColors.planetCore} border border-white/5 shadow-2xl transition-colors duration-700`}>
          {/* Planet atmosphere edge highlight */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_65%)]" />
          <div className="absolute inset-0 rounded-full shadow-[inset_-25px_-20px_60px_rgba(0,0,0,0.95)]" />
        </div>

        {/* Massive Glowing Planetary Rings (Matching video's golden-rainbow ring view) */}
        <svg 
          viewBox="0 0 600 400" 
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="ringGradGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.1" />
              <stop offset="25%" stopColor={themeColors.ringSecondary} stopOpacity="0.75" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="75%" stopColor={themeColors.ringPrimary} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="ringGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor={themeColors.ringPrimary} stopOpacity="0.8" />
              <stop offset="70%" stopColor={themeColors.ringSecondary} stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <filter id="cosmicGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Outer Ring Arc */}
          <ellipse
            cx="440"
            cy="195"
            rx="240"
            ry="110"
            fill="none"
            stroke="url(#ringGradOuter)"
            strokeWidth="3.5"
            transform="rotate(-26 440 195)"
            strokeDasharray="9 4"
            className="opacity-75"
          />

          {/* Primary Radiant Accretion Rings with Glow */}
          <ellipse
            cx="440"
            cy="195"
            rx="215"
            ry="92"
            fill="none"
            stroke="url(#ringGradGold)"
            strokeWidth="14"
            transform="rotate(-26 440 195)"
            filter="url(#cosmicGlow)"
          />

          {/* Inner Sharp Ring Band */}
          <ellipse
            cx="440"
            cy="195"
            rx="180"
            ry="75"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.8"
            transform="rotate(-26 440 195)"
          />

          {/* Chromatic Secondary Ribbon */}
          <ellipse
            cx="440"
            cy="195"
            rx="260"
            ry="125"
            fill="none"
            stroke={themeColors.ringSecondary}
            strokeWidth="2"
            strokeOpacity="0.45"
            transform="rotate(-26 440 195)"
          />

          {/* Distant orbital moon */}
          <circle cx="210" cy="115" r="9" fill="#1e293b" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="212" cy="113" r="8" fill="url(#ringGradOuter)" opacity="0.6" />
        </svg>

        {/* Observation Window Glass Overlay with Beveled Rim Reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/70 pointer-events-none" />
        <div className="absolute inset-0 border-[10px] sm:border-[16px] border-[#0a0d15]/85 rounded-[18px] pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />

        {/* Corner Telemetry Details (Matching Orchid UI) */}
        <div className="absolute top-5 left-6 flex items-center space-x-2 text-[11px] font-mono-code text-slate-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wider text-slate-300 font-semibold">{themeColors.tag}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">ORBIT 04</span>
        </div>

        {/* Solitary Contemplative Observer Silhouette on Ledge (From video frame) */}
        <div className="absolute bottom-3 left-1/3 -translate-x-1/2 w-14 h-16 sm:w-16 sm:h-20 flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 60 70" className="w-full h-full fill-[#05070B]">
            {/* Ledge */}
            <path d="M0 65 L60 65 L55 70 L5 70 Z" fill="#040608" />
            {/* Seated Figure */}
            {/* Head */}
            <circle cx="30" cy="22" r="5" fill="#06090e" />
            {/* Torso & Cloak */}
            <path d="M26 27 C24 33 22 45 20 62 L42 62 C38 48 36 34 34 27 Z" fill="#05080c" />
            {/* Knees bent */}
            <path d="M21 50 C24 45 28 47 34 50 L36 62 L18 62 Z" fill="#070a10" />
            {/* Rim light on observer silhouette */}
            <path d="M30 18 A5 5 0 0 1 35 23 L34 32 C37 42 41 55 42 62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Ambient Ring Glow Accent in lower corner */}
        {interactiveGlow && (
          <div 
            className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full blur-2xl pointer-events-none opacity-40 transition-colors duration-700"
            style={{ background: themeColors.ringPrimary }}
          />
        )}
      </div>
    </div>
  );
};
