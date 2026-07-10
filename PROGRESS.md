# Daily Dev Tip — Progress

> Living document. Update after every working session. Move items between sections, don't delete.

**Last updated:** 2026-06-29
**Current phase:** 🟡 Phase 1 — Recruiting founding curators · Phase 2 🟡 in progress · Phase 2.5 ✅ site scaffolded
**Maintainer:** [@hnooz](https://github.com/hnooz)

---

## Status snapshot

| | |
|---|---|
| Tips repo | 🟡 Scaffolded — pipeline done, awaiting seed tips |
| Extension repo | 🟡 Scaffolded — core logic done, audit pending |
| Founding curators committed (3 needed) | 0 / 3 |
| Seed tips merged | 0 / ~60 |
| Design direction | ✅ Approved (editorial / monospace / author card) |
| Architecture | ✅ Decided (GitHub-only, no backend) |
| Web Store listing | ⚪ Not started |
| Public launch | ⚪ Not started |
| Contributors active | 0 |

Legend: ⚪ not started · 🟡 in progress · ✅ done · 🔴 blocked

---

## Phase 0 — Foundation (planning)

- [x] Pick distribution channel (browser extension)
- [x] Pick content model (community-contributed, GitHub-as-platform)
- [x] Pick monetization stance (free, OSS, personal brand)
- [x] Validate against daily.dev / dev.to / Stack Overflow (different unit + recognition model)
- [x] Pick launch stacks (Laravel + Vue + Nest, friend-curator seeded)
- [x] Decide multi-stack architecture (generic from day one)
- [x] Decide no-backend architecture (GitHub repo + JSON + extension)
- [x] Design new-tab page direction (editorial, code-first, author card, `Esc` escape)
- [x] Write IDEA.md
- [x] Write INSTRUCTIONS.md
- [x] Write CONTRIBUTING.md
- [x] Write PROGRESS.md (this file)

---

## Phase 1 — Friend-seeded launch content

> **The starting state.** Three friend-seniors, one per stack, each writing ~25 tips. You edit for voice consistency. This solves the empty-repo problem and skips the cold-DM validation gamble.

- [ ] Identify 3 friend-curators: 1 Laravel, 1 Vue, 1 Nest
- [ ] Identify 1 backup curator per stack (in case one drops)
- [ ] Pitch in person/call, not text — easier to convey founding-curator frame
- [ ] State the editorial bar upfront: "I'll edit for voice consistency; same bar as outside contributors"
- [ ] Send each curator: CONTRIBUTING.md + 3-5 reference tips you wrote
- [ ] Agree on timeline (2-4 weeks for 25 tips each is realistic)

### Founding curators log

| Stack | Curator | Committed | Tips delivered | Notes |
|---|---|---|---|---|
| Laravel | | | 0 / 25 | |
| Vue | | | 0 / 25 | |
| Nest | | | 0 / 25 | |

**Gate G1: 3 curators verbally committed + first 5 tips delivered → proceed to Phase 2 in parallel.**
**If only 1-2 curators commit → reduce to single/dual stack launch, do not block.**

---

## Phase 2 — Build the contributor pipeline (parallel to Phase 1)

> Run this in parallel with curators writing tips. The pipeline must exist before the first tip is merged, not after.

- [x] Create `daily-dev-tips` repo on GitHub (public)
- [x] Add `LICENSE` (MIT)
- [x] Add `README.md` (front door — sells founding-curator narrative)
- [x] Add `CONTRIBUTING.md` (from this project)
- [x] Add `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- [x] Add `schemas/tip.schema.json` (id optional at submission, required at merge)
- [x] Add `scripts/validate.mjs` (schema + content rules + code-hash duplication)
- [x] Add `scripts/build.mjs` (markdown → JSON, stable shuffle for rotation)
- [x] Add `scripts/assign-id.mjs` (CI-time ID assignment on merge)
- [x] Add `.github/ISSUE_TEMPLATE/new-tip.yml`
- [x] Add `.github/PULL_REQUEST_TEMPLATE.md`
- [x] Add `.github/workflows/validate.yml` (PR validation + duplication check + PR comment on failure)
- [x] Add `.github/workflows/build.yml` (merge → assign id → build → commit dist)
- [ ] Verify CI works end-to-end with a test PR (needs repo public + GitHub push)
- [ ] Set up jsDelivr URL and verify it serves the JSON
- [ ] Edit each curator's tips for voice consistency before merge
- [ ] Commit ~60 tips across 3 stacks before public announcement

**Gate G2: ~60 tips merged + pipeline tested → proceed to Phase 3.**

---

## Phase 3 — Extension scaffold

- [ ] Search current WXT + Manifest V3 versions (verify, don't trust training data)
- [ ] Create `daily-dev-tip-extension` repo (private initially)
- [ ] `pnpm create wxt@latest`
- [ ] TypeScript strict mode
- [ ] Decide: Tailwind vs vanilla CSS (lean vanilla for bundle size)
- [ ] Implement `lib/types.ts`
- [ ] Implement `lib/prefs.ts` (chrome.storage.sync)
- [ ] Implement `lib/tip-service.ts` (fetch + cache + deterministic selection + fallback)
- [ ] Bundle `assets/fallback.json` (last 30 days of rotation, baked at build)
- [ ] Implement `entrypoints/background.ts` (daily alarm)
- [ ] Implement `entrypoints/newtab/` (port mockup HTML/CSS)
- [ ] Implement `entrypoints/popup/` (minimal — opens settings)
- [ ] Wire copy button to clipboard API
- [ ] Wire stack switcher → prefs
- [ ] Wire gear → settings drawer
- [ ] Implement author card (the recognition payoff — give it real visual weight)
- [ ] Implement syntax highlighting (shiki, subset langs)
- [ ] Implement dark mode (`prefers-color-scheme`)
- [ ] Implement `Esc` → blank tab
- [ ] Implement quiet mode
- [ ] Keyboard shortcuts (`C`, `→`, `Esc`)
- [ ] Empty state (zero stacks enabled)
- [ ] Error state (fetch fail → bundled fallback + cached fallback + notice)
- [ ] Loading state (skeleton, no spinner)
- [ ] Mobile responsive (yes — devs screenshot it)
- [ ] `prefers-reduced-motion` respected

---

## Phase 4 — Quality pass

- [ ] Lighthouse ≥ 95
- [ ] Bundle ≤ 250 KB (including fallback.json)
- [ ] Cross-browser: Chrome, Edge, Firefox (WXT cross-build)
- [ ] A11y pass: keyboard, focus rings, screen reader labels
- [ ] Offline test (cached tip serves)
- [ ] CDN-blocked test (bundled fallback serves, no broken UI)
- [ ] Rotation fairness verified (newly-added tips appear in rotation within 7 days)
- [ ] Slow network test (no jank)
- [ ] Cache pruning test (storage doesn't grow forever)
- [ ] Midnight rollover test (selection moves to next tip)
- [ ] Timezone edge cases (Tokyo vs UTC)
- [ ] Unit tests: `tip-service.test.ts`, `selection.test.ts`, `fallback.test.ts`

---

## Phase 5 — Pre-launch

- [ ] Make tips repo public (it's been ready for weeks)
- [ ] Privacy policy (one page, hosted on GitHub Pages)
- [ ] Web Store description (atomic tips + author credit + `Esc` contract + open source)
- [ ] Promo assets:
  - [ ] 1280×800 screenshots × 4
  - [ ] 440×280 promo tile
  - [ ] 128×128 icon
  - [ ] 30-second video (optional, big lift on conversions)
- [ ] Pay Chrome Web Store dev fee ($5)
- [ ] Submit to Chrome Web Store (1–3 day review; budget for 1-2 rejection cycles)
- [ ] Submit to Firefox Add-ons (insurance against Chrome rejection)
- [ ] Submit to Edge Add-ons
- [ ] Set up support email (or use GitHub Discussions as support channel)
- [ ] Open-source the extension repo (trust signal)

---

## Phase 6 — Launch

- [ ] Twitter/X announcement (screenshot + 30-sec video + link)
- [ ] LinkedIn post (job-search signal)
- [ ] Submit to Laravel News
- [ ] r/laravel post — emphasize *contributor* angle, not just extension
- [ ] r/PHP, r/vuejs, r/Nestjs_framework posts
- [ ] Hacker News (Show HN, Sunday morning EST)
- [ ] Product Hunt (Tuesday)
- [ ] DM each founding curator: "we're live, here's your tip rendering, share if it lands"
- [ ] Add to portfolio + GitHub pinned

---

## Phase 7 — Post-launch month 1

- [ ] Reply to every Web Store review
- [ ] Review every PR within 48h (block 3-5 hrs/week on calendar)
- [ ] Track installs daily (manual — no analytics)
- [ ] Track contributors actively engaged (PR merged or in flight)
- [ ] Tweet about excellent merged community tips (free contributor reach)
- [ ] First GitHub Discussion: "What stack should we add next?"

### Month 1 targets
- ✅ 100 installs
- ✅ 5 outside contributor PRs merged
- ✅ < 48h review SLA maintained

---

## Phase 8 — Stack expansion (months 2–6)

- [ ] Evaluate community demand from settings-drawer "vote" / GitHub Discussion data
- [ ] Recruit curator for next stack (same friend-network model if possible)
- [ ] Repeat seed → open flow for new stack
- [ ] Resolve no-telemetry vs vote-driven decision *before* this phase

---

## Phase 9 — Sustainability (month 6+)

- [ ] Co-maintainer model live (≥ 2 maintainers per active stack via trust ladder)
- [ ] Weekly digest as auto-generated GitHub release (RSS-friendly)
- [ ] First contributor "spotlight" feature
- [ ] Consider: tip-of-the-week social card auto-generation
- [ ] Consider: GitHub Sponsors for the project (signal, not revenue)

---

## Trust ladder (contributor permissions)

| Threshold | Status | Permissions |
|---|---|---|
| 1 merged PR | Contributor | Name in extension, GitHub credit |
| 3 merged tips | Founding contributor | Highlighted in extension about page |
| 10 merged tips | Stack curator candidate | PR review rights for that stack |
| 20 merged + 6 mo active | Co-maintainer | Merge rights |

Founding curators (Phase 1 friends) start at "Stack curator" automatically.

---

## Decisions log

> Append-only. Date every decision. Future-you needs the reasoning.

### 2026-07-10 (submission flow simplification)
- **Issue-form submission path removed; PRs only.** Issue → maintainer-converts-to-PR flow was double work for maintainers. Deleted `.github/ISSUE_TEMPLATE/new-tip.yml`; CONTRIBUTING.md, contribute page, IDEA.md, INSTRUCTIONS.md updated to single PR path.
- **Code cap raised 15 → 25 lines** (`CAPS.codeLines` in `validate.mjs`; docs + PR template + contribute page updated). PR-template checklist trimmed: "original work / not AI-generated" and "checked for duplicates" items removed.

### 2026-07-03 (open stacks + site polish session)
- **`stack` and `language` are open sets, not enums.** Schema + Astro content config validate pattern `^[a-z][a-z0-9-]*$`; `STACKS` derived from `tips/` directories in `scripts/shared.mjs`. Adding a stack = adding a directory. Tag pattern relaxed to allow `php8.4`, `n+1`.
- **9 stacks live** (was 3): go, laravel, nest, next, nuxt, php, react, rust, vue — 45 tips, all ids assigned.
- **validate.mjs self-duplicate fix**: tips already in `dist/index.json` no longer flag as duplicates of themselves (hash + title-similarity checks exclude same `id`).
- **Homepage filter pills = stacks** (derived from tips at build), replacing Backend/Frontend/DevOps category groups. Client-side pagination (12/page) added to the homepage grid, integrated with search + pills (`site/src/lib/stacks-filter-client.ts`).
- **Stack pages paginated** via Astro `paginate()`, 6 tips/page (`/[stack]/[...page].astro`); RSS route unaffected.
- **Deploy target confirmed: Cloudflare Pages** (not GitHub Pages — subpath would break absolute links; custom domain stays on CF). `deploy-site.yml` unchanged; needs `CF_API_TOKEN` + `CF_ACCOUNT_ID` secrets before first push.
- **index.astro refactored 958 → 89 lines** into `site/src/components/home/*` (≤150-line cap per file, all file types).

### 2026-06-29
- **Friend-network seed model.** 3 curators × ~25 tips = ~60-75 launch tips across 3 stacks. Solves empty-repo problem; skips cold-DM validation.
- **Trust ladder for contributor permissions** (see table above). Public in CONTRIBUTING.md FAQ.
- **ID assigned at merge, not submission.** Prevents PR collision when two contributors claim the same number.
- **Code-hash duplication CI** before first outside PR. Normalized hash (strip comments/whitespace) blocks exact dupes; title-similarity warns for soft dupes.
- **Bundled fallback.json in extension.** jsDelivr outage degrades to last 30 days of rotation instead of broken UI.
- **Rotation order shuffled deterministically at build time**, not raw insertion order. Newly-added tips enter rotation fairly within ~7 days instead of waiting full pool-length cycle.
- **Explanation cap raised 400 → 600 chars.** 400 starved the "why beats what" mandate; 600 fits one tradeoff sentence.
- **Editorial bar applies equally to friend tips and outside tips.** Stated upfront to curators to prevent inconsistency later.
- **You own PR review.** Friend curators are not maintainers; that role stays with builder for first 6 months minimum.

### 2026-06-29 (security + Phase 2 completion session)
- **Fixed JSON-LD XSS**: `JSON.stringify(jsonLd)` output now escapes `</script>` → `<\/script>` before `set:html` injection in BaseLayout. Without this, a tip title containing `</script>` would break out of the JSON-LD block.
- **Cloudflare Pages security headers** added at `site/public/_headers`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/cohort all denied), `Content-Security-Policy` (script `unsafe-inline` required for theme detection; `connect-src: none`; `frame-ancestors: none`), `COOP`, `CORP`. Immutable cache on `/assets/*`, 1h cache on XML feeds.
- **Completed Phase 2 scaffolding**: `LICENSE` (MIT), `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), `.github/ISSUE_TEMPLATE/new-tip.yml` (full form with checklist), `.github/PULL_REQUEST_TEMPLATE.md`, `validate.yml` (hardened: branch filter, `permissions: contents:read`, PR comment on failure), `build.yml` (hardened: `fetch-depth: 0`, explicit token, `schemas/**` trigger).
- **validate.yml hardening**: `permissions: contents: read, pull-requests: write` (least privilege). `continue-on-error` + GitHub Script comment → always gives contributor PR feedback even on failures. `fetch-depth: 0` so validate.mjs can diff against full history.
- **build.yml hardening**: `permissions: contents: write` only (not admin). `[skip ci]` on the auto-commit prevents infinite build loops.

### 2026-06-29 (lint + CI pipeline session)
- **ESLint + Prettier installed across root and site.** Root (`eslint.config.mjs`, `.prettierrc.json`): covers `scripts/**/*.mjs`. Site (`site/eslint.config.mjs`, `site/.prettierrc.json`): ESLint 9 flat config with `eslint-plugin-astro`, `typescript-eslint`, `prettier-plugin-astro`. Both pass clean (0 errors, all files formatted).
- **`lint.yml` CI workflow added.** Triggers on PRs + pushes to `main` touching `scripts/**` or `site/**`. Two jobs: `lint-root` (scripts) and `lint-site` (Astro). Site job runs lint → format:check → `astro check` (TS type check). PR comment on failure.
- **`astro check` skipped locally, used in CI only.** esbuild 0.25.12 (vite's bundled version) crashes with EPIPE on ARM64 macOS in this environment. On ubuntu-latest (CI) this does not occur. Code quality is still verified by ESLint + Prettier locally.
- **`@astrojs/check typescript` added to site devDeps.** Required for `astro check` to run without interactive prompt.
- **CI permission model finalized** (least privilege across all workflows): `validate.yml` — `contents: read, pull-requests: write`; `build.yml` — `contents: write`; `lint.yml` — `contents: read, pull-requests: write`; `deploy-site.yml` — `contents: read`.

### 2026-06-29 (site scaffold session)
- **Phase 2.5 scaffolded: Astro static site in `site/`.** Astro 5.18.2 + Tailwind v4 (`@tailwindcss/vite`). `site/src/content/tips` is a symlink to `../../tips` — no file copying.
- **All required pages built and verified:** tip pages (`/[stack]/[slug]`), stack archives (`/[stack]`), contributor index + profiles (`/contributors/[handle]`), contribute page, landing page, 404, RSS (global + per-stack), sitemap via `@astrojs/sitemap`.
- **Design tokens ported from extension** — same `@theme` block, same `data-theme` dark mode approach, same Fraunces/Inter/JetBrains Mono font stack.
- **`publishedAt` is `z.coerce.date()`** — Astro's YAML parser auto-coerces date strings to `Date` objects (same issue as gray-matter). All sort comparisons use `.getTime()`, not `.localeCompare()`.
- **Deploy workflow at `.github/workflows/deploy-site.yml`.** Triggers on push to `main` when `tips/**` or `site/**` changes. Requires `CF_API_TOKEN` + `CF_ACCOUNT_ID` secrets in GitHub.
- **OG images deferred.** Static `og-default.png` fallback for now. Per-tip Satori generation is Phase 11 (post-launch).
- **Build verified:** `bun run build` in `site/` → 10 pages, sitemap, 4 RSS feeds. Clean.

### 2026-06-28 (scaffold session)
- **Package manager: bun, not pnpm.** Overrode the planning-doc default at builder's request. Both repos use bun; CI workflows use `oven-sh/setup-bun`. Note: bun blocks WXT's postinstall — `bunx wxt prepare` must run once after `bun install`.
- **Both repos scaffolded.** Content repo: `scripts/{shared,validate,assign-id,build}.mjs` (ESM, deps gray-matter + ajv + js-yaml), `schemas/tip.schema.json`, sample tip `laravel-0001`, validate/build CI workflows. Extension: WXT 0.20.27 + TS 5.9.3, `lib/{types,shuffle,tip-service,prefs,highlight,render}.ts`, newtab/popup entrypoints, vitest shuffle tests (4 passing). Pipeline verified end-to-end.
- **YAML dates kept as strings.** gray-matter via js-yaml auto-parsed `publishedAt` into Date objects, failing the schema. Forced `JSON_SCHEMA` engine in `scripts/shared.mjs` so frontmatter dates stay strings on parse and round-trip.
- **Pinned TypeScript 5.9.3, not 6.0.3.** Latest TS is 6.0.3 but WXT/vitest ecosystem support is unproven; stayed on 5.9.x.
- **Shiki bundle blows the 250 KB budget.** Production build is 1.59 MB total (oniguruma wasm alone 622 KB) — the doc's "~80 KB" shiki estimate was wrong. Chunks are lazy but wasm loads on first highlight. Unresolved; INSTRUCTIONS §6 hand-rolled-tokenizer fallback is the likely fix in Phase 4.
- **GitHub-only platform.** No Laravel backend. PR review is moderation; commit history is attribution; jsDelivr is the CDN. Cost $0, scope shrinks, maintainer-only operations.
- **Community-driven content, not solo-curated.** Builder is not the writer; comparative advantage is shipping the product and editing the bar.
- **Markdown source, JSON build artifact.** Contributors edit clean MD; extension consumes optimized JSON via CI build.
- **Per-tip files, not big arrays.** One PR = one file = one tip. Clean diffs, clean attribution.
- **Author card is the recognition payoff.** Give it real visual weight in the new-tab UI. This is the engine.
- **Multi-stack architecture from day one.** Friend-curator model lets us launch multi-stack instead of Laravel-only.
- **Editorial design direction.** Rejected card-feed aesthetic. Chose monospace-forward, Fraunces serif title, single accent stripe.
- **`Esc` → blank tab is a hard contract.** Trust differentiator, never compromise.
- **Deterministic tip selection per day.** Same tab refreshed = same tip. Random feels broken.

---

## Open questions to resolve

- [ ] Bundle weight: shiki (~80 KB) vs hand-rolled tokenizer (~5 KB)? Decide in Phase 3.
- [ ] Self-host fonts or accept Google Fonts in production (leaning self-host for privacy consistency)
- [ ] Single "Daily Dev Tip" Web Store listing or per-stack listings later?
- [ ] No-telemetry vs vote-driven stack expansion — contradiction to resolve before Phase 8
- [ ] Author handle rename strategy (contributor changes GitHub username)
- [ ] Monorepo vs two-repo split — proceeding with two-repo; revisit if cross-repo friction emerges

---

## Anti-goals (resist scope creep)

When tempted, re-read:

- ❌ "What if we built our own auth on a Laravel backend?"
- ❌ "What if contributors had on-platform profiles, dashboards, follower counts?"
- ❌ "What if AI auto-generated tips from RSS?"
- ❌ "What if there was a paid tier?"
- ❌ "What if we sent push notifications?"
- ❌ "What if we had a mobile app?"
- ❌ "What if there was a comment thread per tip?"
- ❌ "What if we showed a feed of past tips?"

Every "what if" delays the next phase. The next phase is the only thing that matters.

---

## Validation gates (don't skip these)

| Gate | Question | Pass criteria | If fail |
|---|---|---|---|
| **G1: Pre-pipeline** | Are friend-curators committed? | 3 verbal commits + first 5 tips delivered | Reduce to 1-2 stack launch |
| **G2: Pre-launch** | Is the seed content strong enough to set the bar? | Re-read all ~60 tips — would each survive your own review? | Edit/cut until yes |
| **G3: Month 3** | Is the flywheel turning? | ≥ 10 active outside contributors, ≥ 1k installs | Reduce scope; double down on contributor outreach |

---

*Unit of progress: "a tip merged" or "a phase closed." Update on every working session.*

*Ship before you're ready. You can edit a live repo; you can't edit a dead project.*
