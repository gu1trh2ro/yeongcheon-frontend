import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import type {
  DashboardSummary,
  MaintenanceGrade,
  MaintenancePrioritySummary,
  MissingPersonAlert,
  MissingPersonDetectionLog,
  MissingPersonPublicProfile,
  PatrolArrivalPhoto,
  PatrolRoute,
  RecentEvent,
  ReconstructionRecommendation,
  RobotActivityLog,
  RobotMissionTarget,
  VacantHouse,
} from '../../types/dashboard';

export { default as VacantHouseMap } from './VacantHouseMap';

function fmt(v: string) {
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(v));
}

function fmtDateTime(v: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(v));
}

function arrivalResultClass(result: PatrolArrivalPhoto['analysisResult']) {
  if (result === '이상징후') return 'bg-rose-100 text-rose-600';
  if (result === '분석중') return 'bg-amber-100 text-amber-700';

  return 'bg-emerald-100 text-emerald-700';
}

function maintenanceGradeLabel(grade: MaintenanceGrade) {
  if (grade === '특정빈집') return '특정';
  if (grade === '일반빈집') return '일반';

  return grade;
}

function maintenanceGradeClass(grade: MaintenanceGrade) {
  const gradeClasses: Record<MaintenanceGrade, string> = {
    '1등급': 'bg-rose-100 text-rose-600',
    '2등급': 'bg-orange-100 text-orange-700',
    '3등급': 'bg-amber-100 text-amber-700',
    '4등급': 'bg-sky-100 text-sky-700',
    특정빈집: 'bg-fuchsia-100 text-fuchsia-700',
    일반빈집: 'bg-emerald-100 text-emerald-700',
  };

  return gradeClasses[grade];
}

