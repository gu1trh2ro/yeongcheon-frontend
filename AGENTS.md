# AGENTS.md

## Project Overview

This is the frontend repository for the Yeongcheon vacant-house management and autonomous patrol robot dashboard.

The project concept is:

- Autonomous patrol robot or Unity/Gazebo digital twin patrols vacant houses in Yeongcheon.
- Robot sends camera images, robot status, location, battery, and event data to the backend.
- Backend receives robot data, processes public data, and calls AI/VLM/LLM agents.
- AI agents analyze vacant-house anomalies, missing-person candidate events, maintenance priority, and reconstruction recommendations.
- Frontend dashboard visualizes robot status, vacant-house map, maintenance priority, reconstruction recommendation, missing-person candidate alerts, and recent events.

The user is responsible for:

- Frontend implementation
- Frontend security considerations
- Naver Maps integration
- Dashboard UI/UX for hackathon demo
- Preparing a polished competition-ready screen

The user is new to frontend development, so prioritize:

- Clear structure
- Small incremental changes
- Maintainable code
- Beginner-readable implementation
- Stable demo behavior

All user-facing UI text must be Korean.

---

## Main Product Goal

Build a polished hackathon MVP dashboard that immediately communicates:

1. 영천시 빈집 현황
2. 자율주행 로봇 순찰 상태
3. AI 기반 이상 탐지 결과
4. 빈집 정비 우선순위
5. 재건축 용도 추천
6. 실종자 후보 알림
7. 공공데이터 기반 의사결정
8. 별의 도시 영천 지역 정체성

The dashboard should look like a real public-sector smart city service, not a generic admin dashboard.

---

## Core Behavior Guidelines

These guidelines are intended to reduce common LLM coding mistakes.

Bias toward caution, small changes, and verifiable progress.

---

### 1. Think Before Coding

Before implementing, state a brief plan.

Do not silently assume unclear requirements.

If multiple interpretations exist, explain them briefly and choose the safer/simple MVP path.

If something is unclear and affects implementation, ask before coding.

For small and obvious tasks, proceed with reasonable assumptions but mention them.

Good behavior:

- State what files will be created or edited.
- State what will not be implemented yet.
- Keep the work scoped to the user’s request.
- Mention assumptions if necessary.

Bad behavior:

- Adding features not requested.
- Implementing API, WebSocket, or map integration when the user only asked for layout.
- Making large architecture decisions silently.
- Rewriting the project structure without being asked.

---

### 2. Simplicity First

Use the minimum code that solves the requested task.

Do not over-engineer.

Avoid:

- Redux
- Zustand
- Complex routing
- Unnecessary custom hooks
- Premature abstraction
- Large configuration systems
- Unrequested chart/map libraries
- Excessive animations
- Overly complex state management

This is a hackathon MVP dashboard.

Stability, clarity, and demo reliability are more important than clever architecture.

If a simpler approach works, use it.

---

### 3. Surgical Changes

Touch only the files needed for the current task.

Do not refactor unrelated code.

Do not rewrite the whole project unless explicitly requested.

Do not rename files, components, or folders unless necessary.

When editing existing code:

- Match the existing style.
- Remove unused imports caused by your change.
- Do not delete unrelated code.
- Do not “clean up” adjacent code unless asked.
- Do not introduce large formatting-only diffs.

Every changed line should be traceable to the requested task.

---

### 4. Goal-Driven Execution

For every task, define success criteria.

Example task:

“Create or redesign initial dashboard layout”

Success criteria:

- `npm run dev` works.
- `npm run build` passes.
- Dashboard page renders without runtime error.
- Tab switching works if tabs are requested.
- No real API, Naver Map, or WebSocket is implemented unless explicitly requested.

After changes, report:

- Files changed
- What was implemented
- How to test
- Any assumptions made
- Next recommended step

---

## Important Project Rules

### Mock Data First

Backend APIs may not be ready.

