import React, { useState } from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';
import HasmVisualizerComponent from './HasmVisualizerComponent.jsx';
import OsDownloadSection from './OsDownloadSection.jsx';
import { createLogger } from './hasm_logger/src/react/logger.js';

const logger = createLogger('hasm-page');

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

  .HASM_Page_BrandBadge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: var(--theme-primary);
    color: var(--theme-on-accent);
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
    margin: 0 0 32px;
  }

  .HASM_Page_TabNav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
    border-bottom: 1px solid var(--theme-border);
    padding-bottom: 16px;
  }

  .HASM_Page_TabButton {
    padding: 10px 20px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .HASM_Page_TabButton[aria-selected="true"] {
    background: var(--theme-primary);
    color: var(--theme-on-accent);
    border-color: var(--theme-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .HASM_Page_TabButton:hover:not([aria-selected="true"]) {
    background: var(--theme-soft);
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

  .HASM_Page_SectionDesc {
    max-width: 800px;
    color: var(--theme-muted);
    font-size: 1.05rem;
  }

  .HASM_Page_EntityGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin: 28px 0;
  }

  .HASM_Page_EntityCard {
    padding: 20px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HASM_Page_EntityCardHeader {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .HASM_Page_EntityBadge {
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: var(--theme-primary);
    color: var(--theme-on-accent);
  }

  .HASM_Page_EntityCard p {
    margin: 0;
    color: var(--theme-muted);
    font-size: 0.92rem;
  }

  .HASM_Page_FlowContainer {
    margin-top: 32px;
    padding: 24px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HASM_Page_FlowTitle {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--theme-accent-readable);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .HASM_Page_FlowSteps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .HASM_Page_FlowStep {
    padding: 16px;
    background: var(--theme-soft);
    border-left: 3px solid var(--theme-primary);
  }

  .HASM_Page_FlowStepNum {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--theme-accent-readable);
    margin-bottom: 4px;
  }

  .HASM_Page_FlowStepText {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .HASM_Page_TreeBox {
    padding: 20px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    font-family: monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre;
    color: var(--theme-text);
  }

  .HASM_Page_SampleGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .HASM_Page_SampleCard {
    padding: 20px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HASM_Page_SampleTitle {
    font-family: Georgia, serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 8px 0 4px;
    color: var(--theme-text);
  }

  .HASM_Page_SampleSub {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--theme-accent-readable);
    margin-bottom: 8px;
  }

  .HASM_Page_SampleDesc {
    font-size: 0.9rem;
    color: var(--theme-muted);
    margin: 0;
  }

  .HASM_Page_LinkChain {
    margin-top: 24px;
    padding: 20px;
    background: var(--theme-soft);
    border: 1px dashed var(--theme-border);
    font-size: 0.95rem;
  }

  .HASM_Page_LinkChainTitle {
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--theme-text);
  }

  .HASM_Page_LinkChainCode {
    font-family: Georgia, serif;
    font-weight: 700;
    color: var(--theme-primary);
    line-height: 1.5;
  }

  .HASM_Page_BenefitsGrid,
  .HASM_Page_UsecaseGrid {
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
    .HASM_Page_TabNav {
      flex-direction: column;
    }
    .HASM_Page_TabButton {
      width: 100%;
      text-align: center;
    }
    .HASM_Page_FlowSteps {
      grid-template-columns: 1fr;
    }
  }
`;

export const HASM_Page = ({ onNavigateToMarkdown, onNavigateToColorPattern, onNavigateToLogo }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    logger.info('Changed HASM page tab.', { tabId });
  };

  return (
    <div className="HASM_Page">
      <style>{hasmPageStyles}</style>

      <div className="HASM_Page_Inner">
        <header className="HASM_Page_Header">
          <div className="HASM_Page_Brand">
            <img src={hasmLogo} alt="HASM" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div>
              <div className="HASM_Page_BrandTitle">HASM</div>
              <span className="HASM_Page_BrandBadge">{t.hasmMainApp}</span>
            </div>
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
            <p className="HASM_Page_HeroLead">{t.homeDescription}</p>

            {/* TAB NAVIGATION */}
            <nav className="HASM_Page_TabNav" aria-label="HASM navigation">
              <button
                type="button"
                className="HASM_Page_TabButton"
                aria-selected={activeTab === 'all'}
                onClick={() => handleTabChange('all')}
              >
                All Overview
              </button>
              <button
                type="button"
                className="HASM_Page_TabButton"
                aria-selected={activeTab === 'what-is-hasm'}
                onClick={() => handleTabChange('what-is-hasm')}
              >
                {t.navWhatIsHasm}
              </button>
              <button
                type="button"
                className="HASM_Page_TabButton"
                aria-selected={activeTab === 'example'}
                onClick={() => handleTabChange('example')}
              >
                {t.navExample}
              </button>
              <button
                type="button"
                className="HASM_Page_TabButton"
                aria-selected={activeTab === 'benefit'}
                onClick={() => handleTabChange('benefit')}
              >
                {t.navBenefit}
              </button>
              <button
                type="button"
                className="HASM_Page_TabButton"
                aria-selected={activeTab === 'usecase'}
                onClick={() => handleTabChange('usecase')}
              >
                {t.navUsecase}
              </button>
            </nav>
          </section>

          {/* SECTION 1: WHAT IS HASM? */}
          {(activeTab === 'all' || activeTab === 'what-is-hasm') && (
            <section className="HASM_Page_Section" id="what-is-hasm">
              <div className="HASM_Page_SectionHeader">
                <div className="HASM_Page_Kicker">{t.whatIsHasmKicker}</div>
                <h2 className="HASM_Page_SectionTitle">{t.whatIsHasmTitle}</h2>
                <p className="HASM_Page_SectionDesc">{t.whatIsHasmDescription}</p>
              </div>

              <div className="HASM_Page_EntityGrid">
                <div className="HASM_Page_EntityCard">
                  <div className="HASM_Page_EntityCardHeader">
                    <span className="HASM_Page_EntityBadge">{t.entityPerson}</span>
                  </div>
                  <p>{t.entityPersonDesc}</p>
                </div>

                <div className="HASM_Page_EntityCard">
                  <div className="HASM_Page_EntityCardHeader">
                    <span className="HASM_Page_EntityBadge">{t.entityExperience}</span>
                  </div>
                  <p>{t.entityExperienceDesc}</p>
                </div>

                <div className="HASM_Page_EntityCard">
                  <div className="HASM_Page_EntityCardHeader">
                    <span className="HASM_Page_EntityBadge">{t.entityFact}</span>
                  </div>
                  <p>{t.entityFactDesc}</p>
                </div>

                <div className="HASM_Page_EntityCard">
                  <div className="HASM_Page_EntityCardHeader">
                    <span className="HASM_Page_EntityBadge">{t.entityLink}</span>
                  </div>
                  <p>{t.entityLinkDesc}</p>
                </div>
              </div>

              <div className="HASM_Page_FlowContainer">
                <div className="HASM_Page_FlowTitle">{t.flowTitle}</div>
                <div className="HASM_Page_FlowSteps">
                  <div className="HASM_Page_FlowStep">
                    <div className="HASM_Page_FlowStepNum">STEP 01</div>
                    <div className="HASM_Page_FlowStepText">{t.flowStep1}</div>
                  </div>
                  <div className="HASM_Page_FlowStep">
                    <div className="HASM_Page_FlowStepNum">STEP 02</div>
                    <div className="HASM_Page_FlowStepText">{t.flowStep2}</div>
                  </div>
                  <div className="HASM_Page_FlowStep">
                    <div className="HASM_Page_FlowStepNum">STEP 03</div>
                    <div className="HASM_Page_FlowStepText">{t.flowStep3}</div>
                  </div>
                  <div className="HASM_Page_FlowStep">
                    <div className="HASM_Page_FlowStepNum">STEP 04</div>
                    <div className="HASM_Page_FlowStepText">{t.flowStep4}</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: EXAMPLE */}
          {(activeTab === 'all' || activeTab === 'example') && (
            <section className="HASM_Page_Section" id="example">
              <div className="HASM_Page_SectionHeader">
                <div className="HASM_Page_Kicker">{t.exampleKicker}</div>
                <h2 className="HASM_Page_SectionTitle">{t.exampleTitle}</h2>
                <p className="HASM_Page_SectionDesc">{t.exampleDescription}</p>
              </div>

              {/* LIVE 3D COMMIT GRAPH VISUALIZER */}
              <div style={{ marginBottom: 32 }}>
                <div className="HASM_Page_Kicker">{t.visualizerKicker}</div>
                <h3 className="HASM_Page_SectionTitle" style={{ fontSize: '1.6rem', marginTop: 4 }}>
                  {t.visualizerTitle}
                </h3>
                <p className="HASM_Page_SectionDesc" style={{ fontSize: '0.95rem' }}>
                  {t.visualizerDescription}
                </p>
                <HasmVisualizerComponent
                  labels={{
                    sampleModel: t.sampleModel,
                    timeScale: t.timeScale,
                    zScale: t.zScale,
                  }}
                />
              </div>

              <div className="HASM_Page_TreeBox">
                <strong>{t.exampleFolderTitle}:</strong>
                {`
my-hasm-model/
├── PERSON/
│   ├── alan_turing.md
│   └── joan_clarke.md
├── EXPERIENCE/
│   └── enigma_decryption_1939.md
├── FACT/
│   └── bombe_machine_breakthrough.md
├── LINK/
│   ├── turing_enigma_participation.md
│   └── bombe_fact_enigma.md
└── main.db  (SQLite local index)`}
              </div>

              <div className="HASM_Page_SampleGrid">
                <div className="HASM_Page_SampleCard">
                  <span className="HASM_Page_EntityBadge">{t.entityPerson}</span>
                  <div className="HASM_Page_SampleTitle">{t.examplePersonName}</div>
                  <div className="HASM_Page_SampleSub">{t.examplePersonRole}</div>
                  <p className="HASM_Page_SampleDesc">
                    <code>alan_turing.md</code>
                  </p>
                </div>

                <div className="HASM_Page_SampleCard">
                  <span className="HASM_Page_EntityBadge">{t.entityExperience}</span>
                  <div className="HASM_Page_SampleTitle">{t.exampleExperienceName}</div>
                  <div className="HASM_Page_SampleSub">{t.exampleExperienceRole}</div>
                  <p className="HASM_Page_SampleDesc">
                    <code>enigma_decryption_1939.md</code>
                  </p>
                </div>

                <div className="HASM_Page_SampleCard">
                  <span className="HASM_Page_EntityBadge">{t.entityFact}</span>
                  <div className="HASM_Page_SampleTitle">{t.exampleFactName}</div>
                  <div className="HASM_Page_SampleSub">{t.exampleFactRole}</div>
                  <p className="HASM_Page_SampleDesc">{t.exampleFactDesc}</p>
                </div>
              </div>

              <div className="HASM_Page_LinkChain">
                <div className="HASM_Page_LinkChainTitle">{t.entityLink} Network Example:</div>
                <div className="HASM_Page_LinkChainCode">{t.exampleLinkName}</div>
                <p style={{ margin: '8px 0 0', color: 'var(--theme-muted)', fontSize: '0.88rem' }}>
                  {t.exampleLinkDesc}
                </p>
              </div>
            </section>
          )}

          {/* SECTION 3: BENEFIT */}
          {(activeTab === 'all' || activeTab === 'benefit') && (
            <section className="HASM_Page_Section" id="benefit">
              <div className="HASM_Page_SectionHeader">
                <div className="HASM_Page_Kicker">{t.benefitKicker}</div>
                <h2 className="HASM_Page_SectionTitle">{t.benefitTitle}</h2>
                <p className="HASM_Page_SectionDesc">{t.benefitDescription}</p>
              </div>

              <div className="HASM_Page_BenefitsGrid">
                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.benefit1Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.benefit1Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.benefit2Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.benefit2Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.benefit3Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.benefit3Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.benefit4Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.benefit4Desc}</p>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: USECASE */}
          {(activeTab === 'all' || activeTab === 'usecase') && (
            <section className="HASM_Page_Section" id="usecase">
              <div className="HASM_Page_SectionHeader">
                <div className="HASM_Page_Kicker">{t.usecaseKicker}</div>
                <h2 className="HASM_Page_SectionTitle">{t.usecaseTitle}</h2>
                <p className="HASM_Page_SectionDesc">{t.usecaseDescription}</p>
              </div>

              <div className="HASM_Page_UsecaseGrid">
                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.usecase1Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.usecase1Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.usecase2Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.usecase2Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.usecase3Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.usecase3Desc}</p>
                </div>

                <div className="HASM_Page_FeatureCard">
                  <h3 className="HASM_Page_FeatureTitle">{t.usecase4Title}</h3>
                  <p className="HASM_Page_FeatureDesc">{t.usecase4Desc}</p>
                </div>
              </div>
            </section>
          )}

          {/* DOWNLOAD SECTION */}
          <OsDownloadSection appType="hasm" />

          {/* ECOSYSTEM SUB APPS */}
          <section className="HASM_Page_Ecosystem">
            <div className="HASM_Page_EcosystemHeader">
              <div className="HASM_Page_Kicker">{t.hasmSubApps}</div>
              <p className="HASM_Page_SubAppDesc">{t.hasmSubAppsDescription}</p>
            </div>

            <div className="HASM_Page_EcosystemGrid">
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
