import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Menu, Plus, Trash2, X } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { navigateToUrl } from '../utils/navigation';

export type SectionId = 'home' | 'my-work' | 'lets-talk';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
}

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pastHomeHeader, setPastHomeHeader] = useState(false);
  const { content, editMode, updateContent, openActionEditor } = useCms();
  const { navLinks, primaryCta } = content.navbar;

  useEffect(() => {
    const updateScrollState = () => {
      const homeEl = document.getElementById('home');
      if (!homeEl) {
        setPastHomeHeader(window.scrollY > 40);
        return;
      }
      const rect = homeEl.getBoundingClientRect();
      setPastHomeHeader(rect.bottom <= 64);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const isOnYellowHero = activeSection === 'home' && !pastHomeHeader;

  const handleLinkClick = (url: string, label: string, index: number) => {
    if (editMode) {
      openActionEditor({
        title: 'Edit Navigation Link',
        label,
        url,
        onApply: (next) => {
          updateContent((prev) => {
            const copy = [...prev.navbar.navLinks];
            if (copy[index]) {
              copy[index] = { ...copy[index], label: next.label, url: next.url };
            }
            return { ...prev, navbar: { ...prev.navbar, navLinks: copy } };
          });
        },
      });
      return;
    }
    setMobileMenuOpen(false);
    navigateToUrl(url, onNavigate);
  };

  const handlePrimaryCtaClick = () => {
    if (editMode) {
      openActionEditor({
        title: 'Edit Header CTA Button',
        label: primaryCta.label,
        url: primaryCta.url,
        onApply: (next) => {
          updateContent((prev) => ({
            ...prev,
            navbar: { ...prev.navbar, primaryCta: next },
          }));
        },
      });
      return;
    }
    setMobileMenuOpen(false);
    navigateToUrl(primaryCta.url, onNavigate);
  };

  const moveNavLink = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= navLinks.length) return;
    updateContent((prev) => {
      const next = [...prev.navbar.navLinks];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, navbar: { ...prev.navbar, navLinks: next } };
    });
  };

  const deleteNavLink = (index: number) => {
    if (navLinks.length <= 1) return;
    updateContent((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        navLinks: prev.navbar.navLinks.filter((_, i) => i !== index),
      },
    }));
  };

  const addNavLink = () => {
    updateContent((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        navLinks: [
          ...prev.navbar.navLinks,
          { id: `nav-${Date.now()}`, label: 'New Link', url: '#my-work' },
        ],
      },
    }));
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        isOnYellowHero
          ? 'bg-transparent border-b border-transparent'
          : 'bg-zinc-950/88 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-6 sm:px-10 lg:px-16">
        {/* Left-aligned navigation menu */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              isOnYellowHero
                ? 'border-zinc-950/20 bg-zinc-950/10 text-zinc-950 hover:bg-zinc-950/20 focus-visible:ring-zinc-950'
                : 'border-[#E5A93C]/35 bg-zinc-900/80 text-[#E5A93C] hover:bg-zinc-800 focus-visible:ring-[#E5A93C]'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-bold"
          >
            {navLinks.map((item, idx) => {
              const targetSection = item.url.startsWith('#') ? item.url.slice(1) : '';
              const isActive = activeSection === targetSection;
              return (
                <div key={item.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleLinkClick(item.url, item.label, idx)}
                    className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 rounded-sm ${
                      editMode
                        ? 'outline-dashed outline-1 outline-[#E5A93C]/70 px-1.5 bg-zinc-950/20'
                        : ''
                    } ${
                      isOnYellowHero
                        ? isActive
                          ? 'text-zinc-950 focus-visible:ring-zinc-950'
                          : 'text-zinc-950/75 hover:text-zinc-950 focus-visible:ring-zinc-950'
                        : isActive
                          ? 'text-[#E5A93C] focus-visible:ring-[#E5A93C]'
                          : 'text-[#E5A93C]/75 hover:text-[#E5A93C] focus-visible:ring-[#E5A93C]'
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-0 right-0 h-[2px] transition-transform duration-200 origin-left ${
                        isOnYellowHero ? 'bg-zinc-950' : 'bg-[#E5A93C]'
                      } ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                    />
                  </button>

                  {editMode && (
                    <div className="flex items-center gap-0.5 rounded bg-zinc-950/80 px-1 py-0.5 text-zinc-300">
                      <button
                        type="button"
                        onClick={() => moveNavLink(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`Move ${item.label} left`}
                        className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveNavLink(idx, 1)}
                        disabled={idx === navLinks.length - 1}
                        aria-label={`Move ${item.label} right`}
                        className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                      {navLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteNavLink(idx)}
                          aria-label={`Remove ${item.label}`}
                          className="p-0.5 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {editMode && (
              <button
                type="button"
                onClick={addNavLink}
                aria-label="Add navigation link"
                className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-[#E5A93C]/70 bg-zinc-950/75 px-2 text-xs font-medium text-[#E5A93C] hover:bg-zinc-900 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span>Add Link</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handlePrimaryCtaClick}
            className={`hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              editMode ? 'outline-dashed outline-2 outline-offset-2 outline-[#E5A93C]' : ''
            } ${
              isOnYellowHero
                ? 'bg-zinc-950 text-white hover:bg-zinc-800 focus-visible:ring-zinc-950'
                : 'bg-[#E5A93C] text-zinc-950 hover:bg-[#eab85c] focus-visible:ring-white'
            }`}
          >
            {primaryCta.label}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/90 backdrop-blur-xl px-6 py-5">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
            {navLinks.map((item, idx) => {
              const targetSection = item.url.startsWith('#') ? item.url.slice(1) : '';
              const isActive = activeSection === targetSection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.url, item.label, idx)}
                  className={`flex items-center justify-between py-2.5 text-left text-base font-bold transition-colors cursor-pointer ${
                    isActive ? 'text-[#E5A93C]' : 'text-zinc-200 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs text-zinc-400">Active</span>}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handlePrimaryCtaClick}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#E5A93C] px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#eab85c] cursor-pointer"
            >
              {primaryCta.label}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
