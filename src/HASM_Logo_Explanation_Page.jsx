import React, { useState } from 'react';
import hasmLogoTransparent from './assets/logo/hasm_logo_transparent.png';
import hasmLogoDark from './assets/logo/hasm_logo_dark_bg.png';
import hasmLogoLight from './assets/logo/hasm_logo_light_bg.png';
import hasmFavicon from './assets/logo/hasm_favicon.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

const logoExplanationStyles = `
  .HASM_Logo_Explanation_Page { min-height: 100vh; color: var(--theme-text); background: var(--theme-textbackground); font-family: "Yu Mincho", "游明朝", Georgia, serif; letter-spacing: 0.03em; line-height: 1.7; }
  .HASM_Logo_Explanation_Inner { width: min(1160px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 60px; }
  .HASM_Logo_Explanation_Header { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 0 32px; border-bottom: 1px solid var(--theme-border); }
  .HASM_Logo_Explanation_Header a { color: var(--theme-text); text-decoration: none; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .HASM_Logo_Explanation_Hero { display: grid; grid-template-columns: 1fr 0.92fr; gap: 56px; align-items: center; padding: 64px 0 76px; }
  .HASM_Logo_Explanation_Kicker, .HASM_Logo_Explanation_Label { color: var(--theme-accent-readable); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
  .HASM_Logo_Explanation_Hero h1 { max-width: 680px; margin: 12px 0 18px; font-family: Georgia, serif; font-size: clamp(2.7rem, 6vw, 5.8rem); line-height: 0.96; }
  .HASM_Logo_Explanation_Lead { max-width: 600px; margin: 0; color: var(--theme-muted); font-size: 1.08rem; }
  .HASM_Logo_Explanation_HeroMark { display: grid; place-items: center; min-height: 390px; padding: 28px; border: 1px solid var(--theme-border); background: var(--theme-surface); box-shadow: 0 18px 42px rgba(20, 18, 15, 0.12); }
  .HASM_Logo_Explanation_HeroMark img { width: min(100%, 350px); aspect-ratio: 1; object-fit: contain; }
  .HASM_Logo_Explanation_Section { padding: 38px 0; border-top: 1px solid var(--theme-border); }
  .HASM_Logo_Explanation_Section h2 { margin: 8px 0 12px; font-family: Georgia, serif; font-size: clamp(1.8rem, 3vw, 3rem); line-height: 1.05; }
  .HASM_Logo_Explanation_SectionIntro { max-width: 700px; color: var(--theme-muted); }
  .HASM_Logo_Explanation_Variants { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 28px; }
  .HASM_Logo_Explanation_Variant { padding: 0; color: var(--theme-text); text-align: left; background: var(--theme-surface); border: 1px solid var(--theme-border); cursor: pointer; }
  .HASM_Logo_Explanation_Variant[aria-pressed="true"] { border-color: var(--theme-primary); box-shadow: 0 0 0 2px var(--theme-primary); }
  .HASM_Logo_Explanation_VariantImage { display: grid; place-items: center; aspect-ratio: 1; padding: 12px; background: var(--theme-soft); }
  .HASM_Logo_Explanation_VariantImage img { width: 100%; height: 100%; object-fit: contain; }
  .HASM_Logo_Explanation_VariantText { display: block; padding: 10px 12px 12px; font-size: 0.8rem; font-weight: 700; }
  .HASM_Logo_Explanation_Model { display: grid; grid-template-columns: 0.82fr 1.18fr; gap: 28px; align-items: stretch; margin-top: 28px; }
  .HASM_Logo_Explanation_Fact, .HASM_Logo_Explanation_Formula { padding: 24px; border: 1px solid var(--theme-border); background: var(--theme-surface); }
  .HASM_Logo_Explanation_Fact strong { display: block; margin: 8px 0; font-family: Georgia, serif; font-size: 2.6rem; color: var(--theme-primary); }
  .HASM_Logo_Explanation_Fact p { margin: 0; color: var(--theme-muted); }
  .HASM_Logo_Explanation_Formula { overflow-x: auto; font-family: Georgia, serif; font-size: 1.05rem; line-height: 2; }
  .HASM_Logo_Explanation_Formula p { margin: 0; white-space: nowrap; }
  .HASM_Logo_Explanation_Notes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 28px; }
  .HASM_Logo_Explanation_Note { padding-top: 14px; border-top: 2px solid var(--theme-primary); }
  .HASM_Logo_Explanation_Note h3 { margin: 0 0 8px; font-size: 1rem; }
  .HASM_Logo_Explanation_Note p { margin: 0; color: var(--theme-muted); font-size: 0.92rem; }
  @media (max-width: 760px) { .HASM_Logo_Explanation_Hero, .HASM_Logo_Explanation_Model { grid-template-columns: 1fr; gap: 28px; } .HASM_Logo_Explanation_Hero { padding: 44px 0 52px; } .HASM_Logo_Explanation_HeroMark { min-height: 280px; } .HASM_Logo_Explanation_Variants { grid-template-columns: repeat(2, minmax(0, 1fr)); } .HASM_Logo_Explanation_Notes { grid-template-columns: 1fr; gap: 24px; } }
`;

