# 궁금하냥 인텐트 수정 — 종합 레퍼런스 (CLAUDE.md)

> **이 문서의 목적**
> 한양대학교 학사 행정 챗봇 **궁금하냥**의 인텐트 수정에 관한 모든 자료를 한 곳에 모은 레퍼런스. 본 강의(`fix-intent-5min`)와 자매 강의 두 개(`best-intent-worker`, `fix-intent-hands-on`), 그리고 이를 인터랙티브로 구현한 `papers-with-claude-code` 프론트엔드 코드까지 포함합니다.
>
> 미래의 LLM/개발자가 이 문서만 읽고도 (1) 강의 콘텐츠를 재구성하거나 (2) 코드 베이스를 손볼 수 있도록 작성됐습니다.

---

## 0. 한눈에 보기

| 영역 | 위치 | 비고 |
|---|---|---|
| 시리즈 메타 | `awesome-papers-with-claude-code/curious-nyang-intent-guide/paper.json` | 시리즈 제목 "궁금하냥 인텐트 기여 가이드" |
| 강의 1: 이론 | `.../curious-nyang-intent-guide/best-intent-worker/` | 4단계, 13개 개념. 인텐트 시스템 전반 이론 |
| 강의 2: 실전 | `.../curious-nyang-intent-guide/fix-intent-hands-on/` | 2단계, 5개 개념. 발견→진단→수정→검증→기록 손으로 따라하기 |
| 강의 3: 인터랙티브 | `.../curious-nyang-intent-guide/fix-intent-5min/` *(본 폴더)* | 4단계, 4개 개념. 시뮬레이션 UI로 5분만에 1회 수정 사이클 체험 |
| 인터랙티브 구현 | `frontend/src/components/learn/interactive/fix-intent-5min/**` | Next.js + AIN 블록체인 영속화 + Azure OpenAI LLM 검증 |
| 백로그/이슈 | `awesome-papers-with-claude-code/curious-nyang-intent-guide/BACKLOG.md` | best-intent-worker 강의 시트 컬럼 구조 변경 미반영 |

**핵심 외부 시스템 URL**
- Prod 챗봇: `https://hanyang-ai.ainetwork.xyz/`
- Dev 챗봇: `https://hanyang-ai-dev.ainetwork.xyz/`
- Prod 대시보드(Metabase): `https://metabase.ainetwork.xyz/dashboard/2-hanyang-ai-dashboard`
- Dev Google Sheet: `https://docs.google.com/spreadsheets/u/3/d/1fiNQOzCJoTEmBtH1SWYIf1xJL7jRRsYb2TNWCYkBVLU/edit`
- Notion Agents&Intents: `https://www.notion.so/comcom/Agents-Intents-1fbf2b89ad6b41e78137ccac52aee9f9`

---

# Part A · 도메인 지식

## A.1 궁금하냥은 무엇인가

**궁금하냥**(Curious Nyang, "냥"=고양이 울음 의성어)은 한양대학교 학사 행정에 대한 자연어 질의응답 AI 챗봇이다. 학생이 "등록금 얼마야?", "휴학 어떻게 해?" 같은 질문을 자연어로 던지면 즉시 답변을 제공한다.

best-intent-worker 강의의 비유:
> "궁금하냥은 **도서관 안내 데스크**와 같습니다. 학생(유저)이 질문하면, 안내 데스크 직원(인텐트 시스템)이 질문의 종류를 파악하고, 미리 준비된 안내 매뉴얼(프롬프트)에서 정확한 답변을 찾아 전달합니다."

**핵심 가치:** 정확성(Accuracy) × 접근성(Accessibility). 행정 정보 한 번의 오안내가 학생의 한 학기를 좌우할 수 있어 품질 관리가 절대적이다.

**인프라:** AI Network 분산 인프라 위에서 운영. 한양대 서비스이지만 인프라 측면은 AI Network가 제공.

## A.2 인텐트 시스템 작동 원리

```
유저 질문 → 트리거 문장과 유사도 비교 → 가장 유사한 인텐트로 분류
        → 해당 인텐트의 프롬프트 로드 → AI가 프롬프트 기반 답변 생성 → 유저
```

**우체국 분류 시스템에 비유:**
> "편지(질문)가 도착하면 우편번호(트리거 문장)를 보고 올바른 배달 경로(인텐트)로 보내고, 해당 부서(프롬프트)에서 답변을 작성합니다."

### 핵심 3요소

| 용어 | 정의 | 저장 위치 |
|---|---|---|
| **인텐트(Intent)** | 유저 질문의 '의도'를 분류한 카테고리. 예: `등록금_문의`, `휴학_신청_절차` | tab2~5 (카테고리별) |
| **트리거 문장(Trigger Sentence)** | 한 인텐트로 매칭될 유저 질문의 예시. "등록금 얼마야?", "수업료 알려줘" 같이 같은 의도의 다양한 표현 | tab1 (`intent_trigger_sentence`) |
| **프롬프트(Prompt)** | 인텐트 매칭 후 AI가 답변을 생성할 때 따르는 지침/지식 | tab2~5 (각 인텐트 행) |

### 환경 분리: Dev vs Prod

```
Dev (리허설 무대)              Prod (본 공연)
hanyang-ai-dev.ainetwork.xyz   hanyang-ai.ainetwork.xyz
모든 인텐트 일꾼 수정 가능       PM만 반영 가능 (골든셋 검증 필수)
```

## A.3 Google Sheet 5탭 구조

```
tab1: intent_trigger_sentence    ↔  tab2~5 (인텐트 정의)
                                    ├─ tab2: 일반 (장학금, 동아리, 도서관, 기타)
                                    ├─ tab3: 재무 (등록금만)
                                    ├─ tab4: 학사 (시험/휴학/복학/일정/입학)
                                    └─ tab5: 국제 (외국인 inbound + 한양대생 outbound)
```

### tab1 (트리거) 컬럼 구조 — **현행**

| Intent | Sentence |
|---|---|

> ⚠️ **BACKLOG 주의**: best-intent-worker 강의는 아직 옛 구조(`Category`, `Intent`, `Sentence`, `Insert`)로 기술돼 있다. 컬럼 변경이 미반영. fix-intent-5min은 새 구조로 작성됨.

### tab2~5 (인텐트) 컬럼 구조 — **현행**

| Intent | 대표Sentence (참고용) | Prompt |
|---|---|---|

> ⚠️ best-intent-worker 강의는 옛 구조(`Intent`, `대표Sentence`, `Prompt`, `Model`, `isPush`)로 기술. `Model` / `isPush` 컬럼은 이제 사라졌다.

### 카테고리 분류 의사결정 트리

```
1. 등록금 직접 관련?       → 재무 (tab3)
2. 시험/휴학/복학/일정/입학? → 학사 (tab4)
3. 외국인 OR 해외교환?     → 국제 (tab5)
4. 위 어느 것도 아님       → 일반 (tab2)
```

**함정 사례:** **장학금**은 돈 관련이라 재무로 헷갈리지만 담당 부서가 학생지원팀이라 **일반(tab2)**에 등록. 장학금이 카테고리 함정의 대표 사례.

## A.4 표준 워크플로우 (4단계)

```
1. Prod 대시보드에서 이슈 포착   ← 모니터링 담당자
2. 노션에 이슈 등록            ← 이슈 등록자
3. Dev 인텐트 시트 수정·확인     ← 인텐트 일꾼
4. PM 확인 후 Prod 반영        ← PM (Minjae Lee)
```

**약품 승인 절차에 비유:**
> "실험실(Dev)에서 충분히 테스트하고, 심사위원(PM)의 승인을 받아야만 시판(Prod)될 수 있습니다."

### 3가지 트러블슈팅 패턴

| 패턴 | 증상 | 원인 | 수정 위치 |
|---|---|---|---|
| **A** | 인텐트는 있는데 답변 못함 | 트리거 문장 부족 | tab1 보강 |
| **B** | 답변은 하는데 틀림 | 프롬프트 부정확 | tab2~5 프롬프트 수정 |
| **C** | 해당 주제 자체 없음 | 인텐트 미등록 | tab2~5 신규 추가 + tab1 트리거 추가 |

### App Script로 Dev 반영

Google Sheet 수정만으로는 챗봇에 반영되지 않는다. App Script 메뉴를 통해 두 종류 스크립트 실행 필요.

