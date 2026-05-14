import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import {
  SummaryStatCards,
  VacantHouseMap,
  RobotVideoCard,
  RouteMapCard,
  RobotControlDashboard,
  MaintenancePriorityTable,
  ReconstructionRecommendCard,
  OverviewActivityLogCard,
  MissingPersonDetailCard,
  AiAnomalySummary,
} from '../components/dashboard/DashboardSections';
import {
  analyzeReconstructionRecommendation,
  getDashboardSummary,
  getMaintenancePriority,
  getMissingPersonDetectionLogs,
  getMissingPersonProfiles,
  getPatrolArrivalPhotos,
  getPatrolRoute,
  getRecentEvents,
  getReconstructionRecommendation,
  getRobotActivityLogs,
  getRobotMissionTargets,
  getVacantHouses,
} from '../api/dashboardApi';
import type {
  DashboardSummary,
  MaintenancePrioritySummary,
  MissingPersonDetectionLog,
  MissingPersonPublicProfile,
  PatrolArrivalPhoto,
  PatrolRoute,
  RecentEvent,
  ReconstructionRecommendation,
  RobotActivityLog,
  RobotMissionTarget,
  VacantHouse,
} from '../types/dashboard';

const TABS = ['통합 대시보드', '빈집 관리', '로봇 관제', 'AI 분석/추천', '실종자 알림'] as const;
type TabType = typeof TABS[number];

