# 백엔드 연결 인수인계 문서

## 목적

이 문서는 프론트엔드 작업자가 아닌 다음 담당자가 같은 컴퓨터에서 백엔드와 프론트엔드를 연결할 때 참고하기 위한 문서입니다.

현재 프론트는 해커톤 데모용 화면, 탭 구조, CSV 기반 빈집 지도/통계, 로봇 관제 목업, AI 분석/추천 화면, 실종자 알림 화면까지 구성되어 있습니다. 이제 남은 핵심 작업은 백엔드 실행 환경을 같은 PC에 두고 `src/api/dashboardApi.ts`를 실제 API 호출 중심으로 연결하는 것입니다.

---

## 현재 프론트 상태

구현된 화면:

- 통합 대시보드
- 빈집 관리
- 로봇 관제
- AI 분석/추천
- 실종자 알림

현재 데이터 흐름:

```text
프론트 컴포넌트
↓
src/api/dashboardApi.ts
↓
mockData.ts 또는 list.csv 기반 가공 데이터
```

백엔드 연결 후 목표 데이터 흐름:

```text
프론트 컴포넌트
↓
src/api/dashboardApi.ts
↓
로컬 백엔드 API
↓
공공데이터 / DB / AI 에이전트 / 로봇 데이터
```

중요 원칙:

- 컴포넌트에서 직접 `fetch()`를 추가하지 않습니다.
- 실제 API 연결은 최대한 `src/api/dashboardApi.ts` 안에서 처리합니다.
- `.env`에는 키를 넣을 수 있지만 `.env` 파일은 커밋하지 않습니다.
- 공공데이터 serviceKey, AI API Key, 백엔드 Secret은 프론트에 넣지 않습니다.

---

## 실행 환경 기준

권장 폴더 예시:

```text
C:\dev\yeongcheon-frontend
C:\dev\yeongcheon-backend
```

프론트 실행:

```bash
npm install
npm run dev
```

프론트 기본 주소:

```text
http://localhost:5173
```

백엔드 권장 주소:

```text
http://localhost:8000
```

프론트 `.env` 예시:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

백엔드 CORS 허용 필요:

```text
http://localhost:5173
http://127.0.0.1:5173
```

---

## 프론트에서 이미 처리하는 데이터

### 빈집 CSV 통계

현재 빈집 통계와 빈집 분포 지도는 `list.csv`를 프론트에서 직접 읽어서 처리합니다.

관련 파일:

```text
list.csv
src/data/vacantHouseDistribution.ts
```

현재 프론트가 직접 계산하는 값:

- 전체 빈집 수: `list.csv` 전체 행 기준
- 고위험 빈집 수: `등급판정결과`가 `3등급` 또는 `4등급`인 빈집 수
- 행정동별 빈집 수
- 행정동별 등급 개수
- 빈집점수 TOP 4
- 행정동 빈집 수 TOP 4

따라서 지금 당장 백엔드가 빈집 통계를 내려줄 필요는 없습니다.

다만 나중에 백엔드가 `list.csv`를 관리하게 되면, 같은 데이터를 API로 내려주고 프론트의 CSV 직접 import를 제거하면 됩니다.

---

## 실제 백엔드 연결이 필요한 기능

### 1. AI 재건축 용도 추천

기능 개념:

```text
사용자
↓
프론트에서 빈집 선택 또는 주소/사진 입력
↓
백엔드에 빈집 정보 전달
↓
백엔드가 AI 에이전트 호출
↓
AI 추천 결과를 DB 저장 또는 즉시 생성
↓
프론트에 추천 결과 반환
```

현재 프론트에 이미 준비된 함수:

```text
src/api/dashboardApi.ts
analyzeReconstructionRecommendation()
```

현재 호출 대상:

```text
POST /api/maintenance/analyze
```

현재 프론트가 보낼 수 있는 JSON:

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

프론트가 기대하는 응답:

