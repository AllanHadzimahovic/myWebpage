import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LowPowerProvider } from './lowPower.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LowPowerProvider>
      <App />
    </LowPowerProvider>
  </StrictMode>,
)
