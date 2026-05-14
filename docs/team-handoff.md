# 프론트엔드 진행 현황 및 팀 요청사항

작성일: 2026-05-13

이 문서는 현재 영천시 빈집 관리 및 자율주행 방범 대시보드 프론트엔드가 어디까지 구현되었는지, 그리고 백엔드/로봇/AI 팀과 어떤 부분을 맞춰야 하는지 공유하기 위한 문서입니다.

---

## 현재 프론트엔드 상태

현재 프론트엔드는 mock 데이터 기반 대시보드에서 실제 백엔드 연동을 준비하는 단계입니다.

구현된 주요 화면은 다음과 같습니다.

1. 통합 대시보드
2. 빈집 관리
3. 로봇 관제
4. AI 분석/추천
5. 실종자 알림

현재 디자인 방향은 밝은 Star City Yeongcheon 스타일을 유지하고 있습니다. 전체 UI는 `src/pages/DashboardPage.tsx`에서 탭별로 분기되고, 실제 데이터 접근은 `src/api/dashboardApi.ts`를 통해서만 이루어지도록 정리했습니다.

---

## 현재 데이터 흐름

현재 구조는 다음과 같습니다.

```text
컴포넌트
→ src/api/dashboardApi.ts
→ mockData.ts 또는 실제 백엔드 API
```

즉, 컴포넌트가 `src/data/mockData.ts`를 직접 import하지 않습니다.

이 구조 덕분에 백엔드 API가 완성되면 각 컴포넌트를 크게 수정하지 않고 `dashboardApi.ts`만 교체하거나 확장하면 됩니다.

---

## 구현 완료된 프론트 기능

### 1. API adapter 구조

파일:

```text
src/api/dashboardApi.ts
```

현재 제공 함수:

```ts
getDashboardSummary()
getVacantHouses()
getRecentEvents()
getMaintenancePriority()
getReconstructionRecommendation()
getMissingPersonAlert()
getPatrolRoute()
getPatrolArrivalPhotos()
analyzeReconstructionRecommendation(house)
```

`getPatrolRoute()`와 `getPatrolArrivalPhotos()`는 실제 REST 호출을 먼저 시도하고, 실패하면 mock 데이터로 fallback합니다.

### 2. 네이버 지도 연동 준비

파일:

```text
src/components/dashboard/VacantHouseMap.tsx
```

구현 내용:

- `VITE_NAVER_MAP_CLIENT_ID`를 `import.meta.env`에서 읽음
- 네이버 지도 스크립트 동적 로드
- Client ID가 없거나 지도 로딩 실패 시 fallback 지도 표시
- 빈집 좌표 기반 마커 표시
- 위험도별 색상 구분
  - 위험: red
  - 주의: amber
  - 관심: blue
  - 정비완료: green
- 마커 클릭 시 주소, 위험도, 우선순위, 총점 표시

### 3. AI 추천 기능 형태

AI 분석/추천 탭에서 사용자가 빈집을 선택하고 `AI 추천 요청`을 누르면 다음 정보가 백엔드로 전달될 수 있게 준비되어 있습니다.

```json
{
  "houseId": "H-001",
  "address": "영천시 완산동 123-4",
  "coordinate": {
    "lat": 35.9736,
    "lng": 128.9387
  },
  "parcelCode": {
    "sigunguCd": "47230",
    "bjdongCd": "10100",
    "platGbCd": "0",
    "bun": "0123",
    "ji": "0004"
  }
}
```

현재 `VITE_API_BASE_URL`이 있으면 `POST /api/maintenance/analyze`를 시도합니다. 실패하면 프론트 mock 추천 결과를 표시합니다.

### 4. 로봇 관제 범위 정리

로봇 상태 기능은 제외했습니다.

제외한 것:

- 배터리
- 현재 위치 상태 카드
- 다음 목적지 상태 카드
- 연결 상태
- 로봇 상태 API

남긴 것:

- 순찰 카메라 영역
- 빈집 도착 촬영 이력
- 순찰 경로
- 향후 WebSocket 연동 준비

