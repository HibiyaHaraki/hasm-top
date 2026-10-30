import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n.js'
import { LaunchSplash } from './LaunchSplash.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
      <LaunchSplash />
    </LanguageProvider>
  </StrictMode>,
)
