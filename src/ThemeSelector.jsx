import React from 'react';
import Form from 'react-bootstrap/Form';

// Fixed corner control letting visitors preview HASM's selectable color patterns.
function ThemeSelector({ patterns, activePatternId, onChange, label = 'Theme' }) {
  return (
    <div className="ThemeSelector">
      <Form.Label htmlFor="hasm-theme-select" className="ThemeSelector_Label">{label}</Form.Label>
      <Form.Select
        id="hasm-theme-select"
        className="ThemeSelector_Select"
        value={activePatternId}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {patterns.map((pattern) => (
          <option key={pattern.id} value={pattern.id}>{pattern.label}</option>
        ))}
      </Form.Select>
    </div>
  );
}

export default ThemeSelector;