```json
{
  "houseId": "H-001",
  "recommendedUse": "생활안전 거점 + 커뮤니티 공간",
  "buildingScale": "지상 2층, 연면적 180㎡ 내외",
  "expectedCost": "약 3.2억 원",
  "expectedReturn": "공공안전 개선 및 생활권 회복",
  "feasibility": "높음",
  "reason": "완산동 생활권과 접근성이 좋고 위험도 점수가 높아 정비 효과가 큽니다."
}
```

주의:

- 현재 사진 파일은 UI에서 선택/미리보기만 됩니다.
- 사진까지 AI 추천에 사용하려면 `multipart/form-data` API가 추가로 필요합니다.
- 이 경우 `analyzeReconstructionRecommendation()`을 JSON 전송에서 `FormData` 전송으로 바꿔야 합니다.

추천 추가 API:

```text
POST /api/maintenance/analyze-with-image
```

또는 기존 `/api/maintenance/analyze`가 `multipart/form-data`를 받도록 확장해도 됩니다.

---

### 2. AI 이상 탐지 요약

현재 AI 이상 탐지 요약 카드는 화면만 준비되어 있고 실제 API는 아직 없습니다.

필요한 백엔드 데이터:

- 정상 기준 이미지 URL
- 이상 탐지 이미지 URL
- 이상 탐지 제목
- 분석 설명
- 종합 위험 점수
- 현장 접근성 점수
- 인구 밀집도 점수
- 탐지 시각
- 관련 빈집 주소

추천 API:

```text
GET /api/ai/anomaly-summary
```

예상 응답:

```json
{
  "eventId": "A-001",
  "title": "완산동 123-4 외벽 파손 가능성",
  "address": "영천시 완산동 123-4",
  "detectedAt": "2026-05-10T14:31:20",
  "normalImageUrl": "http://localhost:8000/uploads/normal/H-001.jpg",
  "anomalyImageUrl": "http://localhost:8000/uploads/anomaly/H-001.jpg",
  "summary": "순찰 이미지에서 외벽 균열 가능성이 감지되었습니다.",
  "riskScore": 91,
  "accessibilityScore": 85,
  "populationDensityScore": 78
}
```

---

### 3. 로봇 순찰 경로

현재 프론트는 이미 백엔드 API를 시도합니다.

관련 함수:

```text
src/api/dashboardApi.ts
getPatrolRoute()
```

현재 호출 대상:

```text
GET /api/graph
```

현재 동작:

- `VITE_API_BASE_URL`이 없으면 mock 순찰 경로 사용
- `/api/graph` 호출 성공 시 백엔드 graph 데이터를 프론트 순찰 경로 형태로 변환
- 실패하면 mock 순찰 경로 사용

백엔드 응답 예시:

```json
{
  "type": "graph",
  "nodes": {
    "N0": [8.9, 8.5],
    "N1": [8.3, 8.2]
  },
  "edges": {
    "N0": ["N1"],
    "N1": ["N0"]
  },
  "houses": {
    "H1": {
      "pos": [8.65, -0.42],
      "yaw": -1.184
    }
  }
}
```

---

### 4. 로봇 촬영 이미지 / Last Capture

현재 프론트는 이미 백엔드 API를 시도합니다.

관련 함수:

```text
src/api/dashboardApi.ts
getPatrolArrivalPhotos()
```

현재 호출 후보:

```text
GET /api/arrival/{houseId}
GET /arrival/{houseId}
```

현재 동작:

- 각 mock 빈집 `houseId`에 대해 촬영 이미지 API를 시도
- 실패하거나 응답이 비어 있으면 mock 촬영 이력 사용
- 이미지 경로가 `/uploads/...`처럼 `/`로 시작하면 `VITE_API_BASE_URL`을 붙여 표시

권장 응답:

```json
[
  {
    "id": "ARR-001",
    "timestamp": "2026-05-10T14:31:20",
    "photo": "/uploads/robots/robot-01/images/H-001.jpg",
    "x": 8.65,
    "y": -0.42,
    "analysis_result": "이상징후",
    "analysis_summary": "외벽 균열 가능성이 감지되었습니다."
  }
]
```

---

### 5. 로봇 관제 로그

현재 로봇 관제 로그는 mock 데이터입니다.

필요하면 백엔드 API를 추가합니다.

추천 API:

