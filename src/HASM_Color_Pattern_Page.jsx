import React, { useMemo, useState } from 'react';
import { COLOR_PATTERNS, getPatternById } from './hasm_color_pattern/src/index.js';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

const hasmColorPatternStyles = `
  .HASM_Color_Pattern_Page {
    min-height: 100vh;
    background: var(--theme-textbackground);
    color: var(--theme-text);
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    letter-spacing: 0.03em;
    line-height: 1.7;
  }

  .HASM_Color_Pattern_Page_Inner {
    width: min(1200px, calc(100% - 32px));
    margin: 0 auto;
    padding: 24px 0 60px;
  }

  .HASM_Color_Pattern_Header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 18px 0 32px;
    border-bottom: 1px solid var(--theme-border);
  }

  .HASM_Color_Pattern_TitleBlock {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .HASM_Color_Pattern_Badge {
    display: inline-block;
    padding: 7px 12px;
    border: 1px solid var(--theme-border);
    background: var(--theme-soft);
    color: var(--theme-accent-readable);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .HASM_Color_Pattern_Intro {
    padding: 60px 0 36px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
  }

  .HASM_Color_Pattern_Intro h1 {
    margin: 0 0 16px;
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 0.96;
    letter-spacing: -0.04em;
    font-family: Georgia, serif;
  }

  .HASM_Color_Pattern_Intro p {
    margin: 0;
    max-width: 640px;
    color: var(--theme-muted);
    font-size: 1.06rem;
  }

  .HASM_Color_Pattern_Preview {
    padding: 18px;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
  }

  .HASM_Color_Pattern_PreviewCard {
    min-height: 290px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 28px;
    border: 1px solid transparent;
    background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
    color: var(--theme-on-accent);
  }

  .HASM_Color_Pattern_SwatchGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
  }

  .HASM_Color_Pattern_Swatch {
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    overflow: hidden;
  }

  .HASM_Color_Pattern_SwatchSample {
    height: 68px;
    border-bottom: 1px solid var(--theme-border);
  }

  .HASM_Color_Pattern_SwatchMeta {
    padding: 12px 12px 10px;
  }

  .HASM_Color_Pattern_SwatchMeta strong {
    display: block;
    margin-bottom: 6px;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .HASM_Color_Pattern_SwatchMeta span {
    display: block;
    font-size: 0.72rem;
    color: var(--theme-muted);
    word-break: break-word;
  }

  .HASM_Color_Pattern_Section {
    padding-top: 28px;
  }

  .HASM_Color_Pattern_SectionHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--theme-border);
  }

  .HASM_Color_Pattern_SectionHeader h2 {
    margin: 0;
    font-size: clamp(1.6rem, 2vw, 2.2rem);
    font-family: Georgia, serif;
  }

  .HASM_Color_Pattern_List {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }

  .HASM_Color_Pattern_Item {
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    padding: 14px;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .HASM_Color_Pattern_Item:hover {
    transform: translateY(-2px);
    border-color: var(--theme-primary);
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  }

  .HASM_Color_Pattern_Item.isActive {
    border-color: var(--theme-primary);
    box-shadow: 0 0 0 1px var(--theme-primary);
  }

  .HASM_Color_Pattern_ItemTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .HASM_Color_Pattern_Item swatch {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.55);
  }

  .HASM_Color_Pattern_Item strong {
    font-size: 0.92rem;
  }

  .HASM_Color_Pattern_Item small {
    display: block;
    color: var(--theme-muted);
    margin-top: 8px;
  }

  .HASM_Color_Pattern_Code {
    margin-top: 18px;
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    overflow: hidden;
  }

  .HASM_Color_Pattern_CodeHeader {
    padding: 10px 14px;
    border-bottom: 1px solid var(--theme-border);
    background: var(--theme-soft);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--theme-accent-readable);
    font-weight: 700;
  }

  .HASM_Color_Pattern_Code pre {
    margin: 0;
    padding: 18px 20px 20px;
    color: var(--theme-text);
    font-size: 0.82rem;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: "SFMono-Regular", Consolas, monaco, monospace;
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

  @media (max-width: 900px) {
    .HASM_Color_Pattern_Intro {
      grid-template-columns: 1fr;
    }
  }
`;

const codeSnippet = (pattern) => `import { getThemeVariables } from '@hasm/color-patterns';

const vars = getThemeVariables('${pattern.id}');
Object.entries(vars).forEach(([name, value]) => {
  document.documentElement.style.setProperty(name, value);
});`;

