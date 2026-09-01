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
    padding: 56px 0 44px;
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
    max-width: 760px;
    color: var(--theme-muted);
    font-size: 1.15rem;
    margin: 0 auto;
    line-height: 1.8;
  }

  .HASM_Page_Section {
    padding: 48px 0;
    border-top: 1px solid var(--theme-border);
  }

  .HASM_Page_SectionHeader {
    margin-bottom: 28px;
  }

  .HASM_Page_SectionTitle {
    font-family: Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    margin: 6px 0 12px;
    line-height: 1.18;
  }

  .HASM_Page_PhilosophyLead {
    margin: 20px 0 36px;
    padding: 24px 28px;
    background: var(--theme-soft);
    border-left: 4px solid var(--theme-primary);
    font-size: 1.08rem;
    font-style: italic;
    color: var(--theme-text);
    line-height: 1.85;
  }

  /* DUAL LAYER ARCHITECTURE DIAGRAM */
  .HASM_Page_DualLayerDiagram {
    margin: 36px 0;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    padding: 28px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
  }

  .HASM_Page_LayerBox {
    padding: 24px;
    border: 1px solid var(--theme-border);
    position: relative;
  }

  .HASM_Page_LayerBox.subjective {
    background: var(--theme-soft);
    border-top: 4px solid #68a5d2;
  }

  .HASM_Page_LayerBox.objective {
    background: var(--theme-soft);
    border-bottom: 4px solid #e08a65;
  }

  .HASM_Page_LayerHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .HASM_Page_LayerTitle {
    font-family: Georgia, serif;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .HASM_Page_LayerBadge {
    display: inline-block;
    padding: 3px 10px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--theme-primary);
    color: var(--theme-on-accent);
  }

  .HASM_Page_LayerDesc {
    font-size: 0.95rem;
    color: var(--theme-text);
    margin: 0;
    line-height: 1.7;
  }

  .HASM_Page_BridgeConnector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 0;
    text-align: center;
    position: relative;
  }

  .HASM_Page_BridgePill {
    padding: 8px 18px;
    background: var(--theme-surface);
    border: 1px dashed var(--theme-primary);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--theme-accent-readable);
    letter-spacing: 0.08em;
    z-index: 2;
  }

  .HASM_Page_BridgeDesc {
    font-size: 0.88rem;
    color: var(--theme-muted);
    max-width: 650px;
    margin: 8px 0 0;
  }

  /* 4 DEFECTS GRID */
  .HASM_Page_DefectsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin: 28px 0;
  }

  .HASM_Page_DefectCard {
    padding: 24px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-top: 3px solid var(--theme-primary);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .HASM_Page_DefectHeader {
    margin-bottom: 12px;
  }

  .HASM_Page_DefectTitle {
    font-family: Georgia, serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--theme-text);
  }

  .HASM_Page_DefectEn {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--theme-accent-readable);
    letter-spacing: 0.06em;
  }

  .HASM_Page_DefectDesc {
    margin: 0;
    color: var(--theme-muted);
    font-size: 0.92rem;
    line-height: 1.65;
  }

  /* COMPARISON TABLE */
  .HASM_Page_TableContainer {
    margin: 32px 0;
    overflow-x: auto;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
  }

  .HASM_Page_CompTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
    text-align: left;
  }

  .HASM_Page_CompTable th {
    padding: 14px 18px;
    background: var(--theme-soft);
    border-bottom: 2px solid var(--theme-border);
    font-family: Georgia, serif;
    font-weight: 700;
    color: var(--theme-text);
    font-size: 0.95rem;
  }

  .HASM_Page_CompTable td {
    padding: 14px 18px;
    border-bottom: 1px solid var(--theme-border);
    vertical-align: top;
    line-height: 1.65;
  }

  .HASM_Page_CompTable tr:last-child td {
    border-bottom: none;
  }

  .HASM_Page_CompDim {
    font-weight: 700;
    color: var(--theme-accent-readable);
    white-space: nowrap;
  }

  .HASM_Page_CompConv {
    color: var(--theme-muted);
    background: rgba(0, 0, 0, 0.02);
  }

  .HASM_Page_CompHasm {
    color: var(--theme-text);
    font-weight: 600;
    border-left: 2px solid var(--theme-primary);
  }

  /* METAPHOR CALLOUT */
  .HASM_Page_MetaphorBlock {
    margin: 40px 0;
    padding: 28px 32px;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    border-left: 4px solid var(--theme-primary);
  }

  .HASM_Page_MetaphorTitle {
    font-family: Georgia, serif;
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 0 10px;
    color: var(--theme-text);
  }

  .HASM_Page_MetaphorDesc {
    margin: 0;
    color: var(--theme-muted);
    font-size: 1rem;
    line-height: 1.8;
  }

  /* GROUNDING PILLS */
  .HASM_Page_GroundingGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .HASM_Page_GroundingCard {
    padding: 18px 20px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    font-size: 0.9rem;
    color: var(--theme-text);
    line-height: 1.6;
  }

  .HASM_Page_GroundingCard strong {
    display: block;
    font-family: Georgia, serif;
    font-size: 1rem;
    margin-bottom: 6px;
    color: var(--theme-accent-readable);
  }

  /* ECOSYSTEM */
  .HASM_Page_Ecosystem {
    margin-top: 50px;
    padding: 36px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HASM_Page_EcosystemHeader {
    text-align: center;
    margin-bottom: 28px;
  }

  .HASM_Page_EcosystemGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }

  .HASM_Page_SubAppCard {
    padding: 22px;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  .HASM_Page_SubAppTitle {
    font-family: Georgia, serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .HASM_Page_SubAppDesc {
    font-size: 0.88rem;
    color: var(--theme-muted);
    margin: 0;
    line-height: 1.6;
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

export const HASM_Page = ({ onNavigateToHasmApp, onNavigateToMarkdown, onNavigateToColorPattern, onNavigateToLogo, onNavigateToCreator }) => {
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

          {/* PHILOSOPHY SECTION */}
          <section className="HASM_Page_Section" id="philosophy">
            <div className="HASM_Page_SectionHeader">
              <div className="HASM_Page_Kicker">{t.philosophyKicker}</div>
              <h2 className="HASM_Page_SectionTitle">{t.philosophyTitle}</h2>
            </div>

            <p className="HASM_Page_PhilosophyLead">{t.philosophyLead}</p>

            {/* DUAL LAYER ARCHITECTURE DIAGRAM */}
            <div className="HASM_Page_DualLayerDiagram">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="HASM_Page_Kicker">{t.layerStackTitle}</div>
                <p style={{ margin: '4px 0 0', color: 'var(--theme-muted)', fontSize: '0.92rem' }}>
                  {t.layerStackSubtitle}
                </p>
              </div>

              {/* SUBJECTIVE LAYER */}
              <div className="HASM_Page_LayerBox subjective">
                <div className="HASM_Page_LayerHeader">
                  <h3 className="HASM_Page_LayerTitle">{t.layerSubjectiveTitle}</h3>
                  <span className="HASM_Page_LayerBadge">Subjective / Context & Meaning</span>
                </div>
                <p className="HASM_Page_LayerDesc">{t.layerSubjectiveDesc}</p>
              </div>

              {/* NEXUS / BRIDGE */}
              <div className="HASM_Page_BridgeConnector">
                <div className="HASM_Page_BridgePill">⬍ {t.layerNexusTitle} ⬍</div>
                <p className="HASM_Page_BridgeDesc">{t.layerNexusDesc}</p>
              </div>

              {/* OBJECTIVE LAYER */}
              <div className="HASM_Page_LayerBox objective">
                <div className="HASM_Page_LayerHeader">
                  <h3 className="HASM_Page_LayerTitle">{t.layerObjectiveTitle}</h3>
                  <span className="HASM_Page_LayerBadge" style={{ background: '#e08a65' }}>Objective / Facts & Causality</span>
                </div>
                <p className="HASM_Page_LayerDesc">{t.layerObjectiveDesc}</p>
              </div>
            </div>

            {/* 4 FATAL DEFECTS BREAKDOWN */}
            <div style={{ marginTop: 44 }}>
              <div className="HASM_Page_Kicker">{t.defectsSectionTitle}</div>
              <p style={{ margin: '4px 0 16px', color: 'var(--theme-muted)', fontSize: '0.95rem' }}>
                {t.defectsSectionSubtitle}
              </p>

              <div className="HASM_Page_DefectsGrid">
                <div className="HASM_Page_DefectCard">
                  <div className="HASM_Page_DefectHeader">
                    <div className="HASM_Page_DefectTitle">{t.defect1Name}</div>
                    <div className="HASM_Page_DefectEn">{t.defect1EnName}</div>
                  </div>
                  <p className="HASM_Page_DefectDesc">{t.defect1Desc}</p>
                </div>

                <div className="HASM_Page_DefectCard">
                  <div className="HASM_Page_DefectHeader">
                    <div className="HASM_Page_DefectTitle">{t.defect2Name}</div>
                    <div className="HASM_Page_DefectEn">{t.defect2EnName}</div>
                  </div>
                  <p className="HASM_Page_DefectDesc">{t.defect2Desc}</p>
                </div>

                <div className="HASM_Page_DefectCard">
                  <div className="HASM_Page_DefectHeader">
                    <div className="HASM_Page_DefectTitle">{t.defect3Name}</div>
                    <div className="HASM_Page_DefectEn">{t.defect3EnName}</div>
                  </div>
                  <p className="HASM_Page_DefectDesc">{t.defect3Desc}</p>
                </div>

                <div className="HASM_Page_DefectCard">
                  <div className="HASM_Page_DefectHeader">
                    <div className="HASM_Page_DefectTitle">{t.defect4Name}</div>
                    <div className="HASM_Page_DefectEn">{t.defect4EnName}</div>
                  </div>
                  <p className="HASM_Page_DefectDesc">{t.defect4Desc}</p>
                </div>
              </div>
            </div>

            {/* COMPARISON TABLE: CURRENT TECH VS HASM */}
            <div style={{ marginTop: 48 }}>
              <div className="HASM_Page_Kicker">{t.compSectionTitle}</div>
              <p style={{ margin: '4px 0 16px', color: 'var(--theme-muted)', fontSize: '0.95rem' }}>
                {t.compSectionSubtitle}
              </p>

              <div className="HASM_Page_TableContainer">
                <table className="HASM_Page_CompTable">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>{t.compDimHeader}</th>
                      <th style={{ width: '38%' }}>{t.compConvHeader}</th>
                      <th style={{ width: '40%' }}>{t.compHasmHeader}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="HASM_Page_CompDim">{t.compRow1Dim}</td>
                      <td className="HASM_Page_CompConv">{t.compRow1Conv}</td>
                      <td className="HASM_Page_CompHasm">{t.compRow1Hasm}</td>
                    </tr>
                    <tr>
                      <td className="HASM_Page_CompDim">{t.compRow2Dim}</td>
                      <td className="HASM_Page_CompConv">{t.compRow2Conv}</td>
                      <td className="HASM_Page_CompHasm">{t.compRow2Hasm}</td>
                    </tr>
                    <tr>
                      <td className="HASM_Page_CompDim">{t.compRow3Dim}</td>
                      <td className="HASM_Page_CompConv">{t.compRow3Conv}</td>
                      <td className="HASM_Page_CompHasm">{t.compRow3Hasm}</td>
                    </tr>
                    <tr>
                      <td className="HASM_Page_CompDim">{t.compRow4Dim}</td>
                      <td className="HASM_Page_CompConv">{t.compRow4Conv}</td>
                      <td className="HASM_Page_CompHasm">{t.compRow4Hasm}</td>
                    </tr>
                    <tr>
                      <td className="HASM_Page_CompDim">{t.compRow5Dim}</td>
                      <td className="HASM_Page_CompConv">{t.compRow5Conv}</td>
                      <td className="HASM_Page_CompHasm">{t.compRow5Hasm}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ENGINEERING METAPHOR */}
            <div className="HASM_Page_MetaphorBlock">
              <h3 className="HASM_Page_MetaphorTitle">{t.metaphorTitle}</h3>
              <p className="HASM_Page_MetaphorDesc">{t.metaphorDesc}</p>
            </div>

            {/* INTERDISCIPLINARY SCIENTIFIC GROUNDING */}
            <div style={{ marginTop: 40 }}>
              <div className="HASM_Page_Kicker">{t.groundingTitle}</div>
              <p style={{ margin: '4px 0 16px', color: 'var(--theme-muted)', fontSize: '0.95rem' }}>
                {t.groundingDesc}
              </p>

              <div className="HASM_Page_GroundingGrid">
                <div className="HASM_Page_GroundingCard">
                  <strong>Cognitive Science</strong>
                  {t.groundingCognitive}
                </div>
                <div className="HASM_Page_GroundingCard">
                  <strong>Knowledge Engineering</strong>
                  {t.groundingKnowledge}
                </div>
                <div className="HASM_Page_GroundingCard">
                  <strong>HCI & CSCW</strong>
                  {t.groundingHCI}
                </div>
                <div className="HASM_Page_GroundingCard">
                  <strong>Career Theory</strong>
                  {t.groundingCareer}
                </div>
              </div>
            </div>
          </section>

          {/* ECOSYSTEM: LINKS TO ALL SUB-APPS */}
          <section className="HASM_Page_Ecosystem">
            <div className="HASM_Page_EcosystemHeader">
              <div className="HASM_Page_Kicker">{t.hasmSubApps}</div>
              <p className="HASM_Page_SubAppDesc">{t.hasmSubAppsDescription}</p>
            </div>

            <div className="HASM_Page_EcosystemGrid">
              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">HASM Desktop App</div>
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

              <div className="HASM_Page_SubAppCard">
                <div>
                  <div className="HASM_Page_SubAppTitle">{t.creatorTitle}</div>
                  <p className="HASM_Page_SubAppDesc">{t.creatorDescription}</p>
                </div>
                <button type="button" className="HASM_Page_SubAppButton" onClick={onNavigateToCreator}>
                  {t.openCreatorSubApp}
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
