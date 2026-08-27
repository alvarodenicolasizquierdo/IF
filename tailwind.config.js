/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ---- Ground: Premium Purple, the brand book's colour for large solid backgrounds ---- */
        canvas: '#170D26', // Premium Purple, darkened — deepest ground
        surface: '#2C1847', // Premium Purple (exact brand hex) — panel / shell surface
        card: '#3A2359', // Premium Purple, raised — card background
        hairline: '#4A3568', // Premium Purple, border weight

        /* ---- Text: the brand's own neutrals ---- */
        ink: '#FFFFFF', // Visionary White (exact brand hex)
        'ink-warm': '#E0DACE', // Trustful Beige (exact brand hex)
        'ink-muted': '#C7BDCB', // Compassionate Lavender (exact brand hex)
        'ink-faint': '#8B7CA0', // derived from Premium Purple

        /* ---- The Trust Accent Spectrum, re-rooted in the brand ---- */
        trust: {
          // Active processing. Purple was already this role's hue; taking it from
          // the brand's own family puts it on-brand without changing its meaning.
          active: '#7C5DC7',
          'active-soft': '#9F7AEA',
          // Governance passed and HITL checkpoint are functional additions —
          // the brand book defines no status colours, and a governance console
          // cannot work without them.
          passed: '#10B981',
          'passed-soft': '#34D399',
          hitl: '#D97706',
          'hitl-soft': '#F59E0B',
          // Creative Red (exact brand hex) carries both the mark and the
          // policy-violation semantic — in a governance console red already
          // means stop, so the two readings reinforce rather than fight.
          violation: '#DD2C00',
          'violation-soft': '#FF5A2C',
        },
      },
      fontFamily: {
        // Manrope and Instrument Serif stand in for Avenga's licensed Haffer and
        // Reckless. Swap both here once the web licences land.
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'ui-serif', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        /* Trust Accent Spectrum glows — exposed as utilities so components stay class-only */
        'glow-active': '0 0 18px rgba(124, 93, 199, 0.45)',
        'glow-passed': '0 0 18px rgba(16, 185, 129, 0.30)',
        'glow-hitl': '0 0 22px rgba(217, 119, 6, 0.30)',
        'glow-violation': '0 0 22px rgba(221, 44, 0, 0.34)',
        panel: '0 12px 40px -12px rgba(0, 0, 0, 0.75)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.9' },
          '75%, 100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.965)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'sweep-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(2200%)' },
        },
        'caret-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-in-up': 'slide-in-up 260ms ease-out both',
        'fade-in': 'fade-in 200ms ease-out both',
        'scale-in': 'scale-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'sweep-scan': 'sweep-scan 2.6s linear infinite',
        'caret-blink': 'caret-blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
