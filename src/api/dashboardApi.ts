import {
  dashboardSummary,
  missingPersonAlert,
  missingPersonDetectionLogs,
  missingPersonProfiles,
  patrolArrivalPhotos,
  patrolRoute,
  recentEvents,
  reconstructionRecommendation,
  robotActivityLogs,
  robotMissionTargets,
  vacantHouses,
} from '../data/mockData';
import { maintenancePrioritySummary } from '../data/vacantHouseDistribution';
import type {
  DashboardSummary,
  MaintenancePrioritySummary,
  MissingPersonAlert,
  MissingPersonDetectionLog,
  MissingPersonPublicProfile,
  PatrolArrivalPhoto,
  PatrolRoute,
  RecentEvent,
  ReconstructionAnalyzeRequest,
  ReconstructionRecommendation,
  RobotActivityLog,
  RobotMissionTarget,
  VacantHouse,
} from '../types/dashboard';

function resolveMockData<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof baseUrl !== 'string') return '';

  return baseUrl.trim().replace(/\/$/, '');
}

function createApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();

  return baseUrl ? `${baseUrl}${path}` : '';
}

async function fetchJson(path: string): Promise<unknown> {
  const apiUrl = createApiUrl(path);

  if (!apiUrl) {
    throw new Error('API base URL이 설정되지 않았습니다.');
  }

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error('API 응답이 올바르지 않습니다.');
  }

  return response.json();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFeasibility(value: unknown): value is ReconstructionRecommendation['feasibility'] {
  return value === '높음' || value === '보통' || value === '낮음';
}

function isArrivalAnalysisResult(value: unknown): value is PatrolArrivalPhoto['analysisResult'] {
  return value === '정상' || value === '이상징후' || value === '분석중';
}

function isNumberTuple(value: unknown): value is [number, number] {
  return (
    Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
  );
}

function isReconstructionRecommendation(value: unknown): value is ReconstructionRecommendation {
  if (!isRecord(value)) return false;

  return (
    typeof value.houseId === 'string'
    && typeof value.recommendedUse === 'string'
    && typeof value.buildingScale === 'string'
    && typeof value.expectedCost === 'string'
    && typeof value.expectedReturn === 'string'
    && isFeasibility(value.feasibility)
    && typeof value.reason === 'string'
  );
}

function isPatrolRoute(value: unknown): value is PatrolRoute {
  if (!isRecord(value) || !Array.isArray(value.points)) return false;

  return (
    typeof value.missionId === 'string'
    && typeof value.routeName === 'string'
    && typeof value.generatedAt === 'string'
    && typeof value.completedHouseCount === 'number'
    && typeof value.totalHouseCount === 'number'
    && value.points.every((point) => {
      if (!isRecord(point)) return false;

      return (
        typeof point.pointId === 'string'
        && typeof point.label === 'string'
        && typeof point.viewX === 'number'
        && typeof point.viewY === 'number'
        && typeof point.visitOrder === 'number'
        && typeof point.isArrivalPoint === 'boolean'
        && typeof point.isCompleted === 'boolean'
      );
    })
  );
}

function isPatrolArrivalPhoto(value: unknown): value is PatrolArrivalPhoto {
  if (!isRecord(value)) return false;

  return (
    typeof value.photoId === 'string'
    && typeof value.houseId === 'string'
    && typeof value.address === 'string'
    && typeof value.capturedAt === 'string'
    && typeof value.odomX === 'number'
    && typeof value.odomY === 'number'
    && isArrivalAnalysisResult(value.analysisResult)
    && typeof value.analysisSummary === 'string'
  );
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeTimestamp(value: unknown): string | null {
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const numericTime = asNumber(value);

  if (numericTime === null) return null;

  const milliseconds = numericTime > 10_000_000_000 ? numericTime : numericTime * 1000;

  return new Date(milliseconds).toISOString();
}

function normalizeHouseId(houseId: string) {
  const numericId = houseId.match(/\d+/)?.[0];

  if (!numericId) return houseId;

  return `H-${numericId.padStart(3, '0')}`;
}

function resolveHouseById(houseId: string) {
  const normalizedHouseId = normalizeHouseId(houseId);

  return vacantHouses.find((house) => house.houseId === normalizedHouseId || house.houseId === houseId) ?? null;
}

function resolveAssetUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const baseUrl = getApiBaseUrl();

  if (!baseUrl || !path.startsWith('/')) return path;

  return `${baseUrl}${path}`;
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return resolveMockData(dashboardSummary);
}

export function getVacantHouses(): Promise<VacantHouse[]> {
  return resolveMockData(vacantHouses);
}

export function getRecentEvents(): Promise<RecentEvent[]> {
  return resolveMockData(recentEvents);
}

export function getMaintenancePriority(): Promise<MaintenancePrioritySummary> {
  return resolveMockData(maintenancePrioritySummary);
}

