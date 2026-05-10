import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export default function Card({
  children,
  className = '',
  title,
  eyebrow,
  action,
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/75 p-4 shadow-xl shadow-slate-950/30 backdrop-blur ${className}`}
    >
      {(title || eyebrow || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300/80">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-base font-semibold text-slate-100">
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
