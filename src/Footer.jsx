import React from 'react';
import { useLanguage } from './i18n.js';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="HASM_Footer">
      <p className="HASM_Footer_Tagline">{t.footerTagline}</p>
      <div className="HASM_Footer_Ownership">
        <a href="https://github.com/HibiyaHaraki" target="_blank" rel="noreferrer">
          <img
            className="HASM_Footer_Avatar"
            src="https://github.com/HibiyaHaraki.png?size=96"
            alt={t.githubCreatorAvatar}
            width="48"
            height="48"
          />
        </a>
        <p>{t.ownership}{' '}<a href="https://github.com/HibiyaHaraki" target="_blank" rel="noreferrer">HibiyaHaraki</a></p>
      </div>
      <nav className="HASM_Footer_GitHubLinks" aria-label={t.githubLinksLabel}>
        <a href="https://github.com/HibiyaHaraki" target="_blank" rel="noreferrer">{t.githubCreator}</a>
        <a href="https://github.com/HibiyaHaraki/hasm-top" target="_blank" rel="noreferrer">{t.githubIntroduction}</a>
        <a href="https://github.com/HibiyaHaraki/hasm" target="_blank" rel="noreferrer">{t.githubDesktopApp}</a>
        <a href="https://github.com/HibiyaHaraki/hasm_markdown" target="_blank" rel="noreferrer">{t.githubMarkdownEditor}</a>
      </nav>
      <small>{t.copyright}</small>
    </footer>
  );
};

export default Footer;