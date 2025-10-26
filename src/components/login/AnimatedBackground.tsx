'use client';

import { memo } from 'react';

interface AnimatedBackgroundProps {
  isDark: boolean;
}

const AnimatedBackground = memo(({ isDark }: AnimatedBackgroundProps) => {
  return (
    <>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-red-600' : 'bg-red-200'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-red-700' : 'bg-red-300'
        }`}></div>
        <div className={`absolute top-40 left-40 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-red-800' : 'bg-red-400'
        }`}></div>
      </div>

      {/* Floating Particles - Optimized with useMemo for positions */}
      <div className="absolute inset-0">
        {PARTICLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-pulse ${
              isDark ? 'bg-red-400' : 'bg-red-400'
            }`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
              animationDuration: `${pos.duration}s`
            }}
          />
        ))}
      </div>
    </>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

// Optimized particle positions - moved outside component to prevent recreation
const PARTICLE_POSITIONS = [
  { left: 7.68, top: 40.54, delay: 0.97, duration: 3.26 },
  { left: 58.75, top: 14.69, delay: 0.26, duration: 2.14 },
  { left: 55.53, top: 35.12, delay: 0.33, duration: 4.87 },
  { left: 35.62, top: 97.52, delay: 0.89, duration: 2.63 },
  { left: 68.17, top: 81.42, delay: 1.76, duration: 2.44 },
  { left: 47.88, top: 3.59, delay: 0.70, duration: 2.89 },
  { left: 69.31, top: 95.61, delay: 2.59, duration: 2.30 },
  { left: 86.86, top: 55.65, delay: 0.71, duration: 2.10 },
  { left: 15.52, top: 58.61, delay: 0.40, duration: 4.48 },
  { left: 27.46, top: 85.87, delay: 0.57, duration: 2.95 },
  { left: 27.34, top: 8.78, delay: 0.67, duration: 3.80 },
  { left: 22.06, top: 32.28, delay: 2.05, duration: 3.18 },
  { left: 49.42, top: 13.91, delay: 2.74, duration: 3.33 },
  { left: 27.19, top: 25.01, delay: 1.65, duration: 3.56 },
  { left: 4.59, top: 31.77, delay: 2.21, duration: 2.32 }
];

export default AnimatedBackground;
