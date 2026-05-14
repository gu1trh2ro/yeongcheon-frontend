export type RiskLevel = '위험' | '주의' | '관심' | '정비완료';

export type EventStatus = '미확인' | '확인중' | '처리완료';

export type EventSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType =
  | 'MISSING_PERSON_CANDIDATE'
  | 'VACANT_HOUSE_ANOMALY'
  | 'PATROL_COMPLETE'
  | 'MAINTENANCE_RECOMMENDATION';

export interface DashboardSummary {
  vacantHouseCount: number;
  highRiskHouseCount: number;
  todayAnomalyCount: number;
  missingPersonCandidateCount: number;
}

export interface VacantHouse {
  houseId: string;
  address: string;
  lat: number;
  lng: number;
  parcelCode: LandParcelCode;
  riskLevel: RiskLevel;
  priorityRank: number;
  oldness: number;
  accessibility: number;
  populationDensity: number;
  totalScore: number;
}

export interface LandParcelCode {
  sigunguCd: string;
  bjdongCd: string;
  platGbCd: string;
  bun: string;
  ji: string;
}

export interface ReconstructionAnalyzeRequest {
  houseId: string;
  address: string;
  coordinate: {
    lat: number;
    lng: number;
  };
  parcelCode: LandParcelCode;
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

export interface MissingPersonPublicProfile {
  profileId: string;
  rnum: number;
  occrde: string;
  alldressingDscd: string | null;
  ageNow: string;
  age: number;
  writngTrgetDscd: string;
  sexdstnDscd: string;
  occrAdres: string;
  nm: string;
  nltyDscd: string;
  height: number;
  bdwgh: number;
  frmDscd: string;
  faceshpeDscd: string;
  hairshpeDscd: string;
  haircolrDscd: string;
}

export type MissingPersonDetectionStatus = '담당자 확인 필요' | '확인중' | '처리완료';

export interface MissingPersonDetectionLog {
  logId: string;
  candidateName: string;
  candidateAgeLabel: string;
  candidateGender: string;
  detectedAt: string;
  location: string;
  similarity: number;
  robotId: string;
  cameraLabel: string;
  status: MissingPersonDetectionStatus;
  description: string;
  evidenceSummary: string;
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

export type MaintenanceGrade = '1등급' | '2등급' | '3등급' | '4등급' | '특정빈집' | '일반빈집';

export interface MaintenancePriority {
  rank: number;
  houseId: string;
  address: string;
  administrativeDong: string;
  legalDong: string;
  grade: MaintenanceGrade;
  vacantHouseScore: number;
  assessedAt: string;
}

export interface AdministrativeDongVacantHouseRank {
  rank: number;
  administrativeDong: string;
  totalCount: number;
}

export interface MaintenancePrioritySummary {
  topScoredHouses: MaintenancePriority[];
  administrativeDongRankings: AdministrativeDongVacantHouseRank[];
}

export interface PatrolRoutePoint {
  pointId: string;
  label: string;
  houseId?: string;
  viewX: number;
  viewY: number;
  visitOrder: number;
  isArrivalPoint: boolean;
  isCompleted: boolean;
}

export interface PatrolRoute {
  missionId: string;
  routeName: string;
  generatedAt: string;
  completedHouseCount: number;
  totalHouseCount: number;
  points: PatrolRoutePoint[];
}

export interface RobotMissionTarget {
  targetId: string;
  label: string;
  address: string;
  viewX: number;
  viewY: number;
}

export type RobotActivityLogTone = 'info' | 'success' | 'warning';

export interface RobotActivityLog {
  logId: string;
  timestamp: string;
  message: string;
  tone: RobotActivityLogTone;
}

export type ArrivalAnalysisResult = '정상' | '이상징후' | '분석중';

export interface PatrolArrivalPhoto {
  photoId: string;
  houseId: string;
  address: string;
  capturedAt: string;
  imageUrl?: string;
  odomX: number;
  odomY: number;
  analysisResult: ArrivalAnalysisResult;
  analysisSummary: string;
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
