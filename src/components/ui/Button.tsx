import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx, TONE, type Tone } from './tone';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

const SIZES = {
  sm: 'h-8 px-3 text-[14px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-14 px-6 text-[16px]',
} as const;

export function Button({
  tone = 'active',
  variant = 'solid',
  size = 'md',
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const t = TONE[tone];
  const look =
    variant === 'solid'
      ? cx(t.solid, 'border border-transparent')
      : variant === 'outline'
        ? cx('border bg-transparent', t.border, t.text, t.hoverBg)
        : cx('border border-transparent bg-transparent', t.text, t.hoverBg);

  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wider transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        t.ring,
        'disabled:cursor-not-allowed disabled:opacity-40',
        SIZES[size],
        look,
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
