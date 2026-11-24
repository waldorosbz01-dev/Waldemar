import { useEffect, useState } from 'react';
import type { CaseStudy } from '../context/cmsSchema';

interface ProjectArtworkProps {
  motif: CaseStudy['motif'];
  palette: CaseStudy['palette'];
  title: string;
  index: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function ProjectArtwork({
  motif,
  palette,
  title,
  index,
  imageUrl,
  imageAlt,
}: ProjectArtworkProps) {
  const [light, dark, accent] = palette;
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [imageUrl]);

  const showCustomImage = Boolean(imageUrl && imageUrl.trim().length > 0 && !imgFailed);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${dark} 0%, #0d0d10 100%)`,
      }}
    >
      {showCustomImage ? (
        <>
          <img
            src={imageUrl}
            alt={imageAlt || title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
          />
        </>
      ) : (
        <svg
          viewBox="0 0 400 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
        >
          {/* Soft studio radial highlight */}
          <defs>
            <radialGradient id={`glow-${index}`} cx="70%" cy="30%" r="65%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={dark} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="260" fill={`url(#glow-${index})`} />

          {motif === 'arch' && (
            <>
              <path
                d="M120 260V130C120 85.817 155.817 50 200 50C244.183 50 280 85.817 280 130V260"
                stroke={light}
                strokeOpacity="0.55"
                strokeWidth="1.25"
              />
              <path
                d="M150 260V136C150 108.386 172.386 86 200 86C227.614 86 250 108.386 250 136V260"
                fill={light}
                fillOpacity="0.08"
                stroke={accent}
                strokeOpacity="0.7"
                strokeWidth="1"
              />
              <line x1="60" y1="210" x2="340" y2="210" stroke={light} strokeOpacity="0.2" />
            </>
          )}

          {motif === 'grid' && (
            <>
              <rect
                x="64"
                y="42"
                width="272"
                height="176"
                stroke={light}
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <line x1="154" y1="42" x2="154" y2="218" stroke={light} strokeOpacity="0.25" />
              <line x1="244" y1="42" x2="244" y2="218" stroke={light} strokeOpacity="0.25" />
              <line x1="64" y1="100" x2="336" y2="100" stroke={light} strokeOpacity="0.25" />
              <line x1="64" y1="160" x2="336" y2="160" stroke={light} strokeOpacity="0.25" />
              <rect x="154" y="100" width="90" height="60" fill={accent} fillOpacity="0.28" />
            </>
          )}

          {motif === 'circle' && (
            <>
              <circle cx="200" cy="130" r="82" stroke={light} strokeOpacity="0.45" strokeWidth="1" />
              <circle cx="200" cy="130" r="54" stroke={accent} strokeOpacity="0.75" strokeWidth="1.25" />
              <circle cx="200" cy="130" r="22" fill={light} fillOpacity="0.14" />
              <line x1="80" y1="130" x2="320" y2="130" stroke={light} strokeOpacity="0.2" />
            </>
          )}

          {motif === 'monolith' && (
            <>
              <rect
                x="148"
                y="36"
                width="104"
                height="188"
                fill={light}
                fillOpacity="0.09"
                stroke={light}
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              <rect x="172" y="64" width="56" height="132" stroke={accent} strokeOpacity="0.65" />
              <line x1="90" y1="224" x2="310" y2="224" stroke={light} strokeOpacity="0.3" />
            </>
          )}

          {motif === 'horizon' && (
            <>
              <path
                d="M40 164C110 132 168 122 228 140C276 154 322 146 364 116"
                stroke={light}
                strokeOpacity="0.5"
                strokeWidth="1.25"
              />
              <path
                d="M40 188C124 166 198 168 268 182C306 190 338 186 364 174"
                stroke={accent}
                strokeOpacity="0.65"
                strokeWidth="1"
              />
              <circle cx="268" cy="78" r="24" fill={accent} fillOpacity="0.35" />
            </>
          )}

          {motif === 'prism' && (
            <>
              <polygon
                points="200,40 296,204 104,204"
                fill={light}
                fillOpacity="0.07"
                stroke={light}
                strokeOpacity="0.48"
                strokeWidth="1"
              />
              <polygon
                points="200,82 260,188 140,188"
                stroke={accent}
                strokeOpacity="0.72"
                strokeWidth="1.25"
              />
              <line x1="200" y1="40" x2="200" y2="204" stroke={light} strokeOpacity="0.22" />
            </>
          )}
        </svg>
      )}

      {/* Bottom corner editorial plate label & palette dots */}
      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[11px] font-medium text-zinc-300">
        <span className="tabular-nums tracking-wider text-zinc-400">Plate {index}</span>
        <div className="flex items-center gap-1.5" aria-label={`${title} palette`}>
          {palette.map((hex) => (
            <span
              key={hex}
              className="h-2.5 w-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
