import React from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { HASM_Page } from './HASM_Page';
import { HASM_App_Page } from './HASM_App_Page';
import { HASM_Markdown_Page } from './HASM_Markdown_Page';
import { HASM_Color_Pattern_Page } from './HASM_Color_Pattern_Page';
import { HASM_Logo_Explanation_Page } from './HASM_Logo_Explanation_Page';
import { HASM_Creator_Page } from './HASM_Creator_Page';
import { HASM_Blog_Page } from './HASM_Blog_Page';
import './shared-controls.css';

function HomeRoute() {
  const navigate = useNavigate();
  return <HASM_Page
    onNavigateToHasmApp={() => navigate('/editor')}
    onNavigateToMarkdown={() => navigate('/markdown')}
    onNavigateToColorPattern={() => navigate('/color-pattern')}
    onNavigateToLogo={() => navigate('/logo')}
    onNavigateToCreator={() => navigate('/creator')}
  />;
}

function HomeLinkRoute({ Page }) {
  const navigate = useNavigate();
  return <Page onNavigateHome={() => navigate('/')} />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/editor" element={<HomeLinkRoute Page={HASM_App_Page} />} />
        <Route path="/markdown" element={<HomeLinkRoute Page={HASM_Markdown_Page} />} />
        <Route path="/color-pattern" element={<HomeLinkRoute Page={HASM_Color_Pattern_Page} />} />
        <Route path="/logo" element={<HomeLinkRoute Page={HASM_Logo_Explanation_Page} />} />
        <Route path="/creator" element={<HomeLinkRoute Page={HASM_Creator_Page} />} />
        <Route path="/blog" element={<HomeLinkRoute Page={HASM_Blog_Page} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;