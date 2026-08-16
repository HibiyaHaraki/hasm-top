import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Design tokens & syntax highlighting synced from submodules/hasm_markdown (see scripts/sync-markdown-design.mjs).
import './generated/markdown-design-tokens.css';
import { highlightMarkdown } from './generated/markdownHighlight.js';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';

// レイアウト専用スタイル（配色・タイポ・エディタ/プレビューの見た目は generated/markdown-design-tokens.css 側で同期）
const hasmStyles = `
  .hasm-lp-root {
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    letter-spacing: 0.03em;
    line-height: 1.75;
  }

  .sticky-container {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
  }

  .feature-step {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .HASM_Markdown_Editor_Pane {
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    box-shadow: 0 10px 30px rgba(20, 18, 15, 0.12);
    overflow: hidden;
  }

  .HASM_Markdown_Editor_ViewerCol_Viewer {
    padding: 24px;
    min-height: 380px;
  }

  .BackHomeLink {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 20;
    padding: 6px 12px;
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    box-shadow: 0 6px 18px rgba(20, 18, 15, 0.12);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }

`;

// 異なるPC・OSのイラストアニメーション（右側プレビュー用）
const EnvironmentIllustrations = ({ t }) => {
  const [currentEnv, setCurrentEnv] = useState(0);
  const environments = [
    { name: t.osNames[0], label: t.osLabels[0], color: '#2d3748', icon: 'mac', border: '#e2e8f0' },
    { name: t.osNames[1], label: t.osLabels[1], color: '#0f172a', icon: 'win', border: '#38bdf8' },
    { name: t.osNames[2], label: t.osLabels[2], color: '#1c1917', icon: 'linux', border: '#f97316' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEnv((prev) => (prev + 1) % environments.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [environments.length]);

  const env = environments[currentEnv];

  return (
    <div className="p-2 text-center">
      {/* OSインジケーター */}
      <div className="d-flex justify-content-center gap-2 mb-3">
        {environments.map((e, idx) => (
          <span
            key={e.name}
            className={`badge px-2 py-1 ${idx === currentEnv ? 'bg-primary' : 'bg-secondary'}`}
            style={{ fontSize: '0.7rem', transition: 'all 0.3s' }}
          >
            {e.label}
          </span>
        ))}
      </div>

      {/* PCイラスト・フレーム */}
      <motion.div
        key={env.name}
        initial={{ opacity: 0, scale: 0.92, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.4 }}
        className="p-3 rounded-3 shadow-lg text-start mx-auto"
        style={{
          background: env.color,
          border: `2px solid ${env.border}`,
          maxWidth: '420px',
          color: '#f8fafc'
        }}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mb-2">
          <div className="d-flex gap-1">
            <span className="rounded-circle bg-danger d-inline-block" style={{ width: 8, height: 8 }}></span>
            <span className="rounded-circle bg-warning d-inline-block" style={{ width: 8, height: 8 }}></span>
            <span className="rounded-circle bg-success d-inline-block" style={{ width: 8, height: 8 }}></span>
          </div>
          <span className="font-monospace text-muted" style={{ fontSize: '0.65rem' }}>
            HASM Editor - {env.name}
          </span>
        </div>

        <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', fontSize: '0.85rem' }}>
          <div className="fw-bold mb-1" style={{ color: 'var(--theme-accent-readable)' }}>{t.portableStatus}</div>
          <p className="small text-light mb-2">
            {t.portableDescription}
          </p>
          <div className="p-2 rounded font-monospace small" style={{ background: '#000', color: '#4ade80' }}>
            {t.loaded}<br />
            {t.localStatus}
          </div>
        </div>
      </motion.div>

      <div className="mt-3 text-muted small" style={{ fontSize: '0.72rem' }}>
        {t.usbHint}
      </div>
    </div>
  );
};

// 各機能の入力テキスト・プレビュー定義
const getFeatures = (t) => [
  {
    id: 'portable',
    question: t.portableQuestion,
    markdownText: `# ${t.portableTitle}

![${t.portableAlt}](asset:portable.mp4)

- ${t.portableLines[0]}
- ${t.portableLines[1]}
- ${t.portableLines[2]}`,
    renderPreview: () => <EnvironmentIllustrations t={t} />
  },
  {
    id: 'asset',
    question: t.assetQuestion,
    markdownText: `## ${t.assetTitle}

![${t.assetAlt}](asset:architecture-diagram)

${t.assetDescription}`,
    renderPreview: () => (
      <div>
        <h3 className="border-bottom pb-2 border-secondary">{t.assetTitle}</h3>
        <p className="mt-3">{t.assetDescription}</p>
        
        <div className="alert alert-warning border-secondary mt-3 d-flex align-items-center gap-3">
          <div className="fs-3">◇</div>
          <div className="small">
            <strong>asset:architecture-diagram</strong>
            <br />
            <span className="text-muted">{t.assetStatus}</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    question: t.privacyQuestion,
    markdownText: `### ${t.privacyTitle}

  - ${t.externalApi}
  - ${t.telemetry}

  ${t.offlineGuarantee}`,
    renderPreview: () => (
      <div>
        <h4 className="border-bottom pb-2 border-secondary">{t.privacyTitle}</h4>
        <ul className="mt-3">
          <li>{t.externalApi}</li>
          <li>{t.telemetry}</li>
        </ul>
        <div className="p-3 my-3 text-center border border-secondary rounded" style={{ background: 'var(--theme-surface)' }}>
          <div className="fs-2 mb-1">🛡️</div>
          <div className="fw-bold">{t.offlineLabel}</div>
          <div className="small text-muted">{t.offlineDescription}</div>
        </div>
      </div>
    )
  }
];

// タイピング演出コンポーネント
const TypewriterText = ({ htmlContent }) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev < htmlContent.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 15);

    return () => clearInterval(timer);
  }, [htmlContent]);

  const currentHtml = htmlContent.slice(0, displayedLength);

  return (
    <div 
      className="MarkdownSyntax_Input flex-grow-1"
      dangerouslySetInnerHTML={{ __html: currentHtml + '<span style="color:var(--theme-primary)">|</span>' }}
    />
  );
};

