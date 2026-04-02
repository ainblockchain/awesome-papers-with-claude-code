# Data Schema Reference

This document describes every data file the frontend consumes, what each field does, and common mistakes to avoid. **Read this before generating or modifying course data.**

---

## 1. `<paper-slug>/paper.json`

Container-level metadata. The frontend's `PaperCard` component reads this to render the course card on the Explore page.

| Field | Type | Required | Frontend Usage |
|---|---|---|---|
| `title` | string | **Yes** | Card title (`<h3>`) |
| `description` | string | **Yes** | Card subtitle (3-line clamp) |
| `authors` | `{name: string}[]` | **Yes** | Author avatars (first initial) + name list |
| `publishedAt` | string (date) | No | "Jan 1, 2024" date badge |
| `thumbnailUrl` | string (relative path) | No | Card thumbnail image. Relative to this folder (e.g. `"thumbnail.png"`) |
| `backgroundUrl` | string (relative path) | No | Card background image overlay |
| `organization` | `{name: string}` | No | Top-right badge on thumbnail (e.g. "Common Computer") |
| `sortOrder` | number | No | Controls card ordering on Explore page |
| `githubUrl` | string (URL) | No | GitHub link in card |
| `docsUrl` | string (URL) | No | Used as arxivUrl fallback |
| `arxivId` | string | No | HuggingFace CDN thumbnail fallback |
| `submittedBy` | string | No | "community" by default |
| `badgeUrl` | string (relative path) | No | Custom badge image (resolved to raw GitHub URL) |

### Common Mistakes

- **`authors` as string array**: `["Alice", "Bob"]` crashes the frontend. Must be `[{"name": "Alice"}, {"name": "Bob"}]`. The `PaperCard` calls `author.name[0]` for the avatar initial — if `name` is undefined, it throws a TypeError.
- **Missing `organization`**: No badge appears. For this blockchain series, always set `{"name": "Common Computer"}`.
- **`thumbnailUrl` as absolute URL**: Should be a relative path to a file in the same folder. The adapter resolves it via `raw.githubusercontent.com`.

---

## 2. `<paper-slug>/<course-slug>/knowledge/courses.json`

Course structure and lesson content. This is the primary learning content file.

### Top-level: Array of modules

```jsonc
[
  {
    "id": "module_snake_id",          // Module identifier
    "title": "Module Title",          // Displayed in stage title
    "description": "One-line desc",   // Stage description
    "concepts": ["concept_id", ...],  // Concept IDs in this module
    "lessons": [ /* Lesson objects */ ]
  }
]
```

### Lesson object

| Field | Type | Required | Usage |
|---|---|---|---|
| `concept_id` | string | **Yes** | Links to graph.json node ID. Must match exactly. |
| `title` | string | **Yes** | Lesson/concept title in UI |
| `prerequisites` | string[] | **Yes** | Array of concept_ids that must be completed first |
| `content` | string (markdown) | **Yes** | Main learning content shown in ConceptOverlay. Min 500 chars. |
| `key_ideas` | string[] | **Yes** | Bullet points summarizing the concept |
| `exercise` | string | **Yes** | Quiz question text (single string, not an array) |
| `answer` | string | **Yes** | Correct answer text (must match one quiz option exactly) |
| `explanation` | string | **Yes** | Why the answer is correct |
| `code_ref` | string | No | Code reference (usually empty) |
| `paper_ref` | string | No | Paper citation (e.g. "Nakamoto, 2008 — Bitcoin Whitepaper") |
| `x402_price` | string | No | x402 payment price (reserved, usually empty) |
| `x402_gateway` | string | No | x402 gateway URL (reserved, usually empty) |

### Common Mistakes

- **Object format instead of Array**: `{"modules": [...]}` is wrong. Must be `[{...}, {...}]`. The frontend's `parseCourseStats()` iterates the array directly.
- **`exercises` array instead of `exercise` string**: Legacy format. The stage generator expects a single `exercise` string + `answer` + `explanation`.
- **`id` instead of `concept_id`**: Legacy field name. Must be `concept_id`.
- **Missing `answer`/`explanation`**: Quiz won't function — no correct answer to validate against.
- **Content under 500 characters**: PRD requires 500+ chars with markdown sections.

---

## 3. `<paper-slug>/<course-slug>/knowledge/graph.json`

Knowledge graph structure. Used by blockchain config generation and the Claude Code tutor.

