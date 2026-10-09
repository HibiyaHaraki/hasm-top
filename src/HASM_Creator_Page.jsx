import React from 'react';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useLanguage } from './i18n.js';
import SiteHeader from './SiteHeader.jsx';
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
  .HASM_Creator_Page_Content { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 36px; align-items: center; padding: 72px 0; }
  .HASM_Creator_Page_Avatar { width: 160px; height: 160px; border-radius: 50%; border: 2px solid var(--theme-border); object-fit: cover; }
  .HASM_Creator_Page_Kicker { color: var(--theme-accent-readable); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; }
  .HASM_Creator_Page_Title { margin: 8px 0 14px; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1.1; }
  .HASM_Creator_Page_Lead { max-width: 680px; margin: 0; color: var(--theme-muted); font-size: 1.08rem; }
  .HASM_Creator_Page_Profile { margin: 18px 0 0; max-width: 680px; color: var(--theme-muted); }
  .HASM_Creator_Page_GitHub { display: inline-flex; align-items: center; margin-top: 24px; padding: 8px 14px; color: var(--theme-on-accent); background: var(--theme-primary); border: 1px solid var(--theme-primary); text-decoration: none; font-weight: 700; }
  .HASM_Creator_Page_GitHub:hover, .HASM_Creator_Page_GitHub:focus-visible { color: var(--theme-on-accent); filter: brightness(0.92); }
  .HASM_Creator_Page_Links { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-top: 24px; }
  .HASM_Creator_Page_Links .HASM_Creator_Page_GitHub { margin-top: 0; }
  .HASM_Creator_Page_Links a:not(.HASM_Creator_Page_GitHub) { color: var(--theme-accent-readable); font-weight: 700; text-underline-offset: 3px; }
  .HASM_Creator_Page_Blog { padding: 36px 0 0; border-top: 1px solid var(--theme-border); }
  .HASM_Creator_Page_BlogHeader { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 18px; }
  .HASM_Creator_Page_BlogTitle { margin: 0; font-size: 1.45rem; }
  .HASM_Creator_Page_BlogAll { color: var(--theme-accent-readable); font-weight: 700; text-underline-offset: 3px; }
  .HASM_Creator_Page_BlogGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .HASM_Creator_Page_Article { display: flex; flex-direction: column; min-height: 160px; padding: 18px; border: 1px solid var(--theme-border); background: var(--theme-surface); }
  .HASM_Creator_Page_ArticleSource { margin: 0 0 8px; color: var(--theme-accent-readable); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; }
  .HASM_Creator_Page_Article h3 { margin: 0 0 10px; font-size: 1rem; line-height: 1.45; }
  .HASM_Creator_Page_Article p { margin: 0; color: var(--theme-muted); font-size: 0.88rem; }
  .HASM_Creator_Page_Article a { align-self: flex-start; margin-top: auto; padding-top: 14px; color: var(--theme-accent-readable); font-weight: 700; text-underline-offset: 3px; }
  .HASM_Creator_Page_Logo { width: 38px; height: 38px; object-fit: contain; }
  @media (max-width: 760px) { .HASM_Creator_Page_Content { grid-template-columns: 1fr; gap: 24px; padding: 48px 0; } .HASM_Creator_Page_Avatar { width: 128px; height: 128px; } .HASM_Creator_Page_BlogHeader { align-items: flex-start; flex-direction: column; } .HASM_Creator_Page_BlogGrid { grid-template-columns: 1fr; } }
`;

function BlogPreview({ articles, source, label }) {
  return articles.map(([title, summary, url]) => (
    <article className="HASM_Creator_Page_Article" key={url}>
      <div className="HASM_Creator_Page_ArticleSource">{source}</div>
      <h3>{title}</h3>
      <p>{summary}</p>
      <a href={url} target="_blank" rel="noreferrer">{label}</a>
    </article>
  ));
}

export const HASM_Creator_Page = ({ onNavigateHome }) => {
  const { t } = useLanguage();

  return (
    <div className="HASM_Creator_Page">
      <style>{creatorPageStyles}</style>
      <SiteHeader onNavigateHome={onNavigateHome} />
      <div className="HASM_Creator_Page_Inner">
        <main className="HASM_Creator_Page_Content">
          <img className="HASM_Creator_Page_Avatar" src="https://github.com/HibiyaHaraki.png?size=320" alt={t.githubCreatorAvatar} width="160" height="160" />
          <section>
            <div className="HASM_Creator_Page_Kicker">{t.creatorKicker}</div>
            <h1 className="HASM_Creator_Page_Title">HibiyaHaraki</h1>
            <p className="HASM_Creator_Page_Lead">{t.creatorLead}</p>
            <p className="HASM_Creator_Page_Profile">{t.creatorProfile}</p>
            <div className="HASM_Creator_Page_Links">
              <a className="HASM_Creator_Page_GitHub" href="https://github.com/HibiyaHaraki" target="_blank" rel="noreferrer">{t.creatorGithubButton}</a>
              <a href="https://www.linkedin.com/in/hibiyaharaki/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://qiita.com/Hibs" target="_blank" rel="noreferrer">Qiita</a>
              <a href="https://note.com/_hibs_" target="_blank" rel="noreferrer">note</a>
              <a href="#/blog">{t.creatorBlogButton}</a>
            </div>
          </section>
        </main>
        <section className="HASM_Creator_Page_Blog" aria-labelledby="creator-blog-title">
          <div className="HASM_Creator_Page_BlogHeader">
            <h2 className="HASM_Creator_Page_BlogTitle" id="creator-blog-title">{t.creatorBlogTitle}</h2>
            <a className="HASM_Creator_Page_BlogAll" href="#/blog">{t.creatorBlogAll}</a>
          </div>
          <div className="HASM_Creator_Page_BlogGrid">
            <BlogPreview articles={t.blogNoteArticles.slice(0, 2)} source="note" label={t.blogReadArticle} />
            <BlogPreview articles={t.blogQiitaArticles.slice(0, 2)} source="Qiita" label={t.blogReadArticle} />
          </div>
        </section>
        <img className="HASM_Creator_Page_Logo" src={hasmLogo} alt="HASM" />
      </div>
      <Footer />
    </div>
  );
};

export default HASM_Creator_Page;