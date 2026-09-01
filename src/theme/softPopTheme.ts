import { defineTheme } from '@astryxdesign/core/theme'
import { y2kTheme } from '@astryxdesign/theme-y2k'

// Soft Pop Neobrutalist theme — extends Y2K (periwinkle pop) per PLAN.md §D
// Token overrides: thick border, hard offset shadow, bold type, blobby radius
export const softPopTheme = defineTheme({
  name: 'soft-pop',
  extends: y2kTheme,
  color: {
    accent: ['#7B61FF', '#9B85FF'],
    neutralStyle: 'cool',
  },
  typography: {
    scale: { base: 16, ratio: 1.25 },
    heading: { family: 'Poppins', fallbacks: 'system-ui, sans-serif' },
    body: { family: 'Outfit', fallbacks: 'system-ui, sans-serif' },
  },
  radius: { base: 16, multiplier: 1.4 },
  tokens: {
    '--border-width': '3px',
    '--shadow-med': '6px 6px 0px rgba(0,0,0,0.9)',
    '--color-background-body': ['#FFF7F0', '#1A1A2E'],
    '--color-border': ['#0A0A0A', '#2E2E4E'],
    '--color-border-emphasized': ['#000000', '#FFFFFF'],
    '--radius-container': '20px',
    '--radius-element': '12px',
  },
  components: {
    card: {
      base: {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderRadius: '20px',
        padding: '24px',
      },
    },
    button: {
      base: {
        borderRadius: '9999px',
        borderWidth: '2px',
        fontWeight: '700',
      },
      'variant:primary': {
        boxShadow: 'var(--shadow-med)',
      },
      'variant:secondary': {
        borderWidth: '3px',
        borderStyle: 'solid',
      },
    },
  },
})
