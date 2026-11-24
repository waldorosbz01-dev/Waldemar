import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Image as ImageIcon,
  Link2,
  Pause,
  Play,
  ScrollText,
  X,
} from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { sanitizeUrl, type CaseStudy } from '../context/cmsSchema';
import { EditableText } from './cms/EditableText';
import { ProjectArtwork } from './ProjectArtwork';

interface CaseStudyModalProps {
  study: CaseStudy | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onInquire: (projectTitle: string) => void;
}

export function CaseStudyModal({
  study,
  onClose,
  onPrev,
  onNext,
  onInquire,
}: CaseStudyModalProps) {
  const {
    content,
    editMode,
    imageEditor,
    actionEditor,
    updateContent,
    openImageEditor,
    openActionEditor,
  } = useCms();

  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [autoScrolling, setAutoScrolling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [screenshotFailed, setScreenshotFailed] = useState(false);

  const liveIndex = study
    ? content.work.projects.findIndex((item) => item.id === study.id)
    : -1;
  const activeStudy = liveIndex >= 0 ? content.work.projects[liveIndex] : study;

  const fullScreenshot = activeStudy?.fullScreenshotUrl?.trim() ?? '';
  const coverImage = activeStudy?.imageUrl?.trim() ?? '';
  const displaySrc = fullScreenshot || coverImage;
  const displayAlt =
    (fullScreenshot ? activeStudy?.fullScreenshotAlt : activeStudy?.imageAlt) ||
    `${activeStudy?.title ?? 'Project'} website preview`;
  const safeProjectUrl = sanitizeUrl(activeStudy?.projectUrl ?? '', '');

  useEffect(() => {
    setScreenshotFailed(false);
    setAutoScrolling(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeStudy?.id, displaySrc]);

  useEffect(() => {
    if (!activeStudy) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (imageEditor || actionEditor) return;
      if (event.key === 'Escape') onClose();
      if (!editMode) {
        if (event.key === 'ArrowLeft') onPrev();
        if (event.key === 'ArrowRight') onNext();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStudy, editMode, imageEditor, actionEditor, onClose, onPrev, onNext]);

  // Smooth auto-scroll animation loop when toggled on
  useEffect(() => {
    if (!autoScrolling || editMode || shouldReduceMotion) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId = 0;
    let pauseTimer: number | null = null;
    let lastTime = performance.now();
    const speedPxPerSec = 95;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 4) {
        setAutoScrolling(false);
        return;
      }
      if (container.scrollTop >= maxScroll - 1) {
        if (!pauseTimer) {
          pauseTimer = window.setTimeout(() => {
            if (container) {
              container.scrollTo({ top: 0, behavior: 'smooth' });
            }
            pauseTimer = null;
            lastTime = performance.now();
            rafId = window.requestAnimationFrame(step);
          }, 1400);
        }
        return;
      } else {
        container.scrollTop = Math.min(maxScroll, container.scrollTop + speedPxPerSec * dt);
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
      if (pauseTimer) window.clearTimeout(pauseTimer);
    };
  }, [autoScrolling, editMode, shouldReduceMotion]);

  if (!activeStudy) return null;

  const updateProject = (patch: Partial<CaseStudy>) => {
    if (liveIndex < 0) return;
    updateContent((prev) => {
      const next = [...prev.work.projects];
      if (next[liveIndex]) {
        next[liveIndex] = { ...next[liveIndex], ...patch };
      }
      return { ...prev, work: { ...prev.work, projects: next } };
    });
  };

  const handleEditFullScreenshot = () => {
    openImageEditor({
      title: `Full Website Screenshot — ${activeStudy.title}`,
      src: activeStudy.fullScreenshotUrl ?? '',
      alt: activeStudy.fullScreenshotAlt ?? `${activeStudy.title} full website screenshot`,
      allowClear: true,
      clearLabel: 'Clear Screenshot',
      scrollPreview: true,
      onApply: (next) => {
        updateProject({
          fullScreenshotUrl: next.src,
          fullScreenshotAlt: next.alt,
        });
      },
    });
  };

  const handleEditCoverImage = () => {
    openImageEditor({
      title: `Cover Image — ${activeStudy.title}`,
      src: activeStudy.imageUrl ?? '',
      alt: activeStudy.imageAlt ?? activeStudy.title,
      allowClear: true,
      clearLabel: 'Use Vector Plate',
      onApply: (next) => {
        updateProject({
          imageUrl: next.src,
          imageAlt: next.alt,
        });
      },
    });
  };

  const handleEditProjectUrl = () => {
    openActionEditor({
      title: `Project Link — ${activeStudy.title}`,
      label: content.work.cardCtaLabel,
      url: activeStudy.projectUrl ?? '',
      labelFieldTitle: 'Button Label (all cards)',
      urlFieldTitle: 'Website URL (for View Project)',
      urlPlaceholder: 'https://yourclientwebsite.com',
      showSectionPresets: false,
      onApply: (next) => {
        updateContent((prev) => {
          const nextProjects = [...prev.work.projects];
          if (liveIndex >= 0 && nextProjects[liveIndex]) {
            nextProjects[liveIndex] = { ...nextProjects[liveIndex], projectUrl: next.url };
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

  const handleToggleAutoScroll = () => {
    const container = scrollContainerRef.current;
    if (!autoScrolling && container) {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop >= maxScroll - 2) {
        container.scrollTop = 0;
      }
    }
    setAutoScrolling((prev) => !prev);
  };

  const handleScrollToTop = () => {
    setAutoScrolling(false);
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/88 p-3 sm:p-6 lg:p-8 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/95 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="tabular-nums text-xs font-semibold text-[#E5A93C] shrink-0">
              {activeStudy.index}
            </span>
            <span aria-hidden="true" className="text-zinc-600 shrink-0">
              /
            </span>
            <h2 id="case-study-modal-title" className="min-w-0 truncate">
              <EditableText
                value={activeStudy.title}
                singleLine
                ariaLabel="Project title"
                onChange={(val) => updateProject({ title: val })}
                className="font-display text-lg sm:text-xl font-bold tracking-tight text-white"
              />
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleEditFullScreenshot}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-[#E5A93C]/80 bg-zinc-950/90 px-3 text-xs font-semibold text-[#E5A93C] hover:border-[#E5A93C] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{fullScreenshot ? 'Edit Full Screenshot' : 'Upload Full Screenshot'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleEditCoverImage}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-800/80 px-3 text-xs font-medium text-zinc-200 hover:border-[#E5A93C] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Cover</span>
                </button>
                <button
                  type="button"
                  onClick={handleEditProjectUrl}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-800/80 px-3 text-xs font-medium text-zinc-200 hover:border-[#E5A93C] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Link2 className="h-3.5 w-3.5 text-[#E5A93C]" aria-hidden="true" />
                  <span>Website URL</span>
                </button>
              </>
            ) : (
              displaySrc &&
              !screenshotFailed && (
                <button
                  type="button"
                  onClick={handleToggleAutoScroll}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] ${
                    autoScrolling
                      ? 'border-[#E5A93C] bg-[#E5A93C]/15 text-[#E5A93C]'
                      : 'border-white/15 bg-zinc-800/70 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {autoScrolling ? (
                    <>
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Pause Scroll</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Auto-Scroll</span>
                    </>
                  )}
                </button>
              )
            )}

            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/70 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/70 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close popup"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-zinc-800 text-white transition-colors hover:bg-zinc-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Browser Address Bar Strip */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/75 px-5 py-2.5 text-xs text-zinc-400 sm:px-7">
          <div className="flex min-w-0 items-center gap-2">
            <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
            {safeProjectUrl ? (
              <span className="truncate font-mono text-[11px] text-zinc-300">
                {safeProjectUrl}
              </span>
            ) : (
              <span className="truncate text-[11px] text-zinc-500">
                {editMode
                  ? 'No webpage URL assigned — click Website URL above to link'
                  : 'Full-page website preview'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {displaySrc && !screenshotFailed && (
              <button
                type="button"
                onClick={handleScrollToTop}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                <span>Top</span>
              </button>
            )}
            {safeProjectUrl && !editMode && (
              <a
                href={safeProjectUrl}
                target={safeProjectUrl.startsWith('#') ? undefined : '_blank'}
                rel={safeProjectUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E5A93C] hover:underline whitespace-nowrap shrink-0"
              >
                <span>Open Live Site</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Full-Page Scrolling Website Screenshot Viewport */}
        <div
          ref={scrollContainerRef}
          onWheel={() => {
            if (autoScrolling) setAutoScrolling(false);
          }}
          onTouchStart={() => {
            if (autoScrolling) setAutoScrolling(false);
          }}
          onPointerDown={() => {
            if (autoScrolling) setAutoScrolling(false);
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-zinc-950"
        >
          {displaySrc && !screenshotFailed ? (
            <div className="relative mx-auto w-full flex justify-center bg-zinc-950 px-4 sm:px-8 py-6">
              <img
                src={displaySrc}
                alt={displayAlt}
                referrerPolicy="no-referrer"
                onError={() => setScreenshotFailed(true)}
                className="block h-auto w-full max-w-4xl object-contain object-top select-none rounded-xl shadow-2xl"
              />
              {editMode && !fullScreenshot && (
                <div className="border-t border-white/10 bg-zinc-900/95 px-6 py-4 text-center">
                  <p className="text-xs text-zinc-300">
                    Currently showing the card cover image. Upload a full-page website screenshot so
                    visitors can scroll through the entire site.
                  </p>
                  <button
                    type="button"
                    onClick={handleEditFullScreenshot}
                    className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 hover:bg-[#eab85c] cursor-pointer"
                  >
                    <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Upload Full Website Screenshot</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center p-6 sm:p-10">
              <div className="h-[320px] w-full max-w-2xl">
                <ProjectArtwork
                  motif={activeStudy.motif}
                  palette={activeStudy.palette}
                  title={activeStudy.title}
                  index={activeStudy.index}
                />
              </div>
              {editMode ? (
                <button
                  type="button"
                  onClick={handleEditFullScreenshot}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 hover:bg-[#eab85c] cursor-pointer"
                >
                  <ScrollText className="h-4 w-4" aria-hidden="true" />
                  <span>Upload Full Website Screenshot</span>
                </button>
              ) : (
                <p className="mt-5 text-xs text-zinc-400">
                  Scroll preview placeholder — upload a full-page website screenshot in CMS Edit Mode.
                </p>
              )}
            </div>
          )}

          {/* Collapsible / Editable Project Details Section inside scroll area */}
          {showDetails && (
            <div className="border-t border-white/10 bg-zinc-900/95 px-6 py-7 sm:px-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Project Summary
                  </h3>
                  <EditableText
                    as="p"
                    value={activeStudy.summary}
                    ariaLabel="Project summary"
                    onChange={(val) => updateProject({ summary: val })}
                    className="mt-2 block text-sm leading-relaxed text-zinc-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Client
                    </h3>
                    <EditableText
                      value={activeStudy.client}
                      singleLine
                      ariaLabel="Client name"
                      onChange={(val) => updateProject({ client: val })}
                      className="mt-1.5 block text-sm font-medium text-zinc-100"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Year
                    </h3>
                    <EditableText
                      value={activeStudy.year}
                      singleLine
                      ariaLabel="Project year"
                      onChange={(val) => updateProject({ year: val })}
                      className="mt-1.5 block text-sm font-medium text-zinc-100 tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Deliverables
                    </h3>
                    <EditableText
                      as="p"
                      value={activeStudy.deliverables.join(' · ')}
                      singleLine
                      ariaLabel="Project deliverables"
                      onChange={(val) =>
                        updateProject({
                          deliverables: val
                            .split('·')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="mt-1.5 block text-sm text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    The Challenge
                  </h3>
                  <EditableText
                    as="p"
                    value={activeStudy.challenge}
                    ariaLabel="Project challenge"
                    onChange={(val) => updateProject({ challenge: val })}
                    className="mt-2 block text-sm leading-relaxed text-zinc-300"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Creative Direction
                  </h3>
                  <EditableText
                    as="p"
                    value={activeStudy.approach}
                    ariaLabel="Project approach"
                    onChange={(val) => updateProject({ approach: val })}
                    className="mt-2 block text-sm leading-relaxed text-zinc-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-zinc-900 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800/70 px-3 text-xs font-medium text-zinc-200 hover:border-white/25 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>
                {showDetails
                  ? 'Hide Notes'
                  : editMode
                    ? 'Edit Project Notes'
                    : 'Project Notes'}
              </span>
              {showDetails ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            <span className="hidden md:inline text-xs text-zinc-400">
              Scroll to browse the full page · ESC to close
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onInquire(activeStudy.title)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-zinc-800/80 px-4 text-xs font-medium text-zinc-100 whitespace-nowrap shrink-0 transition-colors hover:border-white/35 hover:bg-zinc-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
            >
              <span>Inquire Similar</span>
            </button>

            {editMode ? (
              <button
                type="button"
                onClick={handleEditProjectUrl}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 whitespace-nowrap shrink-0 hover:bg-[#eab85c] cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{safeProjectUrl ? 'Edit Website URL' : 'Set Website URL'}</span>
              </button>
            ) : safeProjectUrl ? (
              <a
                href={safeProjectUrl}
                target={safeProjectUrl.startsWith('#') ? undefined : '_blank'}
                rel={safeProjectUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E5A93C] px-5 text-xs sm:text-sm font-semibold text-zinc-950 whitespace-nowrap shrink-0 transition-colors hover:bg-[#eab85c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>{content.work.cardCtaLabel}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
