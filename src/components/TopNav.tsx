import { Button } from '@astryxdesign/core/Button'
import { Badge } from '@astryxdesign/core/Badge'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
import { TopNav as AstryxTopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav'
import { motion } from 'motion/react'
import { useContentWithLive as useContent } from '../context/LiveTranslationContext'
import { useLanguage } from '../context/LanguageContext'
import { useLiveTranslationContext } from '../context/LiveTranslationContext'

/**
 * TopNav — automatic on-device translation (REQUIREMENTS v7 §2).
 * - One `DropdownMenu` lists languages by `nativeLabel`.
 * - Picking non-English auto-starts (`setLang` instant + `startLive` worker).
 * - English/`Original` resets and terminates the worker.
 * - Worker never loads on boot; lazy inside `startLive()` only.
 */
export function TopNav() {
  const { profile, ui, isTranslating } = useContent()
  const { lang, supported } = useLanguage()
  const live = useLiveTranslationContext()
  const activeCode = live.targetCode ?? lang
  const active = supported.find((s) => s.code === activeCode)?.nativeLabel ?? activeCode
  const busy = isTranslating || live.status === 'loading-model' || live.status === 'translating'

  const handleSelect = (code: string) => {
    if (code === 'en') {
      live.resetLive()
      return
    }
    if (code === live.targetCode && (live.isLive || busy)) return
    live.startLive(code).catch((e) => console.error(e))
  }

  return (
    <>
      <AstryxTopNav
        label="Primary navigation"
        heading={<TopNavHeading heading={profile.displayName} headingHref="#hero" />}
        startContent={
          <>
            {ui.navItems.map((l) => (
              <TopNavItem key={l.href} label={l.label} href={l.href} />
            ))}
          </>
        }
        endContent={
          <>
            <DropdownMenu
              button={{ label: active, variant: 'ghost', size: 'sm' } as never}
              items={supported.map((s) => ({
                label: s.nativeLabel,
                endContent: s.code === activeCode ? ('✓' as unknown as never) : undefined,
                onClick: () => handleSelect(s.code),
                id: s.code,
              }))}
            />
            {(live.isLive || busy || lang !== 'en') && (
              <>
                {live.isLive && <Badge label={ui.live.machineTranslated} variant="warning" />}
                <Button label={ui.live.original} variant="ghost" size="sm" tooltip={ui.live.originalTooltip} onClick={() => live.resetLive()} />
              </>
            )}
            <Button label={profile.ctaLabels.resumeShort} variant="primary" size="sm" href={profile.resumeUrl} target="_blank" rel="noreferrer" />
            <Button label={profile.ctaLabels.certsShort} variant="secondary" size="sm" href={profile.certificationsUrl} target="_blank" rel="noreferrer" />
          </>
        }
      />
      <motion.div layoutId="nav-underline" aria-hidden="true" style={{ height: 2, background: 'var(--color-accent)', opacity: 0, pointerEvents: 'none' }} />
      {live.status === 'loading-model' && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', padding: '4px 8px' }}>
          {ui.live.downloadingDetail.replace('{progress}', String(live.progress))}
        </motion.div>
      )}
      {live.status === 'translating' && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', padding: '4px 8px' }} role="status">
          {ui.live.translating}
        </div>
      )}
      {!live.canSuggestLive && !live.isLive && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-secondary)', padding: '2px 8px' }}>
          {ui.live.dataSaverBanner}
        </div>
      )}
      {live.error && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-error, #c00)', padding: '4px 8px' }} role="alert">
          {ui.live.errorPrefix} {live.error}
        </div>
      )}
    </>
  )
}
