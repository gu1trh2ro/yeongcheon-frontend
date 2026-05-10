interface ProgressBarProps {
  value: number;
  tone?: 'cyan' | 'amber' | 'green' | 'red';
  label?: string;
}

const toneClasses: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  cyan: 'bg-cyan-300',
  amber: 'bg-amber-300',
  green: 'bg-emerald-300',
  red: 'bg-red-300',
};

export default function ProgressBar({
  value,
  tone = 'cyan',
  label,
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>{label}</span>
          <span className="font-semibold text-slate-100">{safeValue}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${toneClasses[tone]}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
