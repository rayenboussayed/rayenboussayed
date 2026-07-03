import { useEffect, useRef, useState } from 'react'

import site from '@/data/site.json'

const navLinks = site.nav

/**
 *
 */
export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const handleNavigate = (): void => {
    setMobileOpen(false)
  }

  const handleClose = (): void => {
    setMobileOpen(false)
    hamburgerRef.current?.focus()
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 top-4 z-50 flex justify-center"
        style={{
          animation: 'navSlideIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        <div className="flex h-14 w-fit items-center justify-between gap-4 rounded-full border border-[var(--border)] bg-[var(--header-bg)] px-3 py-2">
          <a className="group flex items-center gap-2" href="/">
            <div className="orb-docked-glow flex size-7 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-signal-indigo)] to-[var(--color-aqua-pulse)]">
              <span className="font-mono text-[10px] font-bold text-white">
                RB
              </span>
            </div>
          </a>

          <NavLinks links={navLinks} />

          <HamburgerButton
            onClick={() => setMobileOpen(!mobileOpen)}
            open={mobileOpen}
            ref={hamburgerRef}
          />
        </div>
      </nav>

      <MobileMenu
        links={navLinks}
        onClose={handleClose}
        onNavigate={handleNavigate}
        open={mobileOpen}
      />
    </>
  )
}

const HamburgerButton = ({
  onClick,
  open,
  ref,
}: Readonly<{
  onClick: () => void
  open: boolean
  ref: React.RefObject<HTMLButtonElement | null>
}>) => {
  return (
    <button
      aria-expanded={open}
      aria-label="Toggle menu"
      className="flex flex-col gap-1.5 p-2 md:hidden"
      onClick={onClick}
      ref={ref}
    >
      <span
        className={`block h-0.5 w-5 bg-[var(--fg)] transition-all duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`}
      />
      <span
        className={`block h-0.5 w-5 bg-[var(--fg)] transition-all duration-300 ${open ? 'opacity-0' : ''}`}
      />
      <span
        className={`block h-0.5 w-5 bg-[var(--fg)] transition-all duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`}
      />
    </button>
  )
}

/**
 *
 * @param root0
 * @param root0.links
 * @param root0.onClose
 * @param root0.onNavigate
 * @param root0.open
 */
function MobileMenu({
  links,
  onClose,
  onNavigate,
  open,
}: Readonly<{
  links: ReadonlyArray<{ href: string; label: string }>
  onClose: () => void
  onNavigate: () => void
  open: boolean
}>) {
  return (
    <div
      aria-label="Navigation menu"
      aria-modal={open ? 'true' : undefined}
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[var(--bg)]/95 backdrop-blur-xl transition-all duration-300 md:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role={open ? 'dialog' : undefined}
    >
      <MobileMenuLinks links={links} onNavigate={onNavigate} />
    </div>
  )
}

/**
 *
 * @param root0
 * @param root0.links
 * @param root0.onNavigate
 */
function MobileMenuLinks({
  links,
  onNavigate,
}: Readonly<{
  links: ReadonlyArray<{ href: string; label: string }>
  onNavigate: () => void
}>) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (firstLinkRef.current) {
      firstLinkRef.current.focus()
    }
  }, [])

  return (
    <>
      {links.map((link, i) => (
        <a
          className="font-heading text-2xl font-semibold text-[var(--fg)] transition-colors hover:text-white"
          href={link.href}
          key={link.href}
          onClick={onNavigate}
          ref={i === 0 ? firstLinkRef : undefined}
        >
          {link.label}
        </a>
      ))}
      <a
        className="mt-4 rounded-full bg-[var(--color-molten-amber)] px-6 py-3 text-lg font-semibold text-[#1A1A1A]"
        href="#contact"
        onClick={onNavigate}
      >
        Book a call
      </a>
    </>
  )
}

/**
 *
 * @param root0
 * @param root0.links
 */
function NavLinks({
  links,
}: Readonly<{
  links: ReadonlyArray<{ href: string; label: string }>
}>) {
  return (
    <div className="items-center gap-0.5 max-md:hidden md:flex lg:gap-1">
      {links.map((link) => (
        <a
          className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:bg-white/5 hover:text-[var(--fg)]"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </a>
      ))}
      <a
        className="ml-2 rounded-full bg-[var(--color-molten-amber)] px-3 py-1.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[var(--color-molten-amber)]/90 lg:px-4"
        href="#contact"
      >
        Book a call
      </a>
    </div>
  )
}