```text
GET /api/robot/activity-logs
```

프론트 기대 형태:

```json
[
  {
    "logId": "LOG-001",
    "timestamp": "2026-05-10T14:47:49",
    "message": "로봇 순찰 시작: 완산동 위험 빈집 경로를 실행했습니다.",
    "tone": "success"
  }
]
```

허용 tone:

```text
info
success
warning
```

---

### 6. 실종자 리스트

현재 프론트는 mock 실종자 리스트를 사용합니다.

중요:

- 실종자 리스트는 공공데이터 API에서 받은 값 중 영천시 관련 데이터만 보여주는 것이 목표입니다.
- 공공데이터 serviceKey는 반드시 백엔드에만 있어야 합니다.
- 프론트에서 경찰청 공공데이터 API를 직접 호출하면 안 됩니다.

추천 API:

```text
GET /api/missing-persons?region=yeongcheon
```

프론트 기대 형태:

```json
[
  {
    "profileId": "MP-001",
    "photoUrl": "/uploads/missing-persons/MP-001.jpg",
    "rnum": 5,
    "occrde": "20230717",
    "alldressingDscd": null,
    "ageNow": "89",
    "age": 86,
    "writngTrgetDscd": "070",
    "sexdstnDscd": "남자",
    "occrAdres": "경상북도 영천시 완산동",
    "nm": "황시모",
    "nltyDscd": "내국인",
    "height": 165,
    "bdwgh": 55,
    "frmDscd": "마름",
    "faceshpeDscd": "갸름한형",
    "hairshpeDscd": "짧은머리(생머리)",
    "haircolrDscd": "백색"
  }
]
```

`photoUrl`은 선택 필드입니다. 값이 없거나 이미지 로딩에 실패하면 프론트는 실종자 리스트에 `사진 미제공` placeholder를 표시합니다.

---

### 7. 실종자 발견 로그

로봇이 실종자 후보를 탐지하면 프론트의 실종자 알림 화면과 통합 대시보드 로그에 표시되어야 합니다.

현재 프론트 동작:

- `담당자 확인 필요` 상태의 발견 로그가 있으면 알림 모달 표시
- 왼쪽 `실종자 알림` 탭에 느낌표 표시
- 사용자가 알림을 확인하면 실종자 알림 탭으로 이동
- 실종자 확정이나 자동 신고처럼 표시하지 않음

추천 API:

```text
GET /api/missing-person-detection-logs
```

프론트 기대 형태:

```json
[
  {
    "logId": "MLOG-001",
    "candidateName": "발견 후보 A",
    "candidateAgeLabel": "80대 추정",
    "candidateGender": "남자",
    "detectedAt": "2026-05-10T14:30:00",
    "location": "영천시 완산동 123-4 인근",
    "similarity": 82,
    "robotId": "robot-01",
    "cameraLabel": "전방 카메라",
    "status": "담당자 확인 필요",
    "description": "AI/YOLO 기반 탐지 결과 실종자 후보로 분류된 이벤트입니다.",
    "evidenceSummary": "보행자 객체, 연령대, 체형 특징이 로봇 탐지 기준과 일부 유사합니다."
  }
]
```

허용 status:

```text
담당자 확인 필요
확인중
처리완료
```

중요:

- 발견 로그와 실종자 리스트는 자동으로 동일 인물 확정 처리하면 안 됩니다.
- UI 표현은 “실종자 후보”, “담당자 확인 필요”, “담당자 검토 표시” 중심으로 유지합니다.
- 신고서 작성 기능은 현재 프론트에서 제거했습니다.

---

## 통합 대시보드 로그

통합 대시보드의 `관제 로그`는 다음 데이터를 섞어서 보여줍니다.

- 실종자 후보 발견 이벤트
- 빈집 이상 징후 탐지 이벤트
- 로봇 순찰 시작/도착/촬영 로그
- 정비 우선순위 갱신 이벤트

현재 관련 데이터:

```text
src/data/mockData.ts
recentEvents
robotActivityLogs
```

백엔드 연결 시 추천 API:

```text
GET /api/events
GET /api/robot/activity-logs
```

