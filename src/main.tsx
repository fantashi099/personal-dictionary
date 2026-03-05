import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Activate preloaded Google Fonts (CSP-safe, no inline handlers)
const fontLink = document.getElementById('google-fonts') as HTMLLinkElement | null;
if (fontLink) {
  fontLink.rel = 'stylesheet';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
