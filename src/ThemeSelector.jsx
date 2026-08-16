import React from 'react';

// Fixed corner control letting visitors preview HASM's selectable color patterns.
function ThemeSelector({ patterns, activePatternId, onChange, label = 'Theme' }) {
  return (
    <div className="ThemeSelector">
      <label htmlFor="hasm-theme-select" className="ThemeSelector_Label">{label}</label>
      <select
        id="hasm-theme-select"
        className="ThemeSelector_Select"
        value={activePatternId}
        onChange={(event) => onChange(event.target.value)}
      >
        {patterns.map((pattern) => (
          <option key={pattern.id} value={pattern.id}>{pattern.label}</option>
        ))}
      </select>
    </div>
  );
}

export default ThemeSelector;
