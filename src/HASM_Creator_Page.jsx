import React from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

const creatorPageStyles = `
  .HASM_Creator_Page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--theme-text);
    background: var(--theme-textbackground);
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    letter-spacing: 0.03em;
    line-height: 1.7;
  }
  .HASM_Creator_Page_Inner { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 60px; flex: 1; }
  .HASM_Creator_Page_Header { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 0 28px; border-bottom: 1px solid var(--theme-border); }
  .HASM_Creator_Page_Back { color: var(--theme-text); background: none; border: 0; padding: 0; font: inherit; cursor: pointer; }
  .HASM_Creator_Page_Content { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 36px; align-items: center; padding: 72px 0; }
  .HASM_Creator_Page_Avatar { width: 160px; height: 160px; border-radius: 50%; border: 2px solid var(--theme-border); object-fit: cover; }
  .HASM_Creator_Page_Kicker { color: var(--theme-accent-readable); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; }
  .HASM_Creator_Page_Title { margin: 8px 0 14px; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1.1; }
  .HASM_Creator_Page_Lead { max-width: 680px; margin: 0; color: var(--theme-muted); font-size: 1.08rem; }
  .HASM_Creator_Page_GitHub { display: inline-flex; align-items: center; margin-top: 24px; padding: 8px 14px; color: var(--theme-on-accent); background: var(--theme-primary); border: 1px solid var(--theme-primary); text-decoration: none; font-weight: 700; }
  .HASM_Creator_Page_GitHub:hover, .HASM_Creator_Page_GitHub:focus-visible { color: var(--theme-on-accent); filter: brightness(0.92); }
  .HASM_Creator_Page_Logo { width: 38px; height: 38px; object-fit: contain; }
  @media (max-width: 760px) { .HASM_Creator_Page_Header { flex-direction: column; align-items: flex-start; } .HASM_Creator_Page_Content { grid-template-columns: 1fr; gap: 24px; padding: 48px 0; } .HASM_Creator_Page_Avatar { width: 128px; height: 128px; } }
`;

export const HASM_Creator_Page = ({ onNavigateHome }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="HASM_Creator_Page">
      <style>{creatorPageStyles}</style>
      <div className="HASM_Creator_Page_Inner">
        <header className="HASM_Creator_Page_Header">
          <button type="button" className="HASM_Creator_Page_Back" onClick={onNavigateHome}>{t.backHome}</button>
          <div className="d-flex gap-2 align-items-center">
            <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
            <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />
          </div>
        </header>
        <main className="HASM_Creator_Page_Content">
          <img className="HASM_Creator_Page_Avatar" src="https://github.com/HibiyaHaraki.png?size=320" alt={t.githubCreatorAvatar} width="160" height="160" />
          <section>
            <div className="HASM_Creator_Page_Kicker">{t.creatorKicker}</div>
            <h1 className="HASM_Creator_Page_Title">HibiyaHaraki</h1>
            <p className="HASM_Creator_Page_Lead">{t.creatorLead}</p>
            <a className="HASM_Creator_Page_GitHub" href="https://github.com/HibiyaHaraki" target="_blank" rel="noreferrer">{t.creatorGithubButton}</a>
          </section>
        </main>
        <img className="HASM_Creator_Page_Logo" src={hasmLogo} alt="HASM" />
      </div>
      <Footer />
    </div>
  );
};

export default HASM_Creator_Page;