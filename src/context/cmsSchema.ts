export type ProjectCategory =
  | 'All Work'
  | 'Brand Identity'
  | 'Digital Experience'
  | 'Art Direction';

export type ProjectMotif = 'monolith' | 'arch' | 'horizon' | 'grid' | 'prism' | 'circle';

export interface CaseStudyQuote {
  text: string;
  author: string;
  role: string;
}

export interface CaseStudy {
  id: string;
  index: string;
  title: string;
  client: string;
  category: Exclude<ProjectCategory, 'All Work'>;
  secondaryDiscipline: string;
  year: string;
  metricValue: string;
  metricContext: string;
  summary: string;
  challenge: string;
  approach: string;
  deliverables: string[];
  palette: [string, string, string];
  motif: ProjectMotif;
  featured?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  fullScreenshotUrl?: string;
  fullScreenshotAlt?: string;
  projectUrl?: string;
  quote: CaseStudyQuote;
}

export interface NavLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface ActionConfig {
  label: string;
  url: string;
}

export interface ImageConfig {
  src: string;
  alt: string;
}

export interface ContactMetaItem {
  id: string;
  label: string;
  value: string;
}

export interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  color: string;
  icon: 'whatsapp' | 'email' | 'linkedin' | 'instagram' | 'github' | 'facebook';
}

export interface SiteContent {
  site: {
    pageTitle: string;
  };
  navbar: {
    navLinks: NavLinkItem[];
    primaryCta: ActionConfig;
  };
  home: {
    marqueeText: string;
    bgDefaultImage: ImageConfig;
    bgHoverImage: ImageConfig;
    fgDefaultImage: ImageConfig;
    fgHoverImage: ImageConfig;
    kickerLeft: string;
    kickerRight: string;
    introText: string;
    primaryButton: ActionConfig;
    secondaryButton: ActionConfig;
    scrollCueButton: ActionConfig;
  };
  work: {
    kicker: string;
    heading: string;
    helperText: string;
    cardCtaLabel: string;
    projects: CaseStudy[];
  };
  contact: {
    kicker: string;
    heading: string;
    description: string;
    whatsappLabel: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    emailLabel: string;
    emailAddress: string;
    metaItems: ContactMetaItem[];
    footerNote: string;
    sendButtonLabel: string;
  };
  footer: {
    copyright: string;
    links: NavLinkItem[];
    socialLinks: SocialLinkItem[];
  };
}

