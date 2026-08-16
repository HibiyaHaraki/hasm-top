import React from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

// HASM top-level landing page. The hasm desktop app itself has no UI yet, so this
// stays intentionally minimal: brand mark, theme selection, and an entry point
// into the HASM Markdown editor preview.
const hasmPageStyles = `
  .HASM_Page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    text-align: center;
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    letter-spacing: 0.03em;
  }

  .HASM_Page_Content {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .HASM_Page_Kicker {
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.16em;
    color: var(--theme-accent-readable);
  }

  .HASM_Page_NavButton {
    padding: 12px 32px;
    font-weight: 700;
    color: var(--theme-surface);
    background: var(--theme-primary);
    border: 1px solid var(--theme-primary);
    color: var(--theme-on-accent);
    border-radius: 0;
  }

`;

export const HASM_Page = ({ onNavigateToMarkdown }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="HASM_Page">
      <style>{hasmPageStyles}</style>
      <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
      <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />

      <div className="HASM_Page_Content">
        <img src={hasmLogo} alt="HASM" style={{ width: 120, height: 120, objectFit: 'contain' }} />
        <div className="HASM_Page_Kicker">{t.homeKicker}</div>
        <h1 className="display-4 fw-bold" style={{ fontFamily: 'Georgia, serif' }}>
          {t.homeTitle}
        </h1>
        <p className="lead" style={{ color: 'var(--theme-muted)', maxWidth: '640px' }}>
          {t.homeDescription}
        </p>
        <button type="button" className="HASM_Page_NavButton" onClick={onNavigateToMarkdown}>
          {t.openMarkdown}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default HASM_Page;
