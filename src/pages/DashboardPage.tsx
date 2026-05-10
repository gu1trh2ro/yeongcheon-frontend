import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Header from '../components/layout/Header';
import {
  dashboardSummary,
  maintenancePriorities,
  missingPersonAlert,
  recentEvents,
  reconstructionRecommendation,
  robotStatus,
  vacantHouses,
} from '../data/mockData';
import type { EventSeverity, RiskLevel } from '../types/dashboard';

const riskTone: Record<RiskLevel, 'red' | 'amber' | 'cyan' | 'green'> = {
  위험: 'red',
  주의: 'amber',
  관심: 'cyan',
  정비완료: 'green',
};

const severityTone: Record<EventSeverity, 'red' | 'amber' | 'green'> = {
  HIGH: 'red',
  MEDIUM: 'amber',
  LOW: 'green',
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function SummaryStatCards() {
  const stats = [
    {
      label: '전체 빈집 수',
      value: dashboardSummary.vacantHouseCount.toLocaleString(),
      unit: '호',
      accent: 'text-yellow-100',
    },
    {
      label: '정비 완료율',
      value: dashboardSummary.maintenanceRate,
      unit: '%',
      accent: 'text-emerald-200',
    },
    {
      label: '운행 중 로봇',
      value: dashboardSummary.activeRobotCount,
      unit: '대',
      accent: 'text-cyan-200',
    },
    {
      label: '오늘 순찰 거리',
      value: dashboardSummary.todayPatrolDistance,
      unit: 'km',
      accent: 'text-blue-200',
    },
    {
      label: '오늘 이상 탐지',
      value: dashboardSummary.todayAnomalyCount,
      unit: '건',
      accent: 'text-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative overflow-hidden">
          <div className="absolute right-4 top-4 size-1.5 rounded-full bg-yellow-200/80 shadow-[0_0_18px_rgba(250,204,21,0.7)]" />
          <p className="text-sm text-slate-400">{stat.label}</p>
          <div className="mt-3 flex items-end gap-1">
            <strong className={`text-3xl font-bold ${stat.accent}`}>
              {stat.value}
            </strong>
            <span className="pb-1 text-sm font-medium text-slate-300">
              {stat.unit}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RobotVideoCard() {
  return (
    <Card
      title="로봇 영상 모니터링"
      eyebrow="실시간 자율주행 방범 현황"
      action={<Badge tone="cyan">실시간 영상</Badge>}
      className="overflow-hidden"
    >
      <div className="relative h-64 overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-cyan-200/50 shadow-[0_0_20px_rgba(34,211,238,0.7)]" />
        <div className="absolute left-5 top-5">
          <Badge tone="green">{robotStatus.status}</Badge>
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-700/80 bg-slate-950/75 p-4">
          <p className="text-xs text-slate-400">카메라 피드 placeholder</p>
          <div className="mt-2 flex items-center justify-between">
            <strong className="text-lg text-slate-100">{robotStatus.robotId}</strong>
            <span className="text-sm text-cyan-200">완산동 순찰 중</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RobotStatusCard() {
  return (
    <Card title="로봇 상태" eyebrow="자율주행 순찰 제어">
      <div className="space-y-4">
        <ProgressBar value={robotStatus.battery} tone="green" label="배터리" />
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">현재 위치</dt>
            <dd className="text-right font-medium text-slate-100">
              {robotStatus.currentLocation}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">다음 목적지</dt>
            <dd className="text-right font-medium text-cyan-100">
              {robotStatus.nextDestination}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">통신 상태</dt>
            <dd className="font-medium text-emerald-200">
              {robotStatus.connectionStatus}
            </dd>
          </div>
        </dl>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200"
          >
            수동 제어
          </button>
          <button
            type="button"
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100"
          >
            경로 변경
          </button>
        </div>
      </div>
    </Card>
  );
}

function RouteMapCard() {
  const points = [
    { label: '출발', left: '16%', top: '72%', tone: 'bg-emerald-300' },
    { label: '현재', left: '46%', top: '42%', tone: 'bg-yellow-200' },
    { label: '다음', left: '76%', top: '24%', tone: 'bg-cyan-300' },
  ];

  return (
    <Card title="자율주행 순찰 경로" eyebrow="별자리형 경로 placeholder">
      <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <polyline
            points="42,155 125,100 205,54 285,85"
            fill="none"
            stroke="rgba(34,211,238,0.55)"
            strokeWidth="2"
            strokeDasharray="7 7"
          />
          <polyline
            points="42,155 125,100"
            fill="none"
            stroke="rgba(16,185,129,0.75)"
            strokeWidth="4"
          />
        </svg>
        {points.map((point) => (
          <div
            key={point.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: point.left, top: point.top }}
          >
            <span
              className={`mx-auto block size-3 rounded-full ${point.tone} shadow-[0_0_18px_currentColor]`}
            />
            <span className="mt-2 block text-xs font-semibold text-slate-200">
              {point.label}
            </span>
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300">
          완료 구간 62% · 대기 구간 38% · 다음 목적지 완산동 위험 빈집
        </div>
      </div>
    </Card>
  );
}

function VacantHouseMap() {
  const markerPositions = [
    { left: '28%', top: '38%' },
    { left: '46%', top: '52%' },
    { left: '62%', top: '35%' },
    { left: '72%', top: '64%' },
    { left: '38%', top: '70%' },
  ];

  return (
    <Card
      title="영천시 빈집 분포 및 현황"
      eyebrow="공공데이터 기반 지도 placeholder"
      className="min-h-[420px]"
    >
      <div className="relative h-[340px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(250,204,21,0.14),transparent_3px),radial-gradient(circle_at_70%_32%,rgba(34,211,238,0.16),transparent_4px),linear-gradient(135deg,rgba(15,23,42,0.4),rgba(8,13,30,0.9))]" />
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M80 210 C130 145, 210 170, 260 100 S390 90, 440 155"
            fill="none"
            stroke="rgba(250,204,21,0.32)"
            strokeWidth="2"
          />
          <path
            d="M96 245 C175 220, 230 260, 330 215 S420 230, 480 190"
            fill="none"
            stroke="rgba(34,211,238,0.22)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
        </svg>
        <div className="absolute left-5 top-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-100/80">
            Star City Yeongcheon
          </p>
          <strong className="mt-1 block text-2xl text-slate-50">
            영천시 관제 지도
          </strong>
        </div>

        {vacantHouses.map((house, index) => (
          <div
            key={house.houseId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={markerPositions[index]}
            title={house.address}
          >
            <span
              className={`block size-4 rounded-full border-2 border-slate-950 ${
                house.riskLevel === '위험'
                  ? 'bg-red-400'
                  : house.riskLevel === '주의'
                    ? 'bg-amber-300'
                    : house.riskLevel === '관심'
                      ? 'bg-cyan-300'
                      : 'bg-emerald-300'
              } shadow-[0_0_18px_rgba(255,255,255,0.45)]`}
            />
          </div>
        ))}

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 rounded-2xl border border-slate-700/70 bg-slate-950/80 p-3">
          {(['위험', '주의', '관심', '정비완료'] as RiskLevel[]).map((risk) => (
            <Badge key={risk} tone={riskTone[risk]}>
              {risk}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MaintenancePriorityTable() {
  return (
    <Card title="빈집 정비 우선순위" eyebrow="위험도·노후도·생활권 분석">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="py-2 pr-3">순위</th>
              <th className="py-2 pr-3">주소</th>
              <th className="py-2 pr-3">위험도</th>
              <th className="py-2 pr-3">노후도</th>
              <th className="py-2 pr-3">접근성</th>
              <th className="py-2 pr-3">인구밀도</th>
              <th className="py-2 pr-3">점수</th>
              <th className="py-2">조치</th>
            </tr>
          </thead>
          <tbody>
            {maintenancePriorities.map((item) => (
              <tr key={item.houseId} className="border-b border-slate-800/80">
                <td className="py-3 pr-3 font-bold text-yellow-100">
                  {item.rank}
                </td>
                <td className="py-3 pr-3 text-slate-100">{item.address}</td>
                <td className="py-3 pr-3">
                  <Badge tone={riskTone[item.riskLevel]}>{item.riskLevel}</Badge>
                </td>
                <td className="py-3 pr-3 text-slate-300">{item.oldness}</td>
                <td className="py-3 pr-3 text-slate-300">{item.accessibility}</td>
                <td className="py-3 pr-3 text-slate-300">
                  {item.populationDensity}
                </td>
                <td className="py-3 pr-3 font-semibold text-cyan-100">
                  {item.totalScore}
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    검토
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReconstructionRecommendCard() {
  return (
    <Card
      title="추천 재건축 요소"
      eyebrow="AI 추천 · 공공데이터 기반 분석"
      action={<Badge tone="gold">사업 타당성 {reconstructionRecommendation.feasibility}</Badge>}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <InfoBlock label="추천 용도" value={reconstructionRecommendation.recommendedUse} />
        <InfoBlock label="건축 규모" value={reconstructionRecommendation.buildingScale} />
        <InfoBlock label="예상 비용" value={reconstructionRecommendation.expectedCost} />
        <InfoBlock label="기대 효과" value={reconstructionRecommendation.expectedReturn} />
      </div>
      <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm leading-6 text-slate-300">
        {reconstructionRecommendation.reason}
      </p>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function MissingPersonAlertCard() {
  return (
    <Card className="border-red-400/30 bg-red-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-200">
            긴급 확인
          </p>
          <h2 className="mt-1 text-lg font-bold text-red-50">
            실종자 후보 알림
          </h2>
        </div>
        <Badge tone="red">{missingPersonAlert.status}</Badge>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-2xl border border-red-300/20 bg-slate-950/50 p-3">
          <p className="font-semibold text-slate-100">{missingPersonAlert.title}</p>
          <p className="mt-2 text-slate-300">{missingPersonAlert.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoBlock label="탐지 시각" value={formatTime(missingPersonAlert.detectedAt)} />
          <InfoBlock label="유사도" value={`${missingPersonAlert.similarity}%`} />
        </div>
        <InfoBlock label="위치" value={missingPersonAlert.location} />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-xl bg-red-400 px-3 py-2 text-sm font-bold text-red-950"
          >
            신고 초안 생성
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-300/40 px-3 py-2 text-sm font-semibold text-red-100"
          >
            상세 정보 보기
          </button>
        </div>
      </div>
    </Card>
  );
}

function AiAnalysisCard() {
  return (
    <Card title="AI 분석 결과" eyebrow="빈집 이상 탐지">
      <div className="space-y-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-semibold text-cyan-100">
            완산동 123-4 외벽 파손 가능성 감지
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            최근 순찰 이미지와 공공데이터 기반 노후도 점수를 함께 분석한 결과,
            현장 확인 우선순위를 높게 산정했습니다.
          </p>
        </div>
        <ProgressBar value={91} tone="red" label="종합 위험 점수" />
        <ProgressBar value={78} tone="amber" label="인구 밀집 영향" />
        <ProgressBar value={85} tone="cyan" label="현장 접근성" />
      </div>
    </Card>
  );
}

function RecentAlertsCard() {
  return (
    <Card title="최근 알림" eyebrow="관제 이벤트 로그">
      <div className="space-y-3">
        {recentEvents.map((event) => (
          <article
            key={event.eventId}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {event.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {event.location} · {formatTime(event.detectedAt)}
                </p>
              </div>
              <Badge tone={severityTone[event.severity]}>{event.status}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {event.description}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_12%_18%,rgba(250,204,21,0.12),transparent_2px),radial-gradient(circle_at_28%_34%,rgba(34,211,238,0.12),transparent_2px),radial-gradient(circle_at_76%_16%,rgba(250,204,21,0.1),transparent_2px),radial-gradient(circle_at_82%_68%,rgba(34,211,238,0.1),transparent_2px),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />
      <div className="relative z-10">
        <Header />
        <main className="mx-auto flex max-w-[1680px] flex-col gap-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="flex flex-col gap-4 xl:col-span-3">
              <RobotVideoCard />
              <RobotStatusCard />
              <RouteMapCard />
            </div>

            <div className="flex flex-col gap-4 xl:col-span-6">
              <VacantHouseMap />
              <MaintenancePriorityTable />
              <ReconstructionRecommendCard />
            </div>

            <div className="flex flex-col gap-4 xl:col-span-3">
              <MissingPersonAlertCard />
              <AiAnalysisCard />
              <RecentAlertsCard />
            </div>
          </div>

          <SummaryStatCards />
        </main>
      </div>
    </div>
  );
}