function mapGraphToPatrolRoute(data: unknown): PatrolRoute {
  if (isPatrolRoute(data)) return data;

  if (!isRecord(data) || !isRecord(data.houses) || Object.keys(data.houses).length === 0) {
    throw new Error('순찰 경로 API 응답 형식이 올바르지 않습니다.');
  }

  const housePositions = Object.entries(data.houses)
    .map(([houseId, houseValue]) => {
      if (!isRecord(houseValue) || !isNumberTuple(houseValue.pos)) return null;

      return {
        houseId,
        x: houseValue.pos[0],
        y: houseValue.pos[1],
      };
    })
    .filter((item): item is { houseId: string; x: number; y: number } => item !== null);

  if (housePositions.length === 0) {
    throw new Error('순찰 경로 API에 표시할 빈집 위치가 없습니다.');
  }

  const xValues = housePositions.map((point) => point.x);
  const yValues = housePositions.map((point) => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  const points = housePositions.map((point, index) => {
    const house = resolveHouseById(point.houseId);

    return {
      pointId: `P-${normalizeHouseId(point.houseId)}`,
      label: house?.address.replace('영천시 ', '') ?? point.houseId,
      houseId: house?.houseId ?? normalizeHouseId(point.houseId),
      viewX: 50 + ((point.x - minX) / xRange) * 380,
      viewY: 200 - ((point.y - minY) / yRange) * 150,
      visitOrder: index + 1,
      isArrivalPoint: true,
      isCompleted: false,
    };
  });

  return {
    missionId: 'GRAPH-LATEST',
    routeName: '백엔드 도로 그래프 기반 순찰 경로',
    generatedAt: new Date().toISOString(),
    completedHouseCount: 0,
    totalHouseCount: points.length,
    points,
  };
}

export function getPatrolRoute(): Promise<PatrolRoute> {
  if (!getApiBaseUrl()) {
    return resolveMockData(patrolRoute);
  }

  return fetchJson('/api/graph')
    .then(mapGraphToPatrolRoute)
    .catch(() => patrolRoute);
}

export function getRobotMissionTargets(): Promise<RobotMissionTarget[]> {
  return resolveMockData(robotMissionTargets);
}

export function getRobotActivityLogs(): Promise<RobotActivityLog[]> {
  return resolveMockData(robotActivityLogs);
}

function extractArrivalRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];

  if (Array.isArray(data.arrivals)) return data.arrivals;
  if (Array.isArray(data.photos)) return data.photos;
  if (Array.isArray(data.items)) return data.items;

  return [];
}

function mapArrivalRowToPhoto(row: unknown, house: VacantHouse): PatrolArrivalPhoto | null {
  if (isPatrolArrivalPhoto(row)) return row;
  if (!isRecord(row)) return null;

  const rawPhotoId = asString(row.photoId ?? row.id ?? row.imageId);
  const capturedAt = normalizeTimestamp(row.capturedAt ?? row.timestamp ?? row.received_at ?? row.receivedAt);
  const odomX = asNumber(row.odomX ?? row.x ?? row.odom_x);
  const odomY = asNumber(row.odomY ?? row.y ?? row.odom_y);
  const rawImageUrl = asString(row.imageUrl ?? row.image_url ?? row.photo_url ?? row.photo ?? row.photo_path);
  const rawAnalysisResult = asString(row.analysisResult ?? row.analysis_result);
  const analysisSummary = asString(row.analysisSummary ?? row.analysis_summary ?? row.description ?? row.summary);

  if (!rawPhotoId || !capturedAt || odomX === null || odomY === null) return null;

  return {
    photoId: rawPhotoId,
    houseId: house.houseId,
    address: house.address,
    capturedAt,
    imageUrl: rawImageUrl ? resolveAssetUrl(rawImageUrl) : undefined,
    odomX,
    odomY,
    analysisResult: isArrivalAnalysisResult(rawAnalysisResult) ? rawAnalysisResult : '분석중',
    analysisSummary: analysisSummary ?? '백엔드에서 수신한 촬영 이력입니다. 상세 분석 결과는 연동 후 표시됩니다.',
  };
}

async function fetchArrivalPhotosForHouse(house: VacantHouse) {
  const endpointCandidates = [`/api/arrival/${house.houseId}`, `/arrival/${house.houseId}`];

  for (const endpoint of endpointCandidates) {
    try {
      const data = await fetchJson(endpoint);
      const rows = extractArrivalRows(data);
      const photos = rows
        .map((row) => mapArrivalRowToPhoto(row, house))
        .filter((photo): photo is PatrolArrivalPhoto => photo !== null);

      if (photos.length > 0) return photos;
    } catch {
      // Try the next known backend endpoint shape, then fall back to mock data.
    }
  }

  return [];
}

