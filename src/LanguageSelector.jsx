import React from 'react';
import { LANGUAGES } from './i18n.js';

function LanguageSelector({ language, onChange, label }) {
  return (
    <div className="LanguageSelector">
      <label htmlFor="hasm-language-select" className="LanguageSelector_Label">{label}</label>
      <select id="hasm-language-select" className="LanguageSelector_Select" value={language} onChange={(event) => onChange(event.target.value)}>
        {LANGUAGES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </div>
  );
}

export default LanguageSelector;