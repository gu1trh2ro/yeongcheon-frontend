import Badge from '../common/Badge';
import Card from '../common/Card';
import ProgressBar, { CircularGauge } from '../common/ProgressBar';
import {
  dashboardSummary, maintenancePriorities, missingPersonAlert,
  recentEvents, reconstructionRecommendation, robotStatus, vacantHouses,
} from '../../data/mockData';

const markerPos = [
  { left: '22%', top: '32%' }, { left: '50%', top: '55%' },
  { left: '68%', top: '28%' }, { left: '76%', top: '65%' }, { left: '34%', top: '70%' },
];

function fmt(v: string) {
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(v));
}

function Info({ label, value, highlight }: { label: string; value: string, highlight?: boolean }) {
  return (
    <div className="flex justify-between py-3 border-b-2 border-slate-50 last:border-0 text-[15px]">
      <span className="text-slate-500 font-bold">{label}</span>
      <span className={`font-black ${highlight ? 'text-sky-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

/* ── 요약 통계 ── */
export function SummaryStatCards() {
  const items = [
    { label: '전체 빈집', val: dashboardSummary.vacantHouseCount.toLocaleString(), unit: '호', color: 'text-slate-700' },
    { label: '정비 완료율', val: dashboardSummary.maintenanceRate, unit: '%', color: 'text-emerald-500' },
    { label: '운행 중 로봇', val: dashboardSummary.activeRobotCount, unit: '대', color: 'text-sky-500' },
    { label: '오늘 순찰 거리', val: dashboardSummary.todayPatrolDistance, unit: 'km', color: 'text-slate-700' },
    { label: '오늘 이상 탐지', val: dashboardSummary.todayAnomalyCount, unit: '건', color: 'text-rose-500' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((s) => (
        <Card key={s.label}>
          <p className="text-[14px] font-bold text-slate-500">{s.label}</p>
          <p className={`mt-2 text-[32px] font-black tabular-nums tracking-tight ${s.color}`}>
            {s.val}<span className="ml-1 text-[16px] font-bold text-slate-400">{s.unit}</span>
          </p>
        </Card>
      ))}
    </div>
  );
}

/* ── 빈집 지도 ── */
export function VacantHouseMap() {
  return (
    <Card title="영천시 빈집 분포 현황" eyebrow="공공데이터 기반">
      <div className="relative h-[380px] rounded-3xl border-4 border-slate-50 bg-slate-100/50 overflow-hidden shadow-inner">
        {/* 그리드 */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>

        {/* 라벨 */}
        <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-md border-2 border-amber-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <p className="text-[13px] font-black text-amber-500 tracking-wide flex items-center gap-1">⭐ 별의 도시 영천</p>
          <p className="text-[16px] font-black text-slate-700 mt-1">빈집 위치 현황</p>
        </div>

        {/* 마커 */}
        {vacantHouses.map((h, i) => (
          <div key={h.houseId} className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={markerPos[i]} title={h.address}>
            <span className={`block w-5 h-5 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${h.riskLevel === '위험' ? 'bg-rose-400' : 'bg-amber-400'}`} />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-slate-800 text-white rounded-xl px-3 py-1.5 text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              {h.address.replace('영천시 ', '')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── 로봇 상태 ── */
export function RobotStatusSummary() {
  return (
    <Card title="로봇 상태" eyebrow="자율주행 순찰">
      <div className="flex gap-6 items-center">
        <div className="bg-sky-50 border-4 border-white rounded-3xl p-5 shadow-sm">
          <CircularGauge value={robotStatus.battery} tone="sky" label="배터리" size={80} />
        </div>
        <div className="flex-1">
          <Info label="로봇 ID" value={robotStatus.robotId} />
          <Info label="상태" value={robotStatus.status} highlight />
          <Info label="현재 위치" value={robotStatus.currentLocation} />
          <Info label="다음 목적지" value={robotStatus.nextDestination} />
        </div>
      </div>
    </Card>
  );
}

/* ── 실종자 요약 ── */
export function MissingPersonSummary() {
  return (
    <Card>
      <div className="flex items-start justify-between border-b-2 border-slate-50 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 font-black text-[12px] rounded-full mb-2">긴급 확인 요망</span>
          <h3 className="text-[18px] font-black text-slate-800">{missingPersonAlert.title}</h3>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="bg-rose-50 rounded-2xl px-5 py-4 border-2 border-white shadow-sm">
          <p className="text-[14px] font-bold text-rose-400">유사도</p>
          <p className="mt-1 text-[26px] font-black text-rose-500">{missingPersonAlert.similarity}%</p>
        </div>
        <div className="bg-slate-50 rounded-2xl px-5 py-4 border-2 border-white shadow-sm">
          <p className="text-[14px] font-bold text-slate-500">탐지 시각</p>
          <p className="mt-1 text-[22px] font-black text-slate-700 tracking-tight">{fmt(missingPersonAlert.detectedAt)}</p>
        </div>
      </div>
    </Card>
  );
}

/* ── AI 이상 탐지 ── */
export function AiAnomalySummary() {
  return (
    <Card title="AI 이상 탐지 요약" eyebrow="공공데이터 기반 분석">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-amber-50 border-2 border-white p-5 rounded-3xl shadow-sm">
          <p className="text-[16px] font-black text-slate-800 mb-2 flex items-center gap-2">
            <span className="text-amber-500">💡</span> 완산동 123-4 외벽 파손 가능성
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600 font-bold">
            순찰 이미지와 노후도 데이터를 함께 분석해 현장 확인 우선순위를 높게 산정했습니다.
          </p>
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
export function RobotVideoCard() {
  return (
    <Card title="실시간 카메라" eyebrow="로봇 영상 피드">
      <div className="relative h-[400px] bg-slate-100 border-4 border-slate-50 flex flex-col items-center justify-center rounded-3xl overflow-hidden shadow-inner">
        <span className="text-5xl mb-4 grayscale opacity-30">🤖</span>
        <p className="text-[16px] font-black text-slate-400">카메라 연결 대기 중...</p>
        
        <div className="absolute left-4 top-4 flex items-center gap-2 bg-white/90 px-4 py-2 backdrop-blur-sm border-2 border-white rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[13px] font-black text-rose-500 tracking-widest">LIVE</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent pt-12 pb-5 px-6 flex justify-between items-end">
          <span className="text-[16px] font-black text-white drop-shadow-md">{robotStatus.robotId}</span>
          <span className="text-[14px] font-bold text-white drop-shadow-md">영천시 완산동 순찰 경로</span>
        </div>
      </div>
    </Card>
  );
}

/* ── 순찰 경로 ── */
export function RouteMapCard() {
  return (
    <Card title="순찰 경로" eyebrow="자율주행 경로 현황">
      <div className="relative h-[240px] bg-sky-50 border-4 border-white overflow-hidden rounded-3xl shadow-sm">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 240">
          <polyline points="55,180 200,110" fill="none" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round"/>
          <polyline points="200,110 360,60 440,100" fill="none" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round"/>
          {[{x:55,y:180,c:'#0EA5E9'},{x:200,y:110,c:'#FFFFFF'},{x:360,y:60,c:'#FFFFFF'}].map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r="8" fill={p.c} stroke="#0EA5E9" strokeWidth="3" />
          ))}
        </svg>
        {[{l:'출발지',x:'11%',y:'82%'},{l:'현재위치',x:'42%',y:'53%'},{l:'다음목적지',x:'75%',y:'31%'}].map((p) => (
          <div key={p.l} className="absolute -translate-x-1/2 text-center" style={{left:p.x,top:p.y}}>
            <span className="bg-white text-sky-600 border-2 border-sky-100 px-3 py-1.5 text-[12px] font-black rounded-full shadow-sm">{p.l}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── 정비 우선순위 ── */
export function MaintenancePriorityTable() {
  return (
    <Card title="정비 우선순위" eyebrow="위험도·노후도·생활권 분석">
      <div className="overflow-x-auto border-4 border-slate-50 rounded-3xl bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-[15px]">
          <thead className="bg-slate-50/50 border-b-2 border-slate-100">
            <tr>
              {['순위','주소','위험도','노후도','접근성','인구밀도','총점수'].map((h, i)=>(
                <th key={h} className={`py-4 px-5 font-black text-slate-500 ${i===0?'w-20 text-center':''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {maintenancePriorities.map((m) => (
              <tr key={m.houseId} className="border-b-2 border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-5 font-black text-center text-[18px] text-amber-500">{m.rank}</td>
                <td className="py-4 px-5 font-black text-slate-700">{m.address}</td>
                <td className="py-4 px-5"><span className={`px-3 py-1.5 rounded-full text-[13px] font-black shadow-sm ${m.riskLevel === '위험' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{m.riskLevel}</span></td>
                <td className="py-4 px-5 text-slate-600 font-bold">{m.oldness}</td>
                <td className="py-4 px-5 text-slate-600 font-bold">{m.accessibility}</td>
                <td className="py-4 px-5 text-slate-600 font-bold">{m.populationDensity}</td>
                <td className="py-4 px-5 font-black text-sky-500 text-[18px]">{m.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── 재건축 추천 ── */
export function ReconstructionRecommendCard() {
  return (
    <Card title="재건축 용도 추천" eyebrow="AI 추천 · 공공데이터 기반">
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
    </Card>
  );
}

/* ── 최근 알림 ── */
export function RecentAlertsCard() {
  return (
    <Card title="최근 알림" eyebrow="관제 이벤트 로그">
      <div className="grid gap-4 md:grid-cols-2">
        {recentEvents.slice(0, 4).map((e) => (
          <article key={e.eventId} className="flex gap-4 bg-white border-2 border-slate-100 p-5 hover:border-sky-200 cursor-pointer rounded-3xl transition-colors shadow-sm">
            <div className={`mt-1.5 w-3 h-3 flex-shrink-0 rounded-full shadow-sm ${e.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'}`} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-[16px] font-black text-slate-700">{e.title}</h3>
              </div>
              <p className="text-[14px] font-bold text-slate-500">{e.location}</p>
              <p className="text-[13px] font-bold text-slate-400 mt-2">{fmt(e.detectedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

/* ── 실종자 상세 ── */
export function MissingPersonDetailCard() {
  return (
    <Card title="실종자 후보 이벤트" eyebrow="담당자 확인 필요">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border-4 border-white bg-rose-50 p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200 rounded-full blur-3xl opacity-50 -z-10" />
          <span className="px-3 py-1.5 bg-rose-500 text-white text-[13px] font-black rounded-full shadow-sm">긴급 확인 요망</span>
          <h2 className="mt-4 text-[24px] font-black text-rose-600">담당자 현장 확인 필요</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700 font-bold">{missingPersonAlert.description}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              {l:'유사도',v:`${missingPersonAlert.similarity}%`},
              {l:'탐지 시각',v:fmt(missingPersonAlert.detectedAt)},
              {l:'발견 위치',v:missingPersonAlert.location},
            ].map((x)=>(
              <div key={x.l} className="bg-white px-5 py-4 rounded-2xl shadow-sm">
                <p className="text-[13px] font-bold text-slate-400">{x.l}</p>
                <p className="mt-1 text-[16px] font-black text-slate-700">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between bg-slate-50 p-8 rounded-3xl shadow-inner border-2 border-white">
          <div>
            <p className="text-[18px] font-black text-slate-700 flex items-center gap-2">
              <span className="text-sky-500">🛠️</span> 담당자 조치 메뉴
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-500 font-bold">
              모의 시스템으로 실제 경찰서 등과 연계되지 않습니다. 후보자 식별 정보는 시연 용도로 블라인드 처리되었습니다.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-8">
            <button type="button" className="w-full bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)] px-5 py-4 text-[16px] font-black hover:bg-rose-600 rounded-2xl text-center transition-all">
              수동 신고 접수
            </button>
            <button type="button" className="w-full bg-white border-2 border-slate-200 text-slate-600 shadow-sm px-5 py-4 text-[16px] font-black hover:bg-slate-100 hover:border-slate-300 rounded-2xl text-center transition-colors">
              분석 로그 확인
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
