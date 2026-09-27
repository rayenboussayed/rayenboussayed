// Shared jsdom doubles for integration tests (REQUIREMENTS v13).
// Each test file imports what it needs and registers its own afterEach —
// no magic, no globals. Side effect on import: jest-dom matchers.
import '@testing-library/jest-dom/vitest'

/** window.matchMedia stub (jsdom has none; motion/Astryx/bubbles need it). */
export function installMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
    configurable: true,
    writable: true,
  })
}

/** Controllable IntersectionObserver stand-in (hero visibility, scroll replay). */
export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  static reset(): void {
    MockIntersectionObserver.instances = []
  }
  callback: IntersectionObserverCallback
  observed: Element[] = []
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }
  observe(el: Element): void {
    this.observed.push(el)
  }
  unobserve(el: Element): void {
    this.observed = this.observed.filter((e) => e !== el)
  }
  disconnect(): void {
    this.observed = []
  }
  trigger(isIntersecting: boolean): void {
    this.callback(
      this.observed.map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    )
  }
}

function installIntersectionObserver(): void {
  Object.defineProperty(window, 'IntersectionObserver', {
    value: MockIntersectionObserver,
    configurable: true,
    writable: true,
  })
}

/** No-op ResizeObserver (floating-ui layers mount without layout in jsdom). */
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function installResizeObserver(): void {
  Object.defineProperty(window, 'ResizeObserver', {
    value: MockResizeObserver,
    configurable: true,
    writable: true,
  })
}

/** document.hidden is read-only — override for tab-switch tests. */
export function setDocumentHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
}

/** Baseline doubles for every integration file (call in beforeEach). */
export function installDefaults(): void {
  installMatchMedia(false)
  installIntersectionObserver()
  installResizeObserver()
}

/** Per-test cleanup (call in afterEach, plus testing-library cleanup). */
export function resetDoubles(): void {
  MockIntersectionObserver.reset()
  window.localStorage.clear()
  document.documentElement.lang = 'en'
  document.documentElement.dir = 'ltr'
  setDocumentHidden(false)
}
