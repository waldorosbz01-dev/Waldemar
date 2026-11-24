import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { navigateToUrl } from '../utils/navigation';
import { EditableText } from './cms/EditableText';
import type { SectionId } from './Navbar';

interface ContactSectionProps {
  prefilledProject: string | null;
  onNavigate: (id: SectionId) => void;
}

function WhatsAppLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.41 1.3-1.96 1.38-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.92-4.29-5.07-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.02.9 2.17.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.45 1.51.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.08.13.08.73-.16 1.41z" />
    </svg>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'whatsapp':
      return <WhatsAppLogo className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.793 5.927.451.383.856 1.122.856 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    default:
      return <Mail className="h-4 w-4" />;
  }
}

function buildWhatsAppMessage(name: string, message: string): string {
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();
  const greeting = trimmedName ? `Hi Waldemar, I'm ${trimmedName}.` : 'Hi Waldemar,';

  if (!trimmedMessage) {
    return greeting;
  }

  return `${greeting}\n\n${trimmedMessage}`;
}

function buildWhatsAppUrl(phoneDigits: string, text?: string): string {
  const digits = phoneDigits.replace(/\D/g, '') || '5016300785';
  if (!text) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function ContactSection({ prefilledProject, onNavigate }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const {
    content,
    editMode,
    isAuthenticated,
    updateContent,
    openActionEditor,
    openLoginModal,
    toggleEditMode,
  } = useCms();

  const { contact, footer } = content;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });

  const leftColY = useTransform(scrollYProgress, [0, 1], ['40px', '0px']);
  const rightColY = useTransform(scrollYProgress, [0, 1], ['64px', '0px']);

  const [copiedMessage, setCopiedMessage] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [launchedPayload, setLaunchedPayload] = useState<{
    text: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (prefilledProject) {
      setLaunchedPayload(null);
      setErrorMsg(null);
      setMessage((current) =>
        current.trim().length > 0
          ? current
          : `Interested in a direction similar to ${prefilledProject}.`
      );
    }
  }, [prefilledProject]);

  const composedMessage = useMemo(
    () => buildWhatsAppMessage(name, message),
    [name, message]
  );

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(contact.whatsappNumber, composedMessage),
    [contact.whatsappNumber, composedMessage]
  );

  const handleCopyComposed = async () => {
    try {
      await navigator.clipboard.writeText(launchedPayload?.text ?? composedMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2200);
    } catch {
      setCopiedMessage(false);
    }
  };

  const handleWhatsAppLaunch = (event: MouseEvent<HTMLAnchorElement>) => {
    if (editMode) {
      event.preventDefault();
      return;
    }
    if (!message.trim()) {
      event.preventDefault();
      setErrorMsg('Please write a short message before opening WhatsApp.');
      messageInputRef.current?.focus();
      return;
    }

    setErrorMsg(null);
    setLaunchedPayload({
      text: composedMessage,
      url: whatsappUrl,
    });
  };

  const handleReset = () => {
    setName('');
    setMessage('');
    setErrorMsg(null);
    setLaunchedPayload(null);
  };

  // Repeatable meta items handlers
  const moveMetaItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= contact.metaItems.length) return;
    updateContent((prev) => {
      const next = [...prev.contact.metaItems];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, contact: { ...prev.contact, metaItems: next } };
    });
  };

  const deleteMetaItem = (index: number) => {
    if (contact.metaItems.length <= 1) return;
    updateContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        metaItems: prev.contact.metaItems.filter((_, i) => i !== index),
      },
    }));
  };

  const addMetaItem = () => {
    updateContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        metaItems: [
          ...prev.contact.metaItems,
          { id: `meta-${Date.now()}`, label: 'Location', value: 'Belize · Remote Worldwide' },
        ],
      },
    }));
  };

  // Repeatable footer links handlers
  const moveFooterLink = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= footer.links.length) return;
    updateContent((prev) => {
      const next = [...prev.footer.links];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, footer: { ...prev.footer, links: next } };
    });
  };

  const deleteFooterLink = (index: number) => {
    if (footer.links.length <= 1) return;
    updateContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: prev.footer.links.filter((_, i) => i !== index),
      },
    }));
  };

  const addFooterLink = () => {
    updateContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: [
          ...prev.footer.links,
          { id: `footer-${Date.now()}`, label: 'New Link', url: '#home' },
        ],
      },
    }));
  };

  const moveSocialLink = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= footer.socialLinks.length) return;
    updateContent((prev) => {
      const next = [...prev.footer.socialLinks];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, footer: { ...prev.footer, socialLinks: next } };
    });
  };

  const deleteSocialLink = (index: number) => {
    if (footer.socialLinks.length <= 1) return;
    updateContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: prev.footer.socialLinks.filter((_, i) => i !== index),
      },
    }));
  };

  const addSocialLink = () => {
    updateContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: [
          ...prev.footer.socialLinks,
          {
            id: `soc-${Date.now()}`,
            name: 'Website',
            url: 'https://example.com',
            color: '#E5A93C',
            icon: 'email',
          },
        ],
      },
    }));
  };

  return (
    <section
      id="lets-talk"
      ref={sectionRef}
      aria-label="Let's Talk"
      className="relative z-10 flex min-h-screen flex-col justify-between pt-24 pb-10 sm:pt-32 sm:pb-12 overflow-hidden"
    >
      {/* Luminous yellow atmospheric glow behind Let's Talk */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] sm:h-[600px] overflow-hidden select-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 65% at 50% 0%, rgba(246, 222, 72, 0.22) 0%, rgba(211, 179, 8, 0.10) 35%, transparent 75%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-zinc-950" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-6 sm:px-10 lg:px-16">
        {/* Full-width Section Header with Extra Large "LET'S TALK" */}
        <div className="border-b border-white/15 pb-10 mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#E5A93C]">
              03
            </span>
            <span className="h-px w-8 bg-[#E5A93C]/40" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-300">
              Direct Inquiries
            </span>
          </div>

          <EditableText
            as="h2"
            value={
              contact.kicker.toLowerCase().includes('talk') || contact.kicker.toLowerCase().includes('contact')
                ? contact.kicker.replace(/^\d+[\.\s]*/, '')
                : "Let's Talk"
            }
            singleLine
            ariaLabel="Contact section title"
            onChange={(val) =>
              updateContent((prev) => ({ ...prev, contact: { ...prev.contact, kicker: val } }))
            }
            className="mt-4 block font-display text-[clamp(3.75rem,11.5vw,10rem)] font-extrabold uppercase leading-[0.88] tracking-tight text-white drop-shadow-sm"
          />

          <EditableText
            as="p"
            value={contact.heading}
            ariaLabel="Contact section heading subtitle"
            onChange={(val) =>
              updateContent((prev) => ({ ...prev, contact: { ...prev.contact, heading: val } }))
            }
            className="mt-4 block max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-300"
          />
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Direct WhatsApp & Email Details */}
          <motion.div
            style={shouldReduceMotion ? undefined : { y: leftColY }}
            className="lg:col-span-5 flex flex-col justify-between space-y-10 will-change-transform"
          >
            <div>
              <EditableText
                as="p"
                value={contact.description}
                ariaLabel="Contact section description"
                onChange={(val) =>
                  updateContent((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, description: val },
                  }))
                }
                className="block max-w-md text-base leading-relaxed text-zinc-200"
              />

              {/* Direct WhatsApp & Email Lines */}
              <div className="mt-8 space-y-6 border-t border-white/15 pt-7">
                <div>
                  <EditableText
                    as="div"
                    value={contact.whatsappLabel}
                    singleLine
                    ariaLabel="WhatsApp label"
                    onChange={(val) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, whatsappLabel: val },
                      }))
                    }
                    className="text-xs text-zinc-400"
                  />
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {editMode ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <WhatsAppLogo className="h-5 w-5 text-[#25D366]" />
                        <EditableText
                          value={contact.whatsappDisplay}
                          singleLine
                          ariaLabel="WhatsApp display number"
                          onChange={(val) => {
                            const digits = val.replace(/\D/g, '');
                            updateContent((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                whatsappDisplay: val,
                                whatsappNumber:
                                  digits.length >= 7 ? digits : prev.contact.whatsappNumber,
                              },
                            }));
                          }}
                          className="font-display text-xl font-semibold text-white tabular-nums"
                        />
                      </div>
                    ) : (
                      <a
                        href={buildWhatsAppUrl(contact.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-display text-xl font-semibold text-white tabular-nums hover:text-[#25D366] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] rounded-sm"
                      >
                        <WhatsAppLogo className="h-5 w-5 text-[#25D366]" />
                        <span>{contact.whatsappDisplay}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Direct Email */}
                <div>
                  <EditableText
                    as="div"
                    value={contact.emailLabel}
                    singleLine
                    ariaLabel="Email label"
                    onChange={(val) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, emailLabel: val },
                      }))
                    }
                    className="text-xs text-zinc-400"
                  />
                  <div className="mt-1.5 flex items-center gap-2">
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#E5A93C]" aria-hidden="true" />
                        <EditableText
                          value={contact.emailAddress}
                          singleLine
                          ariaLabel="Email address"
                          onChange={(val) =>
                            updateContent((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, emailAddress: val },
                            }))
                          }
                          className="font-display text-lg font-semibold text-white"
                        />
                      </div>
                    ) : (
                      <a
                        href={`mailto:${contact.emailAddress}`}
                        className="inline-flex items-center gap-2 font-display text-lg font-semibold text-white hover:text-[#E5A93C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] rounded-sm"
                      >
                        <Mail className="h-4 w-4 text-[#E5A93C]" aria-hidden="true" />
                        <span>{contact.emailAddress}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Studio Metadata Items */}
                <div className="flex flex-wrap gap-8">
                  {contact.metaItems.map((meta, idx) => (
                    <div key={meta.id} className="relative">
                      <EditableText
                        as="div"
                        value={meta.label}
                        singleLine
                        ariaLabel="Metadata label"
                        onChange={(val) =>
                          updateContent((prev) => {
                            const next = [...prev.contact.metaItems];
                            next[idx] = { ...next[idx], label: val };
                            return { ...prev, contact: { ...prev.contact, metaItems: next } };
                          })
                        }
                        className="text-xs text-zinc-400"
                      />
                      <EditableText
                        as="div"
                        value={meta.value}
                        singleLine
                        ariaLabel="Metadata value"
                        onChange={(val) =>
                          updateContent((prev) => {
                            const next = [...prev.contact.metaItems];
                            next[idx] = { ...next[idx], value: val };
                            return { ...prev, contact: { ...prev.contact, metaItems: next } };
                          })
                        }
                        className="mt-1 text-sm font-medium text-zinc-100"
                      />
                      {editMode && (
                        <div className="mt-1.5 flex items-center gap-1 text-zinc-400">
                          <button
                            type="button"
                            onClick={() => moveMetaItem(idx, -1)}
                            disabled={idx === 0}
                            aria-label="Move item up"
                            className="rounded border border-white/10 p-1 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMetaItem(idx, 1)}
                            disabled={idx === contact.metaItems.length - 1}
                            aria-label="Move item down"
                            className="rounded border border-white/10 p-1 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          {contact.metaItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteMetaItem(idx)}
                              aria-label="Delete metadata item"
                              className="rounded border border-white/10 p-1 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={addMetaItem}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-[#E5A93C]/70 px-2.5 text-xs font-medium text-[#E5A93C] hover:bg-[#E5A93C]/10 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Detail Item</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Streamlined Direct-to-WhatsApp Message Composer */}
          <motion.div
            style={shouldReduceMotion ? undefined : { y: rightColY }}
            className="lg:col-span-7 will-change-transform"
          >
            <div className="rounded-2xl border border-white/15 bg-zinc-950/80 p-6 sm:p-10 backdrop-blur-xl">
              {launchedPayload ? (
                <div className="flex min-h-[320px] flex-col items-start justify-center space-y-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#25D366]/40 bg-[#25D366]/15 text-[#25D366]">
                    <WhatsAppLogo className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white text-balance">
                      WhatsApp chat ready for {contact.whatsappDisplay}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-300">
                      Your message has been pre-filled in WhatsApp. If the chat tab did not open
                      automatically, use the button below or copy the text.
                    </p>
                  </div>

                  <div className="w-full border-y border-white/10 py-4 text-sm whitespace-pre-line text-zinc-200">
                    {launchedPayload.text}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={launchedPayload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-zinc-950 whitespace-nowrap shrink-0 transition-colors hover:bg-[#1EBE5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <WhatsAppLogo className="h-4 w-4" />
                      <span>Open WhatsApp Again</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyComposed}
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:border-white/40 hover:bg-zinc-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                          <span>Message Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLaunchedPayload(null)}
                      className="inline-flex h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                    >
                      <span>Edit Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      aria-label="Start a fresh message"
                      className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-400 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-400/35 bg-red-950/50 px-4 py-3 text-sm text-red-200"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label htmlFor="wa-name" className="block text-xs font-medium text-zinc-300">
                      Your Name <span className="text-zinc-500">(Optional)</span>
                    </label>
                    <input
                      id="wa-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Vance"
                      className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-zinc-900/75 px-3.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-[#25D366] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="wa-message" className="block text-xs font-medium text-zinc-300">
                      Your Message
                    </label>
                    <textarea
                      ref={messageInputRef}
                      id="wa-message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errorMsg && e.target.value.trim()) setErrorMsg(null);
                      }}
                      placeholder="Tell me about your project, timeline, or question..."
                      className="mt-2 w-full rounded-lg border border-white/15 bg-zinc-900/75 p-3.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-[#25D366] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <EditableText
                      value={contact.footerNote}
                      singleLine
                      ariaLabel="Composer footer note"
                      onChange={(val) =>
                        updateContent((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, footerNote: val },
                        }))
                      }
                      className="text-xs text-zinc-400"
                    />
                    {editMode ? (
                      <div className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-zinc-950 whitespace-nowrap shrink-0">
                        <WhatsAppLogo className="h-4 w-4" />
                        <EditableText
                          value={contact.sendButtonLabel}
                          singleLine
                          ariaLabel="Send button label"
                          onChange={(val) =>
                            updateContent((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, sendButtonLabel: val },
                            }))
                          }
                        />
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </div>
                    ) : (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWhatsAppLaunch}
                        className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-zinc-950 whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-[#1EBE5D] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <WhatsAppLogo className="h-4 w-4" />
                        <span>{contact.sendButtonLabel}</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quiet Minimal Footer with Social Buttons and Admin Login Trigger */}
      <footer className="mx-auto mt-16 w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-6 border-t border-white/15 pt-6 pb-4 text-xs text-zinc-400 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <EditableText
              value={footer.copyright}
              singleLine
              ariaLabel="Footer copyright"
              onChange={(val) =>
                updateContent((prev) => ({ ...prev, footer: { ...prev.footer, copyright: val } }))
              }
            />

            {/* Social Buttons with Original Brand Colors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {footer.socialLinks.map((soc, idx) => (
                <div key={soc.id} className="relative flex items-center">
                  {editMode ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#E5A93C]/70 bg-zinc-900 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          openActionEditor({
                            title: `Edit Social Link — ${soc.name}`,
                            label: soc.name,
                            url: soc.url,
                            icon: soc.icon,
                            color: soc.color,
                            showIconSelector: true,
                            labelFieldTitle: 'Platform Name',
                            urlFieldTitle: 'Profile URL',
                            urlPlaceholder: 'https://...',
                            showSectionPresets: false,
                            onApply: (next) => {
                              updateContent((prev) => {
                                const nextSocial = [...prev.footer.socialLinks];
                                if (nextSocial[idx]) {
                                  nextSocial[idx] = {
                                    ...nextSocial[idx],
                                    name: next.label,
                                    url: next.url,
                                    icon: (next.icon as any) ?? nextSocial[idx].icon,
                                    color: next.color ?? nextSocial[idx].color,
                                  };
                                }
                                return {
                                  ...prev,
                                  footer: { ...prev.footer, socialLinks: nextSocial },
                                };
                              });
                            },
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-[#E5A93C] cursor-pointer"
                      >
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${soc.color}25`, color: soc.color }}
                        >
                          <SocialIcon icon={soc.icon} />
                        </span>
                        <span>{soc.name}</span>
                      </button>
                      <div className="flex items-center gap-0.5 text-zinc-400 pl-1">
                        <button
                          type="button"
                          onClick={() => moveSocialLink(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Move left"
                          className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSocialLink(idx, 1)}
                          disabled={idx === footer.socialLinks.length - 1}
                          aria-label="Move right"
                          className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        {footer.socialLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteSocialLink(idx)}
                            aria-label="Delete social link"
                            className="p-0.5 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={soc.url}
                      target={soc.url.startsWith('#') || soc.url.startsWith('mailto:') ? undefined : '_blank'}
                      rel={soc.url.startsWith('#') || soc.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      aria-label={soc.name}
                      className="group inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 transition-all duration-200 hover:scale-110 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
                      style={{ color: soc.color }}
                    >
                      <SocialIcon icon={soc.icon} />
                    </a>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#E5A93C]/70 px-2.5 py-1.5 text-xs font-medium text-[#E5A93C] hover:bg-[#E5A93C]/10 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Social</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {footer.links.map((item, idx) => (
              <div key={item.id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (editMode) {
                      openActionEditor({
                        title: 'Edit Footer Link',
                        label: item.label,
                        url: item.url,
                        onApply: (next) => {
                          updateContent((prev) => {
                            const copy = [...prev.footer.links];
                            copy[idx] = { ...copy[idx], label: next.label, url: next.url };
                            return { ...prev, footer: { ...prev.footer, links: copy } };
                          });
                        },
                      });
                      return;
                    }
                    navigateToUrl(item.url, onNavigate);
                  }}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    editMode ? 'outline-dashed outline-1 outline-[#E5A93C]/70 px-1 rounded-sm' : ''
                  }`}
                >
                  {item.label}
                </button>
                {editMode && (
                  <div className="inline-flex items-center gap-0.5 text-zinc-400">
                    <button
                      type="button"
                      onClick={() => moveFooterLink(idx, -1)}
                      disabled={idx === 0}
                      aria-label={`Move ${item.label} left`}
                      className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFooterLink(idx, 1)}
                      disabled={idx === footer.links.length - 1}
                      aria-label={`Move ${item.label} right`}
                      className="p-0.5 hover:text-[#E5A93C] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    {footer.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteFooterLink(idx)}
                        aria-label={`Delete ${item.label}`}
                        className="p-0.5 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {editMode && (
              <button
                type="button"
                onClick={addFooterLink}
                className="inline-flex items-center gap-1 rounded border border-dashed border-[#E5A93C]/70 px-2 py-0.5 text-[11px] font-medium text-[#E5A93C] hover:bg-[#E5A93C]/10 cursor-pointer"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                <span>Add Link</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => (isAuthenticated ? toggleEditMode() : openLoginModal())}
              className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {isAuthenticated ? (editMode ? 'Exit Edit Mode' : 'Edit Page') : 'Admin Login'}
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
