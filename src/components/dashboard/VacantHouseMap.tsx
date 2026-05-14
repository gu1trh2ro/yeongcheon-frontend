import { useEffect, useRef, useState } from 'react';
import Card from '../common/Card';
import type { GradeLabel } from '../../data/vacantHouseDistribution';
import {
  gradeLabels,
  vacantHouseDistribution,
  type AdministrativeDongDistribution,
} from '../../data/vacantHouseDistribution';

const NAVER_MAP_SCRIPT_ID = 'naver-map-script';
const NAVER_MAP_CALLBACK = '__yeongcheonNaverMapReady';
const YEONGCHEON_CENTER = { lat: 36.0, lng: 128.92 };
const BLUE_MASCOT_MARKER = '/yeongcheon_blue_mascot_wave.svg';
const PINK_MASCOT_MARKER = '/yeongcheon_pink_mascot_wave.svg';

type MapStatus = 'loading' | 'ready' | 'fallback';

type NaverLatLng = {
  readonly __type?: 'NaverLatLng';
};

type NaverPoint = {
  readonly __type?: 'NaverPoint';
};

type NaverSize = {
  readonly __type?: 'NaverSize';
};

interface NaverMap {
  setCenter(coord: NaverLatLng): void;
}

interface NaverMarker {
  setMap(map: NaverMap | null): void;
}

interface NaverMarkerIcon {
  content: string;
  size: NaverSize;
  anchor: NaverPoint;
}

interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  minZoom?: number;
  scaleControl?: boolean;
  logoControl?: boolean;
  mapDataControl?: boolean;
  mapTypeControl?: boolean;
  zoomControl?: boolean;
}

interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMap;
  title: string;
  icon: NaverMarkerIcon;
}

interface NaverMapsNamespace {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
  Marker: new (options: NaverMarkerOptions) => NaverMarker;
  Point: new (x: number, y: number) => NaverPoint;
  Size: new (width: number, height: number) => NaverSize;
}

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapsNamespace;
    };
    [NAVER_MAP_CALLBACK]?: () => void;
  }
}

let naverMapScriptPromise: Promise<NaverMapsNamespace> | null = null;

const gradeToneClasses: Record<GradeLabel, string> = {
  '1등급': 'bg-rose-500',
  '2등급': 'bg-orange-400',
  '3등급': 'bg-amber-400',
  '4등급': 'bg-sky-500',
  특정빈집: 'bg-fuchsia-500',
  일반빈집: 'bg-emerald-500',
};

const gradeTextColors: Record<GradeLabel, string> = {
  '1등급': '#E11D48',
  '2등급': '#F97316',
  '3등급': '#D97706',
  '4등급': '#0284C7',
  특정빈집: '#C026D3',
  일반빈집: '#059669',
};

const fallbackBounds = {
  minLat: Math.min(...vacantHouseDistribution.map((item) => item.lat)),
  maxLat: Math.max(...vacantHouseDistribution.map((item) => item.lat)),
  minLng: Math.min(...vacantHouseDistribution.map((item) => item.lng)),
  maxLng: Math.max(...vacantHouseDistribution.map((item) => item.lng)),
};

function getNaverMapClientId() {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  if (typeof clientId !== 'string') return '';

  const trimmedClientId = clientId.trim();

  return trimmedClientId === 'your_naver_map_client_id' ? '' : trimmedClientId;
}

function getNaverMaps() {
  return window.naver?.maps ?? null;
}

