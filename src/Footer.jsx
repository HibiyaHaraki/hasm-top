import React from 'react';
import { useLanguage } from './i18n.js';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="HASM_Footer">
      <small>{t.copyright}</small>
    </footer>
  );
};

export default Footer;