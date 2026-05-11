import type { ReactNode } from 'react';

type BadgeTone = 'sky' | 'red' | 'amber' | 'green' | 'gray' | 'star';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  sky: 'bg-sky-light text-sky-dark',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  gray: 'bg-gray-100 text-gray-500',
  star: 'bg-star-light text-amber-700',
};

export default function Badge({
  children,
  tone = 'gray',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