function loadNaverMapScript(clientId: string) {
  const loadedMaps = getNaverMaps();

  if (loadedMaps) {
    return Promise.resolve(loadedMaps);
  }

  if (naverMapScriptPromise) {
    return naverMapScriptPromise;
  }

  naverMapScriptPromise = new Promise<NaverMapsNamespace>((resolve, reject) => {
    const resolveLoadedMap = () => {
      const maps = getNaverMaps();

      if (maps) {
        resolve(maps);
        return;
      }

      reject(new Error('네이버 지도 SDK가 준비되지 않았습니다.'));
    };

    window[NAVER_MAP_CALLBACK] = resolveLoadedMap;

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    const searchParams = new URLSearchParams({
      ncpKeyId: clientId,
      callback: NAVER_MAP_CALLBACK,
      language: 'ko',
    });

    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${searchParams.toString()}`;
    script.onerror = () => {
      script.remove();
      naverMapScriptPromise = null;
      reject(new Error('네이버 지도 스크립트 로딩에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });

  return naverMapScriptPromise;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getShortGradeLabel(grade: GradeLabel) {
  if (grade === '특정빈집') return '특정';
  if (grade === '일반빈집') return '일반';

  return grade;
}

function hasDetailedGrades(distribution: AdministrativeDongDistribution) {
  return (
    distribution.gradeCounts['1등급']
    + distribution.gradeCounts['2등급']
    + distribution.gradeCounts['3등급']
    + distribution.gradeCounts['4등급']
  ) > 0;
}

function getMascotMarker(distribution: AdministrativeDongDistribution) {
  return hasDetailedGrades(distribution) ? PINK_MASCOT_MARKER : BLUE_MASCOT_MARKER;
}

function createCountRows(distribution: AdministrativeDongDistribution) {
  return gradeLabels
    .map((grade) => `
      <span style="
        display: flex;
        align-items: center;
        gap: 4px;
        color: #475569;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      ">
        <i style="
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: ${gradeTextColors[grade]};
          display: inline-block;
        "></i>
        ${escapeHtml(getShortGradeLabel(grade))}: ${distribution.gradeCounts[grade]}채
      </span>
    `)
    .join('');
}

function createAdministrativeDongMarkerContent(distribution: AdministrativeDongDistribution) {
  const mascotMarker = getMascotMarker(distribution);

  return `
    <div class="yc-dong-marker">
      <style>
        .yc-dong-marker {
          position: relative;
          width: max-content;
          transform: translateY(-14px);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          z-index: 1;
        }
        .yc-dong-marker:hover {
          z-index: 999;
        }
        .yc-dong-marker-pin {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .yc-dong-marker-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          filter: drop-shadow(0 8px 12px rgba(15, 23, 42, 0.22));
        }
        .yc-dong-marker-label {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(226, 232, 240, 0.96);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14);
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }
        .yc-dong-marker-label strong {
          color: #0f172a;
          font-size: 12px;
          font-weight: 900;
        }
        .yc-dong-marker-label span {
          color: #0284c7;
          font-size: 11px;
          font-weight: 900;
        }
        .yc-dong-marker-detail {
          position: absolute;
          left: 44px;
          top: 50px;
          min-width: 190px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid rgba(226, 232, 240, 0.96);
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.2);
          backdrop-filter: blur(10px);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        .yc-dong-marker:hover .yc-dong-marker-detail {
          opacity: 1;
          transform: translateY(0);
        }
      </style>
      <div class="yc-dong-marker-pin">
        <img class="yc-dong-marker-img" src="${mascotMarker}" alt="" />
        <div class="yc-dong-marker-label">
          <strong>${escapeHtml(distribution.administrativeDong)}</strong>
          <span>${distribution.totalCount}채</span>
        </div>
      </div>
      <div class="yc-dong-marker-detail">
        <div style="
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px 8px;
        ">
          ${createCountRows(distribution)}
        </div>
      </div>
    </div>
  `;
}

function createMarkerIcon(
  maps: NaverMapsNamespace,
  distribution: AdministrativeDongDistribution,
): NaverMarkerIcon {
  return {
    content: createAdministrativeDongMarkerContent(distribution),
    size: new maps.Size(240, 132),
    anchor: new maps.Point(26, 46),
  };
}

function getFallbackPosition(distribution: AdministrativeDongDistribution) {
  const lngRange = fallbackBounds.maxLng - fallbackBounds.minLng || 1;
  const latRange = fallbackBounds.maxLat - fallbackBounds.minLat || 1;

  return {
    left: `${8 + ((distribution.lng - fallbackBounds.minLng) / lngRange) * 84}%`,
    top: `${10 + ((fallbackBounds.maxLat - distribution.lat) / latRange) * 76}%`,
  };
}

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
      {gradeLabels.map((grade) => (
        <span key={grade} className="flex items-center gap-1.5 text-[12px] font-black text-slate-600">
          <span className={`h-2.5 w-2.5 rounded-full ${gradeToneClasses[grade]}`} />
          {getShortGradeLabel(grade)}
        </span>
      ))}
    </div>
  );
}

function FallbackMap({ reason }: { reason: string }) {
  return (
    <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-3xl border-4 border-slate-50 bg-slate-100/50 shadow-inner">
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
        <defs>
          <pattern id="vacant-house-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vacant-house-map-grid)" />
      </svg>

      <div className="absolute left-4 top-4 rounded-2xl border-2 border-amber-100 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        <p className="flex items-center gap-1 text-[13px] font-black tracking-wide text-amber-500">별의 도시 영천</p>
        <p className="mt-1 text-[16px] font-black text-slate-700">행정동별 빈집 등급 현황</p>
      </div>

      <div className="absolute right-4 top-4 max-w-[280px] rounded-2xl border-2 border-white bg-white/90 px-4 py-3 text-[12px] font-bold text-slate-500 shadow-sm backdrop-blur-md">
        {reason}
      </div>

      {vacantHouseDistribution.map((distribution) => (
        <div
          key={distribution.administrativeDong}
          className="group absolute z-10 -translate-x-4 -translate-y-8 hover:z-30"
          style={getFallbackPosition(distribution)}
        >
          <div className="relative flex items-center gap-1.5">
            <img
              src={getMascotMarker(distribution)}
              alt=""
              className="h-12 w-12 object-contain drop-shadow-lg"
            />
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-md">
              <p className="text-[12px] font-black text-slate-800">{distribution.administrativeDong}</p>
              <span className="text-[11px] font-black text-sky-600">{distribution.totalCount}채</span>
            </div>
            <div className="pointer-events-none absolute left-10 top-11 min-w-[172px] translate-y-[-6px] rounded-2xl border-2 border-white bg-white/95 px-3 py-2 opacity-0 shadow-lg backdrop-blur-md transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-black text-slate-800">{distribution.administrativeDong}</p>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-black text-sky-600">
                  {distribution.totalCount}채
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1">
                {gradeLabels.map((grade) => (
                  <span key={grade} className="flex items-center gap-1 text-[10px] font-black text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${gradeToneClasses[grade]}`} />
                    {getShortGradeLabel(grade)} {distribution.gradeCounts[grade]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <MapLegend />
    </div>
  );
}

