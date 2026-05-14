interface HeaderProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export default function Header<T extends string>({
  tabs, activeTab, onTabChange,
}: HeaderProps<T>) {
  return (
    <header className="w-full h-full flex flex-col pt-4">
      {/* 사이드바 상단 로고/타이틀 부분 */}
      <div className="px-2 mb-8 flex flex-col items-center xl:flex-row xl:items-start gap-2 xl:gap-3 text-center xl:text-left">
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-md font-black text-lg shrink-0">
          YC
        </div>
        <div>
          <p className="text-[12px] xl:text-[13px] font-bold text-slate-500">별의 도시 영천</p>
          <h2 className="text-[15px] xl:text-[17px] font-black text-slate-800 tracking-tight leading-tight">스마트 관제</h2>
        </div>
      </div>

      <nav className="flex flex-col gap-2 px-1" aria-label="대시보드 탭">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`
                relative px-3 py-3 rounded-xl font-black text-[13px] xl:text-[14px] transition-all duration-200 text-left flex items-center
                ${isActive 
                  ? 'bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.4)] translate-x-2 z-10' 
                  : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm hover:translate-x-1 border border-white/40'
                }
              `}
              aria-pressed={isActive}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