Use mock data first.

Primary mock data file:

```text
src/data/mockData.ts
```

Do not block frontend development while waiting for backend.

Do not call real backend APIs until explicitly requested.

Do not call public-data APIs directly from frontend.

Expected final data flow:

```text
Frontend
↓
Our backend API
↓
Backend calls public data / AI agent
↓
Frontend receives processed JSON
```

---

### API Integration Rule

All future backend calls must go through:

```text
src/api/dashboardApi.ts
```

Do not scatter `fetch()` calls across many components.

Initial implementation should use mock data.

Later implementation can replace mock data with real fetch calls.

Expected APIs are documented in:

```text
docs/api-spec.md
```

Use `docs/api-spec.md` as the source of truth for response shapes.

---

### Public Data Rule

The frontend should visually show that public data is being used.

Important public-data concepts for this project:

- 영천시 빈집 현황
- 영천시/행정동 인구 데이터
- 경찰청 실종경보정보
- 건축물대장정보
- 상가/상권정보
- 기상청 단기예보

However:

- Frontend must not directly call public-data APIs with service keys.
- Public-data service keys must stay in backend.
- Frontend should receive already-processed JSON from backend.
- During MVP development, use mock data that resembles public-data-derived results.

---

## Security Rules

Never expose secret keys in frontend code.

Do not put these in frontend:

- OpenAI API Key
- Claude API Key
- VLM/LLM API Key
- Public-data serviceKey
- Backend secret key
- Private tokens
- Admin credentials

Naver Maps Client ID may be used in frontend, but it must be loaded from `.env`.

Do not commit `.env`.

Only commit `.env.example`.

Use this format:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

Do not use:

```tsx
dangerouslySetInnerHTML
```

Do not store sensitive tokens in:

```text
localStorage
sessionStorage
hardcoded constants
```

---

## Missing-Person Data Rules

Missing-person information is sensitive.

Default demo should use simulated or anonymized data.

Do not show real missing-person names, faces, or detailed personal information by default.

Use safe wording:

- 실종자 후보
- 담당자 확인 필요
- 유사도
- 신고 초안 생성
- 상세 정보 보기
- 모의 신고

Avoid unsafe wording:

- 실종자 확정
- 경찰 자동 신고 완료
- 실제 신고 완료
- 자동 신고 완료
- 신원 확정

The UI should imply human review, not automatic real-world action.

The missing-person alert card should communicate:

- 후보 이벤트 발생
- AI/YOLO 기반 탐지
- 담당자 확인 필요
- 신고 초안 생성 가능

It must not imply final identification or automatic reporting.

---

## Visual Design Direction

The user does not want a fully dark dashboard.

The UI should be inspired by Yeongcheon City's official website style:

- Bright regional identity
- Star City Yeongcheon concept
- Soft sky or celestial background
- Large hero-style visual area
- Smooth background changes by tab
- Public-service dashboard cards over the background

The final UI should feel like:

```text
Star City Yeongcheon Smart Safety Dashboard
별의 도시 영천 스마트 안전 대시보드
```

It should combine:

1. Yeongcheon local identity
2. Public safety dashboard
3. Smart city technology
4. AI/robot monitoring service
5. Public-data-based decision support

Preferred visual style:

- Bright sky-blue, soft mint, ivory, light navy, and white backgrounds
- Soft gold/yellow highlights for star identity
- Blue/cyan accents for robot and AI status
- Red only for urgent alerts
- Amber for caution
- Green for normal/completed
- Glassmorphism-style cards with translucent white backgrounds
- Rounded 2xl cards
- Soft shadows
- Clear information hierarchy
- Tab-specific background themes

Avoid:

- Fully dark admin dashboard
- Plain white admin dashboard
- Tourism-only landing page
- Overuse of star icons
- Toy-like UI
- Too many cards on one screen
- Low contrast text on images
- Background images that make data hard to read
- Excessive decorative effects that hide dashboard data