```
프롬프트 반영: [Custom Scripts] > [Update Intent Prompts (dev)] > [yes]
트리거 반영:  [Custom Scripts] > [Update Intent Triggers (dev)] > [yes]
```

수정한 종류에 따라 한 쪽만 또는 둘 다 실행. 그 후 Dev 챗봇에서 검증.

## A.5 Notion Tasks 등록 규칙

이슈 발견 시 Notion **Agents & Intents** 페이지 하단의 파란 **새로 만들기** 버튼으로 Task 생성. Task 페이지의 필수 메타데이터:

| 필드 | 채우는 법 |
|---|---|
| **Agent** | 기여 대상 에이전트 (`궁금하냥`) |
| **Title** | 한 줄 이슈 요약 |
| **Assignee** | 시트를 수정한 본인 (← **이래야 카운트됨**) |
| **Status** | 진행 단계에 맞게: In Progress → Done |
| **Season** | 현재 시즌 (← **잘못 설정 시 카운트 안 됨**) |
| **Work type** | 6가지 중 1개 (아래 표) |

### Work type 6가지

| Key | 라벨 | 의미 |
|---|---|---|
| `addTrigger` | Add Triggering Sentence | 트리거 문장 추가 |
| `newIntent` | New Intent | 새 인텐트 등록 |
| `updateIntent` | Update Intent | 기존 인텐트 수정 |
| `newIntentDev` | New Intent + Dev | 새 인텐트 등록 + Dev 반영 |
| `sqlWorkflow` | SQL/Workflow | SQL 또는 워크플로우 관련 |
| `bugReportQa` | BugReport/QA | 버그 리포트/QA |

### Task 페이지 본문 4섹션

1. **문제 상황 분석** — 발견한 문제와 본인의 진단 (스크린샷 대신 텍스트/표로!)
2. **해결방향 정리** — 어떻게 고칠지의 사고 과정
3. **작업 내용** — 실제 어떤 셀/행을 어떻게 고쳤는지
4. **결과** — 수정 후 Dev 챗봇 응답 캡처

> **카운트 규칙:** 기록을 안 남기면 인텐트 수정 개수에 카운트되지 않는다. PM이 변경 내역을 못 알아보고, 다른 사람이 같은 작업을 중복 수행할 수 있다.

## A.6 골든셋 (Golden Set)

수능 모의고사에 비유. Prod 배포 시 기존 인텐트의 품질이 유지되는지 검증하는 핵심 질문-답변 목록. **PM만 관리/실행**하며 인텐트 일꾼은 임의로 변경 금지.

## A.7 인텐트 위원회 (Intent Committee)

인텐트 품질 기준을 정하고 관리하는 조직. 두 가지 핵심 원칙:

1. **위원회 규정 포맷 준수** — 인텐트 명명, 카테고리, 프롬프트 형식 통일
2. **스크린샷 지양, 텍스트/표로 입력** — 검색 가능성·수정 가능성·용량 효율을 위해

### 인텐트 네이밍 규칙

- 패턴: `카테고리_주제_행위` (예: `등록금_납부_방법`, `휴학_신청_절차`)
- 한글 + 언더스코어(`_`)
- 축약어 지양, 명확한 표현
- 기존 인텐트 중복 확인 필수

### 프롬프트 작성 표준

- 구체적 수치/날짜 포함 ("2026학년도 1학기 등록금은 X,XXX,XXX원")
- 출처 명시 ("한양대학교 학칙 제XX조에 따르면…")
- 예외 상황 포함 ("단, 재입학생의 경우 별도 절차")
- 연락처 정보 (부서 전화/위치/운영시간)

---

# Part B · 강의 트릴로지

세 강의는 모두 `awesome-papers-with-claude-code/curious-nyang-intent-guide/` 아래에 있고 시리즈 메타는 `paper.json`에서 "궁금하냥 인텐트 기여 가이드"라는 단일 시리즈로 묶인다. 학습 의도 순서: **이론 → 실전 → 인터랙티브 요약**.

## B.1 강의 ① `best-intent-worker` — 이론

**Korean title:** 궁금하냥 인텐트 기여 가이드 (이론편)
**Slug:** `best-intent-worker`
**구성:** 4 stages × 13 concepts (foundational → frontier)
**대상:** 한양대 행정 개선 참여 학생/스태프; 도구 사용 경험 있는 사람

### Stage별 개요

#### Stage 1 — 기초 (Foundational, 3개 개념)

| ID | 한글 제목 | 핵심 |
|---|---|---|
| `project_overview` | 궁금하냥 프로젝트 소개 | 도서관 안내 데스크 비유, 정확성·접근성 가치 |
| `environment_setup` | 개발/운영 환경 구성 | Dev/Prod 이중 환경, 별도 시트, 어드민 대시보드 |
| `intent_system_overview` | 인텐트 시스템 개요 | 우체국 분류 시스템 비유, 트리거→인텐트→프롬프트 흐름 |

#### Stage 2 — 실무 (Intermediate, 4개 개념)

| ID | 한글 제목 | 핵심 |
|---|---|---|
| `google_sheet_architecture` | Google Sheet 인텐트 구조 | 5탭 구조, tab1=교환대, tab2~5=부서 매뉴얼 |
| `intent_trigger_management` | 인텐트 트리거 문장 관리 | tab1 컬럼, 좋은 트리거 문장 원칙 |
| `intent_prompt_management` | 인텐트 프롬프트 관리 | tab2~5 컬럼, 답변 품질 결정 |
| `intent_categories` | 인텐트 카테고리 분류 | 4카테고리 + 함정(장학금=일반!) |

#### Stage 3 — 심화 (Advanced, 4개 개념)

| ID | 한글 제목 | 핵심 |
|---|---|---|
| `update_deployment` | 챗봇 업데이트 반영 | App Script 실행 절차 (Update Intent Prompts/Triggers) |
| `standard_workflow` | 표준 프로세스 | 4단계: 포착→등록→수정→PM승인 |
| `dashboard_monitoring` | 대시보드 모니터링 | Metabase = CCTV 관제실 |
| `troubleshooting_patterns` | 트러블슈팅 패턴 | 패턴 A/B/C |

#### Stage 4 — 마스터 (Frontier, 2개 개념)

| ID | 한글 제목 | 핵심 |
|---|---|---|
| `prod_launch_process` | 프로덕션 런치 | PM 6단계 절차, 골든셋 검증 |
| `intent_committee_standards` | 인텐트 위원회 표준 | 포맷 준수, 스크린샷 금지, 네이밍·프롬프트 표준 |

### 지식 그래프

DAG. 12개 노드, 18개 엣지. 집중 노드: `google_sheet_architecture`(centrality 4 incoming)와 `update_deployment`. 최단 frontier 경로 6 hops.

### 어조 (verbatim 인용)

> "비유하자면, 궁금하냥은 **도서관 안내 데스크**와 같습니다."
> "비유하자면, 이 프로세스는 **약품 승인 절차**와 같습니다."
> "비유하자면, tab1은 **전화 교환대**이고 tab2~5는 **각 부서의 응대 매뉴얼**입니다."
> "트리거 문장이 많고 다양할수록 매칭 정확도가 높아집니다."
> "모든 인텐트 일꾼은 위원회의 표준을 숙지하고 준수해야 합니다."

**레지스터:** 정중-격식체(`-습니다 / -합니다`). 학습자 호칭은 보통 생략하고 **"여러분"**을 가끔 사용. 메타포 패턴: 문제 → 시각적 비유 → 기술 설명 → 결과.

### ⚠️ BACKLOG (미반영 사항)

`BACKLOG.md`에 명시된 미반영 변경:

> Google Sheet 컬럼 구조 변경
> - 인텐트(tab2~5): `Intent`, `대표Sentence (참고용)`, `Prompt` (3개) — 기존 Model, isPush **삭제**
> - 트리거(tab1): `Intent`, `Sentence` (2개) — 기존 Category, Insert **삭제**
> - 영향 레슨: intent_trigger_management, intent_prompt_management, google_sheet_architecture, update_deployment, troubleshooting_patterns

학습자가 강의를 보고 실제 시트를 열면 다른 컬럼 구조를 발견하게 됨. 5개 레슨 업데이트 필요.

---

## B.2 강의 ② `fix-intent-hands-on` — 실전 핸즈온

