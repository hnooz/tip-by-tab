# Daily Dev Tip — Implementation Guide

> The engineering source of truth. Architecture, conventions, runbook.

---

## 1. Architecture

Two repos, one extension. Zero backend.

```
┌──────────────────────────────────┐
│  github.com/hnooz/daily-dev-tips │   ◄── content + community
│                                  │
│  Contributors → PR / Issue       │
│  Maintainer  → Review            │
│  CI          → Validate + Build  │
│  Output      → dist/*.json       │
└──────────────────────────────────┘
              │ (jsDelivr CDN)
              ▼
┌──────────────────────────────────┐
│  daily-dev-tip-extension         │   ◄── client (WXT, TS)
│                                  │
│  background.ts   daily refresh   │
│  newtab/         renders tip     │
│  popup/          settings        │
│  chrome.storage  cache + prefs   │
│  fallback.json   bundled tips    │
└──────────────────────────────────┘
```

### Why two repos
- **Content repo is the community surface.** Public from day one. Open issues, PRs, discussions. Contributors live here.
- **Extension repo is the product.** Can stay private until v1, gets open-sourced after launch as a trust signal. Different audience (extension code != tip authors).

*(Monorepo is an open question — see PROGRESS.md. Revisit if cross-repo friction emerges.)*

## 2. Repo: `daily-dev-tips`

```
daily-dev-tips/
├── README.md                      # Front door — sells the project to contributors
├── CONTRIBUTING.md                # How to submit a tip (the editorial bar)
├── CODE_OF_CONDUCT.md             # Contributor Covenant
├── LICENSE                        # MIT
├── tips/
│   ├── laravel/
│   │   ├── when-loaded-api-resources.md
│   │   ├── conditional-eager-loading.md
│   │   └── ...
│   ├── vue/
│   └── nest/
├── schemas/
│   └── tip.schema.json            # JSON Schema for frontmatter
├── scripts/
│   ├── validate.mjs               # Schema + content rules + dup detection
│   ├── assign-id.mjs              # CI-time ID assignment on merge
│   └── build.mjs                  # Markdown → JSON + stable rotation shuffle
├── dist/                          # ⚠️ Auto-generated, do not edit
│   ├── manifest.json
│   ├── index.json                 # { id, codeHash, title } lookup for CI
│   ├── rotation.json              # Stable-shuffled order for fair rotation
│   └── stacks/
│       ├── laravel.json
│       └── ...
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── workflows/
│   │   ├── validate.yml           # Runs on every PR
│   │   └── build.yml              # Runs on merge to main (assign id + build)
│   └── FUNDING.yml                # GitHub Sponsors (optional)
└── package.json                   # Just node scripts, no runtime deps
```

### Tip file format

Contributors author files like this. `id` is assigned by CI at merge time, not by the contributor.

```markdown
---
title: Use whenLoaded to keep API resources honest about relationships
stack: laravel
tags: [eloquent, api-resources, n+1]
language: php
file: app/Http/Resources/UserResource.php
author:
  github: hnooz
  name: Mohamed Idris
source: https://laravel.com/docs/eloquent-resources#conditional-relationships
publishedAt: 2026-06-28
---

` ` `php
public function toArray($request): array
{
    return [
        'id'    => $this->id,
        'name'  => $this->name,
        'posts' => PostResource::collection(
            $this->whenLoaded('posts')
        ),
    ];
}
` ` `

`whenLoaded` only renders the relationship when it was eager-loaded on the
controller side. Without it, accessing `$this->posts` inside the resource
silently fires one query per record — the classic N+1.

The same resource can be reused across endpoints with different `->with()`
calls, and the payload truthfully reflects what was loaded. Tradeoff: callers
need to be explicit about eager-loading, but that's the right place for that
concern to live anyway.
```

### Rules
- **One tip per file.** Filename: `<kebab-title>.md`. CI assigns the numeric ID on merge.
- **`id` is permanent once assigned.** Never reused. It's the cache key for clients.
- **`author.github` is required.** This is the recognition.
- **Code block must come first** in the body, explanation second.
- **Max 25 lines of code, max 600 chars of explanation.** Enforced by CI.

