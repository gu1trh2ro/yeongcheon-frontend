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
      className={`rounded-3xl bg-white/95 p-6 border-[3px] border-amber-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm ${className}`}
    >
      {(title || eyebrow || action) && (
        <div className="mb-5 flex items-start justify-between gap-3 border-b-2 border-slate-100 pb-4">
          <div>
            {eyebrow && (
              <p className="text-[13px] font-black text-sky-500 mb-1">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-[19px] font-black text-slate-700 tracking-tight">{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
