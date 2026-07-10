# Daily Dev Tip — Project Brief

> A community-curated knowledge base of atomic developer tips, delivered through a browser extension. Contributors get permanent attribution on their GitHub profile and visible credit in every reader's new tab.

---

## 1. The thesis

Developers love three things: getting better at their craft, sharing what they've learned, and being recognized for it. Existing platforms split these:

- **daily.dev** delivers content but contributors get no recognition (it's RSS)
- **dev.to / Hashnode** give recognition but contributions are long-form and effortful
- **Stack Overflow** gives rep but the unit is "answer to a question," not "thing I think is worth knowing"
- **GitHub** gives durable credit but there's no "share a tip" surface

**Daily Dev Tip** fills the gap: atomic units (one tip = one mechanism), low contribution friction (submit a PR or fill a form), durable recognition (it's on your GitHub forever, and your name renders in every reader's new tab).

## 2. The product

Two surfaces, one project.

### Surface A — The reader (browser extension)
- New-tab override
- Shows today's tip: title, code, why, source
- Author card with GitHub link
- Stack switcher (Laravel / Vue / NestJS / …)
- `Esc` → blank tab (the trust contract)
- Zero accounts, zero tracking

### Surface B — The contributor (GitHub repo)
- One markdown file per tip
- Submit via PR directly (no issue step)
- CI validates schema, lints code, checks attribution, detects duplicates
- Maintainer reviews → merges → CI assigns ID, publishes JSON for extension
- Contributor's name lives in: the file, the commit log, the extension UI, their GitHub contribution graph

## 3. Why GitHub-as-platform, not a Laravel app

The team behind a "community content platform" is usually 5+ people. We are one. GitHub gives us — for free — what would take six months to build:

- Authentication (GitHub login is *the* dev login)
- Submission UI (Issues + PRs)
- Moderation UI (PR review — the best moderation tool ever made)
- Permanent attribution (commit history)
- Spam/abuse handling
- Discussion threads (PR comments)
- Versioning, backup, global CDN

Cost: $0/month. Maintenance burden: review PRs.

This isn't a downgrade from "a real platform." It's the right tool. The category for what we're building is **open-source knowledge base + thin client extension**, not SaaS.

## 4. Who this is for

### Readers
Working developers (junior → senior) who want compounding craft knowledge in their stack — one atomic, copyable tip per day, with no feed to scroll.

### Contributors
Mid-to-senior developers who:
- Have hard-won knowledge they want to share but won't write a blog post for it
- Want public proof of expertise for job search / personal brand
- Already use GitHub daily, find the contribution flow natural

### Seed strategy
**Friend-network curators.** Three senior friends — one per launch stack (Laravel, Vue, NestJS) — each writing ~25 tips before public launch. This solves the empty-repo problem and avoids the cold-DM validation gamble: people who said yes in a DM rarely follow through, friends do.

## 5. The motivation loop

```
        ┌─────────────────────────────────────────┐
        │                                         │
        ▼                                         │
  Dev writes a tip                       Tip gets seen by N
  (5 mins of work) ──────►  PR merged ──►  devs/week, with
                                         their name on it
        ▲                                         │
        │                                         ▼
        └────────────  "That felt good. ◄────  Reader clicks
                       I'll write another."     author profile
```

Fast, public, durable. That's the engine.

## 6. Differentiators

| | daily.dev | dev.to | Stack Overflow | **Daily Dev Tip** |
|---|---|---|---|---|
| Unit | Article | Post | Q&A | One mechanism |
| Effort to contribute | Auto (RSS) | High | Medium | Low (snippet + 3 sentences) |
| Contributor credit | None | Yes | Rep score | GitHub-permanent + UI render |
| Reader effort | 5–15 min | 5–15 min | Search-driven | 30 sec |
| Stack focus | Generalist | Generalist | Generalist | Per-stack curated |
| Moderation | Algorithmic | Light | Community vote | Maintainer review |
| Cost to run | $$$ | $$$ | $$$ | $0 |

## 7. Non-goals

- ❌ User accounts on our infrastructure (GitHub is the only "account")
- ❌ Comments, threads, or social features in the extension
- ❌ Email digest, newsletter, or notifications
- ❌ Mobile app
- ❌ Paid tier
- ❌ AI-generated tips (every tip is human-authored, human-reviewed)
- ❌ A "feed" of past tips in the extension
- ❌ Analytics that violate the no-tracking stance

## 8. Stack launch order

Built generic from day one. Friend-curator seeding lets us launch multi-stack instead of single-stack.

| Phase | Stacks | Trigger |
|---|---|---|
| Launch | **Laravel + Vue + Nest** | 3 friend-curators committed, ~60 tips seeded |
| +3 mo | First voted stack | Demand signal (GitHub Discussions, settings vote) |
| +6 mo | Second voted stack | Same |

## 9. Success metrics

| Phase | Metric | Target |
|---|---|---|
| Pre-launch | Friend-curators committed | 3 (one per stack) |
| Pre-launch | Seed tips merged across 3 stacks | ~60 |
| Month 1 | Extension installs | 100 |
| Month 1 | Outside contributor PRs merged | 5 |
| Month 3 | Installs | 1,000 |
| Month 3 | Active outside contributors (≥1 merged tip) | 10 |
| Month 6 | Tips in repo (any stack) | 250 |
| Month 6 | Stacks live | 4 |
| Month 12 | Installs | 10,000 |
| Month 12 | Active contributors | 50 |

**Anti-metrics:** time-on-page (shorter is better), DAU (we want it equal to installs — one open per day is the design).

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Contributor flywheel never starts after friend-seed exhausts | Friend curators set quality bar publicly; "founding contributor" status for first 20 outside contributors. |
| One friend-curator drops mid-commitment | Backup curator identified per stack; accept lighter launch for that stack if needed. |
| Low-quality PRs flood the queue | Strict CONTRIBUTING.md. CI catches schema + duplicates. Polite-but-firm review. |
| Duplicate tips (intentional or accidental) | Code-hash CI blocks exact dupes; title-similarity warns; maintainer judges conceptual overlap. |
| Malicious code in tips | PR review is the gate. Extension only renders text — never executes. |
| jsDelivr outage breaks the extension | Bundled `fallback.json` (last 30 days of rotation) ships in the extension. |
| GitHub raw rate limits at scale | Already using jsDelivr; fallback to GitHub Pages if jsDelivr degrades. |
| Maintainer burnout from PR review | "Reviewed within 48h" expectation, not 4h. Trust ladder promotes co-maintainers at month 6+. |
| Chrome Web Store rejects (new-tab category) | Minimal permissions, strict MV3, clear privacy policy. Budget 1-2 rejection cycles. Firefox-first soft launch as insurance. |
| Indistinguishable from daily.dev | Code-first design, author cards, atomic format, contributor-led. |
| Legal issues with submitted code | CONTRIBUTING.md requires contributor owns / has rights to the snippet. License: MIT. |
| Editorial bar drifts between friend-tips and outside-tips | Maintainer edits friend tips to same bar before merge; stated upfront to curators. |

## 11. Open questions

- [ ] Co-maintainer model: invite criteria, permissions? Trust ladder drafted; revisit at 250 tips
- [ ] Weekly digest as GitHub-Actions-generated RSS: yes/no for v1.1?
- [ ] No-telemetry vs vote-driven stack expansion — contradiction to resolve before Phase 8
- [ ] Per-tip view counts: never (breaks no-tracking stance) vs aggregate-only privacy-preserving counter?

## 12. North star

> A senior Laravel developer in Karachi writes a 5-minute tip about queue retries before coffee. By Friday, 3,000 developers across 40 countries have read it with her name on it, and it's a permanent line in her GitHub contribution graph. She writes another one next week.

When the loop in §5 is humming, the project has succeeded.

---

*Owner: Mohamed Idris (@hnooz) · Role: Maintainer · Status: pre-build*
