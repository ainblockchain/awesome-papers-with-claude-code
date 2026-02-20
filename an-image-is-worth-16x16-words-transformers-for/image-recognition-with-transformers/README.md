# An Image is Worth 16x16 Words Learning Path

A Claude Code-powered interactive learning path based on
"An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale" by Dosovitskiy et al., 2020.

## Getting Started

1. Open Claude Code in this directory:
   ```bash
   cd image-recognition-with-transformers
   claude
   ```

2. Start learning — just chat naturally:
   ```
   explore              # see the knowledge graph
   teach me <concept>   # start a lesson
   give me a challenge  # get a quiz
   done                 # mark complete, move on
   ```

## Sharing Progress with Friends

1. Create your learner branch:
   ```bash
   git checkout -b learner/your-name
   ```

2. Commit progress as you learn:
   ```bash
   git add .learner/
   git commit -m "Progress update"
   git push origin learner/your-name
   ```

3. Fetch friends' branches:
   ```bash
   git fetch --all
   friends
   ```

## Course Structure

- **Vision Transformer Foundations** (4 concepts): 이미지 처리의 기초와 Vision Transformer의 핵심 입력 처리 방식을 배웁니다.
- **Transformer Architecture** (4 concepts): Vision Transformer의 핵심 신경망 아키텍처와 각 컴포넌트를 깊이 있게 학습합니다.
- **Theory & Design Choices** (3 concepts): ViT의 설계 철학, 귀납적 편향, 스케일링 법칙을 이해합니다.
- **Training & Real-World Applications** (4 concepts): 대규모 사전학습, 미세 조정, 벤치마크 평가와 해석 가능성을 배웁니다.
- **Beyond Image Classification** (1 concept): Vision Transformer의 확장 가능성과 미래 연구 방향을 탐험합니다.

## Stats

- 16 concepts across 5 courses
- 4 foundational, 6 intermediate, 4 advanced, 1 frontier concepts

---

**Questions?** Run `claude` in this directory and chat with the tutor!
