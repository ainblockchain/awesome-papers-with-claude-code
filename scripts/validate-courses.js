#!/usr/bin/env node
/**
 * Course Data Validator
 *
 * Validates all course data against the frontend's expected types:
 *   - paper.json     → Paper, Author, PaperJsonData interfaces
 *   - courses.json   → CoursesJson / lesson schema
 *   - graph.json     → nodes/edges schema
 *   - config.json    → blockchain config schema
 *   - stage files    → StageFileOutput interface
 *
 * Usage:
 *   node scripts/validate-courses.js                    # validate all courses
 *   node scripts/validate-courses.js <slug> <course>    # validate one course
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const FRONTEND_STAGES = path.resolve(BASE, '../../../frontend/public/courses');

let totalErrors = 0;
let totalWarnings = 0;

function error(ctx, msg) {
  totalErrors++;
  console.log(`  ❌ [${ctx}] ${msg}`);
}
function warn(ctx, msg) {
  totalWarnings++;
  console.log(`  ⚠️  [${ctx}] ${msg}`);
}
function ok(ctx, msg) {
  // silent on success
}

// ── paper.json ──────────────────────────────────

function validatePaperJson(slug) {
  const fp = path.join(BASE, slug, 'paper.json');
  if (!fs.existsSync(fp)) {
    error('paper.json', `Missing: ${slug}/paper.json`);
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch (e) {
    error('paper.json', `Invalid JSON: ${e.message}`);
    return;
  }

  // Required string fields
  for (const field of ['title', 'description']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      error('paper.json', `"${field}" must be a non-empty string`);
    }
  }

  // authors: must be array of { name: string }
  if (!Array.isArray(data.authors)) {
    error('paper.json', `"authors" must be an array`);
  } else {
    data.authors.forEach((a, i) => {
      if (typeof a === 'string') {
        error('paper.json', `authors[${i}] is a plain string "${a}" — must be { name: "..." }`);
      } else if (!a || typeof a.name !== 'string' || !a.name.trim()) {
        error('paper.json', `authors[${i}].name is missing or empty`);
      }
    });
  }

  // thumbnailUrl: if present, must resolve to a file
  if (data.thumbnailUrl) {
    const thumbPath = path.join(BASE, slug, data.thumbnailUrl);
    if (!fs.existsSync(thumbPath)) {
      error('paper.json', `thumbnailUrl "${data.thumbnailUrl}" file not found at ${thumbPath}`);
    }
  }

  // sortOrder: should be a number
  if (data.sortOrder == null) {
    warn('paper.json', `"sortOrder" is missing`);
  } else if (typeof data.sortOrder !== 'number') {
    error('paper.json', `"sortOrder" must be a number, got ${typeof data.sortOrder}`);
  }

  // organization: if present, must have name
  if (data.organization && (typeof data.organization !== 'object' || typeof data.organization.name !== 'string')) {
    error('paper.json', `"organization" must be { name: string }`);
  }
}

// ── courses.json ────────────────────────────────

function validateCoursesJson(slug, course) {
  const fp = path.join(BASE, slug, course, 'knowledge', 'courses.json');
  if (!fs.existsSync(fp)) {
    error('courses.json', `Missing: ${slug}/${course}/knowledge/courses.json`);
    return { lessonConceptIds: [] };
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch (e) {
    error('courses.json', `Invalid JSON: ${e.message}`);
    return { lessonConceptIds: [] };
  }

  // Must be Array format
  if (!Array.isArray(data)) {
    error('courses.json', `Must be an Array, got ${typeof data}. Object format is incompatible with frontend`);
    return { lessonConceptIds: [] };
  }

  const lessonConceptIds = [];
  const REQUIRED_LESSON_FIELDS = [
    'concept_id', 'title', 'prerequisites', 'content', 'key_ideas',
    'exercise', 'answer', 'explanation'
  ];
  const OPTIONAL_LESSON_FIELDS = ['code_ref', 'paper_ref', 'x402_price', 'x402_gateway'];

  data.forEach((mod, mi) => {
    // Module-level checks
    if (!mod.id && !mod.module_id) warn('courses.json', `modules[${mi}] missing "id"`);
    if (!mod.title && !mod.module_title) warn('courses.json', `modules[${mi}] missing "title"`);
    if (!Array.isArray(mod.lessons)) {
      error('courses.json', `modules[${mi}] "lessons" must be an array`);
      return;
    }

    mod.lessons.forEach((lesson, li) => {
      const ctx = `modules[${mi}].lessons[${li}]`;

      // Required fields
      for (const field of REQUIRED_LESSON_FIELDS) {
        const val = lesson[field];
        if (val === undefined || val === null) {
          error('courses.json', `${ctx} missing "${field}"`);
        } else if (field === 'prerequisites' || field === 'key_ideas') {
          if (!Array.isArray(val)) {
            error('courses.json', `${ctx} "${field}" must be an array`);
          }
        } else if (typeof val !== 'string') {
          error('courses.json', `${ctx} "${field}" must be a string, got ${typeof val}`);
        }
      }

      // content length
      if (typeof lesson.content === 'string' && lesson.content.length < 500) {
        warn('courses.json', `${ctx} content is ${lesson.content.length} chars (< 500)`);
      }

      // exercise/answer/explanation non-empty
      for (const field of ['exercise', 'answer', 'explanation']) {
        if (typeof lesson[field] === 'string' && !lesson[field].trim()) {
          error('courses.json', `${ctx} "${field}" is empty string`);
        }
      }

      // Detect legacy "exercises" array format
      if (lesson.exercises && !lesson.exercise) {
        error('courses.json', `${ctx} uses legacy "exercises[]" array — frontend expects single "exercise" string`);
      }

      // Detect legacy "id" instead of "concept_id"
      if (lesson.id && !lesson.concept_id) {
        error('courses.json', `${ctx} uses "id" instead of "concept_id"`);
      }

      if (lesson.concept_id) lessonConceptIds.push(lesson.concept_id);
    });
  });

  return { lessonConceptIds };
}

// ── graph.json ──────────────────────────────────

function validateGraphJson(slug, course) {
  const fp = path.join(BASE, slug, course, 'knowledge', 'graph.json');
  if (!fs.existsSync(fp)) {
    error('graph.json', `Missing: ${slug}/${course}/knowledge/graph.json`);
    return { nodeIds: [] };
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch (e) {
    error('graph.json', `Invalid JSON: ${e.message}`);
    return { nodeIds: [] };
  }

  if (!Array.isArray(data.nodes)) {
    error('graph.json', `"nodes" must be an array`);
    return { nodeIds: [] };
  }
  if (!Array.isArray(data.edges)) {
    error('graph.json', `"edges" must be an array`);
  }

  const nodeIds = new Set();
  const REQUIRED_NODE_FIELDS = ['id', 'name', 'type', 'level', 'description'];
  const VALID_LEVELS = ['foundational', 'intermediate', 'advanced', 'frontier'];

  // Detect alternate field names (label→name, domain→type, depth→level)
  const FIELD_ALIASES = { name: 'label', type: 'domain', level: 'depth' };

  data.nodes.forEach((node, i) => {
    for (const field of REQUIRED_NODE_FIELDS) {
      const alias = FIELD_ALIASES[field];
      if (!node[field] && alias && node[alias]) {
        error('graph.json', `nodes[${i}] uses "${alias}" instead of "${field}" — frontend/config expects "${field}"`);
      } else if (!node[field]) {
        warn('graph.json', `nodes[${i}] missing "${field}"`);
      }
    }
    const level = node.level || node.depth;
    if (level && typeof level === 'string' && !VALID_LEVELS.includes(level)) {
      warn('graph.json', `nodes[${i}].level "${level}" not in ${VALID_LEVELS}`);
    }
    if (node.id) nodeIds.add(node.id);
  });

  // Edge references
  if (Array.isArray(data.edges)) {
    data.edges.forEach((edge, i) => {
      if (!edge.source || !edge.target) {
        error('graph.json', `edges[${i}] missing source or target`);
      } else {
        if (!nodeIds.has(edge.source)) error('graph.json', `edges[${i}].source "${edge.source}" not in nodes`);
        if (!nodeIds.has(edge.target)) error('graph.json', `edges[${i}].target "${edge.target}" not in nodes`);
      }
    });
  }

  return { nodeIds: [...nodeIds] };
}

// ── blockchain/config.json ──────────────────────

function validateConfigJson(slug, course, nodeIds) {
  const fp = path.join(BASE, slug, course, 'blockchain', 'config.json');
  if (!fs.existsSync(fp)) {
    error('config.json', `Missing: ${slug}/${course}/blockchain/config.json`);
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch (e) {
    error('config.json', `Invalid JSON: ${e.message}`);
    return;
  }

  if (data.provider_url !== 'https://devnet-api.ainetwork.ai') {
    error('config.json', `provider_url should be devnet, got "${data.provider_url}"`);
  }
  if (data.chain_id !== 0) {
    error('config.json', `chain_id should be 0, got ${data.chain_id}`);
  }
  if (data.topic_prefix !== slug) {
    warn('config.json', `topic_prefix "${data.topic_prefix}" !== slug "${slug}"`);
  }

  // topic_map vs graph.json
  const tmKeys = Object.keys(data.topic_map || {});
  const nodeSet = new Set(nodeIds);
  const missing = nodeIds.filter(id => !tmKeys.includes(id));
  const extra = tmKeys.filter(id => !nodeSet.has(id));
  if (missing.length) error('config.json', `topic_map missing node IDs: ${missing.join(', ')}`);
  if (extra.length) warn('config.json', `topic_map has extra IDs: ${extra.join(', ')}`);

  if (!Array.isArray(data.topics_to_register)) {
    error('config.json', `"topics_to_register" must be an array`);
  }
  if (!data.hasOwnProperty('x402_lessons')) {
    warn('config.json', `"x402_lessons" field missing`);
  }
}

// ── Stage files ─────────────────────────────────

function validateStageFiles(slug, course) {
  const stageDir = path.join(FRONTEND_STAGES, `${slug}--${course}`, 'stages');
  if (!fs.existsSync(stageDir)) {
    warn('stages', `Missing stage dir: ${slug}--${course}/stages/`);
    return;
  }

  const files = fs.readdirSync(stageDir).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) {
    error('stages', `No stage files found`);
    return;
  }

  files.forEach(file => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(stageDir, file), 'utf-8'));
    } catch (e) {
      error('stages', `${file}: Invalid JSON`);
      return;
    }

    if (!data.stage) {
      error('stages', `${file}: missing "stage" object`);
      return;
    }
    if (!data.map) {
      error('stages', `${file}: missing "map" object`);
    }

    const s = data.stage;
    if (typeof s.stageNumber !== 'number') error('stages', `${file}: stage.stageNumber missing`);
    if (!s.title) error('stages', `${file}: stage.title missing`);

    if (!Array.isArray(s.concepts) || s.concepts.length === 0) {
      error('stages', `${file}: stage.concepts is empty or missing`);
    } else {
      s.concepts.forEach((c, i) => {
        if (!c.id) error('stages', `${file}: concepts[${i}].id missing`);
        if (!c.title) error('stages', `${file}: concepts[${i}].title missing`);
        if (!c.content) error('stages', `${file}: concepts[${i}].content missing`);
        if (!c.position) error('stages', `${file}: concepts[${i}].position missing`);
      });
    }

    if (!Array.isArray(s.quizzes) || s.quizzes.length === 0) {
      error('stages', `${file}: stage.quizzes is empty or missing`);
    } else {
      s.quizzes.forEach((q, i) => {
        if (!q.id) error('stages', `${file}: quizzes[${i}].id missing`);
        if (!q.question) error('stages', `${file}: quizzes[${i}].question missing`);
        if (!Array.isArray(q.options) || q.options.length < 2) {
          error('stages', `${file}: quizzes[${i}].options must have 2+ items`);
        }
        if (!q.correctAnswer) error('stages', `${file}: quizzes[${i}].correctAnswer missing`);
        if (!q.position) error('stages', `${file}: quizzes[${i}].position missing`);
      });
    }

    if (!s.spawnPosition) error('stages', `${file}: stage.spawnPosition missing`);
    if (!s.doorPosition) error('stages', `${file}: stage.doorPosition missing`);
  });
}

// ── Cross-file consistency ──────────────────────

function validateCrossConsistency(slug, course, lessonConceptIds, nodeIds) {
  const nodeSet = new Set(nodeIds);
  const lessonSet = new Set(lessonConceptIds);

  // Lessons should reference existing nodes
  const orphanLessons = lessonConceptIds.filter(id => !nodeSet.has(id));
  if (orphanLessons.length) {
    error('cross-check', `Lesson concept_ids not in graph.json: ${[...new Set(orphanLessons)].join(', ')}`);
  }

  // Nodes should have lessons
  const unlessonedNodes = nodeIds.filter(id => !lessonSet.has(id));
  if (unlessonedNodes.length) {
    warn('cross-check', `graph.json nodes without lessons: ${unlessonedNodes.join(', ')}`);
  }
}

// ── Required files check ────────────────────────

function validateRequiredFiles(slug, course) {
  const required = [
    'CLAUDE.md', 'README.md', '.gitignore',
    'knowledge/graph.json', 'knowledge/courses.json',
    'blockchain/config.json', 'blockchain/package.json'
  ];

  for (const file of required) {
    const fp = path.join(BASE, slug, course, file);
    if (!fs.existsSync(fp)) {
      error('files', `Missing: ${slug}/${course}/${file}`);
    }
  }
}

// ── EN/KO consistency ───────────────────────────

function validateEnKoConsistency(slug) {
  const enGraph = path.join(BASE, slug, 'core', 'knowledge', 'graph.json');
  const koGraph = path.join(BASE, slug, 'core-ko', 'knowledge', 'graph.json');

  if (!fs.existsSync(enGraph) || !fs.existsSync(koGraph)) return;

  try {
    const en = JSON.parse(fs.readFileSync(enGraph, 'utf-8'));
    const ko = JSON.parse(fs.readFileSync(koGraph, 'utf-8'));
    const enIds = en.nodes.map(n => n.id).sort();
    const koIds = ko.nodes.map(n => n.id).sort();

    if (JSON.stringify(enIds) !== JSON.stringify(koIds)) {
      const missing = enIds.filter(id => !koIds.includes(id));
      const extra = koIds.filter(id => !enIds.includes(id));
      if (missing.length) error('en-ko', `KO missing concept IDs: ${missing.join(', ')}`);
      if (extra.length) error('en-ko', `KO has extra concept IDs: ${extra.join(', ')}`);
    }
  } catch { /* already caught by individual validators */ }

  // Lesson count match
  const enCourses = path.join(BASE, slug, 'core', 'knowledge', 'courses.json');
  const koCourses = path.join(BASE, slug, 'core-ko', 'knowledge', 'courses.json');
  if (fs.existsSync(enCourses) && fs.existsSync(koCourses)) {
    try {
      const countLessons = (fp) => {
        const d = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        let t = 0;
        if (Array.isArray(d)) d.forEach(m => t += (m.lessons?.length || 0));
        return t;
      };
      const enCount = countLessons(enCourses);
      const koCount = countLessons(koCourses);
      if (enCount !== koCount) {
        error('en-ko', `Lesson count mismatch: EN=${enCount} KO=${koCount}`);
      }
    } catch { /* already caught */ }
  }
}

