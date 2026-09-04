import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { Theme } from '@astryxdesign/core/theme'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import { softPopTheme } from './theme/soft-pop'
import './theme/soft-pop.css'
import './index.css'
import App from './App.tsx'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { LiveTranslationProvider } from './context/LiveTranslationContext'

function I18nBridge({ children }: { children: React.ReactNode }) {
  const { lang, dir } = useLanguage()
  return (
    <InternationalizationProvider locale={lang} dir={dir}>
      {children}
    </InternationalizationProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <LiveTranslationProvider>
        <I18nBridge>
        <MotionConfig reducedMotion="user">
          <Theme theme={softPopTheme}>
            <App />
          </Theme>
        </MotionConfig>
        </I18nBridge>
      </LiveTranslationProvider>
    </LanguageProvider>
  </StrictMode>,
)
