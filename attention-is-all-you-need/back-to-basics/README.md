# Attention Is All You Need Learning Path

A Claude Code-powered interactive learning path based on
"Attention Is All You Need" by Vaswani et al., 2017.

## Getting Started

1. Open Claude Code in this directory:
   ```
   cd awesome-papers-with-claude-code/attention-is-all-you-need/back-to-basics/
   claude
   ```
2. Start learning — just chat naturally:
   ```
   explore              # see the knowledge graph
   teach me attention   # start a lesson
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

- **Why Replace RNNs?** (5 concepts): Background concepts that motivated the Transformer — sequence tasks, RNN limitations, and the birth of attention
- **The Attention Core** (4 concepts): The mathematical heart of the Transformer — QKV formulation, scaled dot-product attention, multi-head attention, and positional encoding
- **Building the Full Transformer** (6 concepts): Assembling the complete architecture — encoder stack, decoder stack, residual connections, masking, and self- vs cross-attention
- **Training & Results** (3 concepts): How the Transformer is trained efficiently — attention complexity, warmup schedule, and label smoothing
- **Impact & the Future** (3 concepts): How the Transformer reshaped AI — transfer learning, attention interpretability, and spread beyond NLP

## Stats

- 21 concepts across 5 courses
- 5 foundational, 7 intermediate, 6 advanced, 3 frontier concepts