**Korean title:** 궁금하냥 인텐트 기여 가이드 (실전편)
**Slug:** `fix-intent-hands-on`
**구성:** 2 courses × 5 concepts. **선형 prerequisite chain** (단일 경로)

### Course 1: 분석 — 문제 발견과 진단

#### Stage 1.1 `find_broken_intents` — 고칠 인텐트 발굴하기

- Metabase 대시보드(`https://metabase.ainetwork.xyz/dashboard/2-hanyang-ai-dashboard`) "All chats in table view" 섹션 접속
- 5컬럼 테이블: Session ID / Created At / Intent / User:Message / Assistant:Contents
- 3가지 패턴 (A: 인텐트 미매칭/부적절 / B: 답변 부족 / C: 틀린 정보) 식별
- 발견 항목 기록: Session ID, 유저 질문, 매칭 인텐트, 문제점, 기대 답변

> **퀴즈 예시:** Intent=`등록금_납부_방법`인데 유저가 "장학금 신청 언제까지야?"를 물음 → 패턴 A (장학금≠등록금)

#### Stage 1.2 `decide_fix_strategy` — 인텐트를 어떻게 고칠지 결정하기

- 원인 진단 → 수정 대상 결정 매트릭스
  - 트리거 문장 부족/부적절 → tab1 추가/수정
  - 프롬프트 내용 부정확 → tab2~5 프롬프트 수정
  - 인텐트 자체 없음 → tab1 + tab2~5 모두 (신규 등록)
- 4 카테고리 분류 가이드

> **퀴즈 예시:** "교환학생 지원 자격" 질문이 매칭 실패 + 관련 인텐트도 없음 → tab5(국제)에 신규 인텐트 + tab1에 트리거 모두 추가

### Course 2: 실행 — 수정, 검증, 기록

#### Stage 2.1 `fix_intent` — 인텐트 고치기

- Dev 시트(`https://docs.google.com/spreadsheets/u/3/d/1fiNQOzCJoTEmBtH1SWYIf1xJL7jRRsYb2TNWCYkBVLU/edit`)에서만 수정. **Prod 시트 직접 수정 금지**
- tab1 트리거: `Intent` + `Sentence`
- tab2~5 프롬프트: `Intent` + `대표Sentence (참고용)` + `Prompt`
- App Script 실행 절차: `[Custom Scripts] > [Update Intent Prompts (dev)] > [yes]` / `[Update Intent Triggers (dev)] > [yes]`

#### Stage 2.2 `verify_fix` — 고친 인텐트 결과 확인하기

- Dev 챗봇(`https://hanyang-ai-dev.ainetwork.xyz/`)에 Stage 1 원래 질문 입력
- 트리거 수정 시 확인사항: 매칭 회복 / 유사 표현 다중 검증 / 회귀 없음
- 프롬프트 수정 시 확인사항: 답변 변화 / 정보 정확성 / 톤
- "교환학생 지원 자격" 인텐트 검증 시 다양한 표현 4종 시연

> **퀴즈 함정:** Dev 단계에서 Prod 동작 확인은 **불가** (아직 미반영)

#### Stage 2.3 `record_changes` — 기록하기

- Notion Agents&Intents 페이지에서 새 Task 생성
- 핵심 메타: Agent / Title / **Assignee(시트 수정자)** / Status / **Season(현 시즌)** / Work type
- 페이지 본문 4섹션: 문제 상황 분석 / 해결방향 / 작업내용 / 결과
- **카운트 안 되는 이유 1순위:** Assignee 또는 Season 잘못 설정

### 지식 그래프

```
find_broken_intents (foundational)
    ↓ enables
decide_fix_strategy (intermediate)
    ↓ enables
fix_intent (intermediate)
    ↓ enables
verify_fix (advanced)
    ↓ enables
record_changes (advanced)
```

선형 체인. 각 노드는 직전 1개의 prerequisite를 가짐.

### 어조 (verbatim 인용)

> "Google Sheet 수정만으로는 챗봇에 반영되지 않습니다. App Script를 실행해야 실제 Dev 챗봇에 적용됩니다."
> "기록을 남기지 않으면 인텐트 수정 개수에 카운트되지 않습니다."
> "테스트 중 여전히 문제가 있다면 스테이지 2~3으로 돌아갑니다."
> "수정과 확인을 반복하여 **충분히 검증된 상태에서** 다음 스테이지로 넘어갑니다."

**특징:** 메타포가 거의 없고 **순서·동작 중심**. 명확한 URL/버튼명/메뉴 경로를 직접 인용. "주의/핵심/필수" 마커로 강조. 학습자 호칭은 함축적(임퍼러티브 직접 사용).

### Quirks
- BACKLOG.md 없음 (이 강의에 한해)
- `x402_price`, `x402_gateway` 빈 필드 = 미래 결제 통합용 슬롯
- 인텐트 위원회 포맷이 한 번 언급되지만 정의는 없음 (best-intent-worker 강의로 위임)
- Prod 반영 부분은 다루지 않음 (PM 영역으로 명시)

---

## B.3 강의 ③ `fix-intent-5min` — 인터랙티브 (본 폴더)

**Korean title:** 궁금하냥 인텐트, 5분만에 고치기
**Slug:** `fix-intent-5min`
**Course ID:** `curious-nyang-intent-guide--fix-intent-5min` (double-dash 컨벤션)
**구성:** 4 stages × 4 concepts. 인터랙티브 시뮬레이션 UI 통과형.
**전제:** best-intent-worker 또는 동등한 인텐트 기본 지식.

### 4 단계 (Phase 매핑)

| Stage | 한글 제목 | Phase string | 시뮬 UI | 영속화 |
|---|---|---|---|---|
| **0** | 인트로 | `intro` | CourseIntro (픽셀 마스코트) | — |
| **1** | 문제 발견 | `dashboard` → `notion` | Metabase 대시보드 클론 → Notion 랜딩/Task 페이지 | selectedIntents, notion 필드 |
| **2** | 수정 방향 | `stage2-page` (+ `quest-clear-2`) | Notion Task 페이지 (solutionDirection) | notion.solutionDirection |
| **3** | Dev Sheet | `sheet-edit` (+ `quest-clear-3`) | Google Sheets 클론 (4 sub-phase) | sheetArtifact (인텐트 행 + 트리거) |
| **4** | Dev 검증 + 마무리 | `chatbot-test` → `stage4-result-page` → `course-complete` | 챗봇 시뮬레이터 → Notion 결과 페이지 | chatbotInteraction, notion.status='Done', notion.result |

### 4 개념 (선형 prerequisite chain)

| ID | 의미 |
|---|---|
| `find_broken_intent` | 대시보드에서 잘못된 인텐트 행 클릭 |
| `decide_fix_direction` | LLM 검증을 통과하는 한 줄 수정 방향 작성 |
| `execute_fix` | Dev Sheet에서 1개 인텐트 + 2+ 트리거 추가 |
| `verify_result` | Dev 챗봇 입력 → 응답 캡처 → 후기 작성 |

### 인터랙티브 UI 4면

| UI | 클론 대상 | Faked vs Real | 학습 효과 |
|---|---|---|---|
| **DashboardView** | Metabase chat-log table | 데이터: 정적 10행 (1 broken + 9 clean). UI: Metabase 토큰(MB_*) 1:1 클론 | 로그 테이블 읽기, 패턴 식별 |
| **NotionLanding + NotionTaskPage** | Notion DB / Task page | 전체 React 클론. 폼 시멘틱은 실제 Notion 속성 미러 (Agent/Title/Assignee/Status/Season/WorkType + 본문 블록) | Task 등록 워크플로우 |
| **SheetEditPage** | Google Sheets + App Script | 5탭(intent_trigger_sentence, 일반/재무/학사/국제) 인-React 시트. Custom Scripts 메뉴 시뮬. LLM 검증은 신규 인텐트/트리거 셀 편집에 적용 | 시트 편집 + 스크립트 실행 |
| **ChatbotTestPage** | Dev 챗봇 + 궁금하냥 캐릭터 | UI는 한양대 실제 모바일 챗봇 클론. 응답은 LLM 토픽 분류기 통과 시 미리 작성된 답변, 통과 실패 시 안내 메시지 | 챗봇 응답 검증 |

### 어조