export const HASM_Color_Pattern_Page = ({ onNavigateHome }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const [selectedPatternId, setSelectedPatternId] = useState(colorPattern ?? 'classic');

  const selectedPattern = useMemo(() => getPatternById(selectedPatternId, colorPattern), [selectedPatternId, colorPattern]);

  const previewSwatches = useMemo(() => [
    { label: 'main', value: selectedPattern.colors.mainColor },
    { label: 'text', value: selectedPattern.colors.textColor },
    { label: 'bg', value: selectedPattern.colors.textBackgroundColor },
  ], [selectedPattern]);

  return (
    <div className="HASM_Color_Pattern_Page">
      <style>{hasmColorPatternStyles}</style>
      {onNavigateHome && (
        <button type="button" className="BackHomeLink" onClick={onNavigateHome}>&larr; {t.backHome}</button>
      )}
      <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
      <ThemeSelector patterns={patterns} activePatternId={selectedPatternId} onChange={(next) => { setSelectedPatternId(next); setColorPattern(next); }} label={t.theme} />

      <div className="HASM_Color_Pattern_Page_Inner">
        <header className="HASM_Color_Pattern_Header">
          <div className="HASM_Color_Pattern_TitleBlock">
            <div className="HASM_Color_Pattern_Badge">{t.colorPatternKicker}</div>
          </div>
        </header>

        <section className="HASM_Color_Pattern_Intro">
          <div>
            <div className="HASM_Color_Pattern_Badge" style={{ marginBottom: '18px' }}>{t.colorPatternLabel}</div>
            <h1>{t.colorPatternTitle}</h1>
            <p>{t.colorPatternDescription}</p>
          </div>

          <div className="HASM_Color_Pattern_Preview">
            <div
              className="HASM_Color_Pattern_PreviewCard"
              style={{
                background: `linear-gradient(135deg, ${selectedPattern.colors.mainColor}, ${selectedPattern.colors.textBackgroundColor})`,
                borderColor: selectedPattern.colors.borderColor,
              }}
            >
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.9 }}>
                {t.colorPatternPreview}
              </div>
              <h3 style={{ margin: '10px 0 0', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
                {selectedPattern.label}
              </h3>
              <p style={{ margin: '10px 0 0', opacity: 0.9, color: selectedPattern.colors.textColor }}>
                {selectedPattern.markdownLabel}
              </p>
            </div>

            <div className="HASM_Color_Pattern_SwatchGrid">
              {previewSwatches.map((swatch) => (
                <div key={swatch.label} className="HASM_Color_Pattern_Swatch">
                  <div className="HASM_Color_Pattern_SwatchSample" style={{ background: swatch.value }} />
                  <div className="HASM_Color_Pattern_SwatchMeta">
                    <strong>{swatch.label}</strong>
                    <span>{swatch.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="HASM_Color_Pattern_Section">
          <div className="HASM_Color_Pattern_SectionHeader">
            <h2>{t.colorPatternCatalog}</h2>
            <span className="HASM_Color_Pattern_Badge">{COLOR_PATTERNS.length} themes</span>
          </div>

          <div className="HASM_Color_Pattern_List">
            {COLOR_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                className={`HASM_Color_Pattern_Item ${pattern.id === selectedPatternId ? 'isActive' : ''}`}
                onClick={() => {
                  setSelectedPatternId(pattern.id);
                  setColorPattern(pattern.id);
                }}
                style={{ textAlign: 'left' }}
              >
                <div className="HASM_Color_Pattern_ItemTop">
                  <strong>{pattern.label}</strong>
                  <swatch style={{ background: pattern.colors.mainColor }} />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, display: 'inline-block', background: pattern.colors.textBackgroundColor, border: '1px solid var(--theme-border)' }} />
                  <span style={{ width: 12, height: 12, display: 'inline-block', background: pattern.colors.textColor, border: '1px solid var(--theme-border)' }} />
                  <span style={{ width: 12, height: 12, display: 'inline-block', background: pattern.colors.mainColor, border: '1px solid var(--theme-border)' }} />
                </div>
                <small>{pattern.markdownLabel}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="HASM_Color_Pattern_Section">
          <div className="HASM_Color_Pattern_SectionHeader">
            <h2>{t.colorPatternCode}</h2>
            <span className="HASM_Color_Pattern_Badge">{t.colorPatternContrast}</span>
          </div>

          <div className="HASM_Color_Pattern_Code">
            <div className="HASM_Color_Pattern_CodeHeader">color-pattern snippet</div>
            <pre>{codeSnippet(selectedPattern)}</pre>
          </div>
        </section>

        <section className="HASM_Color_Pattern_Section">
          <div className="HASM_Color_Pattern_SectionHeader">
            <h2>{t.colorPatternTokens}</h2>
          </div>

          <div className="HASM_Color_Pattern_List">
            {[
              ['--theme-primary', selectedPattern.colors.mainColor],
              ['--theme-text', selectedPattern.colors.textColor],
              ['--theme-textbackground', selectedPattern.colors.textBackgroundColor],
              ['--theme-border', selectedPattern.colors.borderColor],
              ['--theme-soft', selectedPattern.colors.softColor],
              ['--theme-success', selectedPattern.colors.successColor],
            ].map(([name, value]) => (
              <div key={name} className="HASM_Color_Pattern_Item isActive" style={{ cursor: 'default' }}>
                <div className="HASM_Color_Pattern_ItemTop">
                  <strong>{name}</strong>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block', background: value, border: '1px solid var(--theme-border)' }} />
                </div>
                <small>{value}</small>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default HASM_Color_Pattern_Page;
