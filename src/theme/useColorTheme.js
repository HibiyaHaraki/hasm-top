import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_COLOR_PATTERN,
  COLOR_PATTERN_OPTIONS,
  getMarkdownThemeVariables,
  getPatternById,
  getThemeVariables,
  isValidColorPattern,
} from '../hasm_color_pattern/src/index.js';
import { createLogger } from '../hasm_logger/src/react/logger.js';

const STORAGE_KEY = 'hasm_theme_preference';
const logger = createLogger('color-theme');

function getRelativeLuminance(hexColor) {
  const hex = String(hexColor).replace('#', '');
  if (hex.length !== 6) return 0.5;
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function getContrastRatio(firstColor, secondColor) {
  const first = getRelativeLuminance(firstColor);
  const second = getRelativeLuminance(secondColor);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

// Derive readable accent/on-accent tokens so gutter & badge text stays legible on any pattern.
function getReadableColors(colors) {
  const accent = getContrastRatio(colors.mainColor, colors.textBackgroundColor) >= 4.5 ? colors.mainColor : colors.textColor;
  const candidates = [colors.textColor, colors.textBackgroundColor, '#ffffff', '#000000'];
  const onAccent = candidates.reduce((best, candidate) => (
    getContrastRatio(candidate, colors.mainColor) > getContrastRatio(best, colors.mainColor) ? candidate : best
  ));
  return { accent, onAccent };
}

function buildRootVariables(patternId) {
  const pattern = getPatternById(patternId, DEFAULT_COLOR_PATTERN);
  const readable = getReadableColors(pattern.colors);
  return {
    ...getThemeVariables(pattern.id),
    ...getMarkdownThemeVariables(pattern.id),
    '--text-color': readable.onAccent,
    '--theme-accent-readable': readable.accent,
    '--theme-on-accent': readable.onAccent,
    '--theme-warning-background': pattern.id === 'high-contrast' ? '#ffffff' : pattern.colors.softColor,
    '--theme-danger': pattern.id === 'high-contrast' ? '#ff0000' : pattern.colors.dangerColor,
    '--theme-danger-readable': getContrastRatio(pattern.colors.dangerColor, pattern.colors.textBackgroundColor) >= 4.5
      ? pattern.colors.dangerColor
      : pattern.colors.textColor,
  };
}

export function useColorTheme() {
  const [colorPattern, setColorPatternState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_COLOR_PATTERN;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isValidColorPattern(stored) ? stored : DEFAULT_COLOR_PATTERN;
  });

  useEffect(() => {
    // Apply the shared color-pattern contract at the document root for both pages.
    const variables = buildRootVariables(colorPattern);
    Object.entries(variables).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
    document.documentElement.dataset.theme = colorPattern;
    logger.debug('Applied color pattern.', { colorPattern });
  }, [colorPattern]);

  const setColorPattern = useCallback((patternId) => {
    if (!isValidColorPattern(patternId)) return;
    setColorPatternState(patternId);
    window.localStorage.setItem(STORAGE_KEY, patternId);
    logger.info('Selected color pattern.', { colorPattern: patternId });
  }, []);

  return { colorPattern, setColorPattern, patterns: COLOR_PATTERN_OPTIONS };
}
