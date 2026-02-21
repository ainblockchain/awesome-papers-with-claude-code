# Attention Is All You Need Learning Path

A Claude Code-powered interactive learning path based on
"Attention Is All You Need" by Vaswani et al., 2017.

## Getting Started

1. Open Claude Code in this directory:
   cd attention-is-all-you-need/
   claude
2. Start learning — just chat naturally:
   explore              # see the knowledge graph
   teach me <concept>   # start a lesson
   give me a challenge  # get a quiz
   done                 # mark complete, move on

## Sharing Progress with Friends

1. Create your learner branch:
   git checkout -b learner/your-name
2. Commit progress as you learn:
   git add .learner/
   git commit -m "Progress update"
   git push origin learner/your-name
3. Fetch friends' branches:
   git fetch --all
   friends

## Course Structure

- **Foundations of Sequence Modeling** (4 concepts): Background knowledge on sequence-to-sequence models, RNNs, attention, and embeddings needed to understand the Transformer
- **Core Attention Mechanisms** (4 concepts): The heart of the Transformer: scaled dot-product attention, multi-head attention, self-attention, and positional encoding
- **The Transformer Architecture** (7 concepts): How the encoder, decoder, and their sub-layers fit together into the complete Transformer model
- **Training and Optimization** (4 concepts): How the Transformer is tokenized, trained, and regularized: BPE, learning rate warmup, dropout, and label smoothing
- **Complexity Analysis and Generalization** (2 concepts): Understanding the computational trade-offs of self-attention and how the Transformer generalizes beyond machine translation

## Stats

- 21 concepts across 5 courses
- 4 foundational, 8 intermediate,
  7 advanced, 2 frontier concepts