interface DashboardData {
  summary: DashboardSummary;
  vacantHouses: VacantHouse[];
  recentEvents: RecentEvent[];
  maintenancePriority: MaintenancePrioritySummary;
  patrolRoute: PatrolRoute;
  patrolArrivalPhotos: PatrolArrivalPhoto[];
  robotMissionTargets: RobotMissionTarget[];
  robotActivityLogs: RobotActivityLog[];
  reconstructionRecommendation: ReconstructionRecommendation;
  missingPersonProfiles: MissingPersonPublicProfile[];
  missingPersonDetectionLogs: MissingPersonDetectionLog[];
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

function formatDashboardTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('통합 대시보드');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAiHouseId, setSelectedAiHouseId] = useState<string | null>(null);
  const [selectedMissingLogId, setSelectedMissingLogId] = useState<string | null>(null);
  const [selectedMissingProfileId, setSelectedMissingProfileId] = useState<string | null>(null);
  const [isAnalyzingRecommendation, setIsAnalyzingRecommendation] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [pendingMissingAlertLog, setPendingMissingAlertLog] = useState<MissingPersonDetectionLog | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [
          summary,
          vacantHouses,
          recentEvents,
          maintenancePriority,
          patrolRoute,
          patrolArrivalPhotos,
          robotMissionTargets,
          robotActivityLogs,
          reconstructionRecommendation,
          missingPersonProfiles,
          missingPersonDetectionLogs,
        ] = await Promise.all([
          getDashboardSummary(),
          getVacantHouses(),
          getRecentEvents(),
          getMaintenancePriority(),
          getPatrolRoute(),
          getPatrolArrivalPhotos(),
          getRobotMissionTargets(),
          getRobotActivityLogs(),
          getReconstructionRecommendation(),
          getMissingPersonProfiles(),
          getMissingPersonDetectionLogs(),
        ]);

        if (!isMounted) return;

        setDashboardData({
          summary,
          vacantHouses,
          recentEvents,
          maintenancePriority,
          patrolRoute,
          patrolArrivalPhotos,
          robotMissionTargets,
          robotActivityLogs,
          reconstructionRecommendation,
          missingPersonProfiles,
          missingPersonDetectionLogs,
        });
        setSelectedAiHouseId(vacantHouses[0]?.houseId ?? null);
        setSelectedMissingLogId(null);
        setSelectedMissingProfileId(null);
        setPendingMissingAlertLog(
          missingPersonDetectionLogs.find((log) => log.status === '담당자 확인 필요') ?? null,
        );
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

  const selectedAiHouse =
    dashboardData?.vacantHouses.find((house) => house.houseId === selectedAiHouseId)
    ?? dashboardData?.vacantHouses[0]
    ?? null;
  const alertTabs: TabType[] = pendingMissingAlertLog ? ['실종자 알림'] : [];

  function handleSelectAiHouse(houseId: string) {
    setSelectedAiHouseId(houseId);
    setRecommendationError(null);
  }

  async function handleRequestRecommendation(addressOverride?: string) {
    if (!selectedAiHouse) {
      setRecommendationError('추천을 요청할 빈집을 먼저 선택해 주세요.');
      return;
    }

    const requestAddress = addressOverride?.trim() || selectedAiHouse.address;
    const requestHouse: VacantHouse = {
      ...selectedAiHouse,
      address: requestAddress,
    };

    try {
      setIsAnalyzingRecommendation(true);
      setRecommendationError(null);

      const recommendation = await analyzeReconstructionRecommendation(requestHouse);

      setDashboardData((currentData) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          reconstructionRecommendation: recommendation,
        };
      });
    } catch {
      setRecommendationError('AI 추천 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsAnalyzingRecommendation(false);
    }
  }

  function handleOpenMissingAlert() {
    if (!pendingMissingAlertLog) return;

    setSelectedMissingLogId(pendingMissingAlertLog.logId);
    setPendingMissingAlertLog(null);
    setActiveTab('실종자 알림');
  }

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
      <section id="dashboard-section" className="snap-start h-screen w-full pt-8 pb-8 px-6 md:px-8 xl:px-8 relative z-20 bg-white/30 backdrop-blur-xl border-t border-white/50 overflow-hidden">
        
        <div className="max-w-[1800px] mx-auto h-full flex gap-4 xl:gap-6">
          {/* 좌측 사이드바 (툴 메뉴) */}

          <div className="w-[140px] xl:w-[160px] shrink-0 h-full">
            <Header tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} alertTabs={alertTabs} />
          </div>

          {/* 메인 콘텐츠 프레임 (내부 스크롤) */}
          <div className="flex-1 h-full overflow-y-auto custom-scrollbar pr-4 pb-2">
            {isLoading && (
              <DashboardStateMessage
                title="대시보드 데이터를 불러오는 중입니다"
                description="영천시 빈집, AI 분석, 실종자 알림 정보를 준비하고 있습니다."
              />
            )}

            {!isLoading && errorMessage && (
              <DashboardStateMessage
                title="데이터 연결 상태를 확인해 주세요"
                description={errorMessage}
              />
            )}

            {!isLoading && !errorMessage && dashboardData && (
              <div className="animate-fade-in h-full flex flex-col" key={`content-${activeTab}`}>
                {activeTab === '통합 대시보드' && (
                  <div className="flex flex-col gap-6 h-full min-h-0">
                    <SummaryStatCards summary={dashboardData.summary} />
                    
                    {/* 3-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] xl:grid-cols-[1.4fr_1.3fr_1.1fr] gap-4 xl:gap-6 flex-1 min-h-0">
                      
                      {/* Column 1: Map */}
                      <div className="h-full min-h-0">
                        <VacantHouseMap />
                      </div>
                      
                      {/* Column 2: Robot Patrol */}
                      <div className="h-full min-h-0">
                        <RobotVideoCard latestArrivalPhoto={dashboardData.patrolArrivalPhotos[0] ?? null} compact />
                      </div>

                      {/* Column 3: AI & Alerts */}
                      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 xl:gap-6">
                        <OverviewActivityLogCard
                          recentEvents={dashboardData.recentEvents}
                          robotActivityLogs={dashboardData.robotActivityLogs}
                        />
                        <RouteMapCard patrolRoute={dashboardData.patrolRoute} compact />
                      </div>

                    </div>
                  </div>
                )}

                {activeTab === '빈집 관리' && (
                  <div className="space-y-6">
                    <VacantHouseMap />
                    <MaintenancePriorityTable maintenancePriorities={dashboardData.maintenancePriority} />
                  </div>
                )}

                {activeTab === '로봇 관제' && (
                  <RobotControlDashboard
                    missionTargets={dashboardData.robotMissionTargets}
                    initialActivityLogs={dashboardData.robotActivityLogs}
                    latestArrivalPhoto={dashboardData.patrolArrivalPhotos[0] ?? null}
                  />
                )}

                {activeTab === 'AI 분석/추천' && (
                  <div className="space-y-6">
                    <AiAnomalySummary />
                    <ReconstructionRecommendCard
                      reconstructionRecommendation={dashboardData.reconstructionRecommendation}
                      vacantHouses={dashboardData.vacantHouses}
                      selectedHouse={selectedAiHouse}
                      isAnalyzing={isAnalyzingRecommendation}
                      analysisError={recommendationError}
                      onSelectHouse={handleSelectAiHouse}
                      onRequestRecommendation={handleRequestRecommendation}
                    />
                  </div>
                )}

                {activeTab === '실종자 알림' && (
                  <div className="space-y-6">
                    <MissingPersonDetailCard
                      missingPersonProfiles={dashboardData.missingPersonProfiles}
                      detectionLogs={dashboardData.missingPersonDetectionLogs}
                      selectedLogId={selectedMissingLogId}
                      onSelectLog={setSelectedMissingLogId}
                      onCloseLog={() => setSelectedMissingLogId(null)}
                      selectedProfileId={selectedMissingProfileId}
                      onSelectProfile={setSelectedMissingProfileId}
                      onCloseProfile={() => setSelectedMissingProfileId(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {pendingMissingAlertLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-6 py-8 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-[2rem] border-4 border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <span className="inline-flex rounded-full bg-rose-500 px-4 py-2 text-[13px] font-black text-white shadow-sm">
              긴급 확인 요망
            </span>
            <h2 className="mt-5 text-[24px] font-black text-slate-800">
              로봇이 실종자 후보 이벤트를 탐지했습니다
            </h2>
            <p className="mt-3 text-[14px] font-bold leading-relaxed text-slate-600">
              AI/YOLO 탐지 결과가 담당자 확인 필요 상태로 등록되었습니다. 실종자 확정이 아니며,
              담당자가 상세 내용을 검토해야 합니다.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-rose-50 px-4 py-3">
                <p className="text-[12px] font-bold text-rose-400">유사도</p>
                <p className="mt-1 text-[18px] font-black text-rose-500">{pendingMissingAlertLog.similarity}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[12px] font-bold text-slate-400">탐지 시각</p>
                <p className="mt-1 text-[15px] font-black text-slate-700">
                  {formatDashboardTime(pendingMissingAlertLog.detectedAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-4 py-3">
                <p className="text-[12px] font-bold text-sky-400">탐지 위치</p>
                <p className="mt-1 text-[14px] font-black text-slate-700">{pendingMissingAlertLog.location}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleOpenMissingAlert}
                className="flex-1 rounded-2xl bg-rose-500 px-5 py-4 text-[15px] font-black text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all hover:bg-rose-600"
              >
                실종자 알림에서 확인
              </button>
              <button
                type="button"
                onClick={() => setPendingMissingAlertLog(null)}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[15px] font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                나중에 확인
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