export const DEFAULT_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'maison-solene',
    index: '01',
    title: 'Maison Solène',
    client: 'Solène Parfums Paris',
    category: 'Brand Identity',
    secondaryDiscipline: 'Packaging & Launch Film',
    year: '2026',
    metricValue: '+68%',
    metricContext: 'Direct flagship conversion in first 90 days',
    summary:
      'Tactile fragrance identity, embossed cotton-paper cartons, and sensory e-commerce flagship for a Parisian botanical house.',
    challenge:
      'Translate rare cold-pressed botanical extraction into a restrained visual system that stood apart from ornate heritage perfume houses.',
    approach:
      'Crafted an architectural wordmark paired with raw mineral paper stocks, blind debossing, and an unhurried digital storytelling cadence.',
    deliverables: [
      'Brand Architecture',
      'Custom Wordmark',
      'Tactile Packaging',
      'Flagship Storefront',
    ],
    palette: ['#E8DFD3', '#231F1D', '#C88D32'],
    motif: 'arch',
    featured: true,
    imageUrl: '',
    imageAlt: 'Maison Solène fragrance brand identity plate',
    quote: {
      text: 'Every tactile detail—from the weight of the box to the scroll rhythm online—feels unmistakably ours.',
      author: 'Camille Laurent',
      role: 'Founder, Maison Solène',
    },
  },
  {
    id: 'kanso-architecture',
    index: '02',
    title: 'Kanso Architecture',
    client: 'Kanso Studio Tokyo / Zurich',
    category: 'Digital Experience',
    secondaryDiscipline: 'Spatial Archive',
    year: '2026',
    metricValue: '+140%',
    metricContext: 'Qualified private residential inquiries in 6 months',
    summary:
      'Monograph-inspired web platform showcasing timber and cast-concrete residences with interactive blueprint layers.',
    challenge:
      'Replace a sluggish PDF-heavy portfolio with a living spatial archive capable of communicating silence, proportion, and material light.',
    approach:
      'Engineered an editorial grid guided by Japanese structural ratios, pairing crisp monochrome photography with fluid scroll transitions.',
    deliverables: [
      'Digital Strategy',
      'Interactive Monograph',
      'Motion Direction',
      'Design System',
    ],
    palette: ['#D6D3CD', '#18181B', '#E5A93C'],
    motif: 'grid',
    featured: true,
    imageUrl: '',
    imageAlt: 'Kanso Architecture digital archive plate',
    quote: {
      text: 'Waldemar Rosado transformed how collectors experience our work online—direct inquiries rose 140% in six months.',
      author: 'Kenji Takahashi',
      role: 'Principal, Kanso Architecture',
    },
  },
  {
    id: 'vesper-audio',
    index: '03',
    title: 'Vesper Reference Audio',
    client: 'Vesper Acoustics GmbH',
    category: 'Art Direction',
    secondaryDiscipline: 'Hardware Interface',
    year: '2025',
    metricValue: '3.2×',
    metricContext: 'Pre-order waitlist growth at Munich High End',
    summary:
      'Industrial art direction, precision anodized nomenclature, and flagship launch experience for studio reference monitors.',
    challenge:
      'Elevate technical acoustic engineering into a museum-grade collector object without drifting into sterile audio clichés.',
    approach:
      'Shot macro aluminum grain under directional studio light and unified hardware dial typography with the companion web configurator.',
    deliverables: [
      'Art Direction',
      'Studio Photography Direction',
      'Hardware Typography',
      'Launch Microsite',
    ],
    palette: ['#27272A', '#A1A1AA', '#D97706'],
    motif: 'circle',
    imageUrl: '',
    imageAlt: 'Vesper Reference Audio industrial art direction plate',
    quote: {
      text: 'They understood both the physics of our cabinetry and the emotional restraint our listeners expect.',
      author: 'Lukas Weber',
      role: 'Head of Design, Vesper Acoustics',
    },
  },
  {
    id: 'monolith-press',
    index: '04',
    title: 'Monolith Press',
    client: 'Monolith Editions London',
    category: 'Art Direction',
    secondaryDiscipline: 'Editorial Grid',
    year: '2025',
    metricValue: '4,000',
    metricContext: 'First-edition print run sold out in 11 days',
    summary:
      'Swiss-inspired editorial system and collector edition microsite for an independent architecture and photography publisher.',
    challenge:
      'Give a new print imprint immediate institutional authority among museum bookshops across London, New York, and Tokyo.',
    approach:
      'Built a strict proportional baseline grid that governs both cloth-bound book spines and the digital reading room.',
    deliverables: [
      'Editorial System',
      'Book Spine Architecture',
      'Collector Microsite',
      'Campaign Direction',
    ],
    palette: ['#F4F1EA', '#141413', '#B45309'],
    motif: 'monolith',
    imageUrl: '',
    imageAlt: 'Monolith Press editorial system plate',
    quote: {
      text: 'Bookshop buyers assumed we had been publishing for twenty years from day one.',
      author: 'Helena Vance',
      role: 'Editorial Director, Monolith Press',
    },
  },
  {
    id: 'aurelia-sanctuary',
    index: '05',
    title: 'Aurelia Alpine Sanctuary',
    client: 'Aurelia Hospitality Group',
    category: 'Digital Experience',
    secondaryDiscipline: 'Brand Refresh',
    year: '2025',
    metricValue: '+52%',
    metricContext: 'Direct suite bookings year-over-year',
    summary:
      'Calm, high-conversion hospitality platform and printed guest compendium for a 24-suite thermal retreat in Engadin.',
    challenge:
      'Reduce reliance on third-party luxury booking portals by turning the direct website into an atmospheric preview of the stay.',
    approach:
      'Paired slow-paced seasonal visual chapters with a distraction-free, three-step suite reservation flow.',
    deliverables: [
      'Visual Identity Refresh',
      'Booking Experience',
      'Printed Compendium',
      'Copy Direction',
    ],
    palette: ['#E2DDD5', '#292524', '#CA8A04'],
    motif: 'horizon',
    imageUrl: '',
    imageAlt: 'Aurelia Alpine Sanctuary digital platform plate',
    quote: {
      text: 'Guests routinely mention the website as the moment they decided to book directly with us.',
      author: 'Matteo Conti',
      role: 'Managing Partner, Aurelia',
    },
  },
  {
    id: 'nordic-roasters',
    index: '06',
    title: 'Solstice Coffee Collective',
    client: 'Solstice Roasters Copenhagen',
    category: 'Brand Identity',
    secondaryDiscipline: 'Packaging System',
    year: '2024',
    metricValue: '89%',
    metricContext: 'Six-month subscriber retention rate',
    summary:
      'Modular typographic tin system and direct-to-collector tasting club for rare single-estate Nordic light roasts.',
    challenge:
      'Create a scalable packaging architecture that celebrates constantly rotating micro-lots without custom print runs each harvest.',
    approach:
      'Designed reusable matte-black steel canisters paired with color-coded origin belly bands and an intuitive roast cadence portal.',
    deliverables: [
      'Identity System',
      'Modular Packaging',
      'Subscription UX',
      'Origin Cards',
    ],
    palette: ['#1C1917', '#E7E5E4', '#E5A93C'],
    motif: 'prism',
    imageUrl: '',
    imageAlt: 'Solstice Coffee Collective packaging identity plate',
    quote: {
      text: 'Our packaging waste dropped dramatically while subscriber retention hit an all-time high.',
      author: 'Soren Lindqvist',
      role: 'Co-Founder, Solstice',
    },
  },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  site: {
    pageTitle: 'Waldemar Rosado — Creative Direction & Portfolio',
  },
  navbar: {
    navLinks: [
      { id: 'home', label: 'Home', url: '#home' },
      { id: 'my-work', label: 'My Work', url: '#my-work' },
      { id: 'lets-talk', label: "Let's Talk", url: '#lets-talk' },
    ],
    primaryCta: {
      label: 'Start a Project',
      url: '#lets-talk',
    },
  },
  home: {
    marqueeText: 'WALDEMAR ROSADO',
    bgDefaultImage: {
      src: '/assets/aistudio/yellow_portrait_wide_matched.jpg',
      alt: 'Waldemar Rosado full-body portrait against a bright yellow studio backdrop',
    },
    bgHoverImage: {
      src: '/assets/aistudio/yellow_portrait_hover_wide.jpg',
      alt: 'Waldemar Rosado drinking coffee against a bright yellow studio backdrop',
    },
    fgDefaultImage: {
      src: '/assets/aistudio/yellow_subject_cutout_matched.png',
      alt: 'Waldemar Rosado foreground portrait cutout',
    },
    fgHoverImage: {
      src: '/assets/aistudio/yellow_subject_hover_cutout.png',
      alt: 'Waldemar Rosado coffee foreground portrait cutout',
    },
    kickerLeft: 'Creative Direction',
    kickerRight: 'Brand Craft',
    introText:
      'Partnering with founders and cultural houses to build tactile brand identities and fluid digital experiences.',
    primaryButton: {
      label: 'My Work',
      url: '#my-work',
    },
    secondaryButton: {
      label: "Let's Talk",
      url: '#lets-talk',
    },
    scrollCueButton: {
      label: 'Scroll to Selected Work',
      url: '#my-work',
    },
  },
  work: {
    kicker: '02. My Work',
    heading: 'Selected commissions in identity, motion, and digital craft.',
    helperText: 'Drag, flick, or use arrows to browse work',
    cardCtaLabel: 'View Project',
    projects: DEFAULT_CASE_STUDIES,
  },
  contact: {
    kicker: "03. Let's Talk",
    heading: 'Message directly on WhatsApp.',
    description:
      'Skip long email threads. Send your project idea or quick question straight to WhatsApp for a fast, principal-led reply.',
    whatsappLabel: 'WhatsApp Direct',
    whatsappNumber: '5016300785',
    whatsappDisplay: '+501 630-0785',
    emailLabel: 'Email',
    emailAddress: 'waldoweb01@gmail.com',
    metaItems: [
      { id: 'meta-reply', label: 'Typical Reply', value: 'Same day on WhatsApp' },
    ],
    footerNote: 'Opens directly in WhatsApp Web or App.',
    sendButtonLabel: 'Send on WhatsApp',
  },
  footer: {
    copyright: '© 2026 Waldemar Rosado. All rights reserved.',
    links: [
      { id: 'f-home', label: 'Home', url: '#home' },
      { id: 'f-work', label: 'My Work', url: '#my-work' },
      { id: 'f-talk', label: "Let's Talk", url: '#lets-talk' },
    ],
    socialLinks: [
      {
        id: 'soc-whatsapp',
        name: 'WhatsApp',
        url: 'https://wa.me/5016300785',
        color: '#25D366',
        icon: 'whatsapp',
      },
      {
        id: 'soc-email',
        name: 'Email',
        url: 'mailto:waldoweb01@gmail.com',
        color: '#EA4335',
        icon: 'email',
      },
      {
        id: 'soc-linkedin',
        name: 'LinkedIn',
        url: 'https://linkedin.com',
        color: '#0A66C2',
        icon: 'linkedin',
      },
      {
        id: 'soc-instagram',
        name: 'Instagram',
        url: 'https://instagram.com',
        color: '#E4405F',
        icon: 'instagram',
      },
      {
        id: 'soc-github',
        name: 'GitHub',
        url: 'https://github.com',
        color: '#E2E8F0',
        icon: 'github',
      },
      {
        id: 'soc-facebook',
        name: 'Facebook',
        url: 'https://facebook.com',
        color: '#1877F2',
        icon: 'facebook',
      },
    ],
  },
};

