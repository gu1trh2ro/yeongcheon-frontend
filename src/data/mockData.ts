import type {
  DashboardSummary,
  MaintenancePriority,
  MissingPersonAlert,
  RecentEvent,
  ReconstructionRecommendation,
  RobotStatus,
  VacantHouse,
} from '../types/dashboard';

export const dashboardSummary: DashboardSummary = {
  vacantHouseCount: 147,
  maintenanceRate: 32,
  activeRobotCount: 3,
  todayPatrolDistance: 28.5,
  todayAnomalyCount: 7,
};

export const robotStatus: RobotStatus = {
  robotId: 'YC-ROBOT-01',
  battery: 78,
  status: '운행 중',
  currentLocation: '영천시 완산동 123-4 인근',
  nextDestination: '완산동 125-6 위험 빈집',
  connectionStatus: '연결 안정',
  latestImageUrl: undefined,
  lastUpdatedAt: '2026-05-10T14:30:00',
};

export const vacantHouses: VacantHouse[] = [
  {
    houseId: 'H-001',
    address: '영천시 완산동 123-4',
    lat: 35.9736,
    lng: 128.9387,
    riskLevel: '위험',
    priorityRank: 1,
    oldness: 92,
    accessibility: 85,
    populationDensity: 78,
    totalScore: 91,
  },
  {
    houseId: 'H-002',
    address: '영천시 도림동 456-7',
    lat: 35.9688,
    lng: 128.9301,
    riskLevel: '주의',
    priorityRank: 2,
    oldness: 81,
    accessibility: 70,
    populationDensity: 65,
    totalScore: 82,
  },
  {
    houseId: 'H-003',
    address: '영천시 금호읍 789-1',
    lat: 35.9332,
    lng: 128.8796,
    riskLevel: '관심',
    priorityRank: 3,
    oldness: 67,
    accessibility: 77,
    populationDensity: 58,
    totalScore: 74,
  },
  {
    houseId: 'H-004',
    address: '영천시 중앙동 234-5',
    lat: 35.9634,
    lng: 128.9362,
    riskLevel: '정비완료',
    priorityRank: 8,
    oldness: 34,
    accessibility: 88,
    populationDensity: 72,
    totalScore: 48,
  },
  {
    houseId: 'H-005',
    address: '영천시 화북면 567-8',
    lat: 36.1052,
    lng: 128.9151,
    riskLevel: '주의',
    priorityRank: 4,
    oldness: 79,
    accessibility: 52,
    populationDensity: 41,
    totalScore: 71,
  },
];

export const maintenancePriorities: MaintenancePriority[] = vacantHouses
  .filter((house) => house.riskLevel !== '정비완료')
  .map((house) => ({
    rank: house.priorityRank,
    houseId: house.houseId,
    address: house.address,
    riskLevel: house.riskLevel,
    oldness: house.oldness,
    accessibility: house.accessibility,
    populationDensity: house.populationDensity,
    totalScore: house.totalScore,
    reason:
      house.riskLevel === '위험'
        ? '노후도와 인구 밀집 영향이 높아 우선 현장 확인이 필요합니다.'
        : '접근성과 주변 생활권 데이터를 함께 고려한 정비 후보지입니다.',
  }))
  .sort((a, b) => a.rank - b.rank);

export const reconstructionRecommendation: ReconstructionRecommendation = {
  houseId: 'H-001',
  recommendedUse: '생활안전 거점 + 소규모 커뮤니티 공간',
  buildingScale: '지상 2층, 연면적 180㎡ 내외',
  expectedCost: '약 3.2억 원',
  expectedReturn: '공공안전 개선 및 생활권 회복',
  feasibility: '높음',
  reason:
    '완산동 생활권과 접근성이 좋고 위험도 점수가 높아 정비 효과가 큽니다. 공공데이터 기반으로 안전 거점과 주민 이용 시설을 결합하는 방향이 적합합니다.',
};

export const missingPersonAlert: MissingPersonAlert = {
  eventId: 'E-001',
  title: '실종자 후보 이벤트 발생',
  detectedAt: '2026-05-10T14:30:00',
  location: '영천시 완산동 123-4 인근',
  similarity: 82,
  description:
    'AI/YOLO 기반 탐지 결과 실종자 후보로 분류된 이벤트입니다. 담당자 확인 필요 상태이며 신고 초안 생성이 가능합니다.',
  status: '담당자 확인 필요',
};

export const recentEvents: RecentEvent[] = [
  {
    eventId: 'E-001',
    type: 'MISSING_PERSON_CANDIDATE',
    title: '실종자 후보 발견',
    location: '완산동 123-4 인근',
    detectedAt: '2026-05-10T14:30:00',
    status: '미확인',
    severity: 'HIGH',
    description: 'AI/YOLO 기반 탐지 후 담당자 확인 필요 상태입니다.',
  },
  {
    eventId: 'E-002',
    type: 'VACANT_HOUSE_ANOMALY',
    title: '빈집 이상 징후 탐지',
    location: '도림동 456-7',
    detectedAt: '2026-05-10T13:20:00',
    status: '확인중',
    severity: 'MEDIUM',
    description: '파손 가능성이 있는 외벽 영역이 탐지되었습니다.',
  },
  {
    eventId: 'E-003',
    type: 'ROBOT_STATUS',
    title: '자율주행 로봇 배터리 점검',
    location: '금호읍 순찰 구간',
    detectedAt: '2026-05-10T12:45:00',
    status: '확인중',
    severity: 'LOW',
    description: '배터리 30% 이하 도달 전 충전 경로를 확인했습니다.',
  },
  {
    eventId: 'E-004',
    type: 'PATROL_COMPLETE',
    title: '완산동 순찰 완료',
    location: '완산동 2구역',
    detectedAt: '2026-05-10T11:40:00',
    status: '처리완료',
    severity: 'LOW',
    description: '계획된 순찰 경로를 정상 완료했습니다.',
  },
  {
    eventId: 'E-005',
    type: 'MAINTENANCE_RECOMMENDATION',
    title: 'AI 정비 우선순위 갱신',
    location: '영천시 전체',
    detectedAt: '2026-05-10T10:10:00',
    status: '처리완료',
    severity: 'MEDIUM',
    description: '공공데이터 기반 우선순위 점수가 갱신되었습니다.',
  },
];