The UI should be visually polished for a competition, but dashboard data must remain readable.

---

## Local Identity Design Rule

Yeongcheon is known as the “city of stars”.

Reflect this local identity subtly in the UI.

Good examples:

- Small star symbol near the header/title
- Soft sky, star, orbit, or route-line motif
- Very subtle constellation pattern in hero background
- Route or connection lines that feel slightly constellation-inspired
- Soft gold/yellow highlight for selected key points
- Blue/cyan accents for AI and robot status
- Star-shaped point for a selected patrol node or key location

Avoid:

- Cute or playful star graphics
- Too many star icons
- Tourism-poster-only design
- Bright full-screen yellow
- Unprofessional decorative effects
- Large decorations that distract from dashboard data

The final UI should feel like a public smart safety platform with Yeongcheon identity.

It should not feel like a pure tourism page.

---

## Tab-Based Background Theme Rule

The dashboard should use tabs to reduce visual complexity.

Main tabs:

- 통합 대시보드
- 빈집 관리
- 로봇 관제
- AI 분석/추천
- 실종자 알림

Each tab can have a different background theme.

Recommended themes:

1. 통합 대시보드
   - Bright sky-blue / mint / ivory
   - Star City Yeongcheon identity
   - Overall city safety overview

2. 빈집 관리
   - Soft beige / light blue
   - Urban regeneration and public-data feeling
   - Map and risk markers

3. 로봇 관제
   - Clean blue / cyan
   - Robot, route, patrol, live monitoring

4. AI 분석/추천
   - Soft purple / blue gradient
   - AI analysis, recommendation, reconstruction planning

5. 실종자 알림
   - Light red / ivory background
   - Safety alert, human review, report draft

Implementation guidance:

- Use React state for tabs.
- Do not add React Router yet.
- Do not add animation libraries.
- Use CSS/Tailwind transitions for smooth background changes.
- Keep the content readable with translucent cards.
- Do not put all tab content in `App.tsx`.

---

## Visual Design Quality Bar

This dashboard is for a competition, so the first screen must look polished.

Design concept:

- Bright public-service dashboard
- Yeongcheon local brand identity
- Star City Smart Safety Platform
- AI-powered local government operations dashboard
- Autonomous patrol robot control dashboard

Visual style:

- Bright sky-blue/mint/ivory background for the main overview
- Tab-specific background themes
- Glassmorphism cards
- Rounded 2xl cards
- Subtle borders
- Soft shadows
- Clear section titles
- Compact but readable spacing
- Status badges and colored indicators
- Red only for urgent alerts
- Amber/yellow for warning
- Green for normal/completed
- Cyan/blue for AI/robot status
- Soft gold only for star identity and key highlights

Avoid:

- Fully dark page
- Plain white admin dashboard
- Random bright colors
- Toy-like UI
- Too much empty space
- Unaligned cards
- Generic placeholder text
- English-heavy UI
- Overly decorative tourist-page design

The first screen should immediately communicate:

1. 영천시 빈집 현황
2. 자율주행 로봇 순찰 상태
3. AI 분석 결과
4. 실종자 후보 알림
5. 정비 우선순위
6. 영천 지역 정체성

---

## Tech Stack

Use this stack unless the user explicitly changes it:

- Vite
- React
- TypeScript
- Tailwind CSS

Allowed lightweight library:

- `lucide-react` for icons

Do not add these unless explicitly requested:

- Next.js
- Redux
- Zustand
- React Router
- Chart libraries
- Map libraries other than Naver Maps
- Animation-heavy libraries
- Large UI frameworks

This is a dashboard-style web app, not an SEO-focused public website.

Keep the structure simple.

---

## Folder Structure

Use this structure:

