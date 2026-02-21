# Awesome Papers with Claude Code

A curated collection of AI/ML papers turned into interactive learning courses powered by [Claude Code](https://claude.ai/claude-code).

Part of the [Papers with Claude Code](https://paperswithclaudecode.com) project — see [ainblockchain/papers-with-claudecode](https://github.com/ainblockchain/papers-with-claudecode) for the full platform (frontend, blockchain integration, course builder, Cogito Node).

## How it works

Each paper directory contains:
- **`paper.json`** — Paper metadata (title, authors, arXiv ID, GitHub repo)
- **Course subdirectories** — Each is a self-contained learning path with a `CLAUDE.md` tutor prompt, knowledge graph, and lesson content

Open any course directory in Claude Code and start chatting. The AI tutor will guide you through the paper with explanations, analogies, code snippets, and quizzes.

## Papers

| Paper | Authors | Year | Courses |
|-------|---------|------|---------|
| [Attention Is All You Need](attention-is-all-you-need/) | Vaswani et al. (Google Brain) | 2017 | 10 |
| [Adam: A Method for Stochastic Optimization](adam-a-method-for-stochastic-optimization/) | Kingma & Ba (Google Brain / OpenAI) | 2014 | 1 |
| [An Image is Worth 16x16 Words (ViT)](an-image-is-worth-16x16-words-transformers-for/) | Dosovitskiy et al. (Google Research) | 2020 | 1 |
| [Direct Preference Optimization (DPO)](direct-preference-optimization-your-language-model/) | Rafailov et al. (Stanford) | 2023 | 1 |
| [T5: Text-to-Text Transfer Transformer](exploring-the-limits-of-transfer-learning-with-a/) | Raffel et al. (Google) | 2019 | 1 |
| [HippoRAG](hipporag-neurobiologically-inspired-long-term/) | Gutiérrez et al. (Ohio State) | 2024 | 1 |
| [LLaMA 2](llama-2-open-foundation-and-fine-tuned-chat-models/) | Touvron et al. (Meta AI) | 2023 | 1 |
| [YOLOv3](yolov3-an-incremental-improvement/) | Redmon & Farhadi (U. Washington) | 2018 | 1 |

## Quick start

```bash
# Clone and enter a course
git clone https://github.com/ainblockchain/awesome-papers-with-claude-code.git
cd awesome-papers-with-claude-code/attention-is-all-you-need/bible

# Open in Claude Code and start learning
claude
```

Then just chat: "teach me about self-attention", "show the graph", "next", "exercise".

## Course structure

```
paper-name/
├── paper.json              # arXiv metadata
├── course-variant/
│   ├── CLAUDE.md           # AI tutor instructions
│   ├── README.md           # Course overview
│   ├── knowledge/
│   │   ├── graph.json      # Knowledge graph (nodes + edges)
│   │   └── courses.json    # Lessons and quizzes
│   └── .learner/           # Progress tracking (created on first use)
│       ├── profile.json
│       └── progress.json
└── another-variant/
    └── ...
```

## Learner features

- **Knowledge graph** — Visualized as a Mermaid diagram showing concept dependencies
- **Progress tracking** — Completed concepts marked, next concept recommended via graph topology
- **Friends** — Share progress via git branches, see friends' positions on the graph
- **Quizzes** — Each concept ends with a quiz (multiple choice, predict-the-output, true/false)

## On-chain integration

Courses can optionally record progress on the [AIN blockchain](https://ainetwork.ai/) knowledge graph:

- Each concept completion → `ain.knowledge.explore()` on-chain
- Community frontier map → who explored what, to what depth
- x402 micropayments → premium content gated by AIN-token payments
- Visualize on [AINscan](https://ainscan.ainetwork.ai/knowledge)

See [ainblockchain-integration](https://github.com/ainblockchain/papers-with-claudecode/tree/main/ainblockchain-integration) for details.

## Contributing

1. Find a paper on [arXiv](https://arxiv.org/) with open-source code
2. Use the [Course Builder](https://paperswithclaudecode.com/publish) or generate manually with Claude Code
3. Submit a PR with `paper-slug/paper.json` + one or more course directories

## Related

- [paperswithclaudecode.com](https://paperswithclaudecode.com) — Full platform with explore, learn, village, and course builder
- [ainblockchain/papers-with-claudecode](https://github.com/ainblockchain/papers-with-claudecode) — Platform source code
- [ainblockchain/ain-js](https://github.com/ainblockchain/ain-js) — AIN blockchain SDK with knowledge module
- [AINscan](https://ainscan.ainetwork.ai) — Blockchain explorer with knowledge graph visualization

## License

MIT
