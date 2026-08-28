import React from 'react';
import { useLanguage } from './i18n.js';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="HASM_Footer">
      <p className="HASM_Footer_Tagline">{t.footerTagline}</p>
      <small>{t.copyright}</small>
    </footer>
  );
};

export default Footer;