// Gutter markup mirrors HASM_Markdown_Editor.jsx exactly, so the shared .HASM_Markdown_Editor_EditorCol_Editor_LineNum > span rule applies.
const LineNumberGutter = ({ count }) => (
  <div className="HASM_Markdown_Editor_EditorCol_Editor_LineNum">
    {Array.from({ length: count }, (_, i) => i + 1).map((lineNumber) => (
      <span key={lineNumber}>{lineNumber}</span>
    ))}
  </div>
);

export const HASM_Markdown_Page = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const features = getFeatures(t);

  return (
    <div className="hasm-lp-root EditorColor_light min-vh-100">
      <style>{hasmStyles}</style>
      {onNavigateHome && (
        <button type="button" className="BackHomeLink" onClick={onNavigateHome}>&larr; {t.backHome}</button>
      )}
      <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
      <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />

      {/* ヒーローセクション */}
      <section className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <img src={hasmLogo} alt="HASM" className="mb-3" style={{ width: 96, height: 96, objectFit: 'contain' }} />
        <div className="mb-2 text-uppercase fw-bold" style={{ color: 'var(--theme-accent-readable)', fontSize: '0.8rem', letterSpacing: '0.16em' }}>
          {t.markdownKicker}
        </div>
        <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          {t.markdownTitle}
        </h1>
        <p className="lead text-muted max-w-lg mb-4">
          {t.markdownDescription}
        </p>
        <p className="small text-secondary mt-5">↓ {t.scrollHint}</p>
      </section>

      {/* スティッキースクロール */}
      <section className="container py-5">
        <div className="row g-4">
          
          {/* 左側: エディタ領域 */}
          <div className="col-md-6" style={{ paddingBottom: '30vh' }}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                onViewportEnter={() => setActiveTab(index)}
                viewport={{ amount: 0.6 }}
                className="feature-step"
                style={{
                  opacity: activeTab === index ? 1 : 0.25,
                  transition: 'opacity 0.4s ease'
                }}
              >
                <div className="mb-2 fw-bold" style={{ color: 'var(--theme-accent-readable)', fontSize: '0.85rem' }}>
                  {feature.question}
                </div>
                
                <div className="HASM_Markdown_Editor_Pane">
                  <div className="HASM_Markdown_Editor_EditorCol_Title">
                    <span>{t.editor}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--theme-accent-readable)' }}>note_{index + 1}.md</span>
                  </div>
                  <div className="d-flex">
                    <LineNumberGutter count={6} />
                    {activeTab === index ? (
                      <TypewriterText htmlContent={highlightMarkdown(feature.markdownText)} />
                    ) : (
                      <div 
                        className="MarkdownSyntax_Input flex-grow-1"
                        dangerouslySetInnerHTML={{ __html: highlightMarkdown(feature.markdownText) }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 右側: プレビュー領域（画面固定） */}
          <div className="col-md-6">
            <div className="sticky-container">
              <div className="w-100 HASM_Markdown_Editor_Pane">
                <div className="HASM_Markdown_Editor_ViewerCol_Title">
                  <span>{t.preview}</span>
                  <span className="badge" style={{ background: 'var(--theme-primary)', color: 'var(--theme-on-accent)' }}>{t.live}</span>
                </div>
                
                <div className="HASM_Markdown_Editor_ViewerCol_Viewer">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {features[activeTab].renderPreview()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* フッター / ダウンロード */}
      <section className="py-5 text-center border-top" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="container py-4">
          <h2 className="fw-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>{t.footerTitle}</h2>
          <p className="text-muted mb-4">{t.footerDescription}</p>
          <button 
            className="btn btn-lg px-5 py-3 fw-bold"
            style={{ 
              background: 'var(--theme-primary)', 
              color: 'var(--theme-on-accent)',
              border: '1px solid var(--theme-primary)',
              borderRadius: '0' 
            }}
          >
            {t.download}
          </button>
        </div>
      </section>
    </div>
  );
};