다른 두 강의보다 훨씬 명령형·"now do this" 지향. 메타포 거의 없음.

> "문제가 있는 인텐트의 행을 클릭해 주세요"
> "노션 페이지 하단에서 '새로 만들기' 버튼으로 Task 를 추가하세요"
> "수정을 마쳤다면 완료 버튼을 눌러주세요"
> "수정 방향을 입력하면 에이전트가 피드백을 줍니다"

**레지스터:** 일관 `-주세요 / -하세요` 정중체. `-냥` 같은 캐릭터 어미 사용 안 함.

### Stage 별 콘텐츠 핵심

#### Stage 1: 고칠 인텐트 찾기

학습자는 Metabase 대시보드에서 1개 broken row를 식별. 정답 행 클릭 시 Stage 2로 advance, 오답 시 hearts 차감. Notion에 Task 등록(8개 필드: agent/title/assignee/status/season/workType/problemAnalysis 본문 + solutionDirection 시작점). 각 필드 LLM 또는 결정론적 validator 통과.

#### Stage 2: 어떻게 고칠지 결정

solutionDirection 필드만 활성. 트리거 / 프롬프트 / 신규 인텐트 중 어떤 방향인지 한 줄 작성 → Azure OpenAI Responses API 검증.

#### Stage 3: 인텐트 직접 고치기 (4 sub-phase)

```
add-intent → run-intent-script → add-triggers → run-trigger-script → complete
```

- 정답 도메인 탭 선택 → "+ 인텐트 행 추가" → 3컬럼(intent / leadSentence / prompt) 채우기
- Custom Scripts → "Update Intent Prompts (dev)" 실행 시뮬
- 같은 인텐트에 트리거 2개+ 추가
- "Update Intent Triggers (dev)" 실행 시뮬

완료 시 `SheetArtifact` 캡처 → 블록체인 영속화.

#### Stage 4: 결과 확인 + 마무리

ChatbotTestPage에서 Stage 1 broken 발화 입력 → LLM 토픽 분류기 통과 시 미리 작성된 응답. "Notion 으로" 모달 → stage4-result-page (status=Done, result 작성).

result 필드는 두 자동 채우기 버튼 제공:
- **작업 내역 불러오기** → workContent에 Stage 3 artifact를 HTML 표로 자동 삽입
- **테스트 결과 불러오기** → result 아래에 챗봇 Q&A 캡처 카드 렌더

result 한 줄 후기 + 제출 → `course-complete` (cosmic gradient 축하 화면).

### 게임 메카닉

- **Hearts (3개)**: dashboard 단계에서 오답 시 차감. 0 도달 → showRestart → handleRestart가 블록체인 blob 삭제 + 모든 state(`guidance`, `anchorEls` 포함) 리셋
- **TimerBar (60s, cosmetic)**: dashboard 단계 카운트다운. 모달 열림 / `!stage1QuestSeen` / persisting 시 일시정지. 0 도달해도 게임오버 아님 (hearts=0만 게임오버)

### 지식 그래프

`graph.json` 미생성 (TODO). prerequisite은 `courses.json` 안의 `prerequisites` 배열에 암시적으로 표현 (선형 체인).

### 어떤 어조가 시리즈 내에서 통일되는가

세 강의 모두 정중-격식체(`-습니다`)를 기본으로 하고, 학습자에게 "**인텐트 일꾼**"이라는 정체성을 부여. 그러나 본 강의는 **임퍼러티브 행위 지향** 코피로 압축돼 있음.

---

# Part C · 인터랙티브 코드 아키텍처 (`fix-intent-5min` 프론트엔드)

> 이 섹션은 `frontend/src/components/learn/interactive/fix-intent-5min/**`, `frontend/src/lib/courses/fix-intent-5min/**`, `frontend/src/data/courses/fix-intent-5min/**`, `frontend/src/app/api/courses/fix-intent-5min/**` 전부를 다룬다.

## C.1 컴포넌트 맵

위치: `frontend/src/components/learn/interactive/fix-intent-5min/`

### 오케스트레이터

| 파일 | ~줄 | 역할 |
|---|---|---|
| **IntentFixCourse.tsx** | ~2200 | 단일 phase 라우터(`phase: Phase`). TooltipProvider 래퍼 + `IntentFixCourseInner`로 분리. CourseState, 게임 state(hearts/timer/guidance), modal flag, LLM validation 라우팅, idle/stray tooltip trigger 모두 소유. mount effect에서 블록체인 state 로드 + 진행 복원. **Outer/Inner 분리 패턴**: outer는 TooltipProvider 한 번만 mount, inner는 모든 state·early return 보유 |

### Stage 별 페이지

| 파일 | ~줄 | 역할 |
|---|---|---|
| **CourseIntro.tsx** | ~415 | 인트로 페이지. Canvas 22×14 픽셀 스프라이트(코랄 몸체 + 노란 안전모 = Claude Code 마스코트). 강의 4단계 구조 칩(`등록금_문의` 같은 인텐트 칩 스타일로 통일됨) + CTA |
| **DashboardView.tsx** | ~603 | Metabase 클론 (10행 테이블, 1개 broken + 9 clean). hearts HUD + TimerBar(green→amber→red, 마지막 1/4 pulse). 우상단 Search/Download 데코. props: `rows`, `onRowClick`, `hearts`, `timerRemaining`, `onAnchorRef`(narrow span at left-6 top-[44px]), `onAnyClick` |
| **NotionLanding.tsx** | ~1147 | Stage 1 Notion 클론. Tasks 데이터베이스 하단의 "새로 만들기" 버튼이 정답 앵커. 4개의 NotionCard에도 split create button이 있지만 본 클릭은 stopPropagation으로 stray 카운트 회피 |
| **NotionTaskPage.tsx** | ~775 | Notion 인-라인 Task 편집 폼. Stage별 field order 상수 export(`STAGE1_FIELD_ORDER`, `STAGE2_FIELD_ORDER`, `STAGE3_FIELD_ORDER`, `STAGE4_FIELD_ORDER`). `data-field-id` 속성 기반 active anchor querySelector. props에 다양한 anchor 콜백(`onActiveFieldEl`, `onCopyHelperEl`, `onSubmitButtonEl`, `onLoadWorkButtonEl`, `onLoadCaptureButtonEl`) |
| **SheetEditPage.tsx** | ~1283 | Google Sheets 클론 (4 sub-phase: add-intent → run-intent-script → add-triggers → run-trigger-script). 5탭 (intent_trigger_sentence + 일반/재무/학사/국제). 다수의 anchor 콜백 props. Custom Scripts 드롭다운 메뉴 시뮬. ConfirmDialog/ScriptRunning state 부모로 forward |
| **ChatbotTestPage.tsx** | ~334 | Dev 챗봇 시뮬레이터. 입력→`/api/courses/fix-intent-5min/validate-chatbot` 토픽 분류 호출. 카카오톡 채널 안내 멘트(real 궁금하냥 UI 미러), 한양대 캠퍼스 brand 색 |

### 폼 컴포넌트 (`fields/`)

| 파일 | 역할 |
|---|---|
| **TitleField.tsx** | 한 줄 텍스트 입력. blur/submit 시 LLM 검증 (title prompt) |
| **DropdownField.tsx** | 드롭다운 single-select. 옵션별 hint 매핑 (status/season/agent/assignee). orange 테두리로 active 표시 |
| **BlockField.tsx** | 리치 HTML 편집 (paste sanitize, basic formatting). 제출 버튼 ref forward |
| **WorkTypeField.tsx** | Notion-style popover 멀티셀렉트. workTypeAnswer = ['newIntent', 'add'] 두 키 모두 필요 |

### 모달 / 오버레이