```text
src/
├─ api/
│  └─ dashboardApi.ts
│
├─ components/
│  ├─ common/
│  │  ├─ Card.tsx
│  │  ├─ Badge.tsx
│  │  └─ ProgressBar.tsx
│  │
│  ├─ layout/
│  │  └─ Header.tsx
│  │
│  └─ dashboard/
│     ├─ SummaryStatCards.tsx
│     ├─ RobotVideoCard.tsx
│     ├─ RobotStatusCard.tsx
│     ├─ VacantHouseMap.tsx
│     ├─ RouteMapCard.tsx
│     ├─ MaintenancePriorityTable.tsx
│     ├─ ReconstructionRecommendCard.tsx
│     ├─ MissingPersonAlertCard.tsx
│     └─ RecentAlertsCard.tsx
│
├─ data/
│  └─ mockData.ts
│
├─ pages/
│  └─ DashboardPage.tsx
│
├─ types/
│  └─ dashboard.ts
│
├─ App.tsx
├─ main.tsx
└─ index.css
```

If a file already exists, update it instead of creating duplicate versions.

Do not put the entire UI in `App.tsx`.

`App.tsx` should mainly render the page component.

---

## Dashboard Requirements

Main title:

```text
영천시 빈집 관리 및 자율주행 방범 대시보드
```

Optional subtitle:

```text
Star City Smart Safety Platform
```

Main sections:

- 상단 Header
- 탭 메뉴
- 통합 대시보드
- 영천시 빈집 분포 및 현황
- 로봇 영상 또는 이미지 placeholder
- 로봇 상태
- 자율주행 순찰 경로
- 빈집 정비 우선순위
- 추천 재건축 요소
- 실종자 후보 알림
- 최근 알림
- 전체 통계 카드

Use Korean labels.

Use professional public-service dashboard language.

Avoid vague placeholder labels like:

- Card 1
- Item 1
- Lorem ipsum
- Test data

Use realistic Korean labels related to the project.

---

## Dashboard Layout

Use a desktop-first dashboard layout.

The UI should not force all information onto one screen.

Use tabs to separate detail views.

Recommended top-level layout:

```text
Header
└─ service title, subtitle, current time, operation status

Tab menu
├─ 통합 대시보드
├─ 빈집 관리
├─ 로봇 관제
├─ AI 분석/추천
└─ 실종자 알림

Active tab content
└─ tab-specific dashboard cards and hero area
```

Default selected tab:

```text
통합 대시보드
```

The overview tab should show only the most important information:

- Big vacant-house map placeholder
- Robot status summary
- Missing-person candidate alert summary
- AI anomaly summary
- Bottom summary cards

Move detailed tables and long explanations into relevant detail tabs.

Desktop demo quality is more important than perfect mobile responsiveness.

However, avoid completely broken layouts on smaller screens.

---

## Component Requirements

### Header

Show:

- Star-inspired logo or small star symbol
- Project title: 영천시 빈집 관리 및 자율주행 방범 대시보드
- Subtitle: Star City Smart Safety Platform
- Current date/time
- Operation status badge, such as:
  - 관제 운영 중
  - AI 분석 활성화

The star motif should be subtle and professional.

---

### Tab Menu

Show these tabs:

- 통합 대시보드
- 빈집 관리
- 로봇 관제
- AI 분석/추천
- 실종자 알림

Use React state for active tab.

Do not use React Router yet.

When tab changes:

- Active content changes.
- Background theme changes.
- The page should feel visually different but consistent.

---

### SummaryStatCards

Show:

- 전체 빈집 수
- 정비 완료율
- 운행 중 로봇
- 오늘 순찰 거리
- 오늘 이상 탐지

Use visually strong numeric hierarchy.

---

### RobotVideoCard

Show:

- Latest robot camera image placeholder
- Small status badge: 실시간 영상
- Robot ID
- Current patrol status
- Optional scanning overlay or subtle route/grid effect

Do not implement real video streaming yet.

---

### RobotStatusCard

Show:

