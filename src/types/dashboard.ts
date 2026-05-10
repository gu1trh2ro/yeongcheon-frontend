export type RiskLevel = '위험' | '주의' | '관심' | '정비완료';

export type RobotOperationStatus = '운행 중' | '대기 중' | '충전 중' | '오류';

export type EventStatus = '미확인' | '확인중' | '처리완료';

export type EventSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType =
  | 'MISSING_PERSON_CANDIDATE'
  | 'VACANT_HOUSE_ANOMALY'
  | 'ROBOT_STATUS'
  | 'PATROL_COMPLETE'
  | 'MAINTENANCE_RECOMMENDATION';

export interface DashboardSummary {
  vacantHouseCount: number;
  maintenanceRate: number;
  activeRobotCount: number;
  todayPatrolDistance: number;
  todayAnomalyCount: number;
}

export interface RobotStatus {
  robotId: string;
  battery: number;
  status: RobotOperationStatus;
  currentLocation: string;
  nextDestination: string;
  connectionStatus: '연결 안정' | '신호 점검' | '연결 끊김';
  latestImageUrl?: string;
  lastUpdatedAt: string;
}

export interface VacantHouse {
  houseId: string;
  address: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  priorityRank: number;
  oldness: number;
  accessibility: number;
  populationDensity: number;
  totalScore: number;
}

export interface MissingPersonAlert {
  eventId: string;
  title: string;
  detectedAt: string;
  location: string;
  similarity: number;
  description: string;
  status: '담당자 확인 필요';
}

export interface RecentEvent {
  eventId: string;
  type: EventType;
  title: string;
  location: string;
  detectedAt: string;
  status: EventStatus;
  severity: EventSeverity;
  description: string;
}

export interface MaintenancePriority {
  rank: number;
  houseId: string;
  address: string;
  riskLevel: RiskLevel;
  oldness: number;
  accessibility: number;
  populationDensity: number;
  totalScore: number;
  reason: string;
}

export interface ReconstructionRecommendation {
  houseId: string;
  recommendedUse: string;
  buildingScale: string;
  expectedCost: string;
  expectedReturn: string;
  feasibility: '높음' | '보통' | '낮음';
  reason: string;
}