| 파일 | 역할 |
|---|---|
| **MissionBar.tsx** | 상단 1행 페르시스턴트 미션 바. 메시지 변경 시 한 번 펄스 (key={message} 트릭). 주황/브라운 팔레트 |
| **QuestModal.tsx** | one-shot stage-entry/celebration 모달. Enter/Escape 어디서든 dismiss. 파란 Metabase 톤 |
| **GuidanceTooltip.tsx** | radix TooltipPrimitive 직접 합성. virtual trigger를 anchor element rect와 sync. side='top' align='start' 등 controlled. **Persistent mode**: `onPointerDownOutside`/`onEscapeKeyDown` preventDefault. Arrow는 `clip-path: polygon(100% 0, 100% 100%, 0 100%)` + `translateY(calc(-50% - borderWidth))` + `rotate(45deg)` 트릭으로 박스 border와 매끄럽게 연결되는 V (자세한 내용 §C.6) |
| **FeedbackModal.tsx** | validation 실패 알림. Enter/Escape dismiss. autoFocus on 확인 버튼 |
| **CopyIssueModal.tsx** | problemAnalysis 단계에서 발견 이슈를 복사해 붙여넣기 도와주는 모달. Metabase canvas 재사용 (시각 연속성). 헤더 "전체 복사" 버튼은 orange 강조 |
| **IntentCatalogModal.tsx** | 100+ 인텐트 카탈로그 그리드. workType 단계 진입 시 한 번 자동 오픈. 검색 + 필터 |

### 보조 컴포넌트

| 파일 | 역할 |
|---|---|
| **IntentDetailCard.tsx** | 선택된 representativeIntent 정보 카드 (sessionId 끝자리 / 시간 / 인텐트 / 발화 / 응답 미리보기) |
| **RelatedInfoCard.tsx** | Stage 3 sheet-edit에서 prompt 작성 도울 reference 카드. "복사" 버튼은 클립보드 복사 + parent 콜백 |
| **NotionFloatingPanel.tsx** | NotionTaskPage 컨테이너 (사이드 패널 스타일링) |
| **RepresentativeSelect.tsx** | (옵션) representative 인텐트 선택 UI. 현재 메인 플로우에서는 사용 안 함 |

## C.2 데이터 파일

위치: `frontend/src/data/courses/fix-intent-5min/`

| 파일 | 내용 |
|---|---|
| **chat-log-sets.ts** | `ChatLogRow` 인터페이스, `buildStaticChatLogSet()` factory. 1개 broken row + 9 clean rows의 결정론적 set 반환 |
| **intent-catalog.ts** | 100+ 인텐트 카탈로그 (name, label, definition, examples). IntentCatalogModal 그리드 데이터 |
| **intent-sheets.ts** | `INTENT_ROWS`, `TRIGGER_ROWS`, `SHEET_ORDER` (4 sheet IDs), `SHEET_DESCRIPTIONS`, `CORRECT_INTENT_SHEET_ID`, type `IntentRow`/`SheetId`/`TriggerRow` |
| **notion-options.ts** | 모든 드롭다운 옵션 + 정답 + hint:<br>- `agentOptions`, `agentAnswer = '궁금하냥'`<br>- `assigneeOptions` + GitHub ID 검증<br>- `seasonOptions`, `seasonAnswer` (현 시즌)<br>- `statusHints` / `statusHintsStage4` (단계별로 정답이 'In Progress' / 'Done' 분기)<br>- `workTypeAnswer = ['newIntent', 'add']`, `workTypeHints`/`workTypeNextHints` |
| **work-types.ts** | `WorkType[]` ({key, label, bg, text, chartColor}) |
| **related-info.ts** | RelatedInfoCard 데이터 |
| **chatbot-replies.ts** | Stage 4 ChatbotTestPage가 토픽 분류 통과 후 사용할 미리 작성된 응답 |

## C.3 Course state · 영속화 · 검증 lib

위치: `frontend/src/lib/courses/fix-intent-5min/`

### `course-state.ts`

타입 정의:
- `IntentRow` (sessionId, createdAt, intent, userMessage, assistantContent)
- `SelectedIntent` ({setId, row})
- `NotionState` (10 필드: agent, title, assignee, status, season, workType, problemAnalysis, solutionDirection, workContent, result — 모두 nullable)
- `SheetEditState` (tab/cell/value)
- `ChatbotInteractionState` (question/answer)
- `SheetArtifact` ({addedIntent: {sheetId, intent, leadSentence, prompt, createdAt}, triggers: [{intent, sentence}], snapshotAt})
- `CourseState` (selectedIntents/representativeIntent/notion/sheetEdit/chatbotInteraction/sheetArtifact/updatedAt)
- `NotionFieldId` (모든 Notion 필드 union)
- `initialCourseState`

### `storage.ts`

- `loadCourseState(passkeyPublicKey?)` — GET `/api/courses/fix-intent-5min/state` → 블록체인 `/apps/knowledge/explorations/{address}/{topicKey}/courseState` 조회
- `saveCourseState(passkeyPublicKey, courseState)` — POST same route → 전체 blob + updatedAt 저장
- `recordStageComplete(passkeyPublicKey, stageNum)` — POST `/api/stage-complete` (대시보드 진행도 별도 트랙)

### `validate.ts`

- `ValidateContext` ({representativeIntent, username, attempt, phase})
- `ValidateResult` ({pass, hint?})
- `validateNotionField(fieldId, value, context)` 라우터:
  - 결정론적 (agent, assignee, season, status, workType): 로컬 매칭
  - 자유 입력 (title, problemAnalysis, solutionDirection, workContent, result): POST `/api/courses/fix-intent-5min/validate` → Azure OpenAI Responses API

### `mission-copy.ts`

`MissionPhase` (intro / dashboard / notion / quest-clear / stage2-page / quest-clear-2 / sheet-edit / quest-clear-3 / chatbot-test / stage4-result-page / course-complete)
`SheetPhase` (add-intent / run-intent-script / add-triggers / run-trigger-script / complete)
`getMissionCopy(input) → {stageLabel, message} | null`

→ MissionBar에 들어갈 한 줄 미션 텍스트 한 곳에서 결정.

### `tooltip-guidance.ts`

24-entry `GuidancePhase` enum:
```
dashboard
notion-landing
notion-field-{agent,title,assignee,status,season,workType}
notion-field-problemAnalysis-{copy, copy-modal, submit}        # 3-step sequence
stage2-solutionDirection
sheet-add-intent-tab          # default tab일 때
sheet-add-intent-row          # 도메인 탭일 때
sheet-field-intent
sheet-field-leadSentence
sheet-related-copy            # RelatedInfoCard 복사 안 함
sheet-field-prompt-paste      # 복사 후
sheet-run-intent-script
sheet-add-triggers
sheet-run-trigger-script
chatbot-{before, after}
stage4-status
stage4-result-{load-work, load-capture, submit}                # 3-step sequence
```

`guidanceConfig: Record<GuidancePhase, {idleMs, strayThreshold, side, align}>`
- `idleMs`: 단순 액션 15s, 폼 필드 25s, sheet-add-intent 40s (탭 선택 사고시간)
- `strayThreshold`: 보통 2-3, **notion-landing은 1** (원래 FeedbackModal 첫 클릭 즉시 노출 동작 보존)
- `TEST_IMMEDIATE_IDLE` 플래그 = true 시 모든 idleMs를 200ms로 클램프 (개발용; 출시 전 false로)

`GuidanceEntry` ({idleFired, strayCount, dismissedAt, tone, firmFired})
`resolveActiveGuidancePhase(ctx)`: phase + currentFieldId + sheetPhase + panelOpen + hasChatbotAnswer + copyIssueOpen + problemAnalysisCopied + sheetActiveTabId + sheetRowFilled + relatedInfoCopied + workAutoFilled + captureVisible 입력 → 단일 GuidancePhase | null

### `tooltip-copy.ts`

`Record<GuidancePhase, string>` — phase당 한 문장. soft/firm pair 구조 폐지(통합본). 음성 가이드 자매 강의와 일관(`-주세요/-하세요`, 실제 UI 라벨 인용).

대표 예:
- `dashboard`: "문제가 있는 인텐트의 행을 클릭해 주세요"
- `notion-landing`: ""새로 만들기" 버튼을 이용해 Task를 새로 만들어주세요"
- `notion-field-problemAnalysis-copy`: "아래 "발견한 이슈 복사하러가기" 버튼으로 발견한 이슈 로그를 가져와주세요"
- `sheet-add-intent-tab`: "적절한 도메인 탭(일반 / 재무 / 학사 / 국제) 중 이 이슈가 속하는 탭을 골라주세요"
- `stage4-result-load-work`: ""작업 내역 불러오기" 버튼을 눌러 작업 내역을 자동으로 채워주세요"

### `useGuidance.ts`