- Battery percentage
- Current location
- Robot status
- Next destination
- Connection status
- Buttons:
  - 수동 제어
  - 경로 변경

Buttons can be disabled or demo-only initially.

---

### VacantHouseMap

Initial implementation:

- Use placeholder map only.
- Do not implement Naver Maps yet.
- Make it look like a real map panel.
- Include Yeongcheon label.
- Include risk markers.
- Include subtle star/route/connection line if suitable.
- Include legend:
  - 위험
  - 주의
  - 관심
  - 정비완료

Later implementation:

- Integrate Naver Maps.
- Use `VITE_NAVER_MAP_CLIENT_ID`.
- Show vacant-house markers.
- Marker color should reflect risk level.
- Clicking a marker should show address, risk level, priority rank, and total score.
- If Naver Maps fails to load, show a friendly fallback.

---

### RouteMapCard

Show:

- Robot patrol route placeholder
- Start point
- Current position
- Next destination
- Completed route
- Pending route

The route can subtly resemble constellation connections.

Do not implement real route data yet unless requested.

---

### MaintenancePriorityTable

Show:

- Rank
- Address or location
- Risk level
- Oldness
- Accessibility
- Population density
- Total score
- Action button

Use color badges for risk level.

---

### ReconstructionRecommendCard

Show:

- Recommended use
- Building scale
- Expected cost
- Expected return
- Feasibility
- Reason

This should clearly look like an AI recommendation result.

Use wording such as:

- AI 추천
- 추천 근거
- 사업 타당성
- 공공데이터 기반 분석

---

### MissingPersonAlertCard

Show:

- Alert card
- Detection time
- Location
- Similarity score
- Description
- Status: 담당자 확인 필요
- Buttons:
  - 신고 초안 생성
  - 상세 정보 보기

Do not show real personal data.

Do not use unsafe wording.

Urgent alert can use red accents, but the full page does not need to be dark.

---

### RecentAlertsCard

Show recent events such as:

- 실종자 후보 발견
- 빈집 이상 징후 탐지
- 자율주행 차량 배터리 부족
- 순찰 완료
- AI 정비 우선순위 갱신

---

## Data Types

Create and maintain strong types in:

```text
src/types/dashboard.ts
```

Core data concepts:

- DashboardSummary
- RobotStatus
- VacantHouse
- MissingPersonAlert
- RecentEvent
- MaintenancePriority
- ReconstructionRecommendation

Use the API shapes from:

```text
docs/api-spec.md
```

Recommended type values:

```ts
export type RiskLevel = '위험' | '주의' | '관심' | '정비완료';

export type RobotOperationStatus = '운행 중' | '대기 중' | '충전 중' | '오류';

export type EventStatus = '미확인' | '확인중' | '처리완료';

export type EventSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
```

Do not use `any` unless absolutely necessary.

Prefer explicit interfaces.

---

## Mock Data Requirements

Use realistic Yeongcheon-style mock data.

Good example addresses:

- 영천시 완산동 123-4
- 영천시 도림동 456-7
- 영천시 금호읍 789-1
- 영천시 중앙동 234-5
- 영천시 화북면 567-8

Good example summary values:

- 전체 빈집: 147
- 정비 완료율: 32%
- 운행 중 로봇: 3대
- 오늘 순찰 거리: 28.5km
- 오늘 이상 탐지: 7건

Mock data should support:

- Dashboard summary
- Robot status
- Vacant houses
- Maintenance priority
- Reconstruction recommendation
- Missing-person candidate alert
- Recent alerts

---

## Implementation Order

Follow this order unless the user explicitly changes it:

1. Types
2. Mock data
3. Common components
4. Dashboard layout
5. Tab-based layout
6. Dashboard cards
7. Placeholder map
8. API adapter with mock Promise functions
9. Naver Maps integration
10. Real backend API integration
11. Polling
12. UI polish
13. Deployment preparation

Do not skip ahead.