### Schema (`schemas/tip.schema.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "stack", "tags", "language", "author", "publishedAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z]+-[0-9]{4}$",
      "description": "Assigned by CI at merge time. Do not set manually."
    },
    "codeHash": {
      "type": "string",
      "pattern": "^[a-f0-9]{16}$",
      "description": "Computed by CI at build time for duplication detection."
    },
    "title": { "type": "string", "minLength": 10, "maxLength": 90 },
    "stack": { "type": "string", "enum": ["laravel", "vue", "nest"] },
    "tags": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "items": { "type": "string", "pattern": "^[a-z0-9-]+$" }
    },
    "language": { "type": "string", "enum": ["php", "js", "ts", "python", "go", "bash"] },
    "file": { "type": "string" },
    "author": {
      "type": "object",
      "required": ["github", "name"],
      "properties": {
        "github": { "type": "string", "pattern": "^[a-zA-Z0-9-]+$" },
        "name":   { "type": "string", "minLength": 2, "maxLength": 60 }
      }
    },
    "source": { "type": "string", "format": "uri" },
    "publishedAt": { "type": "string", "format": "date" }
  },
  "additionalProperties": false
}
```

### Duplication detection (`scripts/validate.mjs`)

```js
import crypto from "node:crypto";
import fs from "node:fs/promises";