- `useIdleGuidance({enabled, delayMs, resetKey, onFire})` — 단일-shot setTimeout. resetKey 변경 시 재무장 (의미 있는 진행 신호; mousemove로는 reset 안 함)
- `useStrayClick({enabled, strayCount, threshold, onIncrement, onFire})` — `register(event, anchorEl)` exposes; anchor 내부 클릭은 short-circuit

### `workTypeHint.ts`

`computeWorkTypeHint(rawValue)` — workType 검증 실패 시 단계적 hint:
1. 아무것도 미선택 → 안내
2. 잘못된 키 포함 → `workTypeHints[wrongKey]` 사용 (왜 안 맞는지)
3. 정답 키 일부만 → `workTypeNextHints[pickedCorrect]` (이름은 안 알려주고 push)

### `prompts/` (LLM prompt 템플릿)

| 파일 | 검증 대상 |
|---|---|
| **title.ts** | Stage 1 title — 2+ word units, 깨진 인텐트 키워드 또는 일반적 인텐트 수정 framing 포함 |
| **problemAnalysis.ts** | Stage 1 분석문 + 채팅 로그 페이스트 |
| **solutionDirection.ts** | Stage 2 해결 방향 |
| **sheetIntent.ts** | (현재 비활성) Stage 3 신규 인텐트 이름 검증 |
| **sheetTriggers.ts** | (현재 비활성) Stage 3 트리거 문장 검증 |
| **chatbot.ts** | Stage 4 입력 발화 토픽 분류 (인텐트 이슈인가 random text인가) |

### Azure OpenAI 연결

`frontend/src/lib/server/azure-openai.ts` — `callAzureResponses({instructions, input})` 헬퍼. ENV: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`. 기본 retry 2회 (로컬 DNS blip 흡수).

## C.4 API routes

위치: `frontend/src/app/api/courses/fix-intent-5min/`

| Route | Method | 역할 |
|---|---|---|
| **state/route.ts** | GET / POST | CourseState blob 로드/저장 (`/apps/knowledge/explorations/{address}/{topicKey}/courseState`) |
| **validate/route.ts** | POST | 자유입력 필드 검증 라우터 → `prompts/{fieldId}.ts` 빌드 → `callAzureResponses()` |
| **validate-sheet/route.ts** | POST | (스텁) Stage 3 시트 검증 — 현재 항상 pass |
| **validate-chatbot/route.ts** | POST | Stage 4 토픽 분류기 (LLM-backed). 비-인텐트 발화는 "확신할 수 없어요" 메시지로 차단 |

## C.5 Stage flow → Phase / 컴포넌트 / 영속화 매핑 종합

```
intro                 CourseIntro                        →  setPhase('dashboard')
dashboard             DashboardView (rows + hearts)      →  올바른 행 클릭 + correct feedback
                                                           selectedIntents persist
notion (panelOpen=F)  NotionLanding                      →  하단 새로 만들기 클릭 → panelOpen=T
notion (panelOpen=T)  NotionTaskPage (STAGE1 fields)     →  6 필드 모두 LLM/결정론 통과
                                                           notion.* persist + recordStageComplete(1)
quest-clear           QuestModal                         →  확인 → setPhase('stage2-page')
stage2-page           NotionTaskPage (STAGE2 fields)     →  solutionDirection LLM 통과
                                                           recordStageComplete(2)
quest-clear-2         QuestModal                         →  확인 → setPhase('sheet-edit')
sheet-edit            SheetEditPage (4 sub-phase)        →  4 sub 모두 완료 → onComplete(summary, artifact)
                                                           sheetArtifact persist + recordStageComplete(3)
quest-clear-3         QuestModal                         →  확인 → setPhase('chatbot-test')
chatbot-test          ChatbotTestPage                    →  토픽 분류 통과 → answer 표시
                                                           chatbotInteraction persist
                                                           "Notion 으로" 모달 → setPhase('stage4-result-page')
stage4-result-page    NotionTaskPage (STAGE4 fields)     →  status='Done' + result 작성/제출
                                                           notion.{status,result} persist + recordStageComplete(4)
course-complete       CourseCompleteView (cosmic)        →  강의 완료
```

각 stage 경계에서 `recordStageComplete(N)`은 **persist BEFORE setPhase** 순서가 깨지지 않도록 가드(`persisting`).

## C.6 Tooltip 가이던스 시스템 — 디자인 결정 이력

다섯 차례 시행착오 후 다음 구성으로 안정화:

1. **타이밍**: idle timer (phase별 15-40s) + stray click counter (phase별 1-3회). 기본은 idle.
2. **Persistent mode**: tooltip은 학습자가 phase를 advance시킬 때까지 닫히지 않음. ESC / 외부 클릭으로 닫힘 무효화 (radix `onPointerDownOutside`/`onEscapeKeyDown` preventDefault).
3. **Modal-aware open**: `open={activeEntry.idleFired && guidanceEnabled}` — `guidanceEnabled`는 모달 오픈/persisting/loading/saveError/firmFired/quest 미확인 등 모든 차단 조건을 종합. 모달 열릴 때 즉시 숨김.
4. **앵커**: 정답 액션 요소에 고정 (포지션도, 클릭 short-circuit도). dashboard만 narrow phantom span (left-6 top-[44px]) 사용해 arrow가 헤더 좌측으로 가게.
5. **단일 메시지**: phase당 한 문장으로 통합. soft/firm 시각 구분(border 두께 1px → 2px)은 유지.
6. **말풍선 모양**: clip-path + translate + rotate를 합친 트릭 — `rotate(45deg) + translateY(calc(-50% - borderWidth)) + clipPath polygon(100% 0, 100% 100%, 0 100%)`으로 V자만 노출. V의 fill이 박스 bottom border 영역을 덮어 박스 border가 V 구간에서 끊긴 듯 보이게 만들어 박스+V를 연속 윤곽선으로 연결.
7. **avoidCollisions={false}**: 자동 flip 방지(비좁은 공간이라도 지정 side에 못박음).

해결한 주요 버그:
- **Phase-wipe useEffect**: 이전 phase의 stale anchor를 지우려는 `useEffect(() => setAnchorEls({}), [phase])`가 ref-callback 직후 실행돼 막 set한 anchor를 즉시 wipe. Hook은 `useCallback`으로 stable 처리됐기에 React가 다시 호출하지 않아 anchor가 영구히 null. 이로 인해 모든 phase의 tooltip이 silently 비활성화. → 해당 useEffect 제거 (자식 unmount 시 ref-callback이 null로 정리하는 것이 충분).
- **Hook order 위반**: `useIdleGuidance`/`useStrayClick`이 `if (loading) return` 뒤에 위치해 조건부 호출. → 가이드 hook 블록을 early-return 위로 이동, `guidanceEnabled`에 `!loading` 추가.
- **Infinite loop**: 인라인 ref 콜백 identity가 매 렌더 변경되어 React가 cleanup(null)/setup(el) 사이클 무한 반복. → `setAnchorFor`를 `useCallback([])`으로, 모든 phase별 ref 콜백을 `useCallback([setAnchorFor, ...])`로 안정화.

## C.7 MissionBar / QuestModal / GuidanceTooltip 레이어링

```
MissionBar     (passive)  ─ phase가 활성인 동안 항상 상단 한 줄로 노출. 변경시 한 번 펄스
QuestModal     (gating)   ─ phase 진입 시 한 번 (one-shot, *QuestSeen flag로 가드). Enter/Esc dismiss
GuidanceTooltip (idle)    ─ phase별 idleMs 후 또는 strayThreshold 도달 시. modal 열림 시 자동 hide
```

`anyModalOpen` predicate가 위 레이어들의 호환을 보장:

```ts
const anyModalOpen =
  !!dashboardFeedback ||
  showRestart ||
  copyIssueOpen ||
  catalogOpen ||
  !!notionError ||
  questModalOpenHere;          // 현재 phase의 *QuestSeen 미확인 시 true
