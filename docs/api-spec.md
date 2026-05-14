# API Spec

프론트는 아래 API 형식을 기준으로 mockData를 먼저 만들고, 백엔드 완성 후 실제 API로 교체한다.

---

## GET /api/dashboard

대시보드 요약 정보를 반환한다.

### Response

```json
{
  "vacantHouseCount": 147,
  "maintenanceRate": 32,
  "highRiskHouseCount": 23,
  "todayAnomalyCount": 7,
  "missingPersonCandidateCount": 1
}
```

---

## GET /api/houses

영천시 빈집 목록과 지도 표시 정보를 반환한다.

### Response

```json
[
  {
    "houseId": "H-001",
    "address": "영천시 완산동 123-4",
    "lat": 35.9736,
    "lng": 128.9387,
    "parcelCode": {
      "sigunguCd": "47230",
      "bjdongCd": "10100",
      "platGbCd": "0",
      "bun": "0123",
      "ji": "0004"
    },
    "riskLevel": "위험",
    "priorityRank": 1,
    "oldness": 92,
    "accessibility": 85,
    "populationDensity": 78,
    "totalScore": 91
  },
  {
    "houseId": "H-002",
    "address": "영천시 도림동 456-7",
    "lat": 35.9688,
    "lng": 128.9301,
    "parcelCode": {
      "sigunguCd": "47230",
      "bjdongCd": "10900",
      "platGbCd": "0",
      "bun": "0456",
      "ji": "0007"
    },
    "riskLevel": "주의",
    "priorityRank": 2,
    "oldness": 81,
    "accessibility": 70,
    "populationDensity": 65,
    "totalScore": 82
  }
]
```

---

## GET /api/events

최근 이벤트 목록을 반환한다.

### Response

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
    "description": "YOLO 기반 인물 객체 탐지 후 실종자 후보 이벤트가 발생했습니다."
  },
  {
    "eventId": "E-002",
    "type": "VACANT_HOUSE_ANOMALY",
    "title": "빈집 이상 징후 탐지",
    "location": "도림동 456-7",
    "detectedAt": "2026-05-10T13:20:00",
    "status": "확인중",
    "severity": "MEDIUM",
    "description": "AI Agent가 외벽 훼손 가능성을 탐지했습니다."
  }
]
```

---

## POST /api/events/{eventId}/resolve

이벤트를 처리 완료 상태로 변경한다.

### Request

```json
{
  "memo": "담당자 확인 완료"
}
```

### Response

```json
{
  "eventId": "E-001",
  "status": "처리완료"
}
```

---

## GET /api/maintenance

빈집 정비 우선순위 목록을 반환한다.

### Response

```json
[
  {
    "rank": 1,
    "houseId": "H-001",
    "address": "영천시 완산동 123-4",
    "riskLevel": "위험",
    "oldness": 92,
    "accessibility": 85,
    "populationDensity": 78,
    "totalScore": 91,
    "reason": "위험도가 높고 인구 밀집 지역과 가까워 우선 정비가 필요합니다."
  },
  {
    "rank": 2,
    "houseId": "H-002",
    "address": "영천시 도림동 456-7",
    "riskLevel": "주의",
    "oldness": 81,
    "accessibility": 70,
    "populationDensity": 65,
    "totalScore": 82,
    "reason": "건물 노후도가 높고 접근성이 좋아 정비 효과가 기대됩니다."
  }
]
```

---

## GET /api/graph

순찰 경로 표시를 위한 도로 그래프와 빈집 좌표를 반환한다.

현재 프론트는 이 API 호출에 실패하면 mock 순찰 경로를 표시한다.

### Response

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
    },
    "H2": {
      "pos": [-3.73, -8.54],
      "yaw": -0.847
    }
  }
}
```

---

## GET /api/arrival/{houseId}

특정 빈집의 로봇 촬영 이력을 반환한다.

현재 백엔드 문서 호환을 위해 프론트는 `/api/arrival/{houseId}`를 먼저 시도하고, 실패하면 `/arrival/{houseId}`도 시도한다. 두 요청이 모두 실패하면 mock 촬영 이력을 표시한다.

