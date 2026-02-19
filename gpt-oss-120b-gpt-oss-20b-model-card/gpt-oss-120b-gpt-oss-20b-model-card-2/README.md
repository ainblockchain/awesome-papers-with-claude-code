# gpt-oss-120b & gpt-oss-20b Model Card Learning Path

A Claude Code-powered interactive learning path based on
"gpt-oss-120b & gpt-oss-20b Model Card" by OpenAI, 2025.

## Getting Started

1. Open Claude Code in this directory:
   ```
   cd gpt-oss-120b-gpt-oss-20b-model-card-2/
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

- **Foundations: Transformers, MoE, and Training** (6 concepts): Essential background on transformer architecture, mixture of experts, and training paradigms that underpin GPT-OSS
- **GPT-OSS Architecture Deep Dive** (6 concepts): Understanding the specific architectural choices in GPT-OSS: attention variants, context extension, and efficiency techniques
- **Reasoning, Tools, and Agentic Capabilities** (5 concepts): How GPT-OSS implements configurable reasoning, tool use, and the harmony chat format for instruction following
- **Safety, Alignment, and Evaluation** (6 concepts): How OpenAI evaluated GPT-OSS for safety, including deliberative alignment, adversarial testing, and the preparedness framework
- **Open Release and Future Considerations** (2 concepts): Understanding the implications of open weights release and considerations for deploying GPT-OSS

## Stats

- 25 concepts across 5 courses
- 6 foundational, 10 intermediate, 7 advanced, 2 frontier concepts