/* ── 요약 통계 ── */
export function SummaryStatCards({ summary }: { summary: DashboardSummary }) {
  const items = [
    { label: '전체 빈집', val: summary.vacantHouseCount.toLocaleString(), unit: '호', color: 'text-slate-700' },
    { label: '고위험 빈집', val: summary.highRiskHouseCount, unit: '호', color: 'text-rose-500' },
    { label: '이상 탐지', val: summary.todayAnomalyCount, unit: '건', color: 'text-amber-500' },
    { label: '실종자 후보', val: summary.missingPersonCandidateCount, unit: '건', color: 'text-rose-500' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 shrink-0">
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl bg-white/95 px-4 py-2.5 border-[3px] border-amber-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm flex flex-col justify-center">
          <p className="text-[12px] xl:text-[13px] font-bold text-slate-500">{s.label}</p>
          <p className={`text-[20px] xl:text-[24px] font-black tabular-nums tracking-tight leading-tight ${s.color}`}>
            {s.val}<span className="ml-1 text-[12px] xl:text-[14px] font-bold text-slate-400">{s.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function overviewLogToneClass(tone: 'danger' | 'warning' | 'info' | 'success') {
  if (tone === 'danger') return 'border-rose-300 bg-rose-50 text-rose-600';
  if (tone === 'warning') return 'border-amber-300 bg-amber-50 text-amber-700';
  if (tone === 'success') return 'border-emerald-300 bg-emerald-50 text-emerald-700';

  return 'border-sky-300 bg-sky-50 text-sky-700';
}

function recentEventLogTone(event: RecentEvent): 'danger' | 'warning' | 'info' | 'success' {
  if (event.severity === 'HIGH') return 'danger';
  if (event.severity === 'MEDIUM') return 'warning';
  if (event.status === '처리완료') return 'success';

  return 'info';
}

function robotActivityLogTone(log: RobotActivityLog): 'danger' | 'warning' | 'info' | 'success' {
  if (log.tone === 'warning') return 'warning';
  if (log.tone === 'success') return 'success';

  return 'info';
}

/* ── 통합 관제 로그 ── */
export function OverviewActivityLogCard({
  recentEvents,
  robotActivityLogs,
}: {
  recentEvents: RecentEvent[];
  robotActivityLogs: RobotActivityLog[];
}) {
  const eventLogs = recentEvents.map((event) => ({
    id: event.eventId,
    title: event.title,
    detail: event.location,
    timestamp: event.detectedAt,
    tone: recentEventLogTone(event),
    source: event.type === 'MISSING_PERSON_CANDIDATE' ? '실종자 후보' : event.type === 'VACANT_HOUSE_ANOMALY' ? 'AI 탐지' : '관제 이벤트',
    priority: event.type === 'MISSING_PERSON_CANDIDATE'
      ? 4
      : event.type === 'VACANT_HOUSE_ANOMALY'
        ? 3
        : 1,
  }));
  const robotLogs = robotActivityLogs.map((log) => ({
    id: log.logId,
    title: log.message,
    detail: 'robot-01 순찰 로그',
    timestamp: log.timestamp,
    tone: robotActivityLogTone(log),
    source: '로봇 순찰',
    priority: log.tone === 'success' ? 2 : 1,
  }));
  const logs = [
    ...eventLogs.filter((log) => log.priority >= 3),
    ...robotLogs,
    ...eventLogs.filter((log) => log.priority < 3),
  ]
    .sort((a, b) => b.priority - a.priority || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  return (
    <Card title="관제 로그" eyebrow="로봇·AI 이벤트" className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {logs.map((log) => (
          <article key={log.id} className={`rounded-2xl border-2 px-3 py-2 shadow-sm ${overviewLogToneClass(log.tone)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12px] xl:text-[13px] font-black">{log.title}</p>
                <p className="mt-1 truncate text-[11px] font-bold opacity-75">{log.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-[10px] font-black">
                {log.source}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-bold opacity-70">{fmtDateTime(log.timestamp)}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}

/* ── 실종자 요약 ── */
export function MissingPersonSummary({
  missingPersonAlert,
}: {
  missingPersonAlert: MissingPersonAlert;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between border-b-2 border-slate-50 pb-2">
        <div>
          <span className="inline-block px-2 py-1 bg-rose-100 text-rose-600 font-black text-[11px] rounded-full mb-1.5">긴급 확인 요망</span>
          <h3 className="text-[15px] xl:text-[16px] font-black text-slate-800 leading-tight">{missingPersonAlert.title}</h3>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 xl:gap-3">
        <div className="bg-rose-50 rounded-2xl px-3 py-2 border-2 border-white shadow-sm flex flex-col justify-center">
          <p className="text-[12px] font-bold text-rose-400">유사도</p>
          <p className="mt-0.5 text-[20px] xl:text-[22px] font-black text-rose-500 leading-none">{missingPersonAlert.similarity}%</p>
        </div>
        <div className="bg-slate-50 rounded-2xl px-3 py-2 border-2 border-white shadow-sm flex flex-col justify-center">
          <p className="text-[12px] font-bold text-slate-500">탐지 시각</p>
          <p className="mt-0.5 text-[16px] xl:text-[18px] font-black text-slate-700 tracking-tight leading-none">{fmt(missingPersonAlert.detectedAt)}</p>
        </div>
      </div>
    </Card>
  );
}

function AnomalyImageSlot({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: 'normal' | 'danger';
}) {
  const toneClass = tone === 'danger'
    ? 'border-rose-100 bg-rose-50 text-rose-600'
    : 'border-emerald-100 bg-emerald-50 text-emerald-600';

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-white bg-white shadow-sm">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(226,232,240,0.55))]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[24px] shadow-sm">
            📷
          </div>
          <p className="mt-3 text-[13px] font-black text-slate-500">이미지 수신 대기</p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">로봇 촬영 이미지 연동 영역</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="text-[13px] font-black text-slate-700">{label}</p>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black ${toneClass}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

/* ── AI 이상 탐지 ── */
export function AiAnomalySummary() {
  return (
    <Card title="AI 이상 탐지 요약" eyebrow="공공데이터 기반 분석">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="bg-amber-50 border-2 border-white p-5 rounded-3xl shadow-sm">
            <p className="text-[16px] font-black text-slate-800 mb-2 flex items-center gap-2">
              <span className="text-amber-500">💡</span> 완산동 123-4 외벽 파손 가능성
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600 font-bold">
              순찰 이미지와 노후도 데이터를 함께 분석해 현장 확인 우선순위를 높게 산정했습니다.
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AnomalyImageSlot label="정상 기준 이미지" status="정상" tone="normal" />
            <AnomalyImageSlot label="이상 탐지 이미지" status="비정상 후보" tone="danger" />
          </div>
        </div>
        <div className="space-y-5 flex flex-col justify-center">
          <ProgressBar value={91} tone="amber" label="종합 위험 점수" />
          <ProgressBar value={85} tone="sky" label="현장 접근성" />
          <ProgressBar value={78} tone="sky" label="인구 밀집도" />
        </div>
      </div>
    </Card>
  );
}

/* ── 로봇 영상 ── */
export function RobotVideoCard({
  latestArrivalPhoto,
  compact = false,
}: {
  latestArrivalPhoto: PatrolArrivalPhoto | null;
  compact?: boolean;
}) {
  const cameraImageUrl = latestArrivalPhoto?.imageUrl ?? '';
  const hasCameraImage = cameraImageUrl.length > 0;

  return (
    <Card
      title="순찰 카메라"
      eyebrow="촬영 이미지 연동 준비"
      className={`h-full flex flex-col ${compact ? 'min-h-[320px]' : 'min-h-[420px]'}`}
    >
      <div className={`relative flex-1 min-h-0 bg-slate-100 border-4 border-slate-50 flex flex-col items-center justify-center rounded-3xl overflow-hidden shadow-inner`}>
        {hasCameraImage ? (
          <img
            src={cameraImageUrl}
            alt={`${latestArrivalPhoto?.address ?? '순찰 카메라'} 촬영 이미지`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-6 pb-8 text-center">
            <img
              src="/robot.png"
              alt="순찰 대기 중인 로봇"
              className="h-40 w-40 object-contain opacity-90 drop-shadow-[0_14px_24px_rgba(15,23,42,0.14)] xl:h-48 xl:w-48"
            />
            <p className="mt-3 text-[16px] font-black text-slate-500">로봇 순찰 대기 중</p>
            <p className="mt-1 max-w-sm text-[13px] font-bold leading-relaxed text-slate-400">
              현재는 로봇이 순찰을 시작하지 않았습니다. 촬영 이미지가 수신되면 이 영역에 표시됩니다.
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2 bg-white/90 px-4 py-2 backdrop-blur-sm border-2 border-white rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-[13px] font-black text-sky-600">이미지 이력</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent pt-12 pb-5 px-6 flex justify-between items-end">
          <span className="text-[16px] font-black text-white drop-shadow-md truncate max-w-[60%]">
            {hasCameraImage ? latestArrivalPhoto?.address : '영천시 순찰 로봇'}
          </span>
          <span className="text-[14px] font-bold text-white drop-shadow-md shrink-0">
            {hasCameraImage && latestArrivalPhoto ? `${fmtDateTime(latestArrivalPhoto.capturedAt)} 촬영` : '순찰 대기 중'}
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ── 순찰 경로 ── */
export function RouteMapCard({
  patrolRoute,
  compact = false,
}: {
  patrolRoute: PatrolRoute;
  compact?: boolean;
}) {
  const polylinePoints = patrolRoute.points.map((point) => `${point.viewX},${point.viewY}`).join(' ');
  const getLabelPosition = (point: PatrolRoute['points'][number]) => {
    const left = (point.viewX / 480) * 100;
    const top = (point.viewY / 240) * 100;

    if (!compact) {
      return { left: `${left}%`, top: `${top}%` };
    }

    return {
      left: `${Math.min(82, Math.max(16, left))}%`,
      top: `${Math.min(82, Math.max(18, top))}%`,
    };
  };

  return (
    <Card
      title="순찰 경로"
      eyebrow="도로 그래프 연동 준비"
      className={`h-full flex flex-col ${compact ? 'min-h-0' : 'min-h-[340px]'}`}
    >
      <div className={`relative flex-1 min-h-0 bg-sky-50 border-4 border-white overflow-hidden rounded-3xl shadow-sm`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid meet">
          <polyline points={polylinePoints} fill="none" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round"/>
          <polyline
            points={patrolRoute.points.filter((point) => point.isCompleted).map((point) => `${point.viewX},${point.viewY}`).join(' ')}
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {patrolRoute.points.map((point) => (
            <circle
              key={point.pointId}
              cx={point.viewX}
              cy={point.viewY}
              r={point.isArrivalPoint ? 9 : 7}
              fill={point.isCompleted ? '#0EA5E9' : '#FFFFFF'}
              stroke={point.isCompleted ? '#FFFFFF' : '#0EA5E9'}
              strokeWidth="3"
            />
          ))}
        </svg>
        {patrolRoute.points.map((point) => (
          <div
            key={point.pointId}
            className="absolute -translate-x-1/2 text-center pointer-events-none"
            style={getLabelPosition(point)}
          >
            <span className={`inline-block max-w-[92px] overflow-hidden text-ellipsis whitespace-nowrap bg-white border-2 shadow-sm ${
              point.isCompleted ? 'border-sky-100 text-sky-600' : 'border-slate-100 text-slate-500'
            } ${compact ? 'rounded-full px-2 py-1 text-[10px]' : 'rounded-full px-3 py-1.5 text-[12px]'}`}>
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── 촬영 이력 ── */
export function PatrolArrivalPhotosCard({
  arrivalPhotos,
}: {
  arrivalPhotos: PatrolArrivalPhoto[];
}) {
  return (
    <Card title="최근 촬영 이력" eyebrow="빈집 도착 사진 REST 연동 준비">
      <div className="grid gap-4">
        {arrivalPhotos.map((photo) => (
          <article
            key={photo.photoId}
            className="grid gap-4 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr]"
          >
            <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-slate-50 bg-slate-100 text-3xl text-slate-300">
              {photo.imageUrl ? (
                <img src={photo.imageUrl} alt={`${photo.address} 촬영 이미지`} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <span>📷</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="truncate text-[15px] font-black text-slate-700">{photo.address}</h3>
                <span className={`rounded-full px-3 py-1 text-[12px] font-black ${arrivalResultClass(photo.analysisResult)}`}>
                  {photo.analysisResult}
                </span>
              </div>
              <p className="mt-1 text-[13px] font-bold text-slate-400">{fmtDateTime(photo.capturedAt)} 촬영</p>
              <p className="mt-2 text-[13px] font-bold leading-relaxed text-slate-500">{photo.analysisSummary}</p>
              <p className="mt-2 text-[12px] font-bold text-slate-400">
                odom 좌표 x {photo.odomX.toFixed(2)}, y {photo.odomY.toFixed(2)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function activityLogToneClass(tone: RobotActivityLog['tone']) {
  if (tone === 'success') return 'border-emerald-400';
  if (tone === 'warning') return 'border-amber-400';

  return 'border-sky-400';
}

function MockCaptureScene() {
  return (
    <div className="relative h-full min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100">
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-300" />
      <div className="absolute bottom-12 left-10 h-28 w-52 rounded-t-2xl bg-slate-400 shadow-lg">
        <div className="absolute left-8 top-8 h-11 w-12 rounded bg-slate-200 shadow-inner" />
        <div className="absolute bottom-0 right-12 h-16 w-12 rounded-t bg-slate-700" />
      </div>
      <div className="absolute bottom-16 right-10 h-20 w-28 rounded-full bg-emerald-500 blur-[1px]" />
      <div className="absolute bottom-20 right-24 h-24 w-24 rounded-full bg-emerald-400 blur-[1px]" />
      <div className="absolute bottom-3 left-4 rounded-xl bg-slate-900/80 px-3 py-1 text-[12px] font-bold text-white">
        빈집 촬영 이미지
      </div>
    </div>
  );
}

function RobotLiveMap({
  missionTargets,
  selectedTargetIds,
  activePatrolIds,
}: {
  missionTargets: RobotMissionTarget[];
  selectedTargetIds: string[];
  activePatrolIds: string[];
}) {
  const visibleRouteIds = activePatrolIds.length > 0 ? activePatrolIds : selectedTargetIds;
  const visibleRouteTargets = visibleRouteIds
    .map((targetId) => missionTargets.find((target) => target.targetId === targetId))
    .filter((target): target is RobotMissionTarget => target !== undefined);
  const routePoints = visibleRouteTargets.map((target) => `${target.viewX},${target.viewY}`).join(' ');
  const baseRoutePoints = missionTargets.map((target) => `${target.viewX},${target.viewY}`).join(' ');
  const robotTarget = missionTargets.find((target) => target.targetId === (activePatrolIds[0] ?? selectedTargetIds[0] ?? 'H2'));

  return (
    <Card
      title="라이브 맵"
      eyebrow="모의 순찰 경로"
      action={<span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-black text-emerald-600">Live</span>}
      className="min-h-[560px]"
    >
      <div className="relative h-[500px] overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-900 shadow-inner">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="robot-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0L0 0 0 32" fill="none" stroke="#1E293B" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="520" height="300" fill="url(#robot-map-grid)" />
          <polyline points={baseRoutePoints} fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="5 8" opacity="0.55" />
          {visibleRouteTargets.length > 1 && (
            <polyline points={routePoints} fill="none" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {missionTargets.map((target) => {
            const selectedIndex = selectedTargetIds.indexOf(target.targetId);
            const isSelected = selectedIndex >= 0;

            return (
              <g key={target.targetId}>
                <circle
                  cx={target.viewX}
                  cy={target.viewY}
                  r={isSelected ? 9 : 7}
                  fill={isSelected ? '#F59E0B' : '#FFFFFF'}
                  stroke={isSelected ? '#FDE68A' : '#38BDF8'}
                  strokeWidth="3"
                />
                <text x={target.viewX + 10} y={target.viewY + 4} fill="#E0F2FE" fontSize="12" fontWeight="800">
                  {target.label}
                </text>
                {isSelected && (
                  <text x={target.viewX - 4} y={target.viewY + 4} fill="#0F172A" fontSize="10" fontWeight="900">
                    {selectedIndex + 1}
                  </text>
                )}
              </g>
            );
          })}
          {robotTarget && (
            <g>
              <circle cx={robotTarget.viewX} cy={robotTarget.viewY} r="15" fill="#FB7185" opacity="0.25" />
              <circle cx={robotTarget.viewX} cy={robotTarget.viewY} r="8" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="3" />
              <text x={robotTarget.viewX - 3} y={robotTarget.viewY + 4} fill="#FFFFFF" fontSize="10" fontWeight="900">
                R
              </text>
            </g>
          )}
        </svg>
        <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-2 text-[12px] font-black text-slate-600 shadow-sm">
          {visibleRouteIds.length > 0 ? `설정 경로 ${visibleRouteIds.join(' → ')}` : 'H 버튼을 눌러 순찰 경로를 설정하세요'}
        </div>
      </div>
    </Card>
  );
}

function RobotLiveCameraFeed({ latestArrivalPhoto }: { latestArrivalPhoto: PatrolArrivalPhoto | null }) {
  const cameraImageUrl = latestArrivalPhoto?.imageUrl ?? '';

  return (
    <Card
      title="라이브 카메라 피드"
      eyebrow="모의 영상 피드"
      action={<span className="rounded-full bg-rose-100 px-3 py-1 text-[12px] font-black text-rose-600">REC</span>}
    >
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-950 shadow-inner">
        {cameraImageUrl ? (
          <img src={cameraImageUrl} alt={`${latestArrivalPhoto?.address ?? '로봇 카메라'} 영상`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <img src="/robot.png" alt="순찰 로봇 카메라 대기" className="h-28 w-28 object-contain" />
            <p className="mt-2 text-[13px] font-black text-sky-100">실시간 영상 연결 대기 중</p>
            <p className="mt-1 text-[12px] font-bold text-slate-400">순찰 시작 시 모의 피드가 갱신됩니다.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function MissionControl({
  missionTargets,
  selectedTargetIds,
  onToggleTarget,
  onStartPatrol,
  onClearSelection,
}: {
  missionTargets: RobotMissionTarget[];
  selectedTargetIds: string[];
  onToggleTarget: (targetId: string) => void;
  onStartPatrol: () => void;
  onClearSelection: () => void;
}) {
  return (
    <Card title="미션 컨트롤" eyebrow="순찰 경로 설정" className="h-full">
      <div className="grid grid-cols-3 gap-2">
        {missionTargets.map((target) => {
          const selectedIndex = selectedTargetIds.indexOf(target.targetId);
          const isSelected = selectedIndex >= 0;

          return (
            <button
              key={target.targetId}
              type="button"
              onClick={() => onToggleTarget(target.targetId)}
              className={`relative rounded-2xl border-2 px-3 py-3 text-[14px] font-black transition-all ${
                isSelected
                  ? 'border-sky-300 bg-sky-50 text-sky-600 shadow-sm'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-600'
              }`}
            >
              {target.label}
              {isSelected && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] text-white">
                  {selectedIndex + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onStartPatrol}
        disabled={selectedTargetIds.length === 0}
        className="mt-4 w-full rounded-2xl bg-sky-500 px-4 py-3 text-[15px] font-black text-white shadow-[0_6px_16px_rgba(14,165,233,0.25)] transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        선택 경로 설정
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        disabled={selectedTargetIds.length === 0}
        className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-2.5 text-[13px] font-black text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        선택 초기화
      </button>
      <p className="mt-3 text-[12px] font-bold leading-relaxed text-slate-400">
        선택 순서대로 순찰 경로가 설정됩니다.
      </p>
    </Card>
  );
}

function LastCaptureCard({ latestArrivalPhoto }: { latestArrivalPhoto: PatrolArrivalPhoto | null }) {
  return (
    <Card title="최근 촬영" eyebrow="마지막 캡처" className="h-full">
      <div className="overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-100 shadow-inner">
        <div className="h-[180px]">
          {latestArrivalPhoto?.imageUrl ? (
            <img src={latestArrivalPhoto.imageUrl} alt={`${latestArrivalPhoto.address} 최근 촬영`} className="h-full w-full object-cover" />
          ) : (
            <MockCaptureScene />
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] font-bold text-slate-500">
        <span className="truncate">{latestArrivalPhoto?.address ?? '영천시 완산동 123-4'}</span>
        <span className="shrink-0">{latestArrivalPhoto ? fmtDateTime(latestArrivalPhoto.capturedAt) : '모의 캡처'}</span>
      </div>
    </Card>
  );
}

function RobotActivityLogCard({ activityLogs }: { activityLogs: RobotActivityLog[] }) {
  return (
    <Card title="활동 로그" eyebrow="순찰 이벤트 기록">
      <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {activityLogs.map((log) => (
          <article
            key={log.logId}
            className={`rounded-2xl border-l-4 bg-slate-50 px-4 py-3 shadow-sm ${activityLogToneClass(log.tone)}`}
          >
            <p className="text-[13px] font-bold text-slate-600">
              <span className="font-black text-slate-700">[{fmt(log.timestamp)}]</span> {log.message}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

export function RobotControlDashboard({
  missionTargets,
  initialActivityLogs,
  latestArrivalPhoto,
}: {
  missionTargets: RobotMissionTarget[];
  initialActivityLogs: RobotActivityLog[];
  latestArrivalPhoto: PatrolArrivalPhoto | null;
}) {
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(['H1', 'H2']);
  const [activePatrolIds, setActivePatrolIds] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState<RobotActivityLog[]>(initialActivityLogs);

  function handleToggleTarget(targetId: string) {
    setSelectedTargetIds((currentIds) => (
      currentIds.includes(targetId)
        ? currentIds.filter((id) => id !== targetId)
        : [...currentIds, targetId]
    ));
  }

  function handleClearSelection() {
    setSelectedTargetIds([]);
    setActivePatrolIds([]);
  }

  function handleStartPatrol() {
    if (selectedTargetIds.length === 0) return;

    const startedAt = new Date().toISOString();
    const newLogs: RobotActivityLog[] = [
      {
        logId: `LOG-MISSION-${Date.now()}`,
        timestamp: startedAt,
        message: `선택 경로 설정 완료: ${selectedTargetIds.join(' → ')}`,
        tone: 'success',
      },
      {
        logId: `LOG-QUEUE-${Date.now()}`,
        timestamp: startedAt,
        message: '로봇 순찰 대기열에 모의 미션을 등록했습니다.',
        tone: 'info',
      },
    ];

    setActivePatrolIds(selectedTargetIds);
    setActivityLogs((currentLogs) => [...newLogs, ...currentLogs].slice(0, 8));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <RobotLiveMap
        missionTargets={missionTargets}
        selectedTargetIds={selectedTargetIds}
        activePatrolIds={activePatrolIds}
      />

      <div className="grid gap-6">
        <RobotLiveCameraFeed latestArrivalPhoto={latestArrivalPhoto} />
        <div className="grid gap-6 md:grid-cols-2">
          <MissionControl
            missionTargets={missionTargets}
            selectedTargetIds={selectedTargetIds}
            onToggleTarget={handleToggleTarget}
            onStartPatrol={handleStartPatrol}
            onClearSelection={handleClearSelection}
          />
          <LastCaptureCard latestArrivalPhoto={latestArrivalPhoto} />
        </div>
        <RobotActivityLogCard activityLogs={activityLogs} />
      </div>
    </div>
  );
}

/* ── 정비 우선순위 ── */
export function MaintenancePriorityTable({
  maintenancePriorities,
}: {
  maintenancePriorities: MaintenancePrioritySummary;
}) {
  const maxDongCount = Math.max(
    ...maintenancePriorities.administrativeDongRankings.map((item) => item.totalCount),
    1,
  );

  return (
    <Card title="정비 우선순위" eyebrow="빈집점수·등급판정·행정동 분포">
      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="overflow-x-auto rounded-3xl border-4 border-slate-50 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-50 px-5 py-4">
            <div>
              <p className="text-[13px] font-black text-sky-600">빈집점수 TOP 4</p>
              <p className="mt-1 text-[12px] font-bold text-slate-400">영천시 빈집 현황 공공데이터 기준입니다.</p>
            </div>
          </div>
          <table className="w-full min-w-[620px] text-left text-[13px] xl:text-[14px]">
            <thead className="bg-slate-50/50 border-b-2 border-slate-100">
              <tr>
                {['순위', '주소', '행정동', '법정동', '등급', '빈집점수'].map((header, index) => (
                  <th
                    key={header}
                    className={`px-3 py-4 font-black text-slate-500 ${index === 0 ? 'w-16 text-center' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maintenancePriorities.topScoredHouses.map((item) => (
                <tr key={item.houseId} className="border-b-2 border-slate-50 transition-colors last:border-0 hover:bg-slate-50/50">
                  <td className="px-3 py-4 text-center text-[18px] font-black text-amber-500">{item.rank}</td>
                  <td className="px-3 py-4 font-black text-slate-700">{item.address}</td>
                  <td className="px-3 py-4 font-bold text-slate-600">{item.administrativeDong}</td>
                  <td className="px-3 py-4 font-bold text-slate-600">{item.legalDong}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[13px] font-black shadow-sm ${maintenanceGradeClass(item.grade)}`}>
                      {maintenanceGradeLabel(item.grade)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[18px] font-black text-sky-500">{item.vacantHouseScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border-4 border-slate-50 bg-white p-5 shadow-sm">
          <div className="border-b-2 border-slate-50 pb-4">
            <p className="text-[13px] font-black text-sky-600">행정동 빈집 수 TOP 4</p>
            <p className="mt-1 text-[12px] font-bold text-slate-400">영천시 빈집 현황 공공데이터의 행정동별 집계입니다.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {maintenancePriorities.administrativeDongRankings.map((item) => (
              <article key={item.administrativeDong} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-[14px] font-black text-amber-600">
                      {item.rank}
                    </span>
                    <p className="text-[15px] font-black text-slate-700">{item.administrativeDong}</p>
                  </div>
                  <p className="text-[18px] font-black text-sky-500">{item.totalCount}채</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${(item.totalCount / maxDongCount) * 100}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ── 재건축 추천 ── */
export function ReconstructionRecommendCard({
  reconstructionRecommendation,
  vacantHouses,
  selectedHouse,
  isAnalyzing,
  analysisError,
  onSelectHouse,
  onRequestRecommendation,
}: {
  reconstructionRecommendation: ReconstructionRecommendation;
  vacantHouses: VacantHouse[];
  selectedHouse: VacantHouse | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  onSelectHouse: (houseId: string) => void;
  onRequestRecommendation: (addressOverride?: string) => void;
}) {
  const [requestAddressByHouseId, setRequestAddressByHouseId] = useState<Record<string, string>>({});
  const [requestPhotoPreviewUrl, setRequestPhotoPreviewUrl] = useState<string | null>(null);
  const [requestPhotoName, setRequestPhotoName] = useState<string | null>(null);
  const [requestPhotoError, setRequestPhotoError] = useState<string | null>(null);
  const requestAddress = selectedHouse
    ? requestAddressByHouseId[selectedHouse.houseId] ?? selectedHouse.address
    : '';

  useEffect(() => {
    return () => {
      if (requestPhotoPreviewUrl) {
        URL.revokeObjectURL(requestPhotoPreviewUrl);
      }
    };
  }, [requestPhotoPreviewUrl]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setRequestPhotoName(null);
      setRequestPhotoPreviewUrl(null);
      setRequestPhotoError(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setRequestPhotoName(null);
      setRequestPhotoPreviewUrl(null);
      setRequestPhotoError('집 사진은 이미지 파일만 첨부할 수 있습니다.');
      return;
    }

    setRequestPhotoName(file.name);
    setRequestPhotoPreviewUrl(URL.createObjectURL(file));
    setRequestPhotoError(null);
  }

  function handleSubmitRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRequestRecommendation(requestAddress.trim());
  }

  function handleAddressChange(value: string) {
    if (!selectedHouse) return;

    setRequestAddressByHouseId((currentAddresses) => ({
      ...currentAddresses,
      [selectedHouse.houseId]: value,
    }));
  }

  return (
    <Card title="재건축 용도 추천" eyebrow="AI 추천 · 공공데이터 기반">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {vacantHouses.map((house) => {
              const isSelected = house.houseId === selectedHouse?.houseId;

              return (
                <button
                  key={house.houseId}
                  type="button"
                  onClick={() => onSelectHouse(house.houseId)}
                  className={`rounded-3xl border-2 px-5 py-4 text-left shadow-sm transition-all ${
                    isSelected
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-white bg-slate-50 hover:border-sky-100 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-black text-slate-700">{house.address}</p>
                      <p className="mt-1 text-[12px] font-bold text-slate-400">
                        지번 {house.parcelCode.bun}-{house.parcelCode.ji}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-black ${
                      house.riskLevel === '위험'
                        ? 'bg-rose-100 text-rose-600'
                        : house.riskLevel === '주의'
                          ? 'bg-amber-100 text-amber-700'
                          : house.riskLevel === '관심'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {house.riskLevel}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: '우선순위', value: `${house.priorityRank}위` },
                      { label: '총점', value: `${house.totalScore}점` },
                      { label: '노후도', value: `${house.oldness}` },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white/80 px-2 py-2">
                        <p className="text-[11px] font-bold text-slate-400">{item.label}</p>
                        <p className="mt-0.5 text-[13px] font-black text-slate-700">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedHouse && (
            <form className="rounded-3xl border-2 border-white bg-white/80 p-5 shadow-sm" onSubmit={handleSubmitRecommendation}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-black text-sky-600">AI 추천 요청</p>
                  <p className="mt-1 text-[12px] font-bold text-slate-400">
                    집 사진과 주소를 입력해 추천 분석을 요청합니다.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="recommendation-house-photo" className="text-[12px] font-black text-slate-500">
                  집 사진
                </label>
                <label
                  htmlFor="recommendation-house-photo"
                  className="mt-2 flex min-h-[170px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/70 text-center transition-colors hover:border-sky-300 hover:bg-sky-50"
                >
                  {requestPhotoPreviewUrl ? (
                    <img src={requestPhotoPreviewUrl} alt="AI 추천 요청 집 사진 미리보기" className="h-full w-full object-cover" />
                  ) : (
                    <div className="px-5 py-8">
                      <p className="text-[30px]">🏠</p>
                      <p className="mt-2 text-[14px] font-black text-slate-600">집 사진 선택</p>
                      <p className="mt-1 text-[12px] font-bold text-slate-400">JPG, PNG 등 이미지 파일을 첨부할 수 있습니다.</p>
                    </div>
                  )}
                </label>
                <input
                  id="recommendation-house-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                {requestPhotoName && (
                  <p className="mt-2 truncate text-[12px] font-bold text-slate-500">첨부 파일: {requestPhotoName}</p>
                )}
                {requestPhotoError && (
                  <p className="mt-2 rounded-2xl bg-rose-50 px-4 py-2 text-[12px] font-bold text-rose-600">
                    {requestPhotoError}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="recommendation-address" className="text-[12px] font-black text-slate-500">
                  주소
                </label>
                <input
                  id="recommendation-address"
                  type="text"
                  value={requestAddress}
                  onChange={(event) => handleAddressChange(event.target.value)}
                  placeholder="예: 영천시 완산동 123-4"
                  className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-[14px] font-bold text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-sky-300"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="mt-4 w-full rounded-2xl bg-sky-500 px-5 py-3 text-[15px] font-black text-white shadow-[0_4px_12px_rgba(14,165,233,0.3)] transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isAnalyzing ? 'AI 추천 분석 중' : 'AI 추천 요청'}
              </button>
              {analysisError && (
                <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-600">
                  {analysisError}
                </p>
              )}
            </form>
          )}
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {l:'추천 용도',v:reconstructionRecommendation.recommendedUse},
              {l:'건축 규모',v:reconstructionRecommendation.buildingScale},
              {l:'예상 비용',v:reconstructionRecommendation.expectedCost},
              {l:'기대 효과',v:reconstructionRecommendation.expectedReturn},
            ].map((x)=>(
              <div key={x.l} className="bg-slate-50 px-5 py-4 rounded-3xl border-2 border-white shadow-sm">
                <p className="text-[13px] font-bold text-slate-500">{x.l}</p>
                <p className="mt-1 text-[17px] font-black text-slate-700">{x.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-sky-50 border-2 border-white p-6 rounded-3xl shadow-sm">
            <p className="text-[15px] font-black text-sky-700 mb-2">분석 의견</p>
            <p className="text-[15px] leading-relaxed text-slate-600 font-bold">
              {reconstructionRecommendation.reason}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
/* ── 최근 알림 ── */
export function RecentAlertsCard({ recentEvents }: { recentEvents: RecentEvent[] }) {
  return (
    <Card title="최근 알림" eyebrow="관제 이벤트 로그" className="h-full flex flex-col">
      <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-1">
        {recentEvents.slice(0, 3).map((e) => (
          <article key={e.eventId} className="flex gap-3 bg-white border-2 border-slate-100 p-3 xl:p-4 hover:border-sky-200 cursor-pointer rounded-2xl transition-colors shadow-sm shrink-0">
            <div className={`mt-1 w-2.5 h-2.5 flex-shrink-0 rounded-full shadow-sm ${e.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 mb-1">
                <h3 className="text-[14px] xl:text-[15px] font-black text-slate-700 truncate">{e.title}</h3>
              </div>
              <p className="text-[12px] xl:text-[13px] font-bold text-slate-500 truncate">{e.location}</p>
              <p className="text-[11px] xl:text-[12px] font-bold text-slate-400 mt-1">{fmt(e.detectedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function formatPublicDataDate(value: string) {
  if (value.length !== 8) return value;

  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

type MissingPersonSortOrder = 'latest' | 'oldest';

function getPublicDataDateValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getMissingPersonCity(address: string) {
  const tokens = address.split(/\s+/).filter(Boolean);
  const cityOrCounty = tokens.find((token, index) => index > 0 && (token.endsWith('시') || token.endsWith('군')))
    ?? tokens.find((token) => token.endsWith('시') || token.endsWith('군'));

  return cityOrCounty ?? '지역 미분류';
}

function missingLogStatusClass(status: MissingPersonDetectionLog['status']) {
  if (status === '담당자 확인 필요') return 'bg-rose-100 text-rose-600';
  if (status === '확인중') return 'bg-amber-100 text-amber-700';

  return 'bg-emerald-100 text-emerald-700';
}

function MissingPersonModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-6 py-8 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border-4 border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] custom-scrollbar">
        <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-slate-100 pb-4">
          <div>
            <p className="text-[13px] font-black text-sky-600">{eyebrow}</p>
            <h3 className="mt-1 text-[24px] font-black text-slate-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-slate-100 bg-slate-50 px-4 py-2 text-[13px] font-black text-slate-500 transition-colors hover:bg-slate-100"
          >
            닫기
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function MissingPersonProfileModal({
  profile,
  onClose,
}: {
  profile: MissingPersonPublicProfile;
  onClose: () => void;
}) {
  const detailItems = [
    { label: '이름', value: profile.nm },
    { label: '성별', value: profile.sexdstnDscd },
    { label: '현재 나이', value: `${profile.ageNow}세` },
    { label: '실종 당시 나이', value: `${profile.age}세` },
    { label: '국적', value: profile.nltyDscd },
    { label: '발생일', value: formatPublicDataDate(profile.occrde) },
    { label: '발생지역', value: profile.occrAdres },
    { label: '착의사항', value: profile.alldressingDscd ?? '공공데이터 미제공' },
    { label: '신장', value: `${profile.height}cm` },
    { label: '체중', value: `${profile.bdwgh}kg` },
    { label: '체형', value: profile.frmDscd },
    { label: '얼굴형', value: profile.faceshpeDscd },
    { label: '머리형태', value: profile.hairshpeDscd },
    { label: '머리색', value: profile.haircolrDscd },
    { label: '작성대상코드', value: profile.writngTrgetDscd },
    { label: '공공데이터 순번', value: `rnum ${profile.rnum}` },
  ];

  return (
    <MissingPersonModalShell title="실종자 상세 내역" eyebrow="영천시 실종경보 공공데이터" onClose={onClose}>
      <div className="rounded-3xl border-4 border-slate-50 bg-slate-50 p-6 shadow-inner">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h4 className="text-[28px] font-black text-slate-800">{profile.nm}</h4>
            <p className="mt-2 text-[15px] font-bold text-slate-500">
              {profile.sexdstnDscd} · 현재 {profile.ageNow}세 · {profile.nltyDscd}
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-[13px] font-black text-slate-500 shadow-sm">
            {formatPublicDataDate(profile.occrde)} 발생
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {detailItems.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[12px] font-bold text-slate-400">{item.label}</p>
              <p className="mt-1 break-keep text-[14px] font-black text-slate-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </MissingPersonModalShell>
  );
}

function MissingDetectionLogModal({
  log,
  onClose,
}: {
  log: MissingPersonDetectionLog;
  onClose: () => void;
}) {
  return (
    <MissingPersonModalShell title="실종자 후보 상세" eyebrow="로봇 발견 로그 상세" onClose={onClose}>
      <div className="grid gap-6">
        <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-rose-50 p-8 shadow-sm">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-200 opacity-50 blur-3xl" />
          <span className="relative rounded-full bg-rose-500 px-4 py-2 text-[13px] font-black text-white shadow-sm">
            긴급 확인 요망
          </span>
          <h2 className="relative mt-5 text-[26px] font-black text-rose-600">담당자 현장 확인 필요</h2>
          <p className="relative mt-4 text-[16px] font-bold leading-relaxed text-slate-700">
            {log.description}
          </p>
          <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: '유사도', value: `${log.similarity}%` },
              { label: '탐지 시각', value: fmt(log.detectedAt) },
              { label: '발견 위치', value: log.location },
              { label: '로봇 카메라', value: `${log.robotId} · ${log.cameraLabel}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                <p className="text-[13px] font-bold text-slate-400">{item.label}</p>
                <p className="mt-1 text-[16px] font-black text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border-2 border-white bg-slate-50 p-5 shadow-sm">
            <p className="text-[14px] font-black text-sky-600">탐지 후보 정보</p>
            <div className="mt-4 grid gap-3 text-[13px] font-bold text-slate-600">
              <div className="flex justify-between gap-3"><span className="text-slate-400">후보명</span><span>{log.candidateName}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-400">성별</span><span>{log.candidateGender}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-400">연령대</span><span>{log.candidateAgeLabel}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-400">상태</span><span>{log.status}</span></div>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-white bg-slate-50 p-5 shadow-sm">
            <p className="text-[14px] font-black text-sky-600">탐지 근거</p>
            <p className="mt-4 text-[14px] font-bold leading-relaxed text-slate-600">
              {log.evidenceSummary}
            </p>
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-[12px] font-bold leading-relaxed text-slate-400">
              발견 로그는 로봇 탐지 이벤트이며, 실종자 리스트와 자동으로 동일 인물 확정 처리하지 않습니다.
            </p>
          </div>
        </div>

        <div>
          <button type="button" className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[15px] font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
            담당자 검토 표시
          </button>
        </div>
      </div>
    </MissingPersonModalShell>
  );
}

function MissingPersonPhotoSlot({
  photoUrl,
}: {
  photoUrl?: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowPhoto = Boolean(photoUrl) && !hasImageError;

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-white bg-white shadow-sm">
      {shouldShowPhoto ? (
        <img
          src={photoUrl ?? ''}
          alt="실종자 후보 사진"
          loading="lazy"
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-center">
          <span className="text-[24px] text-slate-300">사진</span>
          <span className="mt-1 text-[10px] font-black text-slate-400">미제공</span>
        </div>
      )}
    </div>
  );
}

/* ── 실종자 상세 ── */
export function MissingPersonDetailCard({
  missingPersonProfiles,
  detectionLogs,
  selectedLogId,
  onSelectLog,
  onCloseLog,
  selectedProfileId,
  onSelectProfile,
  onCloseProfile,
}: {
  missingPersonProfiles: MissingPersonPublicProfile[];
  detectionLogs: MissingPersonDetectionLog[];
  selectedLogId: string | null;
  onSelectLog: (logId: string) => void;
  onCloseLog: () => void;
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  onCloseProfile: () => void;
}) {
  const selectedLog = detectionLogs.find((log) => log.logId === selectedLogId) ?? null;
  const selectedProfile = missingPersonProfiles.find((profile) => profile.profileId === selectedProfileId) ?? null;
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [selectedProfileCity, setSelectedProfileCity] = useState('전체');
  const [profileSortOrder, setProfileSortOrder] = useState<MissingPersonSortOrder>('latest');
  const normalizedProfileSearchQuery = profileSearchQuery.trim().toLocaleLowerCase('ko-KR');
  const cityOptions = Array.from(
    new Set(missingPersonProfiles.map((profile) => getMissingPersonCity(profile.occrAdres))),
  ).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  const filteredProfiles = missingPersonProfiles
    .filter((profile) => {
      if (!normalizedProfileSearchQuery) return true;

      return profile.nm.toLocaleLowerCase('ko-KR').includes(normalizedProfileSearchQuery);
    })
    .filter((profile) => selectedProfileCity === '전체' || getMissingPersonCity(profile.occrAdres) === selectedProfileCity)
    .sort((a, b) => {
      const order = getPublicDataDateValue(b.occrde) - getPublicDataDateValue(a.occrde);
      const sortedOrder = profileSortOrder === 'latest' ? order : -order;

      return sortedOrder || a.rnum - b.rnum;
    });

  return (
    <div className="grid gap-6">
      <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card title="실종자 리스트" eyebrow="경찰청 실종경보 공공데이터 기반 · 경북 시군 필터">
          <div className="mb-4 grid gap-3 rounded-3xl bg-slate-50/80 p-4 md:grid-cols-2 2xl:grid-cols-3">
            <label className="grid min-w-0 gap-2">
              <span className="text-[12px] font-black text-slate-500">이름 검색</span>
              <input
                type="search"
                value={profileSearchQuery}
                onChange={(event) => setProfileSearchQuery(event.target.value)}
                placeholder="이름을 입력하세요"
                className="h-11 w-full min-w-0 rounded-2xl border-2 border-white bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-300 focus:border-sky-200"
              />
            </label>

            <label className="grid min-w-0 gap-2">
              <span className="text-[12px] font-black text-slate-500">시/군 선택</span>
              <select
                value={selectedProfileCity}
                onChange={(event) => setSelectedProfileCity(event.target.value)}
                className="h-11 w-full min-w-0 rounded-2xl border-2 border-white bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-colors focus:border-sky-200"
              >
                <option value="전체">경북 전체</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-2">
              <span className="text-[12px] font-black text-slate-500">발생일 정렬</span>
              <select
                value={profileSortOrder}
                onChange={(event) => setProfileSortOrder(event.target.value as MissingPersonSortOrder)}
                className="h-11 w-full min-w-0 rounded-2xl border-2 border-white bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-colors focus:border-sky-200"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </label>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-black text-slate-400">
              검색 결과 {filteredProfiles.length}명
            </p>
            <p className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-600">
              {selectedProfileCity === '전체' ? '경북 전체' : selectedProfileCity}
            </p>
          </div>

          <div className="grid gap-3">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <button
                  key={profile.profileId}
                  type="button"
                  onClick={() => onSelectProfile(profile.profileId)}
                  className="grid w-full gap-4 rounded-3xl border-2 border-white bg-slate-50 p-4 text-left shadow-sm transition-colors hover:border-sky-100 hover:bg-white sm:grid-cols-[96px_1fr]"
                >
                  <MissingPersonPhotoSlot photoUrl={profile.photoUrl} />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-black text-slate-700">{profile.nm}</p>
                        <p className="mt-1 text-[12px] font-bold text-slate-400">
                          {profile.sexdstnDscd} · 현재 {profile.ageNow}세 · {profile.nltyDscd}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-500 shadow-sm">
                        rnum {profile.rnum}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-[12px] font-bold text-slate-500 sm:grid-cols-2">
                      <span>발생일 {formatPublicDataDate(profile.occrde)}</span>
                      <span className="truncate">발생지역 {profile.occrAdres}</span>
                      <span>신장 {profile.height}cm</span>
                      <span>체형 {profile.frmDscd}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-3xl bg-slate-50 px-5 py-8 text-center text-[13px] font-bold text-slate-400">
                조건에 맞는 실종자 정보가 없습니다.
              </div>
            )}
          </div>
        </Card>

        <Card title="발견 로그" eyebrow="로봇 탐지 이벤트">
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {detectionLogs.map((log) => {
              const isSelected = log.logId === selectedLogId;

              return (
                <button
                  key={log.logId}
                  type="button"
                  onClick={() => onSelectLog(log.logId)}
                  className={`w-full rounded-3xl border-2 p-4 text-left shadow-sm transition-all ${
                    isSelected
                      ? 'border-rose-200 bg-white'
                      : 'border-white bg-slate-50 hover:border-rose-100 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-slate-700">
                        {log.candidateName} 탐지 로그
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-slate-400">
                        {fmtDateTime(log.detectedAt)} · {log.robotId} · {log.cameraLabel}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${missingLogStatusClass(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                    <span className="truncate text-[12px] font-bold text-slate-500">{log.location}</span>
                    <span className="shrink-0 text-[15px] font-black text-rose-500">{log.similarity}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {selectedLog && <MissingDetectionLogModal log={selectedLog} onClose={onCloseLog} />}
      {selectedProfile && <MissingPersonProfileModal profile={selectedProfile} onClose={onCloseProfile} />}
    </div>
  );
}
