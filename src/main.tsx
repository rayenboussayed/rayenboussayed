import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { Theme } from '@astryxdesign/core/theme'
import { softPopTheme } from './theme/soft-pop'
import './theme/soft-pop.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Theme theme={softPopTheme}>
        <App />
      </Theme>
    </MotionConfig>
  </StrictMode>,
)
