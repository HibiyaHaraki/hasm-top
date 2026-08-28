import React from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

const hasmPageStyles = `
  .HASM_Page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    letter-spacing: 0.03em;
    line-height: 1.7;
  }

  .HASM_Page_Inner {
    width: min(1160px, calc(100% - 32px));
    margin: 0 auto;
    padding: 24px 0 60px;
    flex: 1;
  }

  .HASM_Page_Header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 18px 0 28px;
    border-bottom: 1px solid var(--theme-border);
  }

  .HASM_Page_Brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--theme-text);
  }

  .HASM_Page_BrandTitle {
    font-family: Georgia, serif;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .HASM_Page_Hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 48px 0 36px;
  }

  .HASM_Page_HeroLogo {
    width: 110px;
    height: 110px;
    object-fit: contain;
    margin-bottom: 16px;
  }

  .HASM_Page_Kicker {
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    color: var(--theme-accent-readable);
    margin-bottom: 8px;
  }

  .HASM_Page_HeroTitle {
    font-family: Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    margin: 0 0 16px;
  }

  .HASM_Page_HeroLead {
    max-width: 720px;
    color: var(--theme-muted);
    font-size: 1.1rem;
    margin: 0 auto;
  }

  .HASM_Page_Section {
    padding: 40px 0;
    border-top: 1px solid var(--theme-border);
  }

  .HASM_Page_SectionHeader {
    margin-bottom: 28px;
  }

  .HASM_Page_SectionTitle {
    font-family: Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    margin: 6px 0 12px;
    line-height: 1.15;
  }

  .HASM_Page_PhilosophyLead {
    margin: 24px 0 32px;
    padding: 20px 24px;
    background: var(--theme-soft);
    border-left: 3px solid var(--theme-primary);
    font-size: 1.05rem;
    font-style: italic;
    color: var(--theme-text);
  }

  .HASM_Page_PhilosophyBlock {
    margin-top: 32px;
  }

  .HASM_Page_PhilosophyBlockTitle {
    font-family: Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 10px;
  }

  .HASM_Page_PhilosophyBlockDesc {
    margin: 0;
    color: var(--theme-muted);
    font-size: 0.98rem;
  }

  .HASM_Page_BenefitsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }

  .HASM_Page_FeatureCard {
    padding: 24px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-top: 3px solid var(--theme-primary);
  }

  .HASM_Page_FeatureTitle {
    font-family: Georgia, serif;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 10px;
  }

  .HASM_Page_FeatureDesc {
    margin: 0;
    color: var(--theme-muted);
    font-size: 0.92rem;
  }

  .HASM_Page_Ecosystem {
    margin-top: 50px;
    padding: 32px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HASM_Page_EcosystemHeader {
    text-align: center;
    margin-bottom: 24px;
  }

  .HASM_Page_EcosystemGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .HASM_Page_SubAppCard {
    padding: 20px;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  .HASM_Page_SubAppTitle {
    font-family: Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 6px;
  }

  .HASM_Page_SubAppDesc {
    font-size: 0.88rem;
    color: var(--theme-muted);
    margin: 0;
  }

  .HASM_Page_SubAppButton {
    padding: 10px 16px;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--theme-on-accent);
    background: var(--theme-primary);
    border: none;
    cursor: pointer;
    text-align: center;
    transition: opacity 0.2s ease;
  }

  .HASM_Page_SubAppButton:hover {
    opacity: 0.9;
  }

  @media (max-width: 760px) {
    .HASM_Page_Header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

export const HASM_Page = ({ onNavigateToHasmApp, onNavigateToMarkdown, onNavigateToColorPattern, onNavigateToLogo }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="HASM_Page">
      <style>{hasmPageStyles}</style>

      <div className="HASM_Page_Inner">
        <header className="HASM_Page_Header">
          <div className="HASM_Page_Brand">
            <img src={hasmLogo} alt="HASM" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div className="HASM_Page_BrandTitle">HASM</div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
            <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />
          </div>
        </header>

        <main>
          {/* HERO SECTION */}
          <section className="HASM_Page_Hero">
            <img src={hasmLogo} alt="HASM" className="HASM_Page_HeroLogo" />
            <div className="HASM_Page_Kicker">{t.homeKicker}</div>
            <h1 className="HASM_Page_HeroTitle">{t.homeTitle}</h1>
            <p className="HASM_Page_HeroLead">{t.homeTagline}</p>
          </section>

          {/* PHILOSOPHY: the only content on the project index page */}
          <section className="HASM_Page_Section" id="philosophy">
            <div className="HASM_Page_SectionHeader">
              <div className="HASM_Page_Kicker">{t.philosophyKicker}</div>
              <h2 className="HASM_Page_SectionTitle">{t.philosophyTitle}</h2>
            </div>

            <p className="HASM_Page_PhilosophyLead">{t.philosophyLead}</p>

            <div className="HASM_Page_PhilosophyBlock">
              <h3 className="HASM_Page_PhilosophyBlockTitle">{t.philosophyProblemTitle}</h3>
              <p className="HASM_Page_PhilosophyBlockDesc">{t.philosophyProblemDesc}</p>
            </div>

            <div className="HASM_Page_PhilosophyBlock">
              <h3 className="HASM_Page_PhilosophyBlockTitle">{t.philosophyDualLayerTitle}</h3>
              <p className="HASM_Page_PhilosophyBlockDesc">{t.philosophyDualLayerDesc}</p>
            </div>

            <div className="HASM_Page_BenefitsGrid">
              <div className="HASM_Page_FeatureCard">
                <h3 className="HASM_Page_FeatureTitle">{t.philosophyCausalTitle}</h3>
                <p className="HASM_Page_FeatureDesc">{t.philosophyCausalDesc}</p>
              </div>
              <div className="HASM_Page_FeatureCard">
                <h3 className="HASM_Page_FeatureTitle">{t.philosophySemanticTitle}</h3>
                <p className="HASM_Page_FeatureDesc">{t.philosophySemanticDesc}</p>
              </div>
            </div>

            <div className="HASM_Page_PhilosophyBlock">
              <h3 className="HASM_Page_PhilosophyBlockTitle">{t.philosophyReinterpretTitle}</h3>
              <p className="HASM_Page_PhilosophyBlockDesc">{t.philosophyReinterpretDesc}</p>
            </div>

            <div className="HASM_Page_PhilosophyBlock">
              <h3 className="HASM_Page_PhilosophyBlockTitle">{t.philosophyGroundingTitle}</h3>
              <p className="HASM_Page_PhilosophyBlockDesc">{t.philosophyGroundingDesc}</p>
            </div>

            <div className="HASM_Page_PhilosophyBlock">
              <h3 className="HASM_Page_PhilosophyBlockTitle">{t.philosophyVisionTitle}</h3>
              <p className="HASM_Page_PhilosophyBlockDesc">{t.philosophyVisionDesc}</p>
            </div>
          </section>

          {/* ECOSYSTEM: links to every app, including HASM itself */}
          <section className="HASM_Page_Ecosystem">
            <div className="HASM_Page_EcosystemHeader">
              <div className="HASM_Page_Kicker">{t.hasmSubApps}</div>
              <p className="HASM_Page_SubAppDesc">{t.hasmSubAppsDescription}</p>
            </div>

            <div className="HASM_Page_EcosystemGrid">
              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">HASM</div>
                  <p className="HASM_Page_SubAppDesc">{t.homeDescription}</p>
                </div>
                <button type="button" className="HASM_Page_SubAppButton" onClick={onNavigateToHasmApp}>
                  {t.openHasmAppSubApp}
                </button>
              </div>

              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">HASM Markdown</div>
                  <p className="HASM_Page_SubAppDesc">{t.markdownDescription}</p>
                </div>
                <button type="button" className="HASM_Page_SubAppButton" onClick={onNavigateToMarkdown}>
                  {t.openMarkdownSubApp}
                </button>
              </div>

              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">Color Pattern System</div>
                  <p className="HASM_Page_SubAppDesc">{t.colorPatternDescription}</p>
                </div>
                <button type="button" className="HASM_Page_SubAppButton" onClick={onNavigateToColorPattern}>
                  {t.openColorPatternSubApp}
                </button>
              </div>

              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">Logo System</div>
                  <p className="HASM_Page_SubAppDesc">{t.logoDescription}</p>
                </div>
                <button type="button" className="HASM_Page_SubAppButton" onClick={onNavigateToLogo}>
                  {t.openLogoSubApp}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HASM_Page;