```

`questModalOpenHere`는 phase별로 분기 — 다른 phase의 *QuestSeen이 false라도 현재 phase 가이던스를 막지 않음.

## C.8 Restart / Hearts / Timer

- `TIMER_TOTAL = 60` (초). dashboard 단계 cosmetic only.
- 일시정지 조건: 모달 오픈 / persisting / `!stage1QuestSeen` / phase ≠ dashboard / timerRemaining = 0
- Hearts: 3개. dashboard 오답 시 차감. 0 → showRestart=true → handleRestart() 실행
  - `saveCourseState(_, initialCourseState)` 호출로 블록체인 blob 클리어
  - 전체 state 리셋: `selectedIntents=[]`, `representative=null`, `notion=initialCourseState.notion`, `currentFieldIdx=0`, `setIndex=0`, `dashboardFeedback=null`, `notionError=null`, `hearts=3`, `timerRemaining=TIMER_TOTAL`, `activeSets=[buildStaticChatLogSet()]`, `showRestart=false`, `setPhase('dashboard')`
  - **추가로** `setGuidance({})`, `setAnchorEls({})` (가이던스 시스템도 fresh)

## C.9 시각 자산 (외부 파일)

### 마스코트 / 아바타
- `frontend/public/courses/fix-intent-5min/curious-nyang-avatar.png` — 30×30 챗봇 아바타 (BotBubble/BotTyping 사용)
- `frontend/public/courses/fix-intent-5min/curious-nyang-character.webp` — 캐릭터 일러스트

### 맵 (Tiled .tmj, 9KB each, 20×15 grid)

`frontend/public/maps/courses/curious-nyang-intent-guide/fix-intent-5min/`
- `stage-0.tmj` — 인트로/스폰 룸
- `stage-1.tmj` — 대시보드 룸
- `stage-2.tmj` — 수정 방향 룸
- `stage-3.tmj` — 시트 편집 룸

용도: 2D portal/door/spawn 맵. 코스 룸 모드 (signboard + portal) 활성화 시 학습자 캐릭터가 입장.

### 랜딩 커버
- `frontend/public/maps/courses/curious-nyang-intent-guide/fix-intent-5min/agents-intents-cover.png` (731KB) — Notion 페이지 상단 cover 이미지로 NotionLanding에서 사용

### 자매 강의 콘텐츠 자산
`knowledge-graph-builder/courseGenerator/awesome-papers-with-claude-code/assets/courses/curious-nyang-intent-guide/fix-intent-5min/`
- `dashboard.png`, `intent-process.png`, `notion-agent-intent-page.png`, `notion-created-page.png`, `notion-new-task.png`, `notion-task-edit.png`, `pattern-a.png`, `pattern-b.png`, `table-columns.png`

→ courses.json/lessons에서 참조하는 스크린샷 자산

## C.10 디자인 docs (frontend/docs/)

- `frontend/docs/interactive-courses/fix-intent-5min-plan.md` — 4-stage 흐름 명세, 데이터 스키마, LLM 검증 엔드포인트
- `frontend/docs/interactive-courses/fix-intent-5min-stage1-plan.md` — Stage 1 상세
- `frontend/docs/interactive-courses/fix-intent-5min-new-intent-notes.md` — 신규 인텐트 기능 메모

## C.11 최근 커밋 주제 (main..HEAD)

대표 흐름:
1. **초기 스캐폴드** — DashboardView + countdown + 정적 10행 chat-log set
2. **Notion 패널 + 필드 검증** — title/problemAnalysis/solutionDirection LLM 검증, status/season/agent/assignee 옵션 + hint
3. **WorkType + IntentCatalog** — Notion popover 스타일, 카탈로그 자동 오픈, newIntent+add 두 키 강제
4. **Stage 3 Sheet** — Google Sheet 클론, 4 sub-phase, blur로 advance, isPush 컬럼 제거
5. **Stage 4** — 챗봇 테스트 페이지(궁금하냥 UI 미러), 토픽 LLM 게이팅, 결과 페이지(status/result split, auto-fill 버튼)
6. **MissionBar 리팩터** — QuestModal-사라지는-브리핑 → 상시 표시 MissionBar로 전환
7. **GuidanceTooltip 시스템** — phase별 idle/stray + 18 → 24 phase 확장, 회전 정사각형 clip-path arrow 트릭으로 박스 border와 매끄럽게 연결, persistent mode + modal-aware open
8. **잡 fix** — paperId double-dash 컨벤션 통일, recordStageComplete BEFORE persist 순서, Azure OpenAI 재시도 2회, dead `.cc-*` celebration CSS 정리

---

# Part D · 외부 시스템 / 메모리 인덱스

## D.1 학습 페이지 라우팅

`frontend/src/app/learn/[...paperId]/page.tsx`:

```ts
import { FIX_INTENT_COURSE_ID, IntentFixCourse } from '...';
if (normalizePaperId(paperId) === FIX_INTENT_COURSE_ID) {
  return <IntentFixCourse />;
}
```

URL: `/learn/curious-nyang-intent-guide/fix-intent-5min`. paperId double-dash 컨벤션 (`curious-nyang-intent-guide--fix-intent-5min`)을 normalize.

## D.2 블록체인 영속화

AIN devnet, write rules `auth.addr !== ''` (any wallet).

```
/apps/knowledge/explorations/{address}/courses|curious-nyang-intent-guide--fix-intent-5min/courseState
```

`getUserAinClient(passkeyPublicKey)`로 학습자별 derive된 address 사용. handleRestart는 이 path를 setValue null로 wipe.

## D.3 메모리 시스템 (Claude harness)

`/Users/comcom/.claude/projects/-Users-comcom-Desktop-papers-with-claude-code/memory/`

관련 항목:
- `MEMORY.md` — 인덱스
- `reference_awesome_folder.md` — awesome 폴더 위치 = `knowledge-graph-builder/courseGenerator/awesome-papers-with-claude-code`
- `reference_data_schema.md` — `paper.json` / `courses.json` / `graph.json` 필드 정의
- `project_blockchain_architecture.md` — write rules, owner key, explorations 초기화 절차
- `project_payment_progress.md` — stage_enter / stage_complete 이벤트 모델
- `project_stage_flow_spec.md` — 코스 결제→스테이지→대시보드 복원 UX 명세
- `feedback_design_green.md` — UI 색상 선호 (파생 결정: 본 강의는 orange #FF9D00 메인)
- `feedback_awesome_repo_push.md` — awesome 레포 변경 시 즉시 commit+push (CLAUDE.md 같은 본 파일 포함)

## D.4 시리즈 메타데이터

`awesome-papers-with-claude-code/curious-nyang-intent-guide/paper.json`:
```
{
  "title": "궁금하냥 인텐트 기여 가이드",
  ...
}
```

`thumbnail.png` — 시리즈 썸네일 (3강좌 모두 공유)

각 강의 폴더(`best-intent-worker/`, `fix-intent-hands-on/`, `fix-intent-5min/`) 내부에 `paper.json` (강의 메타) + `knowledge/courses.json` (단계별 콘텐츠) + `knowledge/graph.json` (concept 그래프, fix-intent-5min은 미생성)

---

# Part E · 미해결 사항 / TODO

## E.1 BACKLOG (강의 콘텐츠)

`awesome-papers-with-claude-code/curious-nyang-intent-guide/BACKLOG.md`:

> ## best-intent-worker 강의 수정 필요
> - Google Sheet 컬럼 구조가 변경됨
>   - 인텐트(tab2~5): `Intent`, `대표Sentence (참고용)`, `Prompt` (3개) — 기존 Model, isPush 삭제
>   - 트리거(tab1): `Intent`, `Sentence` (2개) — 기존 Category, Insert 삭제
> - 해당 내용이 반영된 레슨: intent_trigger_management, intent_prompt_management, google_sheet_architecture, update_deployment, troubleshooting_patterns

상태: **PENDING**. 5개 레슨 업데이트 필요.

## E.2 fix-intent-5min `graph.json` 미생성

best-intent-worker는 `knowledge/graph.json` 보유, fix-intent-5min은 미생성. concepts/edges 정보는 `courses.json`의 `prerequisites` 배열에 암시적으로 표현. blockchain 등록·explorer 경로 시각화 위해 생성 필요.

## E.3 코드 측 TODO

- **Stage 3 LLM 검증** (`sheetIntent.ts`, `sheetTriggers.ts`): 프롬프트는 작성됨. validate-sheet route는 현재 항상 pass 반환하는 스텁. 활성화 필요.
- **TEST_IMMEDIATE_IDLE 플래그**: `tooltip-guidance.ts` 상단 `const TEST_IMMEDIATE_IDLE = true` — 출시 전 false로.
- **workContent / result LLM 검증**: 현재 pass-through. result 후기 검증 prompt 필요.

## E.4 시리즈 학습 경로 안내 부재

세 강의가 서로를 "이 다음에 보세요" 방식으로 cross-reference 하지 않음. 학습자가 어떤 강의를 어떤 순서로 봐야 하는지 안내가 paper.json README 에만 의존. 시리즈 페이지 (frontend/series 라우트) 또는 강의 인트로에 명시적 경로 안내 추가 고려.

---

# Part F · 어휘 & 용어집

자주 충돌하거나 헷갈리는 항목 위주.

| 용어 | 정의 | 출처 / 비고 |
|---|---|---|
| **인텐트(Intent)** | 유저 질문의 의도를 분류한 카테고리. 예: `등록금_문의` | best-intent-worker §intent_system_overview |
| **트리거 문장(Trigger Sentence)** | 한 인텐트에 매칭될 유저 질문 예시 (한 인텐트당 다수) | tab1에 저장 |
| **프롬프트(Prompt)** | 인텐트 매칭 후 AI 답변 생성 지침 | tab2~5에 저장 |
| **인텐트 일꾼** | 인텐트 시스템에 기여하는 사람의 역할명. 학습자에게 부여되는 정체성 | best-intent-worker가 명명, 두 후속 강의도 사용 |
| **궁금하냥** | 한양대 학사 행정 챗봇. "냥"은 고양이 울음 의성어 → 친근함 | 모든 강의 공통 |
| **인텐트 위원회** | 품질 기준을 정하고 관리하는 조직. 포맷·네이밍 표준 보유 | best-intent-worker §intent_committee_standards |
| **골든셋(Golden Set)** | Prod 배포 시 회귀 검증용 핵심 Q-A 셋. PM만 관리 | best-intent-worker §prod_launch_process |
| **Dev/Prod** | hanyang-ai-dev / hanyang-ai 두 환경. 각각 별도 시트, 대시보드 보유 | 모든 강의 공통 |
| **Custom Scripts** | Google Sheet 메뉴 안의 App Script 액션. Update Intent Prompts/Triggers 두 종류 | best-intent-worker §update_deployment, fix-intent-hands-on §fix_intent |
| **Pattern A/B/C** | 트러블슈팅 3패턴: 트리거 미매칭 / 답변 부정확 / 인텐트 미등록 | best-intent-worker §troubleshooting_patterns, fix-intent-hands-on은 A/B 2패턴만 (C는 묵시) |
| **카테고리 (재무/학사/국제/일반)** | tab2~5 매핑. **장학금=일반**(학생지원팀 소관) 함정 주의 | best-intent-worker §intent_categories |
| **Inbound/Outbound** | 국제 카테고리 하위. 외국인 한양대 진입 / 한양대생 해외 진출 | 모든 강의 공통 |
| **Notion Tasks DB / Agents&Intents 페이지** | 이슈 추적 + Prod 승인 큐 | 모든 강의 공통 |
| **Assignee / Season** | 노션 Task 카운트의 핵심 메타. 잘못 설정 시 카운트 안 됨 | fix-intent-hands-on §record_changes 강조 |
| **Work type 6종** | addTrigger / newIntent / updateIntent / newIntentDev / sqlWorkflow / bugReportQa | fix-intent-hands-on §record_changes, fix-intent-5min code |

### 인터랙티브 강의 전용 용어 (코드 레벨)

| 용어 | 의미 |
|---|---|
| **Phase** | IntentFixCourse가 라우팅하는 단일 string state. intro/dashboard/notion/.../course-complete |
| **GuidancePhase** | 24-entry enum. Phase보다 더 fine-grained (필드별, sub-phase별) |
| **MissionPhase** | mission-copy.ts의 enum. Phase와 1:1 가까움 |
| **SheetPhase** | SheetEditPage 내부 4 sub-phase |
| **MissionBar** | 상단 한 줄 페르시스턴트 미션 표시 |
| **QuestModal** | one-shot phase 진입 모달 (블루 톤) |
| **GuidanceTooltip** | idle/stray 후 자동 노출되는 orange 말풍선 |
| **FeedbackModal** | 검증 실패 알림 (간단형) |
| **CopyIssueModal** | 채팅 로그 복사 도우미 (Metabase canvas 재사용) |
| **IntentCatalogModal** | 100+ 인텐트 카탈로그. workType 단계 진입 시 자동 오픈 |
| **SheetArtifact** | Stage 3 결과물 (인텐트 행 + 트리거 행). Stage 4에서 work-content 자동 채움에 사용 |
| **Hearts HUD** | dashboard 3-attempt 게임 메카닉. 0 → restart |
| **TimerBar** | dashboard cosmetic 60s 카운트다운. green→amber→red |
| **Notion 필드 ID** (`NotionFieldId`) | agent / title / assignee / status / season / workType / problemAnalysis / solutionDirection / workContent / result |

---

# Part G · 빠른 점검표

이 문서를 기반으로 작업할 때 자주 쓰는 핵심 정보 요약.

### 새 phase 추가 시 체크
1. `Phase` union에 추가 (IntentFixCourse.tsx)
2. `MissionPhase`/`getMissionCopy` 매핑 (mission-copy.ts)
3. `GuidancePhase` enum + `guidanceConfig` + `tooltip-copy.ts` 추가
4. `resolveActiveGuidancePhase` 분기 추가
5. IntentFixCourse 렌더 분기 (early return) + `guidanceTooltip` 포함
6. 필요 시 anchor 콜백 추가 (자식 컴포넌트 prop)

### 새 LLM-검증 필드 추가 시 체크
1. `prompts/{fieldId}.ts` 작성 (instructions + buildInput)
2. `validate.ts`에서 free-input 분기에 fieldId 추가
3. (현재 stub인 경우) `/api/courses/fix-intent-5min/validate` route에서 라우팅
4. fields/ 폼 컴포넌트가 onSubmit → validateNotionField 호출 흐름인지 확인

### 새 강의 자매 추가 시 체크 (예: 가상의 "fix-intent-quiz")
1. `awesome-papers-with-claude-code/curious-nyang-intent-guide/fix-intent-quiz/` 생성
2. `paper.json`, `knowledge/courses.json`, (옵션) `knowledge/graph.json`, `README.md`
3. paperId 컨벤션: `curious-nyang-intent-guide--fix-intent-quiz`
4. 시리즈 paper.json에 강의 추가 등록 여부 확인
5. 어조 가이드: `-주세요/-하세요`, `-냥` 어미 금지, "인텐트 일꾼" 정체성 유지, 실 UI 라벨 인용
6. 본 강의를 prerequisite으로 명시할지 결정

### 색상 팔레트 (UI 작업 시)
| 역할 | hex | 비고 |
|---|---|---|
| 메인 오렌지 (CTA) | `#FF9D00` | MissionBar pulse glow, CourseIntro CTA, BlockField submit, IntentCatalogModal accent |
| Hover 진행 | `#E68E00` | NotionTaskPage submit hover, RelatedInfoCard hover |
| Surface (peach) | `#FFF8EF` | MissionBar bg, GuidanceTooltip bg |
| Border soft | `#FDE6CE` | MissionBar border, GuidanceTooltip soft border (1px) |
| Border firm | `#FF9D00` | GuidanceTooltip firm border (2px, escalation 표시) |
| Divider | `#F3C5A2` | MissionBar 구분선 |
| Accent text | `#C4704F` | Notion-tag brown |
| Tints | `rgba(255,157,0,0.10/.18/.22/.35)` | chip bg / icon circle / card border / pulse |
| Mascot 코랄 | `#CF6F50` | CourseIntro 픽셀 마스코트 몸체 |
| Mascot 노랑 | `#FFD100` | 안전모 |

### 한국어 어조 가이드 (모든 강의 공통)
- 정중-격식체 `-습니다 / -합니다 / -하세요 / -주세요`
- `-냥` 같은 캐릭터 어미 사용 안 함
- 실제 UI 라벨 인용("새로 만들기", "+ 인텐트 행 추가", "Update Intent Prompts (dev)" 등)
- 「」 인용부호로 UI 버튼 표기 (인터랙티브 강의)
- 학습자에게 "인텐트 일꾼" 정체성 부여
- "여러분"은 가끔만 (단언이 자연스러우면 호칭 생략)
- 함정 사례는 명시적으로 강조 ("주의: 장학금은 일반!")
