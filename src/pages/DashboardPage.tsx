import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import {
  SummaryStatCards,
  VacantHouseMap,
  RobotStatusSummary,
  RobotVideoCard,
  RouteMapCard,
  MaintenancePriorityTable,
  ReconstructionRecommendCard,
  MissingPersonSummary,
  MissingPersonDetailCard,
  AiAnomalySummary,
  RecentAlertsCard,
} from '../components/dashboard/DashboardSections';
import {
  getDashboardSummary,
  getMaintenancePriority,
  getMissingPersonAlert,
  getRecentEvents,
  getReconstructionRecommendation,
  getRobotStatus,
  getVacantHouses,
} from '../api/dashboardApi';
import type {
  DashboardSummary,
  MaintenancePriority,
  MissingPersonAlert,
  RecentEvent,
  ReconstructionRecommendation,
  RobotStatus,
  VacantHouse,
} from '../types/dashboard';

const TABS = ['통합 대시보드', '빈집 관리', '로봇 관제', 'AI 분석/추천', '실종자 알림'] as const;
type TabType = typeof TABS[number];

interface DashboardData {
  summary: DashboardSummary;
  robotStatus: RobotStatus;
  vacantHouses: VacantHouse[];
  recentEvents: RecentEvent[];
  maintenancePriority: MaintenancePriority[];
  reconstructionRecommendation: ReconstructionRecommendation;
  missingPersonAlert: MissingPersonAlert;
}

function DashboardStateMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border-[3px] border-white/70 bg-white/90 p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm">
      <p className="text-[18px] font-black text-slate-700">{title}</p>
      <p className="mt-2 text-[15px] font-bold text-slate-500">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('통합 대시보드');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [
          summary,
          robotStatus,
          vacantHouses,
          recentEvents,
          maintenancePriority,
          reconstructionRecommendation,
          missingPersonAlert,
        ] = await Promise.all([
          getDashboardSummary(),
          getRobotStatus(),
          getVacantHouses(),
          getRecentEvents(),
          getMaintenancePriority(),
          getReconstructionRecommendation(),
          getMissingPersonAlert(),
        ]);

        if (!isMounted) return;

        setDashboardData({
          summary,
          robotStatus,
          vacantHouses,
          recentEvents,
          maintenancePriority,
          reconstructionRecommendation,
          missingPersonAlert,
        });
      } catch {
        if (!isMounted) return;

        setErrorMessage('대시보드 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    // 전체 페이지 스크롤 스냅 & 고정된 배경 이미지 (Parallax 효과)
    <div 
      className="h-screen overflow-y-scroll snap-y snap-mandatory font-sans text-slate-800 bg-cover bg-center bg-fixed bg-no-repeat custom-scrollbar"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      
      {/* ── 1. 첫 화면 (Hero Section): 스크롤 시 딱 걸리는 첫 번째 스냅 영역 ── */}
      <section className="snap-start relative h-screen w-full flex flex-col justify-center px-8 md:px-20">
        
        {/* 가독성을 위한 부드러운 상단/좌측 그라데이션 (배경은 살리고 글씨만 잘 보이게) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* 작은 타이틀 */}
          <p className="text-[20px] font-bold text-slate-700 mb-4 flex items-center gap-2 drop-shadow-md">
            <span className="text-amber-500 text-2xl">☀️</span> Star City Smart Safety Platform
          </p>

          {/* 대형 타이틀 */}
          <h1 className="text-[52px] md:text-[72px] font-black text-slate-800 mb-8 tracking-tight drop-shadow-xl leading-tight break-keep">
            영천시 빈집 관리 및<br/>
            <span className="text-sky-500">자율주행 방범</span> 대시보드
          </h1>

          <button 
            // 스크롤 시 두 번째 섹션으로 부드럽게 이동
            onClick={() => {
              const dash = document.getElementById('dashboard-section');
              if (dash) dash.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-full text-[18px] font-black shadow-[0_8px_20px_rgba(14,165,233,0.4)] transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            관제 시스템 시작하기 ↓
          </button>
        </div>

        {/* 스크롤 유도 애니메이션 아이콘 */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity" 
          onClick={() => {
            const dash = document.getElementById('dashboard-section');
            if (dash) dash.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-[14px] font-bold text-slate-600 mb-2 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">아래로 스크롤</span>
          <div className="w-8 h-12 border-4 border-slate-600 rounded-full flex justify-center pt-2 bg-white/50 backdrop-blur-sm">
            <div className="w-1.5 h-3 bg-slate-600 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── 2. 대시보드 콘텐츠 영역: 스크롤 시 딱 걸리는 두 번째 스냅 영역 ── */}
      {/* 배경 이미지가 비치도록 반투명 블러(글래스모피즘) 적용 */}
      <section id="dashboard-section" className="snap-start min-h-screen py-16 px-6 md:px-12 xl:px-20 relative z-20 bg-white/30 backdrop-blur-xl border-t border-white/50">
        
        <div className="max-w-[1400px] mx-auto">
          {/* 네비게이션 헤더 (중앙 정렬) */}
          <div className="mb-12 flex justify-center">
            <Header tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* 메인 콘텐츠 프레임 */}
          {isLoading && (
            <DashboardStateMessage
              title="대시보드 데이터를 불러오는 중입니다"
              description="영천시 빈집, 로봇 관제, AI 분석 정보를 준비하고 있습니다."
            />
          )}

          {!isLoading && errorMessage && (
            <DashboardStateMessage
              title="데이터 연결 상태를 확인해 주세요"
              description={errorMessage}
            />
          )}

          {!isLoading && !errorMessage && dashboardData && (
            <div className="animate-fade-in" key={`content-${activeTab}`}>
              {activeTab === '통합 대시보드' && (
                <div className="space-y-6">
                  <SummaryStatCards summary={dashboardData.summary} />
                  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                    <VacantHouseMap vacantHouses={dashboardData.vacantHouses} />
                    <div className="space-y-6">
                      <RobotStatusSummary robotStatus={dashboardData.robotStatus} />
                      <MissingPersonSummary missingPersonAlert={dashboardData.missingPersonAlert} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '빈집 관리' && (
                <div className="space-y-6">
                  <VacantHouseMap vacantHouses={dashboardData.vacantHouses} />
                  <MaintenancePriorityTable maintenancePriorities={dashboardData.maintenancePriority} />
                </div>
              )}

              {activeTab === '로봇 관제' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RobotVideoCard robotStatus={dashboardData.robotStatus} />
                  <div className="space-y-6">
                    <RobotStatusSummary robotStatus={dashboardData.robotStatus} />
                    <RouteMapCard />
                  </div>
                </div>
              )}

              {activeTab === 'AI 분석/추천' && (
                <div className="space-y-6">
                  <AiAnomalySummary />
                  <ReconstructionRecommendCard
                    reconstructionRecommendation={dashboardData.reconstructionRecommendation}
                  />
                  <RecentAlertsCard recentEvents={dashboardData.recentEvents} />
                </div>
              )}

              {activeTab === '실종자 알림' && (
                <div className="space-y-6">
                  <MissingPersonDetailCard missingPersonAlert={dashboardData.missingPersonAlert} />
                  <RecentAlertsCard recentEvents={dashboardData.recentEvents} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