통합 대시보드에도 compact 형태의 순찰 카메라와 순찰 경로가 추가되어 있습니다.

### 5. 실종자 알림 안전 표현

실종자 관련 UI는 실제 식별이나 자동 신고처럼 보이지 않도록 표현을 제한했습니다.

사용 중인 표현:

- 실종자 후보
- 담당자 확인 필요
- 담당자 검토 표시
- 유사도

사용하지 않는 표현:

- 실종자 확정
- 자동 신고 완료
- 실제 신고 완료
- 신원 확정

---

## 현재 백엔드 연동 준비 상태

### 이미 프론트에서 시도하는 실제 API

```text
POST /api/maintenance/analyze
GET /api/graph
GET /api/arrival/{houseId}
GET /arrival/{houseId}
```

주의:

- 위 API는 실패해도 앱이 깨지지 않고 mock 데이터로 fallback합니다.
- WebSocket은 아직 구현하지 않았습니다.
- 공공데이터 API는 프론트에서 직접 호출하지 않습니다.

---

## 팀원에게 요청해야 할 것

### 백엔드 팀 요청사항

1. `VITE_API_BASE_URL`로 사용할 최종 백엔드 주소를 확정해 주세요.

현재 후보:

```text
https://yc.jun0.dev
```

2. CORS 허용 도메인을 확정해 주세요.

개발 중에는 최소한 아래가 필요합니다.

```text
http://localhost:5173
```

배포 후에는 프론트 배포 도메인도 추가해야 합니다.

3. 빈집 촬영 이력 조회 API 경로를 하나로 확정해 주세요.

현재 문서와 코드에서 후보가 섞여 있습니다.

```text
GET /api/arrival/{houseId}
GET /arrival/{houseId}
```

프론트는 현재 둘 다 시도하지만, 최종적으로는 하나로 정리하는 것이 좋습니다.

추천:

```text
GET /api/arrival/{houseId}
```

4. 촬영 이력 응답 형태를 확정해 주세요.

프론트에서 가장 다루기 쉬운 형태:

```json
[
  {
    "id": "ARR-001",
    "houseId": "H-001",
    "timestamp": "2026-05-10T14:31:20",
    "imageUrl": "/uploads/robots/robot-01/images/H-001.jpg",
    "x": 8.65,
    "y": -0.42,
    "analysisResult": "이상징후",
    "analysisSummary": "외벽 균열 가능성이 감지되었습니다."
  }
]
```

5. 이미지 URL 접근 방식을 확정해 주세요.

프론트는 다음 두 방식을 모두 처리할 수 있습니다.

```text
/uploads/robots/robot-01/images/H-001.jpg
https://yc.jun0.dev/uploads/robots/robot-01/images/H-001.jpg
```

단, 상대 경로를 주는 경우 백엔드 base URL과 합쳐서 접근 가능한 정적 파일 서빙이 필요합니다.

6. 순찰 경로 조회 API를 확정해 주세요.

현재 프론트는 다음 API를 시도합니다.

```text
GET /api/graph
```

현재 기대하는 최소 응답:

```json
{
  "type": "graph",
  "houses": {
    "H1": {
      "pos": [8.65, -0.42],
      "yaw": -1.184
    }
  }
}
```

프론트는 이 값을 SVG 경로 표시용 좌표로 변환합니다.

7. AI 추천 API를 확정해 주세요.

현재 프론트 요청:

```text
POST /api/maintenance/analyze
```

요청에는 `houseId`, `address`, `coordinate`, `parcelCode`가 들어갑니다.

백엔드가 해야 할 일:

- 해당 빈집 정보로 AI Agent 분석 실행
- 결과 DB 저장
- 추천 결과 반환

응답 필드:

```json
{
  "houseId": "H-001",
  "recommendedUse": "생활안전 거점 + 소규모 커뮤니티 공간",
  "buildingScale": "지상 2층, 연면적 180㎡ 내외",
  "expectedCost": "약 3.2억 원",
  "expectedReturn": "공공안전 개선 및 생활권 회복",
  "feasibility": "높음",
  "reason": "추천 근거"
}
```