// Normalize: strip comments, collapse whitespace, lowercase.
// Catches reformatted dupes; doesn't catch logical reimplementations.
export function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, "")           // line comments (js/ts/php/go)
    .replace(/#.*$/gm, "")              // line comments (python/bash)
    .replace(/\/\*[\s\S]*?\*\//g, "")   // block comments
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function codeHash(code) {
  return crypto.createHash("sha256")
    .update(normalizeCode(code))
    .digest("hex")
    .slice(0, 16);
}

// During PR validation:
// 1. Load dist/index.json (canonical state of merged tips)
// 2. Compute hash of incoming tip's code
// 3. If exact match → fail PR with link to existing tip
// 4. Compute title similarity (e.g., trigram Jaccard) against same-stack tips
// 5. If similarity > 0.85 → warn (maintainer override required)
```

### ID assignment (`scripts/assign-id.mjs`)

Runs on merge to main, before build. Scans `tips/<stack>/` for files without an `id` in their frontmatter, assigns the next monotonic ID for that stack, writes it back, commits.

```js
// Pseudocode
for (const stack of STACKS) {
  const files = await listTipFiles(stack);
  const existingIds = files
    .map(f => parseFrontmatter(f).id)
    .filter(Boolean)
    .map(id => parseInt(id.split("-")[1], 10));
  let next = Math.max(0, ...existingIds) + 1;

  for (const file of files) {
    const { data, content } = parseFile(file);
    if (data.id) continue;
    data.id = `${stack}-${String(next).padStart(4, "0")}`;
    await writeFile(file, serialize(data, content));
    next++;
  }
}
```

### Build pipeline (`scripts/build.mjs`)

```js
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { codeHash } from "./validate.mjs";

const STACKS = ["laravel", "vue", "nest"];
const stacks = [];
const index = []; // { id, codeHash, title, stack } for dup CI

for (const stack of STACKS) {
  const dir = path.join("tips", stack);
  const files = (await fs.readdir(dir)).filter(f => f.endsWith(".md")).sort();
  const tips = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const { code, explanation } = parseBody(content);
    const hash = codeHash(code);

    tips.push({ ...data, code, explanation, codeHash: hash });
    index.push({ id: data.id, codeHash: hash, title: data.title, stack });
  }

  await fs.mkdir("dist/stacks", { recursive: true });
  await fs.writeFile(
    `dist/stacks/${stack}.json`,
    JSON.stringify({ stack, tips }, null, 2)
  );

  stacks.push({
    id: stack,
    name: humanize(stack),
    tipCount: tips.length,
    updated: new Date().toISOString().slice(0, 10),
  });
}

// Stable shuffle: deterministic across builds (seed = sorted joined IDs),
// but newer tips slot in at random positions instead of being appended.
// Fixes the "day % pool.length" bias where tip #1 shows far more than tip #50.
const rotation = {};
for (const stack of STACKS) {
  const stackFile = JSON.parse(
    await fs.readFile(`dist/stacks/${stack}.json`, "utf8")
  );
  const ids = stackFile.tips.map(t => t.id);
  rotation[stack] = stableShuffle(ids, hashSeed(ids.join(",")));
}

await fs.writeFile("dist/rotation.json", JSON.stringify(rotation, null, 2));
await fs.writeFile("dist/index.json", JSON.stringify(index, null, 2));
await fs.writeFile(
  "dist/manifest.json",
  JSON.stringify({ version: 1, updated: new Date().toISOString(), stacks }, null, 2)
);

function stableShuffle(arr, seed) {
  // mulberry32 PRNG, Fisher-Yates shuffle
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### CI workflows

**`.github/workflows/validate.yml`** — runs on every PR:
- `node scripts/validate.mjs` (schema + content rules + code-hash duplication check against `dist/index.json`)
- Block merge on failure
- Comment on PR with errors

**`.github/workflows/build.yml`** — runs on merge to `main`:
- `node scripts/assign-id.mjs` (fills in IDs for newly merged tips)
- `node scripts/build.mjs` (rebuild dist/)
- Commit `dist/` and the updated tip files (with new IDs) back to main
- Optionally tag a release

### Where does the extension fetch from?

| Option | URL pattern | Pros | Cons |
|---|---|---|---|
| **raw.githubusercontent.com** | `…/main/dist/stacks/laravel.json` | Zero setup | 60 req/hr unauth rate limit |
| **GitHub Pages** | `hnooz.github.io/daily-dev-tips/…` | No rate limit, CDN-cached | Branch config |
| **jsDelivr CDN** | `cdn.jsdelivr.net/gh/hnooz/daily-dev-tips@main/dist/…` | No rate limit, fast, free | Third-party dependency, regional blocks possible |

**Decision: jsDelivr primary + bundled `fallback.json` in the extension.**

jsDelivr gives us zero-setup global CDN. The bundled fallback (last 30 days of rotation, ~20 KB) means a jsDelivr outage degrades the product to "yesterday's tip" instead of breaking it entirely. Worth the bundle cost.

If jsDelivr becomes consistently unreliable, fall back to GitHub Pages as primary.

## 3. Repo: `daily-dev-tip-extension`

```
daily-dev-tip-extension/
├── package.json
├── wxt.config.ts
├── tsconfig.json
├── entrypoints/
│   ├── newtab/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── popup/
│   │   ├── index.html
│   │   └── main.ts
│   └── background.ts
├── lib/
│   ├── tip-service.ts             # fetch + cache + selection + fallback
│   ├── prefs.ts                   # user preferences
│   ├── highlight.ts               # syntax highlighting
│   ├── render.ts                  # DOM rendering helpers
│   └── types.ts                   # shared interfaces
├── assets/
│   ├── fonts/                     # Self-hosted (no Google Fonts in prod)
│   └── fallback.json              # Bundled last-30-days rotation
├── public/
│   └── icons/
│       ├── 16.png
│       ├── 48.png
│       └── 128.png
└── tests/
    ├── tip-service.test.ts
    ├── selection.test.ts
    └── fallback.test.ts
```

### Type definitions (`lib/types.ts`)

```ts
export interface Tip {
  id: string;
  title: string;
  code: string;
  language: string;
  file?: string;
  explanation: string;
  tags: string[];
  author: { github: string; name: string };
  source?: string;
  publishedAt: string;
  codeHash: string;
}

export interface StackFile {
  stack: string;
  tips: Tip[];
}

export interface StackMeta {
  id: string;
  name: string;
  tipCount: number;
  updated: string;
}

export interface Manifest {
  version: number;
  updated: string;
  stacks: StackMeta[];
}

export interface Rotation {
  [stack: string]: string[]; // Stable-shuffled tip IDs per stack
}

export interface UserPrefs {
  enabledStacks: string[];
  rotation: "round-robin" | "random-daily";
  quietMode: boolean;
  theme: "auto" | "light" | "dark";
}
```

### Tip selection (`lib/tip-service.ts`)

**Per-tab rotation, scoped to the user's enabled stacks.** Every new tab advances a counter and shows the next tip from the shuffled pool. Refreshing the same tab shows the same tip (pinned by tab ID in session storage). Toggling stacks reshuffles the pool; the counter continues.

Falls back to bundled tips on CDN failure.

```ts
import type { Tip, StackFile, Rotation, UserPrefs } from "./types";

const BASE = "https://cdn.jsdelivr.net/gh/hnooz/daily-dev-tips@main/dist";

export async function getTipForTab(tabId: number, prefs: UserPrefs): Promise<Tip | null> {
  if (prefs.enabledStacks.length === 0) return null;

  // Same tab refreshed → same tip. Session storage clears on browser close.
  const tabKey = `tab:${tabId}`;
  const existing = await chrome.storage.session.get(tabKey);
  if (existing[tabKey]) return existing[tabKey];

  try {
    const [files, rotation] = await Promise.all([
      Promise.all(prefs.enabledStacks.map(fetchStack)),
      fetchRotation(),
    ]);

    const enabled = [...prefs.enabledStacks].sort();
    const pool = enabled.flatMap(s => rotation[s] ?? []);
    if (pool.length === 0) return loadFallback(tabId, prefs);

    // Selection-derived seed → same selection produces same shuffle.
    // Counter advances per new tab → cycles through the shuffled pool.
    const seed = hashString(enabled.join("|"));
    const shuffled = stableShuffle(pool, seed);

    const { tipCounter = 0 } = await chrome.storage.local.get("tipCounter");
    const tipId = shuffled[tipCounter % shuffled.length];
    await chrome.storage.local.set({ tipCounter: tipCounter + 1 });

    const tipsById = new Map(files.flatMap(f => f.tips).map(t => [t.id, t]));
    const tip = tipsById.get(tipId) ?? null;

    if (tip) await chrome.storage.session.set({ [tabKey]: tip });
    return tip;
  } catch (err) {
    console.warn("CDN fetch failed, using bundled fallback", err);
    return loadFallback(tabId, prefs);
  }
}

async function fetchStack(id: string): Promise<StackFile> {
  const res = await fetch(`${BASE}/stacks/${id}.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Stack ${id} fetch failed: ${res.status}`);
  return res.json();
}

async function fetchRotation(): Promise<Rotation> {
  const res = await fetch(`${BASE}/rotation.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Rotation fetch failed: ${res.status}`);
  return res.json();
}

async function loadFallback(tabId: number, prefs: UserPrefs): Promise<Tip | null> {
  const fallback: StackFile[] = (await import("../assets/fallback.json")).default;
  const enabled = [...prefs.enabledStacks].sort();
  const pool = fallback.filter(f => enabled.includes(f.stack)).flatMap(f => f.tips);
  if (pool.length === 0) return null;

  const seed = hashString(enabled.join("|"));
  const shuffled = stableShuffle(pool.map(t => t.id), seed);
  const { tipCounter = 0 } = await chrome.storage.local.get("tipCounter");
  const tipId = shuffled[tipCounter % shuffled.length];
  await chrome.storage.local.set({ tipCounter: tipCounter + 1 });

  const tip = pool.find(t => t.id === tipId) ?? null;
  if (tip) await chrome.storage.session.set({ [`tab:${tabId}`]: tip });
  return tip;
}

// FNV-1a 32-bit. Cheap, deterministic, no crypto needed for a non-security seed.
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Fisher-Yates with mulberry32. Pure, deterministic, same output for same seed.
function stableShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### Behavior

| Action | Result |
|---|---|
| Open new tab | Next tip in shuffled pool (counter advances) |
| Refresh same tab | Same tip (pinned by tab ID in session storage) |
| Close + reopen browser | Counter persists in local storage → continues where it left off |
| Toggle enabled stacks | Pool reshuffles with new seed; counter continues; next new tab picks from new shuffled pool |
| Reach end of pool | Wraps around (`counter % pool.length`) |
| CDN failure | Falls back to bundled `fallback.json` with same per-tab logic |

### Getting the tab ID in the new-tab entrypoint

```ts
// entrypoints/newtab/main.ts
const tab = await chrome.tabs.getCurrent();
if (!tab?.id) return;
const tip = await getTipForTab(tab.id, await loadPrefs());
render(tip);
```

`chrome.tabs.getCurrent` requires the `tabs` permission. Add to manifest:

```json
{
  "permissions": ["storage", "tabs"]
}
```

Web Store listing note: `tabs` only reveals the tab's own ID/URL to the new-tab page itself. No cross-tab access. Document this in the privacy policy.

### Manifest V3 permissions

Ruthless minimum:

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "tabs"],
  "host_permissions": ["https://cdn.jsdelivr.net/*"],
  "chrome_url_overrides": { "newtab": "newtab.html" },
  "action": { "default_popup": "popup.html" }
}
```

`tabs` is needed for `chrome.tabs.getCurrent()` to pin tips to tab IDs. No `activeTab`, no `<all_urls>`. Marketing line for Web Store: *"Reads from one URL, sends nothing back."* Document the narrow `tabs` use in the privacy policy.

### Author card rendering

The recognition payoff. Every tip renders:

```
─────────────────────────────────────
✍︎  contributed by  @hnooz
    Mohamed Idris
    [View profile →]
─────────────────────────────────────
```

Click opens `https://github.com/hnooz` in a new tab. This is the single most important UX element for the contributor flywheel — give it real visual weight.

## 4. Quality bar

Every PR / extension release must satisfy:

- [ ] Lighthouse ≥ 95 on new-tab page
- [ ] Bundle ≤ 250 KB total (including fallback.json)
- [ ] No CLS on tip load (reserve space)
- [ ] Keyboard navigable (Tab, `C` copy, `→` next preview, `Esc` blank)
- [ ] `prefers-reduced-motion` respected
- [ ] `prefers-color-scheme` dark mode supported
- [ ] No third-party scripts or fonts in production
- [ ] No telemetry, no analytics
- [ ] CDN-blocked test passes (bundled fallback serves cleanly)

## 5. Quiet mode (the `Esc` contract)

Devs hate extensions that hijack the new tab. The escape hatch:

- `Esc` on new-tab → swap to blank-tab view (single subtle "i" icon, click to bring tip back)
- Settings: "Quiet mode" toggle → default to blank, click "i" to reveal tip

This is the trust contract. Document on Web Store listing.

## 6. Syntax highlighting

| Option | Size | Quality | Decision |
|---|---|---|---|
| highlight.js full | ~200 KB | ✅ | ❌ too heavy |
| shiki (subset langs) | ~80 KB | ✅✅ | ✅ default |
| Hand-rolled tokenizer | ~5 KB | ✅ | Fallback if bundle pressure |

Start with shiki. Pre-bundle only `php`, `js`, `ts`, `vue`, `python`, `go`, `bash`.

## 7. Versions to verify (do NOT trust stale numbers)

Before scaffolding, search for current versions of:
- WXT
- Vite (pinned by WXT)
- TypeScript
- Shiki
- gray-matter (for build script)
- ajv (for schema validation)
- Manifest V3 deprecation timeline

*Last verified: 2026-06-29. Re-check before Phase 3.*

## 8. Local development

```bash
# Tips repo
git clone git@github.com:hnooz/daily-dev-tips.git
cd daily-dev-tips
bun install
bun run validate            # Check all tips
bun run build               # Generate dist/

# Extension repo
git clone git@github.com:hnooz/daily-dev-tip-extension.git
cd daily-dev-tip-extension
bun install
bun run dev                 # Loads in Chrome via WXT
```

Point extension at local tips during dev:

```ts
// wxt.config.ts
const BASE = import.meta.env.DEV
  ? "http://localhost:8787/dist"   // serve daily-dev-tips/dist locally
  : "https://cdn.jsdelivr.net/gh/hnooz/daily-dev-tips@main/dist";
```

## 9. Web Store launch checklist

- [ ] Privacy policy (one page, "we collect nothing")
- [ ] Screenshots 1280×800: light, dark, code-copied, settings drawer
- [ ] Promo tile 440×280
- [ ] Description focuses on `Esc` contract + atomic tips + open source
- [ ] Link to GitHub tips repo in listing description
- [ ] Tested: Chrome stable, Edge, Firefox
- [ ] Dev fee paid ($5)
- [ ] Budget for 1-2 rejection cycles (new-tab override category is scrutinized)
- [ ] Firefox-first soft-launch plan as insurance against Chrome rejection

## 10. Maintainer workflow (post-launch)

This is the actual job:

1. **Daily** — quick scan of new Issues / PRs, no obligation to act
2. **Every 48h** — review pending PRs, leave constructive feedback, merge approved
3. **Weekly** — write one of your own tips if you want (optional now that curators exist)
4. **Weekly** — announce notable merged tips on Twitter/LinkedIn (free reach for contributors)
5. **Monthly** — write a "what's new" GitHub release / discussion
6. **Quarterly** — review CONTRIBUTING.md, schema, editorial bar
7. **Quarterly** — promote contributors who hit trust-ladder thresholds

The job is **editor + community manager**, not feature developer. Block 3-5 hrs/week on calendar for review.

---

*Source of truth for engineering. PRs to this document require rationale in commit message.*