```jsonc
{
  "nodes": [
    {
      "id": "snake_case_id",           // Must match concept_id in courses.json
      "name": "Human Readable Name",   // Display name
      "type": "concept|architecture|technique|...",  // Concept category
      "level": "foundational|intermediate|advanced|frontier",  // Difficulty
      "description": "2-3 sentence description",
      "key_ideas": ["idea1", "idea2"],
      "code_refs": [],
      "paper_ref": "Author, Year — Title",
      "first_appeared": null,
      "confidence": 1.0
    }
  ],
  "edges": [
    {
      "source": "concept_id_1",         // Must reference existing node ID
      "target": "concept_id_2",         // Must reference existing node ID
      "relationship": "builds_on|requires|component_of|...",
      "weight": 1.0,
      "description": "Relationship description"
    }
  ]
}
```

### Common Mistakes

- **`label` instead of `name`**: Some generators output `label`. The blockchain config and tutor expect `name`.
- **`domain` instead of `type`**: Same issue. Must be `type`.
- **`depth` (number) instead of `level` (string)**: `level` must be one of: `foundational`, `intermediate`, `advanced`, `frontier`. Not a number.
- **Edge referencing non-existent node**: Causes errors in blockchain registration.

---

## 4. `<paper-slug>/<course-slug>/blockchain/config.json`

Blockchain registration config. Generated from graph.json.

| Field | Type | Value |
|---|---|---|
| `provider_url` | string | Always `"https://devnet-api.ainetwork.ai"` |
| `chain_id` | number | Always `0` (devnet) |
| `topic_prefix` | string | Must equal the paper-slug |
| `topic_map` | object | `{concept_id: "paper-slug/concept_id"}` for each node |
| `depth_map` | object | `{concept_id: 1-4}` mapping level to integer |
| `topics_to_register` | array | One root entry + one per concept |
| `x402_lessons` | object | Always `{}` (reserved) |

### Key Rule

`topic_map` and `depth_map` keys must exactly match `graph.json` node IDs.

---

## 5. Frontend Stage Files (`frontend/public/courses/<slug>--<course>/stages/N.json`)

Generated by `npx tsx scripts/generate-course-stages.ts`. Consumed by the game UI.

```jsonc
{
  "map": { /* TMJ tilemap data */ },
  "stage": {
    "id": "string",
    "stageNumber": 1,
    "title": "Stage Title",
    "roomWidth": 30,
    "roomHeight": 20,
    "concepts": [
      {
        "id": "concept_id",
        "title": "Concept Title",
        "content": "Markdown content from lesson",  // From courses.json lesson.content
        "position": {"x": 5, "y": 10},
        "type": "npc"
      }
    ],
    "quizzes": [
      {
        "id": "quiz-stage-1-lesson-0-0",
        "question": "Quiz text",          // From courses.json lesson.exercise
        "type": "multiple-choice",
        "options": ["A", "B", "C"],        // Parsed from exercise text
        "correctAnswer": "B",              // From courses.json lesson.answer
        "position": {"x": 18, "y": 7}
      }
    ],
    "doorPosition": {"x": 15, "y": 0},
    "spawnPosition": {"x": 15, "y": 18},
    "nextStage": 2,
    "previousStage": null
  }
}
```

### Key Rule

Stage files are **generated**, not hand-written. If courses.json is correct, stages will be correct. Always re-run the generator after modifying courses.json.

---

## 6. Validation

Run the validator before pushing:

```bash
cd awesome-papers-with-claude-code
node scripts/validate-courses.js
```

This checks all of the above against the frontend's expected types. **0 errors required** before push.

---

## Field Name Mapping (Legacy → Correct)

| Wrong | Correct | File | Impact |
|---|---|---|---|
| `authors: ["string"]` | `authors: [{name: "string"}]` | paper.json | **Runtime crash** (TypeError) |
| `{modules: [...]}` | `[{...}]` | courses.json | Frontend can't parse stats |
| `exercises: [...]` | `exercise: "string"` | courses.json | Stage generator ignores quizzes |
| `id: "x"` | `concept_id: "x"` | courses.json | Concept linkage broken |
| `label: "x"` | `name: "x"` | graph.json | Config/tutor can't find name |
| `domain: "x"` | `type: "x"` | graph.json | Missing concept type |
| `depth: 1` | `level: "foundational"` | graph.json | Config depth_map inconsistency |