### Response

```json
[
  {
    "id": "ARR-001",
    "timestamp": "2026-05-10T14:31:20",
    "photo": "/uploads/robots/robot-01/images/H-001.jpg",
    "x": "8.65",
    "y": "-0.42",
    "analysis_result": "이상징후",
    "analysis_summary": "외벽 균열 가능성이 감지되었습니다."
  }
]
```

---

## POST /api/maintenance/analyze

특정 빈집에 대해 AI Agent 기반 재건축 추천 결과를 반환한다.

프론트는 사용자가 선택한 빈집의 주소, 좌표, 지번 코드를 함께 전송한다.
백엔드는 이 정보를 기준으로 AI Agent 분석을 실행하고, 결과를 DB에 저장한 뒤 추천 결과를 반환한다.

### Request

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

### Request Fields

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `houseId` | string | 필 | 프론트/백엔드에서 사용하는 빈집 식별자 |
| `address` | string | 필 | 사용자가 선택한 빈집 주소 또는 지번 표시명 |
| `coordinate.lat` | number | 필 | 빈집 위도 |
| `coordinate.lng` | number | 필 | 빈집 경도 |
| `parcelCode.sigunguCd` | string | 필 | 시군구코드 |
| `parcelCode.bjdongCd` | string | 필 | 법정동코드 |
| `parcelCode.platGbCd` | string | 필 | 대지구분코드. `0`: 대지, `1`: 산, `2`: 블록 |
| `parcelCode.bun` | string | 필 | 본번. 4자리 문자열 권장 |
| `parcelCode.ji` | string | 필 | 부번. 4자리 문자열 권장 |

### Response

```json
{
  "houseId": "H-001",
  "recommendedUse": "주거 + 상업 복합",
  "buildingScale": "2F ~ 3F",
  "expectedCost": "약 3.2억원",
  "expectedReturn": "연 6.8%",
  "feasibility": "높음",
  "reason": "인구 밀도와 접근성이 높고, 빈집 위험도가 높아 우선 정비 효과가 큽니다. 주변 상권과 연계하면 복합 생활 거점으로 활용 가능성이 있습니다."
}
```

---

## 데이터 표현 규칙

### riskLevel

빈집 위험도는 아래 값 중 하나를 사용한다.

```text
위험
주의
관심
정비완료
```

### event type

이벤트 종류는 아래 값을 우선 사용한다.

```text
MISSING_PERSON_CANDIDATE
VACANT_HOUSE_ANOMALY
PATROL_COMPLETE
MAINTENANCE_RECOMMENDATION
```

### event status

이벤트 처리 상태는 아래 값을 사용한다.

```text
미확인
확인중
처리완료
```

### severity

이벤트 심각도는 아래 값을 사용한다.

```text
HIGH
MEDIUM
LOW
```

### parcelCode

빈집 재건축 추천 요청에는 건축물대장/공공데이터 조회에 필요한 지번 코드를 함께 보낸다.

```json
{
  "sigunguCd": "47230",
  "bjdongCd": "10100",
  "platGbCd": "0",
  "bun": "0123",
  "ji": "0004"
}
```

| 필드 | 설명 | 예시 |
|------|------|------|
| `sigunguCd` | 시군구코드 | `"47230"` |
| `bjdongCd` | 법정동코드 | `"10100"` |
| `platGbCd` | 대지구분코드. `0`: 대지, `1`: 산, `2`: 블록 | `"0"` |
| `bun` | 본번 | `"0123"` |
| `ji` | 부번 | `"0004"` |

---

## 보안상 주의사항

- 프론트는 공공데이터 API serviceKey를 직접 사용하지 않는다.
- 프론트는 OpenAI, Claude, VLM API Key를 직접 사용하지 않는다.
- 프론트는 백엔드에서 가공된 데이터만 받는다.
- 실종자 데이터는 실제 개인정보를 직접 노출하지 않는다.
- 실종자 관련 UI는 “실종자 후보”, “담당자 확인 필요”, “담당자 검토 표시” 표현을 사용한다.