Do not implement Naver Maps, real API, or WebSocket during the initial UI layout or redesign task.

---

## Naver Maps Rule

Do not implement Naver Maps until explicitly requested.

When requested:

- Read `VITE_NAVER_MAP_CLIENT_ID` from `import.meta.env`.
- Do not hardcode the key.
- Do not create or commit `.env`.
- Use `.env.example` only for variable names.
- If the key is missing, show placeholder UI.
- If map loading fails, show fallback UI.
- Keep the app usable even if map integration fails.

---

## Real-Time Data Rule

For MVP, use polling first.

Do not implement WebSocket unless explicitly requested or backend is ready.

Recommended future polling intervals:

- Robot status: every 1 second
- Latest robot image: every 2 or 3 seconds
- Events: every 3 seconds
- Map markers: load once at page load
- Maintenance priority: load once or refresh by button

Stable demo is more important than perfect real-time streaming.

---

## Styling Rules

Use Tailwind CSS.

For the new bright theme, prefer:

- `bg-sky-50`
- `bg-cyan-50`
- `bg-blue-50`
- `bg-amber-50`
- `bg-white/70`
- `backdrop-blur`
- `border-white/60`
- `text-slate-900`
- `text-slate-600`
- `rounded-2xl`
- `shadow`
- `grid`
- `gap-4`
- `p-4`

Use controlled accent colors:

- Sky/blue/cyan for AI and robot status
- Red for danger/urgent alert
- Amber/yellow/gold for caution and star identity
- Green for normal/completed
- Purple/blue for AI recommendation tab

Do not use many unrelated colors.

Do not make the full page dark unless a specific tab intentionally needs a darker accent.

---

## Accessibility and Readability

Use clear text hierarchy.

Make important numbers readable.

Do not make text too small.

Ensure alert text has enough contrast.

Buttons should look clickable.

Use semantic HTML when reasonable.

Do not rely only on color if a label can clarify the meaning.

Background decoration must not reduce readability.

---

## Verification

After changes, run or instruct the user to run:

```bash
npm run dev
npm run build
```

A task is not complete if the app does not build.

If build errors occur:

- Fix only the build error.
- Do not add new features while fixing.
- Explain what was fixed.

---

## Communication Style

When responding after coding, include:

1. Brief summary
2. Files changed
3. How to test
4. Any assumptions
5. Next recommended step

Keep explanations clear and beginner-friendly.

Do not overwhelm the user with unnecessary theory.

---

## Development Workflow

For each user request:

1. Read this `AGENTS.md`.
2. Check relevant docs:
   - `docs/frontend-plan.md`
   - `docs/api-spec.md`
   - `docs/security-checklist.md`
3. State a brief plan.
4. Make the smallest useful change.
5. Verify with build when possible.
6. Report what changed.

Do not proceed with large speculative work.

---

## Final Demo Story

The dashboard should support this demo flow:

1. Operator opens the Yeongcheon vacant-house dashboard.
2. Dashboard shows total vacant houses and risk distribution.
3. Map or map placeholder shows high-risk vacant houses.
4. Robot patrol status is visible.
5. Robot image or camera panel shows patrol context.
6. AI analysis identifies vacant-house anomaly or risk.
7. Maintenance priority table highlights which house should be handled first.
8. Reconstruction recommendation explains possible reuse.
9. Missing-person candidate alert appears.
10. Operator reviews details and generates a report or 신고 초안.

The frontend should make this story obvious without requiring too much verbal explanation.

---

## What Not To Do

Do not:

- Implement all features at once.
- Add real API calls before requested.
- Add Naver Maps before requested.
- Add WebSocket before requested.
- Expose secret keys.
- Use unsafe missing-person wording.
- Create a pure tourism landing page.
- Use a fully dark admin dashboard if the user requested bright Yeongcheon branding.
- Put all code in `App.tsx`.
- Add unnecessary libraries.
- Ignore build errors.
- Change unrelated files.