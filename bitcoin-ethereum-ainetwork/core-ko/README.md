# Bitcoin, Ethereum, AI Network 학습 경로

Claude Code 기반 인터랙티브 학습 경로 — 사토시 나카모토의 비트코인 백서(2008),
Vitalik Buterin의 이더리움 백서(2014), AI Network 아키텍처/백서(2018-2025) 기반.

## 시작하기

1. 이 디렉토리에서 Claude Code 실행:
   ```bash
   cd bitcoin-ethereum-ainetwork/core-ko
   claude
   ```
2. 자연스럽게 대화하며 학습:
   ```
   explore              # 지식 그래프 보기
   teach me <concept>   # 레슨 시작
   give me a challenge  # 퀴즈 풀기
   done                 # 완료 후 다음 진행
   ```

## 친구와 진행 상황 공유

1. 학습자 브랜치 생성:
   ```bash
   git checkout -b learner/your-name
   ```
2. 학습 진행에 따라 커밋:
   ```bash
   git add .learner/
   git commit -m "Progress update"
   git push origin learner/your-name
   ```
3. 친구 브랜치 가져오기:
   ```bash
   git fetch --all
   friends
   ```

## 코스 구조

- **비트코인 백서 핵심** (4 concepts): 사토시 나카모토의 2008년 비트코인 백서의 핵심 개념 — 트랜잭션, 작업 증명, 인센티브
- **비트코인 심화 개념** (3 concepts): SPV, 상태 전이 시스템, 비트코인 스크립트 한계 등 심화 주제
- **이더리움 백서 핵심** (6 concepts): Vitalik Buterin의 2014년 이더리움 백서 — 계정, Gas, EVM, 응용 분야
- **AI Network 아키텍처** (5 concepts): AI Network의 Deep Computing 아키텍처와 역할 시스템 — 2018-2025년 백서 기반
- **프론티어: AI와 블록체인의 미래** (2 concepts): ML 패턴과 Open Resource — AI Network의 최첨단 비전

## 통계

- 20개 개념, 5개 코스
- 4 foundational, 10 intermediate, 5 advanced, 2 frontier 개념
