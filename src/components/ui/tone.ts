/**
 * The Trust Accent Spectrum, expressed once as Tailwind utility sets.
 * Components pick a tone; they never hand-pick a hex value.
 */
export type Tone = 'active' | 'passed' | 'hitl' | 'violation' | 'neutral';

interface ToneClasses {
  text: string;
  border: string;
  bg: string;
  ring: string;
  glow: string;
  dot: string;
  solid: string;
  /** Static hover surface — never build Tailwind class names at runtime. */
  hoverBg: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  active: {
    text: 'text-trust-active-soft',
    border: 'border-trust-active/50',
    bg: 'bg-trust-active/10',
    ring: 'ring-trust-active/40',
    glow: 'shadow-glow-active',
    dot: 'bg-trust-active',
    solid: 'bg-trust-active text-white hover:bg-trust-active-soft',
    hoverBg: 'hover:bg-trust-active/10',
  },
  passed: {
    text: 'text-trust-passed',
    border: 'border-trust-passed/50',
    bg: 'bg-trust-passed/10',
    ring: 'ring-trust-passed/40',
    glow: 'shadow-glow-passed',
    dot: 'bg-trust-passed',
    solid: 'bg-trust-passed text-canvas hover:bg-trust-passed-soft',
    hoverBg: 'hover:bg-trust-passed/10',
  },
  hitl: {
    text: 'text-trust-hitl-soft',
    border: 'border-trust-hitl/50',
    bg: 'bg-trust-hitl/10',
    ring: 'ring-trust-hitl/40',
    glow: 'shadow-glow-hitl',
    dot: 'bg-trust-hitl',
    solid: 'bg-trust-hitl text-canvas hover:bg-trust-hitl-soft',
    hoverBg: 'hover:bg-trust-hitl/10',
  },
  violation: {
    text: 'text-trust-violation-soft',
    border: 'border-trust-violation/50',
    bg: 'bg-trust-violation/10',
    ring: 'ring-trust-violation/40',
    glow: 'shadow-glow-violation',
    dot: 'bg-trust-violation',
    solid: 'bg-trust-violation text-white hover:bg-trust-violation-soft',
    hoverBg: 'hover:bg-trust-violation/10',
  },
  neutral: {
    text: 'text-ink-muted',
    border: 'border-hairline',
    bg: 'bg-card/40',
    ring: 'ring-hairline',
    glow: '',
    dot: 'bg-ink-faint',
    solid: 'bg-card text-ink hover:bg-hairline',
    hoverBg: 'hover:bg-card/60',
  },
};

/** Tiny classnames joiner — keeps conditional Tailwind readable. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
