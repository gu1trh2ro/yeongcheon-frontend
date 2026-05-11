import { useEffect, useRef, useState } from 'react';
import Card from '../common/Card';
import type { RiskLevel, VacantHouse } from '../../types/dashboard';

const NAVER_MAP_SCRIPT_ID = 'naver-map-script';
const NAVER_MAP_CALLBACK = '__yeongcheonNaverMapReady';
const YEONGCHEON_CENTER = { lat: 35.9736, lng: 128.9387 };

const markerPos = [
  { left: '22%', top: '32%' }, { left: '50%', top: '55%' },
  { left: '68%', top: '28%' }, { left: '76%', top: '65%' }, { left: '34%', top: '70%' },
];

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

interface NaverInfoWindow {
  open(map: NaverMap, marker: NaverMarker): void;
  close(): void;
}

interface NaverListener {
  remove(): void;
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

interface NaverInfoWindowOptions {
  content: string;
  borderWidth?: number;
  backgroundColor?: string;
  disableAnchor?: boolean;
  pixelOffset?: NaverPoint;
}

interface NaverMapsNamespace {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
  Marker: new (options: NaverMarkerOptions) => NaverMarker;
  InfoWindow: new (options: NaverInfoWindowOptions) => NaverInfoWindow;
  Point: new (x: number, y: number) => NaverPoint;
  Size: new (width: number, height: number) => NaverSize;
  Event: {
    addListener(target: NaverMarker, eventName: 'click', listener: () => void): NaverListener;
    clearInstanceListeners(target: NaverMarker): void;
  };
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

const riskStyles: Record<RiskLevel, {
  markerColor: string;
  fallbackClass: string;
}> = {
  위험: {
    markerColor: '#EF4444',
    fallbackClass: 'bg-rose-500',
  },
  주의: {
    markerColor: '#F59E0B',
    fallbackClass: 'bg-amber-400',
  },
  관심: {
    markerColor: '#0EA5E9',
    fallbackClass: 'bg-sky-400',
  },
  정비완료: {
    markerColor: '#10B981',
    fallbackClass: 'bg-emerald-500',
  },
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

function createMarkerIcon(maps: NaverMapsNamespace, riskLevel: RiskLevel): NaverMarkerIcon {
  const markerColor = riskStyles[riskLevel].markerColor;

  return {
    content: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: ${markerColor};
        border: 4px solid #ffffff;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.24);
      "></div>
    `,
    size: new maps.Size(22, 22),
    anchor: new maps.Point(11, 11),
  };
}

function createInfoWindowContent(house: VacantHouse) {
  const riskColor = riskStyles[house.riskLevel].markerColor;

  return `
    <div style="
      min-width: 190px;
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
      color: #334155;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <p style="margin: 0 0 8px; color: #0f172a; font-size: 14px; font-weight: 800;">
        ${escapeHtml(house.address)}
      </p>
      <div style="display: grid; gap: 5px; font-size: 12px; font-weight: 700;">
        <span>위험도: <b style="color: ${riskColor};">${escapeHtml(house.riskLevel)}</b></span>
        <span>우선순위: ${escapeHtml(house.priorityRank)}위</span>
        <span>총점: ${escapeHtml(house.totalScore)}점</span>
      </div>
    </div>
  `;
}

function MapLegend() {
  const items: RiskLevel[] = ['위험', '주의', '관심', '정비완료'];

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-1.5 text-[12px] font-black text-slate-600">
          <span className={`h-2.5 w-2.5 rounded-full ${riskStyles[item].fallbackClass}`} />
          {item}
        </span>
      ))}
    </div>
  );
}

function FallbackMap({
  vacantHouses,
  reason,
}: {
  vacantHouses: VacantHouse[];
  reason: string;
}) {
  return (
    <div className="relative h-[380px] rounded-3xl border-4 border-slate-50 bg-slate-100/50 overflow-hidden shadow-inner">
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
        <defs>
          <pattern id="vacant-house-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vacant-house-map-grid)" />
      </svg>

      <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-md border-2 border-amber-100 rounded-2xl px-4 py-2.5 shadow-sm">
        <p className="text-[13px] font-black text-amber-500 tracking-wide flex items-center gap-1">⭐ 별의 도시 영천</p>
        <p className="text-[16px] font-black text-slate-700 mt-1">빈집 위치 현황</p>
      </div>

      <div className="absolute right-4 top-4 max-w-[260px] rounded-2xl border-2 border-white bg-white/90 px-4 py-3 text-[12px] font-bold text-slate-500 shadow-sm backdrop-blur-md">
        {reason}
      </div>

      {vacantHouses.map((house, index) => (
        <div
          key={house.houseId}
          className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={markerPos[index % markerPos.length]}
          title={house.address}
        >
          <span className={`block h-5 w-5 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${riskStyles[house.riskLevel].fallbackClass}`} />
          <span className="absolute left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-800 px-3 py-1.5 text-[13px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {house.address.replace('영천시 ', '')}
          </span>
        </div>
      ))}

      <MapLegend />
    </div>
  );
}

export default function VacantHouseMap({ vacantHouses }: { vacantHouses: VacantHouse[] }) {
  const naverMapClientId = getNaverMapClientId();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const infoWindowRef = useRef<NaverInfoWindow | null>(null);
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
          zoom: 12,
          minZoom: 10,
          scaleControl: true,
          logoControl: true,
          mapDataControl: false,
          mapTypeControl: false,
          zoomControl: true,
        });

        map.setCenter(center);
        mapRef.current = map;

        markersRef.current = vacantHouses.map((house) => {
          const marker = new maps.Marker({
            position: new maps.LatLng(house.lat, house.lng),
            map,
            title: house.address,
            icon: createMarkerIcon(maps, house.riskLevel),
          });
          const infoWindow = new maps.InfoWindow({
            content: createInfoWindowContent(house),
            borderWidth: 0,
            backgroundColor: 'transparent',
            disableAnchor: true,
            pixelOffset: new maps.Point(0, -10),
          });

          maps.Event.addListener(marker, 'click', () => {
            infoWindowRef.current?.close();
            infoWindow.open(map, marker);
            infoWindowRef.current = infoWindow;
          });

          return marker;
        });

        setMapStatus('ready');
      })
      .catch(() => {
        if (!isMounted) return;

        setMapStatus('fallback');
        setFallbackReason('네이버 지도 로딩에 실패해 예시 지도를 표시합니다.');
      });

    return () => {
      isMounted = false;
      const maps = getNaverMaps();

      markersRef.current.forEach((marker) => {
        maps?.Event.clearInstanceListeners(marker);
        marker.setMap(null);
      });
      markersRef.current = [];
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      mapRef.current = null;
    };
  }, [naverMapClientId, vacantHouses]);

  return (
    <Card title="영천시 빈집 분포 현황" eyebrow="공공데이터 기반">
      {mapStatus === 'fallback' ? (
        <FallbackMap vacantHouses={vacantHouses} reason={fallbackReason} />
      ) : (
        <div className="relative h-[380px] overflow-hidden rounded-3xl border-4 border-slate-50 bg-slate-100/50 shadow-inner">
          <div ref={mapElementRef} className="h-full w-full" aria-label="영천시 빈집 위치 지도" />

          {mapStatus === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm">
              <div className="rounded-2xl border-2 border-white bg-white/90 px-5 py-3 text-center shadow-sm">
                <p className="text-[14px] font-black text-slate-700">네이버 지도를 불러오는 중입니다</p>
                <p className="mt-1 text-[12px] font-bold text-slate-500">빈집 위험도 마커를 준비하고 있습니다.</p>
              </div>
            </div>
          )}

          <MapLegend />
        </div>
      )}
    </Card>
  );
}
