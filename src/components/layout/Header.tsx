import { useEffect, useState } from 'react';
import Badge from '../common/Badge';

const tabs = [
  '통합 대시보드',
  '빈집 관리',
  '자율주행 방범',
  '재건축 추천',
  '실종자 알림',
  '통계/분석',
];

function formatKoreanDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export default function Header() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid size-12 place-items-center rounded-2xl border border-yellow-200/30 bg-slate-900 shadow-lg shadow-cyan-950/40">
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.9)]" />
              <span className="text-xl text-yellow-100">✦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-50 md:text-2xl">
                영천시 빈집 관리 및 자율주행 방범 대시보드
              </h1>
              <p className="mt-1 text-sm text-cyan-200/80">
                Star City Smart Safety Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone="green">관제 운영 중</Badge>
            <Badge tone="cyan">AI 분석 활성화</Badge>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 font-medium text-slate-200">
              {formatKoreanDateTime(now)}
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab, index) => (
            <button
              type="button"
              key={tab}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition ${
                index === 0
                  ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
