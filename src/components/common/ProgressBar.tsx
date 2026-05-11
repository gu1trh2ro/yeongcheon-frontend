interface ProgressBarProps {
  value: number;
  label: string;
  tone?: 'sky' | 'amber' | 'red';
}

export default function ProgressBar({ value, label, tone = 'sky' }: ProgressBarProps) {
  const bg = tone === 'sky' ? 'bg-sky-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div>
      <div className="flex justify-between text-[14px] font-black mb-2">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-700">{value}%</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full ${bg} transition-all duration-1000 rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function CircularGauge({ value, label, size = 64, tone = 'sky' }: ProgressBarProps & { size?: number }) {
  const r = size * 0.4;
  const c = size / 2;
  const stroke = size * 0.15; // 둥글고 두꺼운 선
  const dash = 2 * Math.PI * r;
  const off = dash - (dash * value) / 100;
  
  const strokeColor = tone === 'sky' ? '#38BDF8' : tone === 'amber' ? '#FBBF24' : '#FB7185';

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center drop-shadow-sm" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={c} cy={c} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          <circle cx={c} cy={c} r={r} fill="none" stroke={strokeColor} strokeWidth={stroke} strokeDasharray={dash} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <span className="absolute text-slate-700 font-black" style={{ fontSize: size * 0.28 }}>{value}%</span>
      </div>
      {label && <span className="text-[14px] font-black text-slate-500">{label}</span>}
    </div>
  );
}