export function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

export function mergeWithDefaults(partial: unknown): SiteContent {
  const base = cloneContent(DEFAULT_SITE_CONTENT);
  if (!partial || typeof partial !== 'object') return base;
  const p = partial as Partial<SiteContent>;

  return {
    site: { ...base.site, ...(p.site ?? {}) },
    navbar: {
      navLinks: Array.isArray(p.navbar?.navLinks) ? p.navbar.navLinks : base.navbar.navLinks,
      primaryCta: p.navbar?.primaryCta
        ? { ...base.navbar.primaryCta, ...p.navbar.primaryCta }
        : base.navbar.primaryCta,
    },
    home: {
      ...base.home,
      ...(p.home ?? {}),
      bgDefaultImage: { ...base.home.bgDefaultImage, ...(p.home?.bgDefaultImage ?? {}) },
      bgHoverImage: { ...base.home.bgHoverImage, ...(p.home?.bgHoverImage ?? {}) },
      fgDefaultImage: { ...base.home.fgDefaultImage, ...(p.home?.fgDefaultImage ?? {}) },
      fgHoverImage: { ...base.home.fgHoverImage, ...(p.home?.fgHoverImage ?? {}) },
      primaryButton: { ...base.home.primaryButton, ...(p.home?.primaryButton ?? {}) },
      secondaryButton: { ...base.home.secondaryButton, ...(p.home?.secondaryButton ?? {}) },
      scrollCueButton: { ...base.home.scrollCueButton, ...(p.home?.scrollCueButton ?? {}) },
    },
    work: {
      ...base.work,
      ...(p.work ?? {}),
      projects: Array.isArray(p.work?.projects)
        ? p.work.projects.map((item) => ({
            ...item,
            imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
            imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : '',
            fullScreenshotUrl:
              typeof item.fullScreenshotUrl === 'string' ? item.fullScreenshotUrl : '',
            fullScreenshotAlt:
              typeof item.fullScreenshotAlt === 'string' ? item.fullScreenshotAlt : '',
            projectUrl: typeof item.projectUrl === 'string' ? item.projectUrl : '',
          }))
        : base.work.projects,
    },
    contact: {
      ...base.contact,
      ...(p.contact ?? {}),
      metaItems: Array.isArray(p.contact?.metaItems)
        ? p.contact.metaItems.filter((item) => item.label.toLowerCase() !== 'booking window')
        : base.contact.metaItems,
    },
    footer: {
      ...base.footer,
      ...(p.footer ?? {}),
      links: Array.isArray(p.footer?.links) ? p.footer.links : base.footer.links,
      socialLinks: Array.isArray(p.footer?.socialLinks)
        ? p.footer.socialLinks
        : base.footer.socialLinks,
    },
  };
}

export function sanitizeUrl(raw: string, fallback = '#'): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return fallback;
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function sanitizeImageUrl(raw: string, fallback = ''): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}
