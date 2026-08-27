/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ---- Avenga Enterprise Dark canvas ---- */
        canvas: '#0B0F19', // Dark Slate primary background
        surface: '#111827', // Panel / shell surface
        card: '#1F2937', // Muted Charcoal card background
        hairline: '#374151', // Thin card borders
        ink: '#F9FAFB', // Crisp White primary text
        'ink-muted': '#9CA3AF', // Soft Gray muted text
        'ink-faint': '#6B7280', // Cool gray sub-elements

        /* ---- The Trust Accent Spectrum ---- */
        trust: {
          active: '#4F46E5', // Electric Indigo  — active processing / focus
          'active-soft': '#6366F1',
          passed: '#10B981', // Emerald Green    — governance passed / immutable
          'passed-soft': '#34D399',
          hitl: '#D97706', // Amber Gold       — human-in-the-loop checkpoint
          'hitl-soft': '#F59E0B',
          violation: '#DC2626', // Crimson Red      — policy violation / audit vulnerability
          'violation-soft': '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        /* Trust Accent Spectrum glows — exposed as utilities so components stay class-only */
        'glow-active': '0 0 18px rgba(79, 70, 229, 0.40)',
        'glow-passed': '0 0 18px rgba(16, 185, 129, 0.30)',
        'glow-hitl': '0 0 22px rgba(217, 119, 6, 0.30)',
        'glow-violation': '0 0 22px rgba(220, 38, 38, 0.32)',
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
