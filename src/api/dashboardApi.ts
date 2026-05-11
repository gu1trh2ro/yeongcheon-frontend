import {
  dashboardSummary,
  maintenancePriorities,
  missingPersonAlert,
  recentEvents,
  reconstructionRecommendation,
  robotStatus,
  vacantHouses,
} from '../data/mockData';
import type {
  DashboardSummary,
  MaintenancePriority,
  MissingPersonAlert,
  RecentEvent,
  ReconstructionRecommendation,
  RobotStatus,
  VacantHouse,
} from '../types/dashboard';

function resolveMockData<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return resolveMockData(dashboardSummary);
}

export function getRobotStatus(): Promise<RobotStatus> {
  return resolveMockData(robotStatus);
}

export function getVacantHouses(): Promise<VacantHouse[]> {
  return resolveMockData(vacantHouses);
}

export function getRecentEvents(): Promise<RecentEvent[]> {
  return resolveMockData(recentEvents);
}

export function getMaintenancePriority(): Promise<MaintenancePriority[]> {
  return resolveMockData(maintenancePriorities);
}

export function getReconstructionRecommendation(): Promise<ReconstructionRecommendation> {
  return resolveMockData(reconstructionRecommendation);
}

export function getMissingPersonAlert(): Promise<MissingPersonAlert> {
  return resolveMockData(missingPersonAlert);
}
