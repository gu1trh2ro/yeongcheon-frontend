interface HeaderProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export default function Header<T extends string>({
  tabs, activeTab, onTabChange,
}: HeaderProps<T>) {
  return (
    <header className="w-full relative px-6 py-2">
      <nav className="flex items-center justify-center gap-2" aria-label="대시보드 탭">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`
                relative px-5 py-3 rounded-full font-bold text-[15px] transition-all duration-200
                ${isActive 
                  ? 'bg-amber-400 text-white shadow-[0_4px_12px_rgba(251,191,36,0.4)] scale-105 z-10' 
                  : 'bg-white/60 text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm border border-white/40'
                }
              `}
              aria-pressed={isActive}
            >
              {isActive && <span className="mr-1.5 inline-block text-[14px]">⭐</span>}
              {tab}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
