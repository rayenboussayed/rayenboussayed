import { profile, seo, i18n } from '../lib/content'

/**
 * SEO shell — renders React 19 native <title>/<meta>/<link> + JSON-LD.
 * React hoists these to <head> even though we mount inside <main>.
 * Locked to English (REQUIREMENTS v7 §5): live translation is client-side only,
 * invisible to crawlers — accepted tradeoff. `hreflang` points to the same
 * canonical URL for all supported languages.
 */
export function Seo() {
  const entry = seo.default

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      alternateName: profile.displayName,
      jobTitle: profile.role,
      address: { '@type': 'PostalAddress', addressCountry: profile.location },
      email: `mailto:${profile.email}`,
      sameAs: profile.socials.map((s) => s.href),
      knowsAbout: seo.default.keywords,
      url: entry.canonical,
    },
  }

  return (
    <>
      <title>{entry.title}</title>
      <meta name="description" content={entry.description} />
      <meta name="keywords" content={entry.keywords.join(', ')} />
      <link rel="canonical" href={entry.canonical} />
      {/* hreflang for each supported language (same canonical: client-side live translation) */}
      {i18n.supported.map((l) => (
        <link key={l.code} rel="alternate" hrefLang={l.code} href={entry.canonical} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={entry.canonical} />
      {/* Open Graph */}
      <meta property="og:title" content={entry.title} />
      <meta property="og:description" content={entry.description} />
      <meta property="og:image" content={entry.ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={entry.canonical} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={entry.title} />
      <meta name="twitter:description" content={entry.description} />
      <meta name="twitter:image" content={entry.ogImage} />
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
    </>
  )
}
