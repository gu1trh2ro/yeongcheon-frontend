import type { ReactNode } from 'react';

type BadgeTone = 'cyan' | 'red' | 'amber' | 'green' | 'slate' | 'gold';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  cyan: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
  red: 'border-red-400/40 bg-red-500/15 text-red-200',
  amber: 'border-amber-300/40 bg-amber-400/10 text-amber-200',
  green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  slate: 'border-slate-600/70 bg-slate-800/80 text-slate-200',
  gold: 'border-yellow-300/40 bg-yellow-300/10 text-yellow-100',
};

export default function Badge({
  children,
  tone = 'slate',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
