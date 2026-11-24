import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, Image as ImageIcon, Pencil } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { navigateToUrl } from '../utils/navigation';
import { CoffeeSteam } from './CoffeeSteam';
import { EditableText } from './cms/EditableText';
import type { SectionId } from './Navbar';

interface HomeSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [fgError, setFgError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const { content, editMode, updateContent, openImageEditor, openActionEditor } = useCms();
  const { home } = content;

  useEffect(() => {
    setBgError(false);
  }, [home.bgDefaultImage.src, home.bgHoverImage.src]);

  useEffect(() => {
    setFgError(false);
  }, [home.fgDefaultImage.src, home.fgHoverImage.src]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  // Pixel-locked parallax transforms shared by background & forefront cutout
  const imageScale = useTransform(smoothScroll, [0, 1], [1.0, 1.08]);
  const imageY = useTransform(smoothScroll, [0, 1], ['0%', '8%']);

  const contentY = useTransform(smoothScroll, [0, 1], ['0px', '-36px']);
  const contentOpacity = useTransform(smoothScroll, [0, 0.78, 1], [1, 0.45, 0]);

  const handleEditAction = (
    key: 'primaryButton' | 'secondaryButton' | 'scrollCueButton',
    title: string
  ) => {
    const current = home[key];
    openActionEditor({
      title,
      label: current.label,
      url: current.url,
      onApply: (next) => {
        updateContent((prev) => ({
          ...prev,
          home: {
            ...prev.home,
            [key]: next,
          },
        }));
      },
    });
  };

  const handleEditHeroImage = (
    key: 'bgDefaultImage' | 'bgHoverImage' | 'fgDefaultImage' | 'fgHoverImage',
    title: string
  ) => {
    const target = home[key];
    openImageEditor({
      title,
      src: target.src,
      alt: target.alt,
      onApply: (next) => {
        updateContent((prev) => ({
          ...prev,
          home: {
            ...prev.home,
            [key]: next,
          },
        }));
      },
    });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      aria-label="Home"
      className="relative z-10 flex h-screen min-h-[680px] flex-col justify-between overflow-hidden bg-[#f6de48]"
    >
      {/* LAYER 0 (z-0): Full-screen yellow studio full-body portrait with flash-free hover crossfade */}
      {!bgError ? (
        <motion.div
          aria-hidden="true"
          style={
            shouldReduceMotion
              ? undefined
              : {
                  scale: imageScale,
                  y: imageY,
                }
          }
          className="pointer-events-none absolute inset-0 z-0 select-none will-change-transform"
        >
          <img
            src={home.bgDefaultImage.src}
            alt={home.bgDefaultImage.alt}
            referrerPolicy="no-referrer"
            onError={() => setBgError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
          />
          <img
            src={home.bgHoverImage.src}
            alt={home.bgHoverImage.alt}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-250 ease-out ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </motion.div>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#f1db4a] via-[#f6de48] to-[#d6be20]"
        />
      )}

      {/* LAYER 1 (z-10): Large bold slow marquee under the menu, passing behind head */}
      <motion.div
        aria-hidden="true"
        style={
          shouldReduceMotion
            ? undefined
            : {
                y: contentY,
                opacity: contentOpacity,
              }
        }
        className="pointer-events-none absolute inset-x-0 top-14 sm:top-16 z-10 overflow-x-clip py-4 select-none will-change-transform"
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: ['0%', '-50%'],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 54,
                  ease: 'linear',
                }
          }
          className="flex w-max items-center will-change-transform"
        >
          {[0, 1, 2, 3].map((copyIdx) => (
            <span
              key={copyIdx}
              className="font-display text-[clamp(5.25rem,16vw,15.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.03em] text-zinc-950/90 whitespace-nowrap pr-16 sm:pr-32"
            >
              {home.marqueeText}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* LAYER 2 (z-20): Forefront subject cutout so head and hair stay cleanly in front of the marquee */}
      {!bgError && (
        <motion.div
          aria-hidden="true"
          style={
            shouldReduceMotion
              ? undefined
              : {
                  scale: imageScale,
                  y: imageY,
                }
          }
          className="pointer-events-none absolute inset-0 z-20 select-none will-change-transform"
        >
          {!fgError && (
            <>
              <img
                src={home.fgDefaultImage.src}
                alt={home.fgDefaultImage.alt}
                referrerPolicy="no-referrer"
                onError={() => setFgError(true)}
                style={{
                  transitionProperty: 'opacity',
                  transitionDuration: isHovered ? '120ms' : '220ms',
                  transitionTimingFunction: 'ease-out',
                  transitionDelay: isHovered ? '130ms' : '0ms',
                }}
                className={`absolute inset-0 h-full w-full object-cover object-center ${
                  isHovered ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <img
                src={home.fgHoverImage.src}
                alt={home.fgHoverImage.alt}
                referrerPolicy="no-referrer"
                style={{
                  transitionProperty: 'opacity',
                  transitionDuration: isHovered ? '250ms' : '150ms',
                  transitionTimingFunction: 'ease-out',
                  transitionDelay: isHovered ? '0ms' : '100ms',
                }}
                className={`absolute inset-0 h-full w-full object-cover object-center ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          )}
          <CoffeeSteam active={isHovered} reducedMotion={shouldReduceMotion} />
        </motion.div>
      )}

      {/* Edit Mode floating hero media & marquee controls */}
      {editMode && (
        <div className="absolute top-20 right-6 sm:right-10 lg:right-16 z-30 flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-zinc-950/88 px-3 py-1.5 text-xs text-zinc-100 shadow-lg backdrop-blur-md">
            <Pencil className="h-3 w-3 text-[#E5A93C]" aria-hidden="true" />
            <span className="text-zinc-400">Marquee:</span>
            <EditableText
              value={home.marqueeText}
              singleLine
              ariaLabel="Hero marquee text"
              onChange={(val) =>
                updateContent((prev) => ({
                  ...prev,
                  home: { ...prev.home, marqueeText: val },
                }))
              }
              className="font-semibold text-white px-1"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              handleEditHeroImage(
                isHovered ? 'bgHoverImage' : 'bgDefaultImage',
                isHovered ? 'Edit Hover Portrait Background' : 'Edit Default Portrait Background'
              )
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/15 bg-zinc-950/88 px-3 text-xs font-medium text-white shadow-lg backdrop-blur-md hover:border-[#E5A93C] hover:text-[#E5A93C] cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHovered ? 'Edit Hover Photo' : 'Edit Portrait Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleEditHeroImage(
                isHovered ? 'fgHoverImage' : 'fgDefaultImage',
                isHovered ? 'Edit Hover Cutout Layer' : 'Edit Default Cutout Layer'
              )
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/15 bg-zinc-950/88 px-3 text-xs font-medium text-zinc-200 shadow-lg backdrop-blur-md hover:border-[#E5A93C] hover:text-[#E5A93C] cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHovered ? 'Edit Hover Cutout' : 'Edit Cutout'}</span>
          </button>
        </div>
      )}

      {/* Interactive central hover/tap zone over the person */}
      <button
        type="button"
        aria-label="Toggle portrait pose"
        aria-pressed={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onClick={() => {
          if (editMode) {
            handleEditHeroImage(
              isHovered ? 'bgHoverImage' : 'bgDefaultImage',
              isHovered ? 'Edit Hover Portrait Background' : 'Edit Default Portrait Background'
            );
            return;
          }
          setIsHovered((prev) => !prev);
        }}
        className={`absolute inset-y-16 left-1/2 z-30 w-[min(78vw,460px)] -translate-x-1/2 cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/70 rounded-2xl ${
          editMode ? 'border-2 border-dashed border-zinc-950/45 hover:border-[#E5A93C]' : ''
        }`}
      />

      {/* Subtle bottom transition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-zinc-950/30 to-transparent"
      />

      <h1 className="sr-only">Waldemar Rosado — Creative Direction &amp; Brand Portfolio</h1>

      <div className="flex-1" />

      {/* Peripheral editorial intro & CTAs clear of the full-body figure */}
      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                y: contentY,
                opacity: contentOpacity,
              }
        }
        className="pointer-events-none relative z-30 mx-auto w-full max-w-[1440px] px-6 pb-6 sm:px-10 sm:pb-8 lg:px-16 will-change-transform"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/12 bg-zinc-950/75 p-5 backdrop-blur-xl">
            <p className="text-xs font-medium text-[#E5A93C]">
              <EditableText
                value={home.kickerLeft}
                singleLine
                ariaLabel="Hero kicker left"
                onChange={(val) =>
                  updateContent((prev) => ({
                    ...prev,
                    home: { ...prev.home, kickerLeft: val },
                  }))
                }
              />
              <span aria-hidden="true" className="mx-2 text-zinc-500">
                ·
              </span>
              <EditableText
                value={home.kickerRight}
                singleLine
                ariaLabel="Hero kicker right"
                onChange={(val) =>
                  updateContent((prev) => ({
                    ...prev,
                    home: { ...prev.home, kickerRight: val },
                  }))
                }
                className="text-zinc-200"
              />
            </p>
            <EditableText
              as="p"
              value={home.introText}
              ariaLabel="Hero intro text"
              onChange={(val) =>
                updateContent((prev) => ({
                  ...prev,
                  home: { ...prev.home, introText: val },
                }))
              }
              className="mt-2 block text-sm leading-relaxed text-zinc-200"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  editMode
                    ? handleEditAction('primaryButton', 'Edit Primary Hero Button')
                    : navigateToUrl(home.primaryButton.url, onNavigate)
                }
                className={`inline-flex h-10 items-center gap-2 rounded-lg bg-[#E5A93C] px-4 py-2 text-xs font-semibold text-zinc-950 whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-[#eab85c] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  editMode ? 'outline-dashed outline-2 outline-offset-2 outline-white' : ''
                }`}
              >
                <span>{home.primaryButton.label}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() =>
                  editMode
                    ? handleEditAction('secondaryButton', 'Edit Secondary Hero Button')
                    : navigateToUrl(home.secondaryButton.url, onNavigate)
                }
                className={`inline-flex h-10 items-center rounded-lg border border-white/20 bg-zinc-900/70 px-4 py-2 text-xs font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white/40 hover:bg-zinc-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] ${
                  editMode ? 'outline-dashed outline-2 outline-offset-2 outline-[#E5A93C]' : ''
                }`}
              >
                <span>{home.secondaryButton.label}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              editMode
                ? handleEditAction('scrollCueButton', 'Edit Scroll Cue Button')
                : navigateToUrl(home.scrollCueButton.url, onNavigate)
            }
            className={`pointer-events-auto inline-flex items-center gap-2 self-start lg:self-end rounded-lg border border-white/15 bg-zinc-950/70 px-4 py-2.5 text-xs font-medium text-zinc-100 backdrop-blur-md hover:border-[#E5A93C]/60 hover:text-[#E5A93C] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] ${
              editMode ? 'outline-dashed outline-2 outline-offset-2 outline-[#E5A93C]' : ''
            }`}
          >
            <span>{home.scrollCueButton.label}</span>
            <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
