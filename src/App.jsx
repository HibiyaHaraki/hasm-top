import React, { useState } from 'react';
import { HASM_Page } from './HASM_Page';
import { HASM_Markdown_Page } from './HASM_Markdown_Page';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div>
      {page === 'home' ? (
        <HASM_Page onNavigateToMarkdown={() => setPage('markdown')} />
      ) : (
        <HASM_Markdown_Page onNavigateHome={() => setPage('home')} />
      )}
    </div>
  );
}

export default App;