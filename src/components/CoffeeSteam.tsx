import { motion } from 'motion/react';

interface CoffeeSteamProps {
  active: boolean;
  reducedMotion: boolean | null;
}

interface SteamWispConfig {
  id: string;
  baseX: number;
  baseY: number;
  path: string;
  strokeWidth: number;
  duration: number;
  delay: number;
  driftX: [number, number, number, number];
  riseY: [number, number, number, number];
  scaleX: [number, number, number, number];
  scaleY: [number, number, number, number];
  rotate: [number, number, number, number];
  opacity: [number, number, number, number];
}

// Coordinates aligned to the hover portrait coffee mug opening
const STEAM_WISPS: SteamWispConfig[] = [
  {
    id: 'wisp-center',
    baseX: 1072,
    baseY: 506,
    path: 'M 0 0 C -12 -32, 16 -64, -6 -100 C -18 -128, 14 -160, -4 -196',
    strokeWidth: 12,
    duration: 2.8,
    delay: 0,
    driftX: [0, -8, 10, -5],
    riseY: [0, -30, -70, -112],
    scaleX: [0.8, 1.1, 1.4, 1.7],
    scaleY: [0.7, 1.0, 1.25, 1.45],
    rotate: [0, -4, 5, -3],
    opacity: [0, 0.92, 0.55, 0],
  },
  {
    id: 'wisp-left',
    baseX: 1052,
    baseY: 508,
    path: 'M 0 0 C 14 -28, -16 -60, 8 -92 C 22 -120, -10 -150, 6 -182',
    strokeWidth: 10,
    duration: 3.2,
    delay: 0.5,
    driftX: [0, 9, -11, -16],
    riseY: [0, -26, -64, -104],
    scaleX: [0.75, 1.05, 1.35, 1.62],
    scaleY: [0.65, 0.95, 1.2, 1.38],
    rotate: [0, 5, -6, -8],
    opacity: [0, 0.85, 0.48, 0],
  },
  {
    id: 'wisp-right',
    baseX: 1092,
    baseY: 508,
    path: 'M 0 0 C -16 -30, 14 -58, -8 -88 C -20 -116, 16 -148, 2 -180',
    strokeWidth: 10.5,
    duration: 3.0,
    delay: 1.1,
    driftX: [0, -10, 12, 16],
    riseY: [0, -28, -66, -106],
    scaleX: [0.78, 1.08, 1.38, 1.65],
    scaleY: [0.68, 0.98, 1.22, 1.4],
    rotate: [0, -5, 6, 7],
    opacity: [0, 0.88, 0.52, 0],
  },
  {
    id: 'wisp-curl-a',
    baseX: 1062,
    baseY: 504,
    path: 'M 0 0 C -18 -24, 20 -54, -10 -88 C -26 -112, 12 -142, -8 -170',
    strokeWidth: 8.5,
    duration: 3.5,
    delay: 1.7,
    driftX: [0, -6, 13, 5],
    riseY: [0, -24, -58, -96],
    scaleX: [0.72, 1.02, 1.32, 1.58],
    scaleY: [0.65, 0.92, 1.16, 1.32],
    rotate: [0, -6, 4, -5],
    opacity: [0, 0.78, 0.42, 0],
  },
  {
    id: 'wisp-curl-b',
    baseX: 1082,
    baseY: 505,
    path: 'M 0 0 C 16 -26, -18 -56, 10 -88 C 24 -114, -12 -144, 8 -174',
    strokeWidth: 9,
    duration: 3.3,
    delay: 2.2,
    driftX: [0, 7, -10, 8],
    riseY: [0, -25, -60, -98],
    scaleX: [0.75, 1.04, 1.34, 1.6],
    scaleY: [0.66, 0.94, 1.18, 1.35],
    rotate: [0, 5, -5, 4],
    opacity: [0, 0.82, 0.46, 0],
  },
];

const VAPOR_PUFFS = [
  { id: 'puff-a', cx: 1070, cy: 496, rx: 32, ry: 20, duration: 3.6, delay: 0.1 },
  { id: 'puff-b', cx: 1076, cy: 492, rx: 38, ry: 24, duration: 4.0, delay: 1.8 },
];

export function CoffeeSteam({ active, reducedMotion }: CoffeeSteamProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 2134 1200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <filter id="coffee-steam-wisp-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="coffee-steam-plume-blur" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <linearGradient id="coffee-steam-stroke" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="55%" stopColor="#fffdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="coffee-steam-puff" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.48" />
            <stop offset="50%" stopColor="#fffdf6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {reducedMotion ? (
          <g opacity={0.75}>
            <ellipse
              cx={1072}
              cy={474}
              rx={32}
              ry={30}
              fill="url(#coffee-steam-puff)"
              filter="url(#coffee-steam-plume-blur)"
            />
            {STEAM_WISPS.slice(0, 3).map((wisp) => (
              <path
                key={wisp.id}
                d={wisp.path}
                transform={`translate(${wisp.baseX}, ${wisp.baseY})`}
                fill="none"
                stroke="url(#coffee-steam-stroke)"
                strokeWidth={wisp.strokeWidth}
                strokeLinecap="round"
                filter="url(#coffee-steam-wisp-blur)"
                opacity={0.65}
              />
            ))}
          </g>
        ) : (
          <g>
            {/* Immediate vibrant surface vapor */}
            <motion.ellipse
              cx={1072}
              cy={496}
              rx={26}
              ry={14}
              fill="url(#coffee-steam-puff)"
              filter="url(#coffee-steam-plume-blur)"
              animate={{
                opacity: [0.55, 0.85, 0.55],
                scaleX: [0.92, 1.12, 0.92],
                scaleY: [0.92, 1.18, 0.92],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Soft ambient vapor rising directly off the mug rim */}
            {VAPOR_PUFFS.map((puff) => (
              <g key={puff.id} transform={`translate(${puff.cx}, ${puff.cy})`}>
                <motion.ellipse
                  cx={0}
                  cy={0}
                  rx={puff.rx}
                  ry={puff.ry}
                  fill="url(#coffee-steam-puff)"
                  filter="url(#coffee-steam-plume-blur)"
                  animate={{
                    y: [0, -40, -96, -150],
                    x: [0, -10, 12, -6],
                    scaleX: [0.75, 1.2, 1.65, 2.0],
                    scaleY: [0.75, 1.28, 1.75, 2.1],
                    opacity: [0, 0.88, 0.5, 0],
                  }}
                  transition={{
                    duration: puff.duration,
                    delay: puff.delay,
                    repeat: Infinity,
                    ease: 'easeOut',
                    times: [0, 0.2, 0.6, 1],
                  }}
                />
              </g>
            ))}

            {/* Layered curling steam wisps */}
            {STEAM_WISPS.map((wisp) => (
              <g key={wisp.id} transform={`translate(${wisp.baseX}, ${wisp.baseY})`}>
                <motion.path
                  d={wisp.path}
                  fill="none"
                  stroke="url(#coffee-steam-stroke)"
                  strokeWidth={wisp.strokeWidth}
                  strokeLinecap="round"
                  filter="url(#coffee-steam-wisp-blur)"
                  animate={{
                    x: wisp.driftX,
                    y: wisp.riseY,
                    scaleX: wisp.scaleX,
                    scaleY: wisp.scaleY,
                    rotate: wisp.rotate,
                    opacity: wisp.opacity,
                  }}
                  transition={{
                    duration: wisp.duration,
                    delay: wisp.delay,
                    repeat: Infinity,
                    ease: 'easeOut',
                    times: [0, 0.18, 0.6, 1],
                  }}
                />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
