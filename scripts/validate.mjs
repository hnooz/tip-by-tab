import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { STACKS, parseBody, parseTip } from "./shared.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

// Normalize: strip comments, collapse whitespace, lowercase.
// Catches reformatted dupes; doesn't catch logical reimplementations.
export function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/#.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function codeHash(code) {
  return crypto.createHash("sha256").update(normalizeCode(code)).digest("hex").slice(0, 16);
}

const CAPS = { codeLines: 25, explanationChars: 600 };

function trigrams(s) {
  const t = s.toLowerCase().replace(/\s+/g, " ").trim();
  const set = new Set();
  for (let i = 0; i < t.length - 2; i++) {
    set.add(t.slice(i, i + 3));
  }
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) {
    return 1;
  }
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) {
      inter++;
    }
  }
  return inter / (a.size + b.size - inter);
}

async function loadSchema() {
  const raw = await fs.readFile(path.join(ROOT, "schemas/tip.schema.json"), "utf8");
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  return ajv.compile(JSON.parse(raw));
}

async function loadIndex() {
  try {
    const raw = await fs.readFile(path.join(ROOT, "dist/index.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function main() {
  const validate = await loadSchema();
  const index = await loadIndex();
  const errors = [];
  const warnings = [];
  const seenHashes = new Map(index.map((e) => [e.codeHash, e.id ?? e.title]));

  const rootEntries = await fs.readdir(path.join(ROOT, "tips"), { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!entry.isDirectory() && !entry.name.startsWith(".")) {
      errors.push(`tips/${entry.name}: tips must live in tips/<stack>/<kebab-title>.md`);
    }
  }

  for (const stack of STACKS) {
    const dir = path.join(ROOT, "tips", stack);
    let files = [];
    try {
      const entries = (await fs.readdir(dir)).sort();
      for (const f of entries.filter((f) => !f.endsWith(".md"))) {
        errors.push(`tips/${stack}/${f}: tip files must have a .md extension`);
      }
      files = entries.filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }

    for (const file of files) {
      const rel = `tips/${stack}/${file}`;
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content } = parseTip(raw);

      if (!validate(data)) {
        for (const e of validate.errors) {
          errors.push(`${rel}: ${e.instancePath || "/"} ${e.message}`);
        }
        continue;
      }
      if (data.stack !== stack) {
        errors.push(`${rel}: stack "${data.stack}" does not match directory "${stack}"`);
      }

      let body;
      try {
        body = parseBody(content);
      } catch (e) {
        errors.push(`${rel}: ${e.message}`);
        continue;
      }

      const codeLines = body.code.split("\n").length;
      if (codeLines > CAPS.codeLines) {
        errors.push(`${rel}: code is ${codeLines} lines (max ${CAPS.codeLines})`);
      }
      if (body.explanation.length > CAPS.explanationChars) {
        errors.push(
          `${rel}: explanation is ${body.explanation.length} chars (max ${CAPS.explanationChars})`
        );
      }
      if (body.explanation.length === 0) {
        errors.push(`${rel}: explanation is empty`);
      }

      const hash = codeHash(body.code);
      const dupOf = seenHashes.get(hash);
      if (dupOf !== undefined && dupOf !== data.id) {
        errors.push(`${rel}: duplicate code (matches ${dupOf})`);
      } else if (dupOf === undefined) {
        seenHashes.set(hash, data.id ?? rel);
      }

      const tg = trigrams(data.title);
      for (const e of index) {
        if (e.stack !== stack || (data.id && e.id === data.id)) {
          continue;
        }
        const sim = jaccard(tg, trigrams(e.title));
        if (sim > 0.85) {
          warnings.push(
            `${rel}: title ${(sim * 100).toFixed(0)}% similar to "${e.title}" (${e.id})`
          );
        }
      }
    }
  }

  for (const w of warnings) {
    console.warn(`⚠ ${w}`);
  }
  if (errors.length) {
    for (const e of errors) {
      console.error(`✖ ${e}`);
    }
    console.error(`\n${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(`✓ validation passed${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
