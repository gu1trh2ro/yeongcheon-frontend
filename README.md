# 영천시 빈집 관리 및 자율주행 방범 대시보드

Star City Yeongcheon Smart Safety Platform 프론트엔드 저장소입니다.

현재 프론트는 해커톤 데모용 화면, 탭 구조, CSV 기반 빈집 지도/통계, 로봇 관제 목업, AI 분석/추천 화면, 실종자 알림 화면까지 구현되어 있습니다. 다음 담당자는 같은 컴퓨터에서 백엔드와 연결하는 작업을 이어가면 됩니다.

## 팀원이 먼저 할 일

저장소를 클론합니다.

```bash
git clone https://github.com/gu1trh2ro/yeongcheon-frontend.git
cd yeongcheon-frontend
npm install
```

프로젝트 루트에 `.env` 파일을 만듭니다.

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

프론트를 실행합니다.

```bash
npm run dev
```

기본 접속 주소:

```text
http://localhost:5173
```

## 백엔드 연결 핵심 규칙

실제 API 연결은 최대한 이 파일에서만 처리합니다.

```text
src/api/dashboardApi.ts
```

컴포넌트 안에 직접 `fetch()`를 흩뿌리지 말아 주세요.

현재 흐름:

```text
컴포넌트
→ dashboardApi.ts
→ mockData.ts 또는 list.csv 기반 데이터
```

연결 후 목표:

```text
컴포넌트
→ dashboardApi.ts
→ 로컬 백엔드 API
```

## 같은 컴퓨터 연결 기준

권장 실행 구조:

```text
C:\dev\yeongcheon-frontend
C:\dev\yeongcheon-backend
```

백엔드 권장 주소:

```text
http://localhost:8000
```

백엔드는 CORS에 아래 주소를 허용해야 합니다.

```text
http://localhost:5173
http://127.0.0.1:5173
```

## 현재 프론트가 직접 처리하는 것

`list.csv` 기반 데이터는 현재 프론트에서 직접 처리합니다.

관련 파일:

```text
list.csv
src/data/vacantHouseDistribution.ts
```

프론트가 직접 계산하는 값:

- 전체 빈집 수
- 고위험 빈집 수: `등급판정결과`가 `3등급` 또는 `4등급`인 빈집 수
- 행정동별 빈집 수
- 행정동별 등급 개수
- 빈집점수 TOP 4
- 행정동 빈집 수 TOP 4

따라서 지금 당장 백엔드가 빈집 통계 API를 반드시 만들 필요는 없습니다. 나중에 백엔드가 CSV를 관리하게 되면 같은 값을 API로 내려주고 프론트의 CSV 직접 import를 제거하면 됩니다.

## 백엔드 연결이 필요한 주요 기능

### AI 재건축 용도 추천

흐름:

```text
프론트에서 빈집 주소/좌표/지번 정보 전달
→ 백엔드
→ AI 에이전트 추천
→ 백엔드 응답
→ 프론트 표시
```

현재 프론트 준비 함수:

```text
src/api/dashboardApi.ts
analyzeReconstructionRecommendation()
```

현재 호출 대상:

```text
POST /api/maintenance/analyze
```

현재는 JSON으로 주소, 좌표, 지번 코드를 보냅니다. 집 사진 업로드는 UI 미리보기만 있고 실제 전송은 아직 연결하지 않았습니다. 사진까지 필요하면 `multipart/form-data` API가 추가로 필요합니다.

### AI 이상 탐지 요약

현재 화면은 준비되어 있지만 실제 API는 아직 없습니다.

추천 API:

```text
GET /api/ai/anomaly-summary
```

필요 데이터:

- 정상 기준 이미지 URL
- 이상 탐지 이미지 URL
- 분석 제목
- 분석 설명
- 위험 점수
- 탐지 시각
- 관련 빈집 주소

### 로봇 순찰 경로

현재 프론트가 이미 시도하는 API:

```text
GET /api/graph
```

관련 함수:

```text
getPatrolRoute()
```

### 로봇 촬영 이미지

현재 프론트가 이미 시도하는 API:

```text
GET /api/arrival/{houseId}
GET /arrival/{houseId}
```

관련 함수:

```text
getPatrolArrivalPhotos()
```

이미지 경로가 `/uploads/...`처럼 오면 프론트가 `VITE_API_BASE_URL`을 붙여 표시할 수 있습니다.

### 실종자 리스트

추천 API:

```text
GET /api/missing-persons?region=yeongcheon
```

주의:

- 공공데이터 serviceKey는 백엔드에만 둡니다.
- 프론트에서 경찰청 공공데이터 API를 직접 호출하지 않습니다.
- 영천시 관련 데이터만 가공해서 내려주는 것을 권장합니다.
- 백엔드가 `photoUrl`을 내려주면 실종자 리스트의 사진 칸에 표시됩니다. 값이 없으면 `사진 미제공` placeholder가 표시됩니다.

### 실종자 발견 로그

추천 API:

```text
GET /api/missing-person-detection-logs
```

현재 프론트 동작:

- `담당자 확인 필요` 상태의 발견 로그가 있으면 알림 모달 표시
- 왼쪽 `실종자 알림` 탭에 느낌표 표시
- 사용자가 확인하면 실종자 알림 탭으로 이동
- 실종자 확정, 자동 신고, 신원 확정처럼 표시하지 않음
- 신고서 작성 기능은 제외됨

## 자세한 인수인계 문서

백엔드 연결 담당자는 아래 문서를 먼저 읽어 주세요.

```text
docs/backend-integration-handoff.md
```

API 응답 예시는 아래 문서도 참고합니다.

```text
docs/api-spec.md
```

보안 관련 주의사항:

```text
docs/security-checklist.md
```

## 보안 주의

프론트에 넣으면 안 되는 값:

- 공공데이터 serviceKey
- OpenAI API Key
- VLM/LLM API Key
- 백엔드 Secret
- 개인 토큰

네이버 지도 Client ID는 프론트에서 사용할 수 있지만 `.env`로 관리합니다.

`.env`는 GitHub에 올리지 않습니다.

## 검증 명령어

작업 후 아래 명령어를 확인합니다.

```bash
npm run lint
npm run build
```

## 연결 완료 체크리스트

- 프론트가 `http://localhost:5173`에서 실행되는가
- 백엔드가 `http://localhost:8000`에서 실행되는가
- `.env`의 `VITE_API_BASE_URL`이 백엔드 주소와 맞는가
- 백엔드 CORS가 프론트 주소를 허용하는가
- 통합 대시보드가 깨지지 않는가
- 빈집 지도 또는 fallback UI가 정상 표시되는가
- 관제 로그에 실종자 후보, 이상 탐지, 로봇 순찰 로그가 표시되는가
- AI 재건축 추천 요청 후 응답이 화면에 표시되는가
- 로봇 촬영 이미지 URL이 브라우저에서 접근 가능한가
- 실종자 발견 로그가 있을 때 알림 모달이 표시되는가
- `npm run lint`가 통과하는가
- `npm run build`가 통과하는가
