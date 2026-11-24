import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type WheelEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Expand,
  Image as ImageIcon,
  Link2,
  Plus,
  ScrollText,
  Trash2,
} from 'lucide-react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react';
import { useCms } from '../context/CmsContext';
import { sanitizeUrl, type CaseStudy } from '../context/cmsSchema';
import { EditableText } from './cms/EditableText';
import { ProjectArtwork } from './ProjectArtwork';

interface WorkSectionProps {
  onSelectStudy: (study: CaseStudy) => void;
}

interface CarouselCardProps {
  study: CaseStudy;
  index: number;
  totalCount: number;
  cardCtaLabel: string;
  snapPoints: number[];
  trackX: MotionValue<number>;
  velocityTilt: MotionValue<number>;
  isOverflowing: boolean;
  shouldReduceMotion: boolean | null;
  wasDraggedRef: RefObject<boolean>;
  onSelectStudy: (study: CaseStudy) => void;
  onUpdateStudy: (index: number, patch: Partial<CaseStudy>) => void;
  onMoveStudy: (index: number, delta: -1 | 1) => void;
  onDeleteStudy: (index: number) => void;
}

const BOUNCY_SPRING = {
  type: 'spring' as const,
  stiffness: 240,
  damping: 19,
  mass: 0.9,
};

