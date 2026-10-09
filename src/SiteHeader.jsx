/*
 * File: SiteHeader.jsx
 * Purpose: Shared header used by every HASM page so the top of each page matches the HASM home
 *          page design (HASM logo + "HASM" wordmark, grouped page navigation, and shared selectors).
 * Behavior: Renders the brand as a button that navigates home when `onNavigateHome` is provided,
 *           otherwise as a static brand block (used by the home page itself).
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useColorTheme } from './theme/useColorTheme.js';
import { useLanguage } from './i18n.js';
import { createLogger } from './hasm_logger/src/react/logger.js';
import './site-header.css';

const logger = createLogger('site-header');

export const SiteHeader = ({ onNavigateHome, activePatternId, onThemeChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();

  // Pages such as the color pattern explorer drive the theme selection with their own state.
  const selectedPatternId = activePatternId || colorPattern;
  const handleThemeChange = onThemeChange || setColorPattern;
  const applicationGroups = [
    {
      id: 'philosophy',
      label: t.navGroupPhilosophy,
      items: [
        { path: '/', label: t.applicationHome },
        { path: '/extended-commit-graph', label: t.applicationExtendedCommitGraph }
      ]
    },
    {
      id: 'application',
      label: t.navGroupApplication,
      items: [
        { path: '/editor', label: t.applicationHasm },
        { path: '/markdown', label: t.applicationMarkdown }
      ]
    },
    {
      id: 'others',
      label: t.navGroupOthers,
      items: [
        { path: '/color-pattern', label: t.applicationColorPattern },
        { path: '/logo', label: t.applicationLogo },
        { path: '/creator', label: t.applicationCreator }
      ]
    }
  ];
  const selectedApplication = applicationGroups
    .flatMap(({ items }) => items)
    .some(({ path }) => path === location.pathname)
    ? location.pathname
    : '';

  const handleBrandClick = () => {
    logger.debug('Navigating home from the shared header.');
    onNavigateHome();
  };

  const handleApplicationChange = (event) => {
    const path = event.target.value;
    if (!path) {
      return;
    }

    logger.debug('Navigating from the shared application selector.', { path });
    navigate(path);
  };

  const brand = (
    <>
      <img src={hasmLogo} alt="HASM" className="HASM_SiteHeader_Logo" />
      <div className="HASM_SiteHeader_Title">HASM</div>
    </>
  );

  return (
    <header className="HASM_SiteHeader">
      <div className="HASM_SiteHeader_Inner">
        {onNavigateHome ? (
          <button type="button" className="HASM_SiteHeader_Brand" onClick={handleBrandClick} aria-label={t.backHome}>
            {brand}
          </button>
        ) : (
          <div className="HASM_SiteHeader_Brand">{brand}</div>
        )}

        <div className="HASM_SiteHeader_Controls">
          <div className="HASM_SiteHeader_ApplicationSelector">
            <label htmlFor="hasm-application-select">{t.pages}</label>
            <select
              id="hasm-application-select"
              value={selectedApplication}
              onChange={handleApplicationChange}
              aria-label={t.pages}
            >
              <option value="" disabled>{t.selectPage}</option>
              {applicationGroups.map(({ id, label, items }) => (
                <optgroup key={id} label={label}>
                  {items.map((item) => (
                    <option key={item.path} value={item.path}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
          <ThemeSelector patterns={patterns} activePatternId={selectedPatternId} onChange={handleThemeChange} label={t.theme} />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
