import React from 'react';
import Form from 'react-bootstrap/Form';
import { LANGUAGES } from './i18n.js';

function LanguageSelector({ language, onChange, label }) {
  return (
    <div className="LanguageSelector">
      <Form.Label htmlFor="hasm-language-select" className="LanguageSelector_Label">{label}</Form.Label>
      <Form.Select
        id="hasm-language-select"
        className="LanguageSelector_Select"
        value={language}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {LANGUAGES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </Form.Select>
    </div>
  );
}

export default LanguageSelector;