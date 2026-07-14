# Contributing to Tip by Tab

First — thank you. Every merged tip lands on the new-tab page of developers around the world, with **your name and GitHub profile attached**. That's the deal: you teach one thing, you get credit forever.

This guide tells you exactly how to submit a tip that gets merged.

---

## How to contribute

Submit tips as pull requests — no issue needed first:

1. Fork the repo
2. Create `tips/<stack>/<kebab-title>.md` (don't worry about numbering — CI assigns the `id` on merge)
3. Follow the [tip format](#tip-format) below
4. Open a PR titled `[<stack>] <tip title>`
5. CI runs validation; fix anything it complains about
6. Wait for review (usually ≤ 48 hours)

---

## Before you submit: check for duplicates

Search `tips/<stack>/` for similar mechanisms. CI will reject exact code duplicates automatically (we hash normalized code blocks). For conceptual overlap — same lesson taught with different code — a maintainer will close your PR with a link to the existing tip.

Not sure if your tip is too close to an existing one? Open a Discussion first, not a PR.

---

## What makes a good tip

A great tip teaches **one mechanism, in 30 seconds, that the reader didn't know they needed**.

### The five rules

1. **One thing.** A tip teaches one mechanism, one idiom, one gotcha — not a tutorial.
2. **The code compiles.** Literally. Copy-paste into a fresh project and it runs.
3. **The "why" beats the "what."** Anyone can describe what `whenLoaded` does. The tip explains *why you reach for it.*
4. **It's not in the docs' first paragraph.** If it's the obvious example on the framework's homepage, skip it.
5. **Tradeoffs are honest.** "Use Queues for emails — except for password resets, which should be sync."

### What gets rejected

- ❌ "Use `array_map` instead of `foreach`" — basic, in every intro
- ❌ Full tutorials, multi-step setups, anything > 25 lines of code
- ❌ Code without explanation, or vague "this is cool" explanations
- ❌ Opinions framed as tips ("always use spaces over tabs")
- ❌ Tips for deprecated APIs or unmaintained libraries
- ❌ Self-promotion (linking your course, your client's product, etc.)
- ❌ Code you don't own the rights to
- ❌ AI-generated submissions presented as your own work
- ❌ Duplicate or near-duplicate of an existing tip

### What gets merged fast

- ✅ A subtle Laravel feature that prevents a real production bug
- ✅ A Vue composable pattern that simplifies common state
- ✅ A NestJS decorator combination that removes 30 lines of boilerplate
- ✅ A gotcha you only learn after shipping something to production
- ✅ A test pattern that catches a class of bugs cleanly

---

## Tip format

Each tip is a single Markdown file: `tips/<stack>/<kebab-title>.md`

Example: `tips/laravel/queue-batch-failures.md`

### File template

````markdown
---
title: Catch the whole batch with allowFailures and then() in Bus::batch()
stack: laravel
tags: [queues, batch, error-handling]
language: php
file: app/Jobs/ProcessOrders.php
author:
  github: your-handle
  name: Your Name
source: https://laravel.com/docs/queues#job-batching
publishedAt: 2026-07-15
---

```php
Bus::batch([
    new ProcessOrder($order1),
    new ProcessOrder($order2),
])->then(fn ($batch) => Mail::to($admin)->send(new BatchDone($batch)))
  ->catch(fn ($batch, $e) => Log::error('Batch failed', ['e' => $e]))
  ->allowFailures()
  ->dispatch();
```

`allowFailures()` lets the batch continue when individual jobs fail, while
`catch()` still fires once per failed job — giving you per-failure
observability without aborting the whole batch.

Pair this with `->onQueue('batches')` to isolate batch work from your
regular queue and keep your dashboards readable. The tradeoff: if any
single failure should abort the run, drop `allowFailures()` and let the
batch cancel on first error.
````

### Field rules

| Field | Required | Rules |
|---|---|---|
| `id` | ❌ | **Do not set.** Auto-assigned at merge time by CI. |
| `title` | ✅ | 10–90 chars. Sentence case. No trailing period. Imperative or descriptive ("Use X to…", not "How to X"). |
| `stack` | ✅ | One of: `laravel`, `vue`, `nest` (more added over time) |
| `tags` | ✅ | 1–5 tags, `lowercase-kebab`. Examples: `eloquent`, `n+1`, `performance` |
| `language` | ✅ | One of: `php`, `js`, `ts`, `python`, `go`, `bash` (use code-fence language tag for Vue SFCs) |
| `file` | ⬜ | Suggested file path. Helps readers orient. |
| `author.github` | ✅ | Your GitHub username. This is the recognition. |
| `author.name` | ✅ | Display name (2–60 chars). Can be your real name or chosen name. |
| `source` | ⬜ | Link to docs / article that goes deeper. Strongly encouraged. |
| `publishedAt` | ✅ | Today's date in `YYYY-MM-DD`. The maintainer may adjust this. |

### Body rules

- **Code block first**, explanation second. No exceptions.
- **Code block** must specify the language: ` ```php`, ` ```ts`, etc.
- **Max 25 lines** of code. If it needs more, it's not a tip.
- **Max 600 characters** of explanation (about 4-5 sentences). Use the room to explain the *why* and one tradeoff.
- **Use backticks** for inline code: `whenLoaded`, not "whenLoaded".
- **No headings** in the body. Frontmatter + code + prose is the whole format.
- **No images, no GIFs, no embeds.** Pure text only.

---

## What happens after you submit

```
You open PR ──► CI validates ──► Maintainer reviews ──► Merged ──► CI assigns id + builds JSON
     │              │                    │                              │
     │              ▼                    ▼                              ▼
     │         Auto-comment       Feedback or          Your tip is live on the
     │         on errors          approval             extension for thousands
     │                                                  of developers.
     ▼
Your GitHub profile shows
the contribution forever.
```

**Review SLA:** maintainer aims for first response within **48 hours**.

**Iteration is normal.** First-time PRs often need small adjustments. That's fine — it's how the quality bar holds.

---

## Code of Conduct

Be kind. Disagree about technique, not about people. We're all here because we love getting better at this.

Full text: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

## Licensing

By submitting a tip, you confirm:

1. You wrote the code yourself, or it's small enough and generic enough to not be subject to copyright (e.g., a standard `for` loop is not copyrightable).
2. You're not copying from a source that prohibits reuse.
3. You agree to license your contribution under [**MIT**](./LICENSE), the same license as the project.

This protects everyone — you, the readers, and the project.

---

## FAQ

**Q: Can I submit anonymously?**
No. Recognition is the point. Your GitHub handle is non-negotiable.

**Q: Can I submit AI-generated tips?**
No. We rely on human-authored, human-tested craft knowledge. AI-generated content is rejected at review.

**Q: Can I rewrite a docs example?**
Only if your tip adds something the docs don't — context, tradeoff, gotcha, or combination with another feature. A bare rewording gets rejected.

**Q: How fast can I get multiple tips merged?**
Quality bar is the same for tip #1 and tip #50. We don't rate-limit, but we *do* enforce quality strictly. Three excellent tips beat thirty mediocre ones.

**Q: Can my company sponsor / be credited?**
Your `author.name` and GitHub link are visible. No corporate logos, no "tip sponsored by X." This is a craft community, not a marketing channel.

**Q: I found a mistake in a published tip. What do I do?**
Open a PR fixing it. The original author keeps attribution; you get a `co-author` line in the file's frontmatter.

**Q: How do I propose a new stack?**
Open a Discussion. We add a stack when there's a committed curator + ≥ 20 tip drafts ready.

**Q: How do I become a stack curator or co-maintainer?**
We use a trust ladder based on merged contributions:

| Threshold | Status | Permissions |
|---|---|---|
| 1 merged PR | Contributor | Name in extension, GitHub credit |
| 3 merged tips | Founding contributor | Highlighted in extension about page |
| 10 merged tips | Stack curator candidate | PR review rights for that stack |
| 20 merged + 6 mo active | Co-maintainer | Merge rights |

Curator and co-maintainer status are by invitation once thresholds are met. Active participation (timely PRs, helpful reviews of others' work) matters more than raw counts.

---

Thanks again. Now go write a tip.

— Mohamed Idris ([@hnooz](https://github.com/hnooz)), maintainer
