import React from 'react';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from './i18n.js';
import Footer from './Footer.jsx';

const styles = `
  .HASM_Blog { min-height: 100vh; display: flex; flex-direction: column; color: var(--theme-text); background: var(--theme-textbackground); font-family: "Yu Mincho", "游明朝", Georgia, serif; letter-spacing: 0.03em; line-height: 1.7; }
  .HASM_Blog_Inner { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 60px; flex: 1; }
  .HASM_Blog_Header { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 0 28px; border-bottom: 1px solid var(--theme-border); }
  .HASM_Blog_Back { color: var(--theme-text); background: none; border: 0; padding: 0; font: inherit; cursor: pointer; }
  .HASM_Blog_Hero { max-width: 760px; padding: 64px 0 36px; }
  .HASM_Blog_Kicker { color: var(--theme-accent-readable); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; }
  .HASM_Blog_Hero h1 { margin: 8px 0 14px; font-size: clamp(2.2rem, 4vw, 3.8rem); line-height: 1.1; }
  .HASM_Blog_Hero p, .HASM_Blog_Article p { margin: 0; color: var(--theme-muted); }
  .HASM_Blog_Section { padding: 34px 0; border-top: 1px solid var(--theme-border); }
  .HASM_Blog_Section h2 { margin: 0 0 20px; font-size: 1.45rem; }
  .HASM_Blog_Grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .HASM_Blog_Article { display: flex; flex-direction: column; min-height: 190px; padding: 20px; border: 1px solid var(--theme-border); background: var(--theme-surface); }
  .HASM_Blog_Article h3 { margin: 0 0 10px; font-size: 1.05rem; line-height: 1.45; }
  .HASM_Blog_Article p { font-size: 0.9rem; }
  .HASM_Blog_Article a { align-self: flex-start; margin-top: auto; padding-top: 16px; color: var(--theme-accent-readable); font-weight: 700; text-underline-offset: 3px; }
  @media (max-width: 760px) { .HASM_Blog_Header { flex-direction: column; align-items: flex-start; } .HASM_Blog_Hero { padding: 48px 0 28px; } .HASM_Blog_Grid { grid-template-columns: 1fr; } }
`;

function ArticleGrid({ articles, label }) {
  return <div className="HASM_Blog_Grid">{articles.map(([title, summary, url]) => <article className="HASM_Blog_Article" key={url}><h3>{title}</h3><p>{summary}</p><a href={url} target="_blank" rel="noreferrer">{label}</a></article>)}</div>;
}

export const HASM_Blog_Page = ({ onNavigateHome }) => {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  return <div className="HASM_Blog"><style>{styles}</style><div className="HASM_Blog_Inner"><header className="HASM_Blog_Header"><button type="button" className="HASM_Blog_Back" onClick={onNavigateHome}>{t.backHome}</button><div className="d-flex gap-2 align-items-center"><LanguageSelector language={language} onChange={setLanguage} label={t.language} /><ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} /></div></header><main><section className="HASM_Blog_Hero"><div className="HASM_Blog_Kicker">{t.blogKicker}</div><h1>{t.blogTitle}</h1><p>{t.blogLead}</p></section><section className="HASM_Blog_Section"><h2>{t.blogNoteLabel}</h2><ArticleGrid articles={t.blogNoteArticles} label={t.blogReadArticle} /></section><section className="HASM_Blog_Section"><h2>{t.blogQiitaLabel}</h2><ArticleGrid articles={t.blogQiitaArticles} label={t.blogReadArticle} /></section></main></div><Footer /></div>;
};

export default HASM_Blog_Page;