`GET /api/events` 기대 형태:

```json
[
  {
    "eventId": "E-001",
    "type": "MISSING_PERSON_CANDIDATE",
    "title": "실종자 후보 발견",
    "location": "완산동 123-4 인근",
    "detectedAt": "2026-05-10T14:30:00",
    "status": "미확인",
    "severity": "HIGH",
    "description": "AI/YOLO 기반 탐지 후 담당자 확인 필요 상태입니다."
  }
]
```

허용 type:

```text
MISSING_PERSON_CANDIDATE
VACANT_HOUSE_ANOMALY
PATROL_COMPLETE
MAINTENANCE_RECOMMENDATION
```

허용 status:

```text
미확인
확인중
처리완료
```

허용 severity:

```text
HIGH
MEDIUM
LOW
```

---

## 네이버 지도

관련 파일:

```text
src/components/dashboard/VacantHouseMap.tsx
```

현재 동작:

- `VITE_NAVER_MAP_CLIENT_ID`가 있으면 네이버 지도 API v3 스크립트를 동적으로 로드합니다.
- Client ID가 없거나 로딩 실패 시 fallback 지도 UI를 표시합니다.
- 지도 마커는 현재 `list.csv`의 행정동별 집계 기반입니다.
- 마커 이미지는 `public/yeongcheon_blue_mascot_wave.svg`, `public/yeongcheon_pink_mascot_wave.svg`를 사용합니다.

백엔드 연결 시 바로 필요한 작업은 아닙니다.

나중에 백엔드가 빈집 분포 데이터를 내려주게 되면 `VacantHouseMap.tsx`가 `src/data/vacantHouseDistribution.ts`를 직접 import하지 않고 API adapter를 통해 데이터를 받도록 변경하면 됩니다.

---

## 프론트 수정 우선순위

백엔드 담당자가 연결할 때 추천 순서:

1. `.env`에 `VITE_API_BASE_URL` 설정
2. 백엔드 CORS 설정
3. `/api/graph` 연결 확인
4. `/api/arrival/{houseId}` 연결 확인
5. `/api/maintenance/analyze` 연결 확인
6. `/api/events` 연결
7. `/api/missing-persons` 연결
8. `/api/missing-person-detection-logs` 연결
9. 필요하면 AI 이상 탐지 요약 API 추가
10. `npm run build` 통과 확인

---

## 백엔드 담당자에게 꼭 전달할 것

- 프론트는 `src/api/dashboardApi.ts`를 중심으로 연결합니다.
- 컴포넌트에 직접 `fetch()`를 추가하지 않는 방향이 좋습니다.
- 응답 날짜는 ISO string 형식을 권장합니다.
- 이미지 URL은 프론트에서 접근 가능한 URL이어야 합니다.
- `/uploads/...`처럼 상대 경로를 줄 경우 프론트는 `VITE_API_BASE_URL`을 붙여 표시할 수 있습니다.
- 공공데이터 serviceKey와 AI API Key는 프론트에 절대 노출하지 않습니다.
- 실종자 기능은 자동 신고, 실종자 확정, 신원 확정처럼 보이면 안 됩니다.
- 신고서 작성 기능은 현재 제외했습니다.

---

## 연결 완료 검증 체크리스트

- 통합 대시보드가 정상 로드되는가
- 전체 빈집/고위험 빈집 수가 CSV 기준으로 표시되는가
- 관제 로그에 실종자 후보, 이상 탐지, 로봇 순찰 로그가 함께 표시되는가
- 네이버 지도 Client ID가 없을 때 fallback UI가 깨지지 않는가
- 네이버 지도 Client ID가 있을 때 빈집 분포 마커가 표시되는가
- 로봇 관제 탭에서 라이브 맵, 카메라, 미션 컨트롤, Last Capture, Activity Log가 깨지지 않는가
- AI 분석/추천에서 빈집 추천 요청 후 백엔드 응답이 카드에 표시되는가
- 실종자 발견 로그가 있으면 알림 모달이 표시되는가
- 실종자 알림 상세 팝업이 열리는가
- `npm run lint`가 통과하는가
- `npm run build`가 통과하는가
