import { useEffect, useState } from 'react';
import splashImageDarkText from './assets/logo/sprash_transparent.png';
import splashImageLightText from './assets/logo/sprash_transparent_light.png';
import { getPatternById } from './hasm_color_pattern/src/index.js';
import { createLogger } from './hasm_logger/src/react/logger.js';
import { useLanguage } from './i18n.js';
import { useColorTheme } from './theme/useColorTheme.js';
import './launch-splash.css';

const MINIMUM_VISIBLE_MS = 5000;
const FADE_OUT_MS = 400;
const logger = createLogger('launch-splash');

function isDarkColor(hexColor) {
  const hex = String(hexColor).replace('#', '');
  if (hex.length !== 6) return false;
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function waitForDocumentLoad() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
}

// Shown once per document load. Route changes use the HashRouter inside <App>, so they never remount this.
export function LaunchSplash() {
  const { colorPattern } = useColorTheme();
  const { t } = useLanguage();
  const [phase, setPhase] = useState('visible');

  useEffect(() => {
    let cancelled = false;
    let fadeTimer;
    // performance.now() counts from navigation start, so the 5s minimum includes bundle loading time.
    const remainingMs = Math.max(0, MINIMUM_VISIBLE_MS - performance.now());
    const minimumDelay = new Promise((resolve) => { fadeTimer = window.setTimeout(resolve, remainingMs); });

    Promise.all([minimumDelay, waitForDocumentLoad()]).then(() => {
      if (cancelled) return;
      setPhase('leaving');
      fadeTimer = window.setTimeout(() => {
        setPhase('done');
        logger.info('Launch splash dismissed.', { visibleMs: Math.round(performance.now()) });
      }, FADE_OUT_MS);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fadeTimer);
    };
  }, []);

  useEffect(() => {
    // Prevent scrolling the page underneath while the overlay is shown.
    if (phase === 'done') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [phase]);

  if (phase === 'done') return null;

  const pattern = getPatternById(colorPattern);
  const splashImage = isDarkColor(pattern.colors.textBackgroundColor) ? splashImageLightText : splashImageDarkText;

  return (
    <div
      className={`launch-splash${phase === 'leaving' ? ' launch-splash--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <img className="launch-splash__image" src={splashImage} alt={t.splashImageAlt} width="1200" height="720" />
      <span className="launch-splash__status">{t.splashStatus}</span>
    </div>
  );
}
