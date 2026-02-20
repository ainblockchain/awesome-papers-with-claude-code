# YOLOv3: An Incremental Improvement Learning Path

A Claude Code-powered interactive learning path based on
"YOLOv3: An Incremental Improvement" by Joseph Redmon & Ali Farhadi, 2018.

## Getting Started

1. Open Claude Code in this directory:
   ```bash
   cd ./awesome-papers-with-claude-code/yolov3-an-incremental-improvement/yolo-v3-object-detection-fundamentals
   claude
   ```
2. Start learning — just chat naturally:
   - `explore` — see the knowledge graph
   - `teach me <concept>` — start a lesson
   - `give me a challenge` — get a quiz
   - `done` — mark complete, move on
   - `status` — check your progress

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

- **Object Detection Fundamentals** (5 concepts) — Core concepts for understanding what object detection is, how bounding boxes work, and how we measure success with IoU and mAP.
- **YOLO Architecture Deep Dive** (6 concepts) — The heart of YOLOv3: Darknet-53 backbone, residual connections, batch normalization, and multi-scale Feature Pyramid Networks.
- **Multi-Scale Detection & Prediction** (5 concepts) — YOLOv3's innovation: predicting at three scales using anchor boxes, grid-based predictions, objectness scores, and box regression.
- **Loss Functions & Training Strategy** (5 concepts) — How YOLOv3 learns: the composite loss function, handling class imbalance, data augmentation, speed-accuracy tradeoffs, and NMS post-processing.
- **Real-Time Optimization & Deployment** (3 concepts) — Making YOLOv3 practical: real-time optimization techniques, edge device deployment, and future directions with weak supervision.

## Stats

- 25 concepts across 5 courses
- 4 foundational, 7 intermediate, 8 advanced, 6 frontier concepts
- Paper: Joseph Redmon & Ali Farhadi, "YOLOv3: An Incremental Improvement," 2018
- arXiv: https://arxiv.org/abs/1804.02767

---

**Ready to learn?** Run `claude` in this directory and start exploring! 🚀