// ── Main ────────────────────────────────────────

function validateCourse(slug, course) {
  console.log(`\n📦 ${slug}/${course}`);

  validateRequiredFiles(slug, course);
  const { lessonConceptIds } = validateCoursesJson(slug, course);
  const { nodeIds } = validateGraphJson(slug, course);
  validateConfigJson(slug, course, nodeIds);
  validateStageFiles(slug, course);
  validateCrossConsistency(slug, course, lessonConceptIds, nodeIds);
}

function main() {
  const args = process.argv.slice(2);

  let slugs;
  if (args.length >= 2) {
    // Validate one specific course
    slugs = [{ slug: args[0], courses: [args[1]] }];
  } else {
    // Auto-discover blockchain series courses
    const BLOCKCHAIN_SLUGS = [
      'blockchain-decentralization-fundamentals',
      'dao-decentralized-organizations',
      'bitcoin-ethereum-ainetwork',
      'meaning-of-decentralization',
      'strong-weak-technologies',
      'token-standards-crypto',
      'nft-philosophy-technology',
      'nft-creator-economy',
      'ai-blockchain-longtail',
      'ainft-web3-ai',
    ];
    slugs = BLOCKCHAIN_SLUGS.map(slug => ({ slug, courses: ['core', 'core-ko'] }));
  }

  console.log('🔍 Course Data Validator');
  console.log('========================');

  for (const { slug, courses } of slugs) {
    console.log(`\n━━━ ${slug} ━━━`);

    // Container-level
    validatePaperJson(slug);

    // Per-course
    for (const course of courses) {
      validateCourse(slug, course);
    }

    // EN/KO consistency (only if both exist)
    if (courses.includes('core') && courses.includes('core-ko')) {
      validateEnKoConsistency(slug);
    }
  }

  console.log('\n========================');
  console.log(`Results: ${totalErrors} errors, ${totalWarnings} warnings`);
  if (totalErrors > 0) {
    console.log('❌ VALIDATION FAILED');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  PASSED with warnings');
  } else {
    console.log('✅ ALL PASSED');
  }
}

main();