export default function VacantHouseMap() {
  const naverMapClientId = getNaverMapClientId();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const [mapStatus, setMapStatus] = useState<MapStatus>(naverMapClientId ? 'loading' : 'fallback');
  const [fallbackReason, setFallbackReason] = useState(
    naverMapClientId
      ? '네이버 지도 연결을 준비하고 있습니다.'
      : '네이버 지도 Client ID가 설정되지 않아 예시 지도를 표시합니다.',
  );

  useEffect(() => {
    let isMounted = true;

    if (!naverMapClientId) {
      return undefined;
    }

    loadNaverMapScript(naverMapClientId)
      .then((maps) => {
        if (!isMounted || !mapElementRef.current) return;

        const center = new maps.LatLng(YEONGCHEON_CENTER.lat, YEONGCHEON_CENTER.lng);
        const map = new maps.Map(mapElementRef.current, {
          center,
          zoom: 10,
          minZoom: 9,
          scaleControl: true,
          logoControl: true,
          mapDataControl: false,
          mapTypeControl: false,
          zoomControl: true,
        });

        map.setCenter(center);
        mapRef.current = map;

        markersRef.current = vacantHouseDistribution.map((distribution) => (
          new maps.Marker({
            position: new maps.LatLng(distribution.lat, distribution.lng),
            map,
            title: `${distribution.administrativeDong} 빈집 ${distribution.totalCount}채`,
            icon: createMarkerIcon(maps, distribution),
          })
        ));

        setMapStatus('ready');
      })
      .catch(() => {
        if (!isMounted) return;

        setMapStatus('fallback');
        setFallbackReason('네이버 지도 로딩에 실패해 예시 지도를 표시합니다.');
      });

    return () => {
      isMounted = false;

      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [naverMapClientId]);

  return (
    <Card title="영천시 빈집 분포 현황" eyebrow="행정동별 등급 집계" className="flex h-full flex-col">
      {mapStatus === 'fallback' ? (
        <FallbackMap reason={fallbackReason} />
      ) : (
        <div className="relative flex-1 min-h-0 overflow-hidden rounded-3xl border-4 border-slate-50 bg-slate-100/50 shadow-inner">
          <div ref={mapElementRef} className="h-full w-full" aria-label="영천시 행정동별 빈집 등급 지도" />

          {mapStatus === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm">
              <div className="rounded-2xl border-2 border-white bg-white/90 px-5 py-3 text-center shadow-sm">
                <p className="text-[14px] font-black text-slate-700">네이버 지도를 불러오는 중입니다</p>
                <p className="mt-1 text-[12px] font-bold text-slate-500">행정동별 빈집 등급 마커를 준비하고 있습니다.</p>
              </div>
            </div>
          )}

          <MapLegend />
        </div>
      )}
    </Card>
  );
}
