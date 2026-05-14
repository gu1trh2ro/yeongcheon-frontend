import vacantHouseCsv from '../../list.csv?raw';
import type {
  AdministrativeDongVacantHouseRank,
  MaintenanceGrade,
  MaintenancePriority,
  MaintenancePrioritySummary,
} from '../types/dashboard';

export type GradeLabel = MaintenanceGrade;

export interface GradeCounts {
  '1등급': number;
  '2등급': number;
  '3등급': number;
  '4등급': number;
  '특정빈집': number;
  '일반빈집': number;
}

export interface AdministrativeDongDistribution {
  administrativeDong: string;
  lat: number;
  lng: number;
  totalCount: number;
  gradeCounts: GradeCounts;
}

export interface CsvVacantHouseRecord {
  sourceRowNumber: number;
  administrativeDong: string;
  legalDong: string;
  vacantHouseScore: number;
  grade: GradeLabel;
  assessedAt: string;
}

const GRADE_LABELS: GradeLabel[] = ['1등급', '2등급', '3등급', '4등급', '특정빈집', '일반빈집'];

const ADMINISTRATIVE_DONG_COORDINATES: Record<string, { lat: number; lng: number }> = {
  고경면: { lat: 35.999, lng: 129.044 },
  금호읍: { lat: 35.933, lng: 128.879 },
  남부동: { lat: 35.946, lng: 128.927 },
  대창면: { lat: 35.875, lng: 128.884 },
  동부동: { lat: 35.975, lng: 128.956 },
  북안면: { lat: 35.915, lng: 128.942 },
  서부동: { lat: 35.972, lng: 128.916 },
  신녕면: { lat: 36.045, lng: 128.789 },
  완산동: { lat: 35.963, lng: 128.936 },
  임고면: { lat: 36.016, lng: 128.995 },
  자양면: { lat: 36.083, lng: 129.017 },
  중앙동: { lat: 35.965, lng: 128.932 },
  청통면: { lat: 35.995, lng: 128.822 },
  화남면: { lat: 36.052, lng: 128.891 },
  화북면: { lat: 36.105, lng: 128.915 },
  화산면: { lat: 36.019, lng: 128.856 },
};

function createEmptyGradeCounts(): GradeCounts {
  return {
    '1등급': 0,
    '2등급': 0,
    '3등급': 0,
    '4등급': 0,
    특정빈집: 0,
    일반빈집: 0,
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = '';
  let isInsideQuote = false;

  for (const character of line) {
    if (character === '"') {
      isInsideQuote = !isInsideQuote;
      continue;
    }

    if (character === ',' && !isInsideQuote) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

function isGradeLabel(value: string): value is GradeLabel {
  return GRADE_LABELS.includes(value as GradeLabel);
}

function getColumnIndex(headers: string[], columnName: string) {
  return headers.indexOf(columnName);
}

function createMockAddress(record: CsvVacantHouseRecord) {
  const addressDong = record.legalDong || record.administrativeDong;

  return `영천시 ${addressDong} ${100 + record.sourceRowNumber}-${(record.sourceRowNumber % 9) + 1}`;
}

function parseVacantHouseRows(csvText: string): CsvVacantHouseRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const [headerLine, ...dataLines] = lines;

  if (!headerLine) return [];

  const headers = parseCsvLine(headerLine);
  const administrativeDongIndex = getColumnIndex(headers, '행정동');
  const legalDongIndex = getColumnIndex(headers, '법정동');
  const scoreIndex = getColumnIndex(headers, '빈집점수');
  const gradeIndex = getColumnIndex(headers, '등급판정결과');
  const assessedAtIndex = getColumnIndex(headers, '빈집판정일자');

  if (
    administrativeDongIndex < 0
    || legalDongIndex < 0
    || scoreIndex < 0
    || gradeIndex < 0
    || assessedAtIndex < 0
  ) {
    return [];
  }

  return dataLines
    .map((line, index) => {
      const row = parseCsvLine(line);
      const administrativeDong = row[administrativeDongIndex];
      const legalDong = row[legalDongIndex];
      const score = Number(row[scoreIndex]);
      const grade = row[gradeIndex];
      const assessedAt = row[assessedAtIndex];

      if (!administrativeDong || !Number.isFinite(score) || !isGradeLabel(grade)) return null;

      return {
        sourceRowNumber: index + 1,
        administrativeDong,
        legalDong: legalDong || administrativeDong,
        vacantHouseScore: score,
        grade,
        assessedAt,
      };
    })
    .filter((record): record is CsvVacantHouseRecord => record !== null);
}

function buildDistribution(csvText: string): AdministrativeDongDistribution[] {
  const distributionMap = new Map<string, GradeCounts>();

  parseVacantHouseRows(csvText).forEach((record) => {
    const gradeCounts = distributionMap.get(record.administrativeDong) ?? createEmptyGradeCounts();
    gradeCounts[record.grade] += 1;
    distributionMap.set(record.administrativeDong, gradeCounts);
  });

  return Array.from(distributionMap.entries())
    .map(([administrativeDong, gradeCounts]) => {
      const coordinate = ADMINISTRATIVE_DONG_COORDINATES[administrativeDong];

      if (!coordinate) return null;

      const totalCount = GRADE_LABELS.reduce((sum, grade) => sum + gradeCounts[grade], 0);

      return {
        administrativeDong,
        lat: coordinate.lat,
        lng: coordinate.lng,
        totalCount,
        gradeCounts,
      };
    })
    .filter((item): item is AdministrativeDongDistribution => item !== null)
    .sort((a, b) => b.totalCount - a.totalCount);
}

function buildTopScoredHouses(records: CsvVacantHouseRecord[]): MaintenancePriority[] {
  return [...records]
    .sort((a, b) => b.vacantHouseScore - a.vacantHouseScore || a.sourceRowNumber - b.sourceRowNumber)
    .slice(0, 4)
    .map((record, index) => ({
      rank: index + 1,
      houseId: `CSV-H-${String(record.sourceRowNumber).padStart(3, '0')}`,
      address: createMockAddress(record),
      administrativeDong: record.administrativeDong,
      legalDong: record.legalDong,
      grade: record.grade,
      vacantHouseScore: record.vacantHouseScore,
      assessedAt: record.assessedAt,
    }));
}

function buildAdministrativeDongRankings(
  distribution: AdministrativeDongDistribution[],
): AdministrativeDongVacantHouseRank[] {
  return distribution.slice(0, 4).map((item, index) => ({
    rank: index + 1,
    administrativeDong: item.administrativeDong,
    totalCount: item.totalCount,
  }));
}

function buildMaintenancePrioritySummary(
  records: CsvVacantHouseRecord[],
  distribution: AdministrativeDongDistribution[],
): MaintenancePrioritySummary {
  return {
    topScoredHouses: buildTopScoredHouses(records),
    administrativeDongRankings: buildAdministrativeDongRankings(distribution),
  };
}

export const vacantHouseRecords = parseVacantHouseRows(vacantHouseCsv);

export const gradeLabels = GRADE_LABELS;

export const vacantHouseDistribution = buildDistribution(vacantHouseCsv);

export const vacantHouseCsvSummary = {
  totalCount: vacantHouseRecords.length,
  highRiskHouseCount: vacantHouseRecords.filter((record) => record.grade === '3등급' || record.grade === '4등급').length,
};

export const maintenancePrioritySummary = buildMaintenancePrioritySummary(
  vacantHouseRecords,
  vacantHouseDistribution,
);
