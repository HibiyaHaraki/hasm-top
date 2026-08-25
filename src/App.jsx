import React, { useState } from 'react';
import { HASM_Page } from './HASM_Page';
import { HASM_Markdown_Page } from './HASM_Markdown_Page';
import { HASM_Color_Pattern_Page } from './HASM_Color_Pattern_Page';
import { HASM_Logo_Explanation_Page } from './HASM_Logo_Explanation_Page';
import './shared-controls.css';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div>
      {page === 'home' ? (
        <HASM_Page
          onNavigateToMarkdown={() => setPage('markdown')}
          onNavigateToColorPattern={() => setPage('color-pattern')}
          onNavigateToLogo={() => setPage('logo')}
        />
      ) : page === 'markdown' ? (
        <HASM_Markdown_Page onNavigateHome={() => setPage('home')} />
      ) : page === 'logo' ? (
        <HASM_Logo_Explanation_Page onNavigateHome={() => setPage('home')} />
      ) : (
        <HASM_Color_Pattern_Page onNavigateHome={() => setPage('home')} />
      )}
    </div>
  );
}

export default App;