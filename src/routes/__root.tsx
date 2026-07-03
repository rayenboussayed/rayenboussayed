import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

import LenisProvider from '../components/lenis-provider'
import Header from '../components/nav'
import Scroll3DScene from '../components/scroll-3d-scene'
import ScrollProgress from '../components/scroll-progress'
import Footer from '../components/sections/footer'
import { ThemeProvider } from '../contexts/theme-provider'
import site from '../data/site.json'
import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var m=s==='light'||s==='dark'?s:'dark';var p=matchMedia('(prefers-color-scheme:dark)').matches;if(s==='auto')m=p?'dark':'light';var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(m);r.style.colorScheme=m;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: 'https://api.fontshare.com', rel: 'preconnect' },
      {
        href: 'https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap',
        rel: 'stylesheet',
      },
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { crossOrigin: '', href: 'https://fonts.gstatic.com', rel: 'preconnect' },
      { href: '/apple-touch-icon.png', rel: 'apple-touch-icon' },
      { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
      { href: '/manifest.json', rel: 'manifest' },
    ],
    meta: [
      { charSet: 'utf8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      {
        content: site.seo.description,
        name: 'description',
      },
      { title: site.seo.title },
      { content: '#0A0A0A', name: 'theme-color' },
    ],
  }),
  shellComponent: RootDocument,
})

/**
 *
 * @param root0
 * @param root0.children
 */
function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <HeadContent />
      </head>
      <body className="overflow-x-clip bg-[var(--bg)] text-[var(--fg)] antialiased">
        <ScrollProgress />
        <ThemeProvider>
          <LenisProvider>
            <Scroll3DScene />
            <div aria-hidden="true" className="noise-overlay" />
            <a
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--color-signal-indigo)] focus:px-4 focus:text-white"
              href="#main-content"
            >
              Skip to content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