function CarouselCard({
  study,
  index,
  totalCount,
  cardCtaLabel,
  snapPoints,
  trackX,
  velocityTilt,
  isOverflowing,
  shouldReduceMotion,
  wasDraggedRef,
  onSelectStudy,
  onUpdateStudy,
  onMoveStudy,
  onDeleteStudy,
}: CarouselCardProps) {
  const { editMode, openImageEditor, openActionEditor, updateContent } = useCms();
  const targetSnap = snapPoints[index] ?? 0;
  const prevSnap = snapPoints[index - 1] ?? targetSnap + 520;
  const nextSnap = snapPoints[index + 1] ?? targetSnap - 520;

  const lowX = Math.min(nextSnap, targetSnap - 460);
  const highX = Math.max(prevSnap, targetSnap + 460);

  const rawScale = useTransform(trackX, [lowX, targetSnap, highX], [0.92, 1.0, 0.92]);
  const rawOpacity = useTransform(trackX, [lowX, targetSnap, highX], [0.65, 1, 0.65]);
  const rawY = useTransform(trackX, [lowX, targetSnap, highX], [14, -4, 14]);

  const scale = useSpring(rawScale, { stiffness: 260, damping: 18, mass: 0.7 });
  const opacity = useSpring(rawOpacity, { stiffness: 240, damping: 24 });
  const y = useSpring(rawY, { stiffness: 260, damping: 17, mass: 0.7 });

  const safeProjectUrl = sanitizeUrl(study.projectUrl ?? '', '');

  const handleOpen = () => {
    if (wasDraggedRef.current) return;
    onSelectStudy(study);
  };

  const handleEditArtwork = () => {
    openImageEditor({
      title: `Cover Image — ${study.title}`,
      src: study.imageUrl ?? '',
      alt: study.imageAlt ?? study.title,
      allowClear: true,
      clearLabel: 'Use Vector Plate',
      onApply: (next) => {
        onUpdateStudy(index, {
          imageUrl: next.src,
          imageAlt: next.alt,
        });
      },
    });
  };

  const handleEditFullScreenshot = () => {
    openImageEditor({
      title: `Full Website Screenshot — ${study.title}`,
      src: study.fullScreenshotUrl ?? '',
      alt: study.fullScreenshotAlt ?? `${study.title} full website screenshot`,
      allowClear: true,
      clearLabel: 'Clear Screenshot',
      scrollPreview: true,
      onApply: (next) => {
        onUpdateStudy(index, {
          fullScreenshotUrl: next.src,
          fullScreenshotAlt: next.alt,
        });
      },
    });
  };

  const handleEditProjectUrl = () => {
    openActionEditor({
      title: `Project Link — ${study.title}`,
      label: cardCtaLabel,
      url: study.projectUrl ?? '',
      labelFieldTitle: 'Button Label (all cards)',
      urlFieldTitle: 'Website URL (for View Project)',
      urlPlaceholder: 'https://yourclientwebsite.com',
      showSectionPresets: false,
      onApply: (next) => {
        updateContent((prev) => {
          const nextProjects = [...prev.work.projects];
          if (nextProjects[index]) {
            nextProjects[index] = { ...nextProjects[index], projectUrl: next.url };
          }
          return {
            ...prev,
            work: {
              ...prev.work,
              cardCtaLabel: next.label,
              projects: nextProjects,
            },
          };
        });
      },
    });
  };

  return (
    <motion.article
      style={
        shouldReduceMotion || !isOverflowing
          ? undefined
          : {
              scale,
              opacity,
              y,
              rotate: velocityTilt,
            }
      }
      whileHover={
        shouldReduceMotion || editMode
          ? undefined
          : { y: -8, transition: { type: 'spring', stiffness: 360, damping: 18 } }
      }
      className={`group shrink-0 w-[84vw] sm:w-[440px] lg:w-[500px] flex flex-col justify-between rounded-2xl border border-white/12 bg-zinc-950/80 p-6 backdrop-blur-xl transition-colors duration-200 hover:border-[#E5A93C]/55 hover:bg-zinc-950/90 will-change-transform ${
        editMode ? 'select-text' : 'select-none'
      }`}
    >
      <div>
        {editMode && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[#E5A93C]/55 bg-zinc-900/90 px-2.5 py-1.5 text-xs">
            <span className="font-medium text-[#E5A93C]">Card {study.index}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveStudy(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${study.title} left`}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/10 text-zinc-300 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveStudy(index, 1)}
                disabled={index === totalCount - 1}
                aria-label={`Move ${study.title} right`}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/10 text-zinc-300 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {totalCount > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteStudy(index)}
                  aria-label={`Delete ${study.title}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/10 text-zinc-300 hover:border-red-400/50 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Visual Artwork Plate — clicks open full scrolling website screenshot popup */}
        {editMode ? (
          <div className="relative h-52 sm:h-60 w-full rounded-xl outline-dashed outline-2 outline-offset-2 outline-[#E5A93C]/70">
            <button
              type="button"
              onClick={handleOpen}
              aria-label={`Open scrolling website screenshot popup for ${study.title}`}
              className="block h-full w-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <ProjectArtwork
                motif={study.motif}
                palette={study.palette}
                title={study.title}
                index={study.index}
                imageUrl={study.imageUrl}
                imageAlt={study.imageAlt}
              />
            </button>

            <div className="absolute top-2.5 right-2.5 z-10 flex flex-wrap items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={handleEditArtwork}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-zinc-950/92 px-2.5 text-[11px] font-semibold text-[#E5A93C] shadow-md hover:border-[#E5A93C] cursor-pointer whitespace-nowrap shrink-0"
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cover Image</span>
              </button>
              <button
                type="button"
                onClick={handleEditFullScreenshot}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-zinc-950/92 px-2.5 text-[11px] font-semibold text-white shadow-md hover:border-[#E5A93C] hover:text-[#E5A93C] cursor-pointer whitespace-nowrap shrink-0"
              >
                <ScrollText className="h-3.5 w-3.5 text-[#E5A93C]" aria-hidden="true" />
                <span>
                  {study.fullScreenshotUrl ? 'Edit Screenshot' : 'Add Full Screenshot'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpen}
              className="absolute bottom-2.5 left-2.5 z-10 inline-flex h-7 items-center gap-1 rounded-md border border-white/15 bg-zinc-950/90 px-2 text-[11px] font-medium text-zinc-200 hover:border-[#E5A93C] hover:text-[#E5A93C] cursor-pointer"
            >
              <Expand className="h-3 w-3" aria-hidden="true" />
              <span>Preview Popup</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            aria-label={`View full scrolling website screenshot for ${study.title}`}
            className="relative block h-52 sm:h-60 w-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
          >
            <ProjectArtwork
              motif={study.motif}
              palette={study.palette}
              title={study.title}
              index={study.index}
              imageUrl={study.imageUrl}
              imageAlt={study.imageAlt}
            />
          </button>
        )}

        {/* Card Index */}
        <div className="mt-5 flex items-center justify-end">
          <span className="font-display text-xs font-semibold text-zinc-500 tabular-nums">
            {study.index}
          </span>
        </div>

        {/* Title & Description */}
        <EditableText
          as="h3"
          value={study.title}
          singleLine
          ariaLabel="Project title"
          onChange={(val) => onUpdateStudy(index, { title: val })}
          className="mt-2.5 block font-display text-2xl font-semibold tracking-tight text-white group-hover:text-[#E5A93C] transition-colors duration-150"
        />
        <EditableText
          as="p"
          value={study.summary}
          ariaLabel="Project summary"
          onChange={(val) => onUpdateStudy(index, { summary: val })}
          className="mt-2 block text-sm leading-relaxed text-zinc-300"
        />
      </div>

      {/* Explicit Interactive Project Webpage Link */}
      <div
        className={`mt-6 flex items-center gap-4 border-t border-white/10 pt-4 ${
          editMode ? 'justify-between' : 'justify-end'
        }`}
      >
        {editMode ? (
          <>
            <button
              type="button"
              onClick={handleEditProjectUrl}
              className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-dashed border-[#E5A93C]/70 bg-zinc-900/90 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 hover:border-[#E5A93C] hover:text-[#E5A93C] cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0 text-[#E5A93C]" aria-hidden="true" />
              <span className="truncate">
                {safeProjectUrl
                  ? safeProjectUrl.replace(/^https?:\/\//, '')
                  : 'Set Website URL'}
              </span>
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A93C] whitespace-nowrap shrink-0 rounded-sm py-1 px-1">
              <EditableText
                value={cardCtaLabel}
                singleLine
                ariaLabel="Project button label"
                onChange={(val) =>
                  updateContent((prev) => ({
                    ...prev,
                    work: { ...prev.work, cardCtaLabel: val },
                  }))
                }
              />
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </>
        ) : safeProjectUrl ? (
          safeProjectUrl.startsWith('#') ? (
            <a
              href={safeProjectUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A93C] whitespace-nowrap shrink-0 underline-offset-4 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] rounded-sm py-1 px-1"
            >
              <span>{cardCtaLabel}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          ) : (
            <a
              href={safeProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A93C] whitespace-nowrap shrink-0 underline-offset-4 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] rounded-sm py-1 px-1"
            >
              <span>{cardCtaLabel}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          )
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A93C] whitespace-nowrap shrink-0 underline-offset-4 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] rounded-sm py-1 px-1"
          >
            <span>{cardCtaLabel}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </motion.article>
  );
}

export function WorkSection({ onSelectStudy }: WorkSectionProps) {
  const { content, editMode, updateContent } = useCms();
  const { work } = content;
  const projects = work.projects;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [snapPoints, setSnapPoints] = useState<number[]>([0]);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const wasDraggedRef = useRef(false);
  const wheelEndTimerRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const trackX = useMotionValue(0);
  const trackVelocity = useVelocity(trackX);
  const rawTilt = useTransform(trackVelocity, [-2400, 0, 2400], [-2.5, 0, 2.5]);
  const velocityTilt = useSpring(rawTilt, { stiffness: 280, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4, 1], ['36px', '0px', '-32px']);
  const isOverflowing = maxTranslate > 8;

  const measureTrack = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const vw = viewport.clientWidth;
    const sw = track.scrollWidth;
    const maxScroll = Math.max(0, sw - vw);
    setMaxTranslate(maxScroll);

    const children = Array.from(track.children) as HTMLElement[];
    const points = children.map((child) => {
      const center = child.offsetLeft + child.offsetWidth / 2;
      const ideal = vw / 2 - center;
      return Math.max(-maxScroll, Math.min(0, ideal));
    });

    setSnapPoints(points.length > 0 ? points : [0]);
  }, []);

  useEffect(() => {
    measureTrack();
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const observer = new ResizeObserver(measureTrack);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measureTrack, projects.length]);

  useEffect(() => {
    const unsubscribe = trackX.on('change', (latest) => {
      if (snapPoints.length === 0) return;
      let closestIdx = 0;
      let closestDist = Infinity;
      snapPoints.forEach((pt, idx) => {
        const d = Math.abs(pt - latest);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    });
    return () => unsubscribe();
  }, [snapPoints, trackX]);

  const findNearestSnap = useCallback(
    (projectedX: number) => {
      if (snapPoints.length === 0) return 0;
      let best = snapPoints[0];
      let bestDist = Infinity;
      for (const pt of snapPoints) {
        const d = Math.abs(pt - projectedX);
        if (d < bestDist) {
          bestDist = d;
          best = pt;
        }
      }
      return best;
    },
    [snapPoints]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (snapPoints.length === 0) return;
      const clamped = Math.max(0, Math.min(snapPoints.length - 1, index));
      const target = snapPoints[clamped] ?? 0;
      setActiveIndex(clamped);

      if (shouldReduceMotion) {
        trackX.set(target);
      } else {
        animate(trackX, target, BOUNCY_SPRING);
      }
    },
    [shouldReduceMotion, snapPoints, trackX]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: globalThis.WheelEvent) => {
      if (!isOverflowing) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;

      const currentX = trackX.get();
      const atStart = delta < 0 && currentX >= -4;
      const atEnd = delta > 0 && currentX <= -maxTranslate + 4;
      if (atStart || atEnd) return; // Allow natural page scroll past boundaries

      e.preventDefault();
      const next = Math.max(-maxTranslate, Math.min(0, currentX - delta));
      trackX.set(next);

      if (wheelEndTimerRef.current) {
        window.clearTimeout(wheelEndTimerRef.current);
      }
      wheelEndTimerRef.current = window.setTimeout(() => {
        const snapped = findNearestSnap(trackX.get());
        if (shouldReduceMotion) {
          trackX.set(snapped);
        } else {
          animate(trackX, snapped, BOUNCY_SPRING);
        }
      }, 110);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [isOverflowing, maxTranslate, trackX, shouldReduceMotion, findNearestSnap]);

  const handleTrackKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editMode) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleUpdateStudy = (index: number, patch: Partial<CaseStudy>) => {
    updateContent((prev) => {
      const next = [...prev.work.projects];
      if (next[index]) {
        next[index] = { ...next[index], ...patch };
      }
      return { ...prev, work: { ...prev.work, projects: next } };
    });
  };

  const handleMoveStudy = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    updateContent((prev) => {
      const next = [...prev.work.projects];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      const reindexed = next.map((proj, i) => ({
        ...proj,
        index: String(i + 1).padStart(2, '0'),
      }));
      return { ...prev, work: { ...prev.work, projects: reindexed } };
    });
  };

  const handleDeleteStudy = (index: number) => {
    if (projects.length <= 1) return;
    updateContent((prev) => {
      const filtered = prev.work.projects.filter((_, i) => i !== index);
      const reindexed = filtered.map((proj, i) => ({
        ...proj,
        index: String(i + 1).padStart(2, '0'),
      }));
      return { ...prev, work: { ...prev.work, projects: reindexed } };
    });
  };

  const handleAddStudy = () => {
    const nextIdx = String(projects.length + 1).padStart(2, '0');
    const newProject: CaseStudy = {
      id: `project-${Date.now()}`,
      index: nextIdx,
      title: 'New Studio Commission',
      client: 'Client Name',
      category: 'Brand Identity',
      secondaryDiscipline: 'Visual System',
      year: '2026',
      metricValue: '+50%',
      metricContext: 'Key outcome metric context',
      summary: 'Brief editorial overview of the brand identity, art direction, or digital craft.',
      challenge: 'Describe the creative challenge and positioning opportunity.',
      approach: 'Describe the strategic direction, typography, and digital execution.',
      deliverables: ['Brand Identity', 'Digital Platform', 'Art Direction'],
      palette: ['#E8DFD3', '#18181B', '#E5A93C'],
      motif: 'monolith',
      imageUrl: '',
      imageAlt: 'New studio commission artwork',
      fullScreenshotUrl: '',
      fullScreenshotAlt: 'New studio commission full website screenshot',
      projectUrl: '',
      quote: {
        text: 'A concise, attributable client quote describing the outcome.',
        author: 'Client Name',
        role: 'Founder',
      },
    };
    updateContent((prev) => ({
      ...prev,
      work: {
        ...prev.work,
        projects: [...prev.work.projects, newProject],
      },
    }));
    window.setTimeout(() => scrollToIndex(projects.length), 80);
  };

  const minProgress = Math.min(1, 1 / Math.max(1, projects.length));
  const progressScaleX = useTransform(
    trackX,
    [Math.min(-1, -maxTranslate), 0],
    [1, minProgress]
  );
  const smoothProgressBar = useSpring(progressScaleX, {
    stiffness: 200,
    damping: 20,
  });

  return (
    <section
      id="my-work"
      ref={sectionRef}
      aria-label="My Work"
      className="relative z-10 min-h-screen py-24 sm:py-32 overflow-hidden"
    >
      {/* Luminous yellow atmospheric gradient joining header into the black page (matching reference image) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] sm:h-[720px] overflow-hidden select-none"
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'url(/assets/aistudio/yellow_header_gradient.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 70% at 50% 0%, rgba(246, 222, 72, 0.35) 0%, rgba(211, 179, 8, 0.18) 36%, transparent 75%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-zinc-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <motion.div
          style={shouldReduceMotion ? undefined : { y: headerY }}
          className="border-b border-white/15 pb-10 will-change-transform"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#E5A93C]">
                02
              </span>
              <span className="h-px w-8 bg-[#E5A93C]/40" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-300">
                Selected Portfolio
              </span>
            </div>

            {/* Extra Large "MY WORKS" Title spanning across the gradient like the reference image */}
            <EditableText
              as="h2"
              value={
                work.kicker.toLowerCase().includes('work')
                  ? work.kicker.replace(/^\d+[\.\s]*/, '')
                  : 'My Works'
              }
              singleLine
              ariaLabel="Work section title"
              onChange={(val) =>
                updateContent((prev) => ({ ...prev, work: { ...prev.work, kicker: val } }))
              }
              className="mt-4 block font-display text-[clamp(3.75rem,11.5vw,10rem)] font-extrabold uppercase leading-[0.88] tracking-tight text-white drop-shadow-sm"
            />

            <EditableText
              as="p"
              value={work.heading}
              ariaLabel="Work section heading description"
              onChange={(val) =>
                updateContent((prev) => ({ ...prev, work: { ...prev.work, heading: val } }))
              }
              className="mt-4 block max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-300"
            />
          </div>
        </motion.div>

        {/* Carousel Controls & Live Index Counter */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-display text-sm font-semibold text-white tabular-nums">
              {String(Math.min(activeIndex + 1, projects.length)).padStart(2, '0')}
              <span className="mx-1.5 text-zinc-500">/</span>
              <span className="text-zinc-400">
                {String(projects.length).padStart(2, '0')}
              </span>
            </span>
            <EditableText
              value={work.helperText}
              singleLine
              ariaLabel="Carousel helper text"
              onChange={(val) =>
                updateContent((prev) => ({ ...prev, work: { ...prev.work, helperText: val } }))
              }
              className="text-xs text-zinc-400"
            />
            {editMode && (
              <button
                type="button"
                onClick={handleAddStudy}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-[#E5A93C] bg-[#E5A93C]/10 px-3 text-xs font-semibold text-[#E5A93C] hover:bg-[#E5A93C]/20 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Project</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous work item"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-zinc-950/75 text-white transition-transform duration-150 active:scale-90 hover:border-[#E5A93C]/60 hover:text-[#E5A93C] disabled:opacity-35 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex >= projects.length - 1}
              aria-label="Next work item"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-zinc-950/75 text-white transition-transform duration-150 active:scale-90 hover:border-[#E5A93C]/60 hover:text-[#E5A93C] disabled:opacity-35 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-bleed Spring-Bouncy Horizontal Carousel Viewport */}
      <div
        ref={viewportRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Selected work horizontal showcase"
        onKeyDown={handleTrackKeyDown}
        style={{ touchAction: 'pan-y' }}
        className={`relative mt-6 overflow-x-clip py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] ${
          !editMode && isOverflowing ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
      >
        <motion.div
          ref={trackRef}
          style={{ x: trackX }}
          drag={isOverflowing && !editMode ? 'x' : false}
          dragConstraints={{ left: -maxTranslate, right: 0 }}
          dragElastic={0.22}
          dragMomentum={!shouldReduceMotion}
          dragTransition={{
            bounceStiffness: 240,
            bounceDamping: 18,
            power: 0.35,
            timeConstant: 220,
            modifyTarget: (projected) => findNearestSnap(projected),
          }}
          onDragStart={() => {
            wasDraggedRef.current = true;
            setIsDragging(true);
          }}
          onDragEnd={() => {
            setIsDragging(false);
            window.setTimeout(() => {
              wasDraggedRef.current = false;
            }, 80);
          }}
          className="flex w-max items-stretch gap-6 px-6 sm:px-10 lg:px-16 will-change-transform"
        >
          {projects.map((study, idx) => (
            <CarouselCard
              key={study.id}
              study={study}
              index={idx}
              totalCount={projects.length}
              cardCtaLabel={work.cardCtaLabel}
              snapPoints={snapPoints}
              trackX={trackX}
              velocityTilt={velocityTilt}
              isOverflowing={isOverflowing}
              shouldReduceMotion={shouldReduceMotion}
              wasDraggedRef={wasDraggedRef}
              onSelectStudy={onSelectStudy}
              onUpdateStudy={handleUpdateStudy}
              onMoveStudy={handleMoveStudy}
              onDeleteStudy={handleDeleteStudy}
            />
          ))}
        </motion.div>
      </div>

      {/* Horizontal Tactile Track Scrubber & Index Segments */}
      <div className="mx-auto mt-4 max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-6">
          <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              style={
                shouldReduceMotion || !isOverflowing
                  ? { scaleX: isOverflowing ? (activeIndex + 1) / Math.max(1, projects.length) : 1 }
                  : { scaleX: smoothProgressBar }
              }
              className="absolute inset-0 origin-left bg-[#E5A93C]"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {projects.map((study, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={study.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Jump to ${study.title}`}
                  className={`px-2 py-1 text-xs font-medium tabular-nums transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] ${
                    isCurrent ? 'text-[#E5A93C]' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {study.index}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
