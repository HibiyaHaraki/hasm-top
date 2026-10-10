import React from 'react';
// Design tokens & syntax highlighting synced from submodules/hasm_markdown (see scripts/sync-markdown-design.mjs).
import './generated/markdown-design-tokens.css';
import { highlightMarkdown } from './generated/markdownHighlight.js';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import SiteHeader from './SiteHeader.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';
import OsDownloadSection from './OsDownloadSection.jsx';

const hasmMarkdownPageStyles = `
  .HASM_Markdown_Page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    letter-spacing: 0.03em;
    line-height: 1.7;
  }

  .HASM_Markdown_Page_Inner {
    width: min(1160px, calc(100% - 32px));
    margin: 0 auto;
    padding: 24px 0 60px;
    flex: 1;
  }

  .HASM_Markdown_Page_Hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 48px 0 44px;
  }

  .HASM_Markdown_Page_HeroLogo {
    width: 110px;
    height: 110px;
    object-fit: contain;
    margin-bottom: 16px;
  }

  .HASM_Markdown_Page_Kicker {
    margin: 0 0 8px;
    color: var(--theme-accent-readable);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .HASM_Markdown_Page_HeroTitle {
    margin: 0 0 16px;
    font-family: Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
  }

  .HASM_Markdown_Page_HeroLead {
    max-width: 760px;
    margin: 0;
    color: var(--theme-muted);
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .HASM_Markdown_Page_Feature {
    padding: 44px 0;
    border-top: 1px solid var(--theme-border);
  }

  .HASM_Markdown_Page_FeatureQuestion {
    max-width: 820px;
    margin: 0 0 8px;
    color: var(--theme-muted);
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .HASM_Markdown_Page_FeatureTitle {
    margin: 0 0 24px;
    font-family: Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    line-height: 1.18;
  }

  .HASM_Markdown_Page_DemoGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: stretch;
  }

  .HASM_Markdown_Page_Pane {
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    box-shadow: 8px 8px 0 var(--theme-soft);
  }

  .HASM_Markdown_Page_PaneTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 18px;
    color: var(--theme-muted);
    background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  .HASM_Markdown_Page_FileName {
    color: var(--theme-accent-readable);
    font-size: 0.72rem;
    letter-spacing: 0.03em;
  }

  .HASM_Markdown_Page_EditorBody {
    display: flex;
    min-height: 220px;
    flex: 1;
    overflow: auto;
    background: var(--editor-surface);
  }

  .HASM_Markdown_Page_EditorBody .HASM_Markdown_Editor_EditorCol_Editor_LineNum {
    flex: 0 0 48px;
  }

  .HASM_Markdown_Page_Code {
    min-width: 0;
    min-height: 220px;
    height: auto;
    overflow: auto;
  }

  .HASM_Markdown_Page_Preview {
    min-height: 220px;
    flex: 1;
    padding: 24px;
  }

  .HASM_Markdown_Page_Preview h3,
  .HASM_Markdown_Page_Preview h4 {
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--theme-border);
    font-family: Georgia, serif;
    line-height: 1.35;
  }

  .HASM_Markdown_Page_Preview p {
    color: var(--theme-muted);
  }

  .HASM_Markdown_Page_PortableStatus {
    padding: 16px;
    border: 1px solid var(--theme-border);
    border-left: 4px solid var(--theme-accent-readable);
    background: var(--theme-soft);
  }

  .HASM_Markdown_Page_PortableStatus strong {
    display: block;
    margin-bottom: 6px;
    color: var(--theme-accent-readable);
  }

  .HASM_Markdown_Page_PortableStatus p {
    margin: 0;
  }

  .HASM_Markdown_Page_EnvironmentList {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 14px;
    padding: 0;
    list-style: none;
  }

  .HASM_Markdown_Page_EnvironmentList li {
    padding: 5px 10px;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    font-size: 0.82rem;
  }

  .HASM_Markdown_Page_AssetStatus {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--theme-border);
    background: var(--theme-soft);
  }

  .HASM_Markdown_Page_AssetStatus strong,
  .HASM_Markdown_Page_AssetStatus span {
    display: block;
  }

  .HASM_Markdown_Page_AssetStatus span {
    margin-top: 4px;
    color: var(--theme-muted);
    font-size: 0.9rem;
  }

  .HASM_Markdown_Page_OfflineStatus {
    padding: 16px;
    border: 1px solid var(--theme-border);
    background: var(--theme-soft);
  }

  .HASM_Markdown_Page_OfflineStatus strong {
    display: block;
    margin-bottom: 4px;
    color: var(--theme-accent-readable);
  }

  .HASM_Markdown_Page_OfflineStatus p {
    margin: 0;
  }

  .HASM_Markdown_Page_Footer {
    padding: 36px 0 0;
    border-top: 1px solid var(--theme-border);
  }

  @media (max-width: 760px) {
    .HASM_Markdown_Page_Inner {
      width: min(100% - 28px, 600px);
      padding-top: 12px;
    }

    .HASM_Markdown_Page_Hero {
      padding: 36px 0;
    }

    .HASM_Markdown_Page_HeroLogo {
      width: 88px;
      height: 88px;
    }

    .HASM_Markdown_Page_Feature {
      padding: 34px 0;
    }

    .HASM_Markdown_Page_DemoGrid {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }

    .HASM_Markdown_Page_Preview,
    .HASM_Markdown_Page_EditorBody,
    .HASM_Markdown_Page_Code {
      min-height: 190px;
    }
  }
`;

