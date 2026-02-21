# Adam: A Method for Stochastic Optimization Learning Path

A Claude Code-powered interactive learning path based on
"Adam: A Method for Stochastic Optimization" by Diederik P. Kingma and Jimmy Ba, 2014.

## Getting Started

1. Open Claude Code in this directory:
   ```bash
   cd adam-a-method-for-stochastic-optimization/
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

- **Optimization Foundations** (4 concepts): Background on SGD, momentum, AdaGrad, and RMSprop—essential context for understanding Adam's innovations.

- **The Adam Algorithm** (5 concepts): Core techniques including first moment estimation (momentum), second moment estimation (variance tracking), bias correction, adaptive learning rates, and hyperparameter selection.

- **Applications & Special Cases** (3 concepts): How Adam handles sparse gradients (critical for NLP), noisy objectives, and the AdaMax variant for extreme gradient spikes.

- **Advanced Theory & Efficiency** (3 concepts): Convergence guarantees, memory requirements, and per-iteration computational cost—why Adam scales to modern deep learning.

## Stats

- 15 concepts across 4 courses
- 4 foundational, 7 intermediate, 3 advanced, 1 frontier concepts
- ~60 minutes total learning time

## Paper Details

**Title:** Adam: A Method for Stochastic Optimization

**Authors:** Diederik P. Kingma, Jimmy Ba

**Venue:** ICLR 2015

**ArXiv:** https://arxiv.org/abs/1412.6980

**Abstract:** Adam proposes a method for efficient stochastic optimization that combines advantages of adaptive learning rate methods (like AdaGrad) with momentum-based methods. The algorithm maintains exponential moving averages of both gradients (first moment) and squared gradients (second moment), with bias correction to account for zero initialization. Adam is computationally efficient, has minimal memory requirements, and is invariant to diagonal rescaling of gradients. The paper provides theoretical convergence analysis and demonstrates strong empirical performance across diverse problems.

## Why Adam Matters

Adam is arguably the most important optimization algorithm in modern deep learning. Before Adam (2015), practitioners had to carefully tune learning rates for each problem. Adam introduced sensible defaults (α=0.001, β₁=0.9, β₂=0.999) that work across computer vision, NLP, reinforcement learning, and other domains. Today, Adam is the default optimizer in PyTorch, TensorFlow, and most research papers. Understanding Adam is understanding the heartbeat of modern AI.
