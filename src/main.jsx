import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // Import i18n configuration
import './index.css'
import AppWithAuth from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>,
)
