# GLM-5 Learning Path

A Claude Code-powered interactive learning path based on
"GLM-5" by Z.ai, 2025.

## Getting Started

1. Open Claude Code in this directory:
   ```
   cd glm-5-1/
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
   ```
   git checkout -b learner/your-name
   ```
2. Commit progress as you learn:
   ```
   git add .learner/
   git commit -m "Progress update"
   git push origin learner/your-name
   ```
3. Fetch friends' branches:
   ```
   git fetch --all
   friends
   ```

## Course Structure

- **Foundations: Building Blocks for GLM-5** (4 concepts): Essential background concepts in transformers, sparse architectures, and RLHF training
- **GLM-5 Architecture Deep Dive** (5 concepts): Understanding GLM-5's architectural innovations including its scale, sparse attention, and context handling
- **Training GLM-5: From Pre-training to Post-training** (2 concepts): How GLM-5 was trained and refined using the innovative Slime asynchronous RL infrastructure
- **Deploying GLM-5 Efficiently** (3 concepts): Practical deployment strategies including vLLM, speculative decoding, and the EAGLE algorithm
- **GLM-5 in Action: Agentic Applications** (6 concepts): How GLM-5's capabilities translate into real-world agentic tasks and benchmarks

## Stats

- 20 concepts across 5 courses
- 4 foundational, 5 intermediate, 8 advanced, 3 frontier concepts
