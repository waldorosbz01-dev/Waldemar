import { sanitizeUrl } from '../context/cmsSchema';

export function navigateToUrl(
  rawUrl: string,
  scrollToSection: (id: 'home' | 'my-work' | 'lets-talk') => void
): void {
  const safe = sanitizeUrl(rawUrl, '#home');
  if (safe === '#home' || safe === '#my-work' || safe === '#lets-talk') {
    scrollToSection(safe.slice(1) as 'home' | 'my-work' | 'lets-talk');
    return;
  }
  if (safe.startsWith('#')) {
    const el = document.getElementById(safe.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
  if (safe.startsWith('http://') || safe.startsWith('https://')) {
    const link = document.createElement('a');
    link.href = safe;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }
  window.location.assign(safe);
}