const getFeatures = (t) => [
  {
    id: 'portable',
    question: t.portableQuestion,
    title: t.portableTitle,
    markdownText: `# ${t.portableTitle}

![${t.portableAlt}](asset:portable.mp4)

- ${t.portableLines[0]}
- ${t.portableLines[1]}
- ${t.portableLines[2]}`,
    renderPreview: () => (
      <div className="HASM_Markdown_Page_Preview HASM_Markdown_Editor_ViewerCol_Viewer">
        <h3>{t.portableTitle}</h3>
        <div className="HASM_Markdown_Page_PortableStatus">
          <strong>{t.portableStatus}</strong>
          <p>{t.portableDescription}</p>
        </div>
        <ul className="HASM_Markdown_Page_EnvironmentList" aria-label={t.portableTitle}>
          {t.osLabels.map((label) => <li key={label}>{label}</li>)}
        </ul>
        <p>{t.usbHint}</p>
      </div>
    )
  },
  {
    id: 'asset',
    question: t.assetQuestion,
    title: t.assetTitle,
    markdownText: `## ${t.assetTitle}

![${t.assetAlt}](asset:architecture-diagram)

${t.assetDescription}`,
    renderPreview: () => (
      <div className="HASM_Markdown_Page_Preview HASM_Markdown_Editor_ViewerCol_Viewer">
        <h3>{t.assetTitle}</h3>
        <p>{t.assetDescription}</p>
        <div className="HASM_Markdown_Page_AssetStatus">
          <div aria-hidden="true">◇</div>
          <div>
            <strong>asset:architecture-diagram</strong>
            <span>{t.assetStatus}</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    question: t.privacyQuestion,
    title: t.privacyTitle,
    markdownText: `### ${t.privacyTitle}

- ${t.externalApi}
- ${t.telemetry}

${t.offlineGuarantee}`,
    renderPreview: () => (
      <div className="HASM_Markdown_Page_Preview HASM_Markdown_Editor_ViewerCol_Viewer">
        <h3>{t.privacyTitle}</h3>
        <ul>
          <li>{t.externalApi}</li>
          <li>{t.telemetry}</li>
        </ul>
        <div className="HASM_Markdown_Page_OfflineStatus">
          <strong>{t.offlineLabel}</strong>
          <p>{t.offlineDescription}</p>
        </div>
      </div>
    )
  }
];

const LineNumberGutter = ({ count }) => (
  <div className="HASM_Markdown_Editor_EditorCol_Editor_LineNum" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <span key={index + 1}>{index + 1}</span>
    ))}
  </div>
);

const FeatureDemo = ({ feature, t }) => {
  const highlightedMarkdown = highlightMarkdown(feature.markdownText);

  return (
    <section className="HASM_Markdown_Page_Feature" aria-labelledby={`markdown-feature-${feature.id}`}>
      <p className="HASM_Markdown_Page_FeatureQuestion">{feature.question}</p>
      <h2 className="HASM_Markdown_Page_FeatureTitle" id={`markdown-feature-${feature.id}`}>
        {feature.title}
      </h2>
      <div className="HASM_Markdown_Page_DemoGrid">
        <div className="HASM_Markdown_Page_Pane">
          <div className="HASM_Markdown_Editor_EditorCol_Title HASM_Markdown_Page_PaneTitle">
            <span>{t.editor}</span>
            <span className="HASM_Markdown_Page_FileName">note.md</span>
          </div>
          <div className="HASM_Markdown_Page_EditorBody">
            <LineNumberGutter count={feature.markdownText.split('\n').length} />
            <div
              className="MarkdownSyntax_Input HASM_Markdown_Page_Code"
              dangerouslySetInnerHTML={{ __html: highlightedMarkdown }}
            />
          </div>
        </div>
        <div className="HASM_Markdown_Page_Pane">
          <div className="HASM_Markdown_Editor_ViewerCol_Title HASM_Markdown_Page_PaneTitle">
            <span>{t.preview}</span>
          </div>
          {feature.renderPreview()}
        </div>
      </div>
    </section>
  );
};

export const HASM_Markdown_Page = ({ onNavigateHome }) => {
  const { t } = useLanguage();
  const features = getFeatures(t);

  return (
    <div className="HASM_Markdown_Page EditorColor_light">
      <style>{hasmMarkdownPageStyles}</style>
      <SiteHeader onNavigateHome={onNavigateHome} />
      <main className="HASM_Markdown_Page_Inner">
        <header className="HASM_Markdown_Page_Hero">
          <img src={hasmLogo} alt="HASM" className="HASM_Markdown_Page_HeroLogo" />
          <p className="HASM_Markdown_Page_Kicker">{t.markdownKicker}</p>
          <h1 className="HASM_Markdown_Page_HeroTitle">{t.markdownTitle}</h1>
          <p className="HASM_Markdown_Page_HeroLead">{t.markdownDescription}</p>
        </header>
        {features.map((feature) => (
          <FeatureDemo key={feature.id} feature={feature} t={t} />
        ))}
        <footer className="HASM_Markdown_Page_Footer">
          <OsDownloadSection appType="hasm_markdown" />
          <Footer />
        </footer>
      </main>
    </div>
  );
};