export const HASM_Logo_Explanation_Page = ({ onNavigateHome }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeVariant, setActiveVariant] = useState(0);
  const variants = [
    { image: hasmLogoTransparent, name: t.logoTransparent },
    { image: hasmLogoDark, name: t.logoDark },
    { image: hasmLogoLight, name: t.logoLight },
    { image: hasmFavicon, name: t.logoFavicon }
  ];

  return (
    <div className="HASM_Logo_Explanation_Page">
      <style>{logoExplanationStyles}</style>
      <div className="HASM_Logo_Explanation_Inner">
        <header className="HASM_Logo_Explanation_Header">
          <a href="#home" onClick={(event) => { event.preventDefault(); onNavigateHome(); }}>{t.backHome}</a>
          <div className="d-flex gap-2 align-items-center">
            <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
            <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />
          </div>
        </header>
        <main>
          <section className="HASM_Logo_Explanation_Hero">
            <div><div className="HASM_Logo_Explanation_Kicker">{t.logoKicker}</div><h1>{t.logoTitle}</h1><p className="HASM_Logo_Explanation_Lead">{t.logoDescription}</p></div>
            <div className="HASM_Logo_Explanation_HeroMark"><img src={variants[activeVariant].image} alt={variants[activeVariant].name} /></div>
          </section>
          <section className="HASM_Logo_Explanation_Section">
            <div className="HASM_Logo_Explanation_Label">{t.logoVariantsLabel}</div><h2>{t.logoVariantsTitle}</h2><p className="HASM_Logo_Explanation_SectionIntro">{t.logoVariantsDescription}</p>
            <div className="HASM_Logo_Explanation_Variants">{variants.map((variant, index) => <button key={variant.name} type="button" className="HASM_Logo_Explanation_Variant" aria-pressed={activeVariant === index} onClick={() => setActiveVariant(index)}><span className="HASM_Logo_Explanation_VariantImage"><img src={variant.image} alt="" /></span><span className="HASM_Logo_Explanation_VariantText">{variant.name}</span></button>)}</div>
          </section>
          <section className="HASM_Logo_Explanation_Section">
            <div className="HASM_Logo_Explanation_Label">{t.logoModelLabel}</div><h2>{t.logoModelTitle}</h2><p className="HASM_Logo_Explanation_SectionIntro">{t.logoModelDescription}</p>
            <div className="HASM_Logo_Explanation_Model"><div className="HASM_Logo_Explanation_Fact"><div className="HASM_Logo_Explanation_Label">{t.logoAnchorLabel}</div><strong>2026.08.14</strong><p>{t.logoAnchorDescription}</p></div><div className="HASM_Logo_Explanation_Formula" aria-label={t.logoFormulaLabel}><p>x(t) = [cos(8t) + (8/14)cos(14t + phi)] / [1 + 8/14]</p><p>y(t) = [sin(8t) - (8/14)sin(14t + phi)] / [1 + 8/14]</p><p>phi = 2026 pi / 180, &nbsp; 0 &lt;= t &lt;= 2 pi</p></div></div>
            <div className="HASM_Logo_Explanation_Notes"><div className="HASM_Logo_Explanation_Note"><h3>{t.logoHarmonyTitle}</h3><p>{t.logoHarmonyDescription}</p></div><div className="HASM_Logo_Explanation_Note"><h3>{t.logoColorTitle}</h3><p>{t.logoColorDescription}</p></div><div className="HASM_Logo_Explanation_Note"><h3>{t.logoUsageTitle}</h3><p>{t.logoUsageDescription}</p></div></div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HASM_Logo_Explanation_Page;