export async function getPatrolArrivalPhotos(): Promise<PatrolArrivalPhoto[]> {
  if (!getApiBaseUrl()) {
    return resolveMockData(patrolArrivalPhotos);
  }

  try {
    const photoGroups = await Promise.all(vacantHouses.map((house) => fetchArrivalPhotosForHouse(house)));
    const photos = photoGroups
      .flat()
      .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());

    return photos.length > 0 ? photos : patrolArrivalPhotos;
  } catch {
    return patrolArrivalPhotos;
  }
}

export function getReconstructionRecommendation(): Promise<ReconstructionRecommendation> {
  return resolveMockData(reconstructionRecommendation);
}

function createAnalyzeRequest(house: VacantHouse): ReconstructionAnalyzeRequest {
  return {
    houseId: house.houseId,
    address: house.address,
    coordinate: {
      lat: house.lat,
      lng: house.lng,
    },
    parcelCode: house.parcelCode,
  };
}

function createMockRecommendation(
  request: ReconstructionAnalyzeRequest,
  house: VacantHouse,
): ReconstructionRecommendation {
  if (house.riskLevel === '정비완료') {
    return {
      houseId: request.houseId,
      recommendedUse: '생활권 유지 관리 + 공공 안내 거점',
      buildingScale: '기존 규모 유지',
      expectedCost: '약 0.8억 원',
      expectedReturn: '정비 완료 자산의 활용도 개선',
      feasibility: '보통',
      reason:
        `${request.address}은 이미 정비가 완료된 빈집으로, 대규모 재건축보다 안내 거점이나 주민 편의 기능을 더하는 방향이 적합합니다. ` +
        `요청 정보에는 지번 코드 ${request.parcelCode.bun}-${request.parcelCode.ji}와 좌표 ${request.coordinate.lat.toFixed(4)}, ${request.coordinate.lng.toFixed(4)}가 함께 포함됩니다.`,
    };
  }

  if (house.riskLevel === '위험') {
    return {
      houseId: request.houseId,
      recommendedUse: '생활안전 거점 + 소규모 커뮤니티 공간',
      buildingScale: '지상 2층, 연면적 180㎡ 내외',
      expectedCost: '약 3.2억 원',
      expectedReturn: '공공안전 개선 및 생활권 회복',
      feasibility: '높음',
      reason:
        `${request.address}은 위험도와 노후도 점수가 높아 우선 정비 효과가 큽니다. ` +
        `지번 코드 ${request.parcelCode.bun}-${request.parcelCode.ji}, 좌표 ${request.coordinate.lat.toFixed(4)}, ${request.coordinate.lng.toFixed(4)}를 기준으로 공공안전 거점과 주민 이용 시설을 결합하는 방향이 적합합니다.`,
    };
  }

  return {
    houseId: request.houseId,
    recommendedUse: '마을 돌봄 거점 + 경량 리모델링',
    buildingScale: '지상 1층 ~ 2층, 기존 골조 활용',
    expectedCost: '약 1.8억 원',
    expectedReturn: '정비 비용 절감 및 생활권 접근성 개선',
    feasibility: house.riskLevel === '주의' ? '높음' : '보통',
    reason:
      `${request.address}은 접근성과 주변 생활권 지표를 함께 고려했을 때 전면 철거보다 경량 리모델링 중심의 활용이 적합합니다. ` +
      `분석 요청에는 시군구코드 ${request.parcelCode.sigunguCd}, 법정동코드 ${request.parcelCode.bjdongCd}, 지번 ${request.parcelCode.bun}-${request.parcelCode.ji}, 좌표 ${request.coordinate.lat.toFixed(4)}, ${request.coordinate.lng.toFixed(4)}가 포함됩니다.`,
  };
}

export function analyzeReconstructionRecommendation(
  house: VacantHouse,
): Promise<ReconstructionRecommendation> {
  const request = createAnalyzeRequest(house);
  const fallbackRecommendation = createMockRecommendation(request, house);
  const apiUrl = createApiUrl('/api/maintenance/analyze');

  if (!apiUrl) {
    return resolveMockData(fallbackRecommendation);
  }

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('AI 추천 API 응답이 올바르지 않습니다.');
      }

      const data: unknown = await response.json();

      if (!isReconstructionRecommendation(data)) {
        throw new Error('AI 추천 API 응답 형식이 올바르지 않습니다.');
      }

      return data;
    })
    .catch(() => fallbackRecommendation);
}

export function getMissingPersonAlert(): Promise<MissingPersonAlert> {
  return resolveMockData(missingPersonAlert);
}

export function getMissingPersonProfiles(): Promise<MissingPersonPublicProfile[]> {
  return resolveMockData(
    missingPersonProfiles.filter((profile) => profile.occrAdres.includes('영천')),
  );
}

export function getMissingPersonDetectionLogs(): Promise<MissingPersonDetectionLog[]> {
  return resolveMockData(missingPersonDetectionLogs);
}
