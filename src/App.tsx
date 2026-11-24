import { useCallback, useEffect, useState } from 'react';
import { CaseStudyModal } from './components/CaseStudyModal';
import {
  ActionEditorPopover,
  AdminAuthModal,
  AdminToolbar,
  ChangePasswordModal,
  CmsToast,
  ImageEditorPopover,
} from './components/cms/AdminOverlays';
import { ContactSection } from './components/ContactSection';
import { HomeSection } from './components/HomeSection';
import { Navbar, type SectionId } from './components/Navbar';
import { ParallaxBackdrop } from './components/ParallaxBackdrop';
import { WorkSection } from './components/WorkSection';
import { CmsProvider, useCms } from './context/CmsContext';
import type { CaseStudy } from './context/cmsSchema';

const SECTION_ORDER: { id: SectionId; index: string; label: string }[] = [
  { id: 'home', index: '01', label: 'Home' },
  { id: 'my-work', index: '02', label: 'My Work' },
  { id: 'lets-talk', index: '03', label: "Let's Talk" },
];

function PortfolioShell() {
  const { content } = useCms();
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [prefilledProject, setPrefilledProject] = useState<string | null>(null);

  useEffect(() => {
    if (content.site.pageTitle) {
      document.title = content.site.pageTitle;
    }
  }, [content.site.pageTitle]);

  const navigateToSection = useCallback((id: SectionId) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Track which of the 3 scrolling pages is in primary viewport focus
  useEffect(() => {
    const sections = SECTION_ORDER.map((item) => document.getElementById(item.id)).filter(
      Boolean
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.id as SectionId;
          setActiveSection(id);
        }
      },
      {
        rootMargin: '-25% 0px -35% 0px',
        threshold: [0.15, 0.4, 0.7],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleStepCaseStudy = (direction: -1 | 1) => {
    const projects = content.work.projects;
    if (!selectedStudy || projects.length === 0) return;
    const currentIndex = projects.findIndex((s) => s.id === selectedStudy.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + projects.length) % projects.length;
    setSelectedStudy(projects[nextIndex]);
  };

  const handleInquireFromModal = (projectTitle: string) => {
    setPrefilledProject(projectTitle);
    setSelectedStudy(null);
    setTimeout(() => navigateToSection('lets-talk'), 60);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      {/* Persistent Full-Screen Parallax Portrait Background */}
      <ParallaxBackdrop />

      {/* Fixed 3-Zone Top Navigation Bar */}
      <Navbar activeSection={activeSection} onNavigate={navigateToSection} />

      {/* Subtle right-edge 3-page vertical waypoint indicator (desktop only) */}
      <aside
        aria-label="Page section indicator"
        className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:flex flex-col items-end gap-4"
      >
        {SECTION_ORDER.map((item) => {
          const isCurrent = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToSection(item.id)}
              aria-label={`Jump to ${item.label}`}
              className="group flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] rounded-sm py-0.5"
            >
              <span
                className={`text-[11px] font-medium tracking-wide transition-opacity duration-150 ${
                  isCurrent
                    ? 'text-[#E5A93C] opacity-100'
                    : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                {item.index} {item.label}
              </span>
              <span
                className={`block h-6 w-[2px] transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#E5A93C] scale-y-100'
                    : 'bg-white/25 scale-y-75 group-hover:bg-white/60'
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* 3 Full-Screen Scrolling Pages */}
      <main>
        <HomeSection onNavigate={navigateToSection} />
        <WorkSection onSelectStudy={setSelectedStudy} />
        <ContactSection
          prefilledProject={prefilledProject}
          onNavigate={navigateToSection}
        />
      </main>

      {/* Case Study Detail Lightbox */}
      <CaseStudyModal
        study={selectedStudy}
        onClose={() => setSelectedStudy(null)}
        onPrev={() => handleStepCaseStudy(-1)}
        onNext={() => handleStepCaseStudy(1)}
        onInquire={handleInquireFromModal}
      />

      {/* Visual CMS Admin UI */}
      <AdminAuthModal />
      <ChangePasswordModal />
      <ImageEditorPopover />
      <ActionEditorPopover />
      <AdminToolbar />
      <CmsToast />
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <PortfolioShell />
    </CmsProvider>
  );
}
