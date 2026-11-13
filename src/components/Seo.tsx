import { useContent } from '../hooks/useContent'

/**
 * SEO shell — renders React 19 native <title>/<meta>/<link> + JSON-LD.
 * React hoists these to <head> even though we mount inside <main>.
 * Content follows the active language (machine-translated at runtime);
 * the canonical URL and lang/dir stay English for crawlers.
 */
export function Seo() {
  const { profile, seo } = useContent()
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
      {/* JSON-LD — role/location may be machine-translated; escape "<" so a
          hostile endpoint cannot break out of the <script> block. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