8. 대시보드 기본 API 제공 여부를 확인해 주세요.

프론트 문서 기준으로는 아래 API가 있으면 좋습니다.

```text
GET /api/dashboard
GET /api/houses
GET /api/events
GET /api/maintenance
```

아직 준비되지 않았다면 프론트는 계속 mock으로 시연할 수 있습니다.

9. 실종자 후보 이벤트를 어디로 받을지 확정해 주세요.

후보:

```text
GET /api/events
GET /api/missing-person-events
WebSocket /ws/dashboard
```

프론트에서는 자동 신고나 신고서 작성이 아니라 “담당자 확인 필요”와 “담당자 검토 표시” 흐름으로만 표시할 예정입니다.

### 로봇 팀 요청사항

1. `house_id` 포맷을 백엔드/프론트와 맞춰 주세요.

현재 프론트 mock 데이터:

```text
H-001
H-002
H-003
```

백엔드 연동 문서 예시:

```text
H1
H2
H3
```

둘 중 하나로 통일하는 것이 좋습니다.

추천:

```text
H-001
```

2. 사진 업로드 시 `house_id`를 함께 보내는지 확인해 주세요.

촬영 이력을 빈집별로 보여주려면 다음 정보가 필요합니다.

```text
image
house_id
x
y
timestamp
```

3. 그래프 데이터의 `houses` 키와 사진 업로드의 `house_id`가 같은 규칙을 쓰는지 확인해 주세요.

예:

```json
{
  "houses": {
    "H-001": {
      "pos": [8.65, -0.42],
      "yaw": -1.184
    }
  }
}
```

4. WebSocket은 아직 프론트에서 구현하지 않았습니다.

로봇/백엔드 쪽에서 `/ws/dashboard` 메시지 포맷이 확정되면 프론트에서 다음 단계로 붙일 수 있습니다.

필요한 메시지 후보:

```text
graph
plan
pos
status
video_frame
arrival_ack
```

### AI 팀 요청사항

1. 재건축 추천 결과 필드를 프론트와 맞춰 주세요.

필수 필드:

```text
houseId
recommendedUse
buildingScale
expectedCost
expectedReturn
feasibility
reason
```

2. `feasibility` 값은 아래 중 하나로 맞춰 주세요.

```text
높음
보통
낮음
```

3. 실종자 탐지 결과는 실제 개인정보가 아니라 후보 이벤트 형태로 내려 주세요.

프론트에서 안전하게 표시할 수 있는 필드:

```text
eventId
detectedAt
location
similarity
description
status: 담당자 확인 필요
```

---

## 프론트 보안 원칙

프론트에는 아래 값을 넣지 않습니다.

- OpenAI API Key
- Claude API Key
- VLM/LLM API Key
- 공공데이터 serviceKey
- 백엔드 secret key
- private token

네이버 지도 Client ID만 프론트에서 사용할 수 있으며, 반드시 `.env`의 `VITE_NAVER_MAP_CLIENT_ID`로 관리합니다.

---

## 환경변수

프론트에서 사용하는 환경변수:

```env
VITE_API_BASE_URL=https://yc.jun0.dev
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

주의:

- `.env`는 Git에 올리지 않습니다.
- `.env.example`만 공유합니다.
- Naver Map Client Secret은 프론트에서 사용하지 않습니다.

---

## 현재 검증 상태

최근 검증 명령:

```bash
npm run build
npm run lint
```

두 명령 모두 통과했습니다.

---

## 다음 프론트 작업 후보

1. 백엔드 실제 응답을 받아 `dashboardApi.ts`의 mock fallback 코드를 실제 API 중심으로 정리
2. `GET /api/arrival/{houseId}` 응답 확정 후 촬영 이력 카드 실제 이미지 표시
3. `GET /api/graph` 응답 확정 후 순찰 경로 SVG 표시 개선
4. 실종자 후보 이벤트 API 확정 후 실종자 알림 탭에 실제 이벤트 반영
5. `/ws/dashboard`가 확정되면 WebSocket 기반 실시간 위치/경로 갱신 구현
