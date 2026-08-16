import React from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';

// HASM top-level landing page. The hasm desktop app itself has no UI yet, so this
// stays intentionally minimal: brand mark, theme selection, and an entry point
// into the HASM Markdown editor preview.
const hasmPageStyles = `
  .HASM_Page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 24px;
    text-align: center;
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    letter-spacing: 0.03em;
  }

  .HASM_Page_Kicker {
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.16em;
    color: var(--theme-primary);
  }

  .HASM_Page_NavButton {
    padding: 12px 32px;
    font-weight: 700;
    color: var(--theme-surface);
    background: var(--theme-primary);
    border: 1px solid var(--theme-primary);
    border-radius: 0;
  }

  .ThemeSelector {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    box-shadow: 0 6px 18px rgba(20, 18, 15, 0.12);
  }

  .ThemeSelector_Label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--theme-muted);
  }

  .ThemeSelector_Select {
    padding: 4px 8px;
    color: var(--theme-text);
    background: var(--theme-input-bg);
    border: 1px solid var(--theme-border);
  }
`;

export const HASM_Page = ({ onNavigateToMarkdown }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();

  return (
    <div className="HASM_Page">
      <style>{hasmPageStyles}</style>
      <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} />

      <img src={hasmLogo} alt="HASM" style={{ width: 120, height: 120, objectFit: 'contain' }} />
      <div className="HASM_Page_Kicker">HASM</div>
      <h1 className="display-4 fw-bold" style={{ fontFamily: 'Georgia, serif' }}>
        Human And Structure Modeling
      </h1>
      <p className="lead" style={{ color: 'var(--theme-muted)', maxWidth: '640px' }}>
        HASM 本体アプリは現在準備中です。まずは HASM Markdown エディタをご覧ください。
      </p>
      <button type="button" className="HASM_Page_NavButton" onClick={onNavigateToMarkdown}>
        Go to HASM Markdown page
      </button>
    </div>
  );
};

export default HASM_Page;
