// Build-time helpers for the hero tip preview card.
import { codeToHtml } from "shiki";

export interface HeroTip {
  label: string;
  title: string;
  code: string;
  language: string;
  github: string;
}

export interface HeroCard {
  label: string;
  title: string;
  github: string;
  codeHtml: string;
}

// Badge/avatar accent per cycle position (content-independent, matches mesh stops)
export const ACCENTS = ["#f87171", "#38bdf8", "#b9b9f9", "#f96bee", "#85e89d", "#f9a06b"];

export function accentStyle(i: number): string {
  const c = ACCENTS[i % ACCENTS.length];
  return `color:${c};background:color-mix(in srgb, ${c} 12%, transparent);border:1px solid color-mix(in srgb, ${c} 30%, transparent);`;
}

// Aliases only — anything else passes straight to shiki (unknown langs hit the catch fallback)
const LANG_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
};

function firstLines(code: string, n = 4): string {
  const lines = code.split("\n");
  return lines.slice(0, n).join("\n") + (lines.length > n ? "\n…" : "");
}

async function highlight(tip: HeroTip): Promise<string> {
  const snippet = firstLines(tip.code);
  try {
    return await codeToHtml(snippet, {
      lang: LANG_MAP[tip.language] ?? tip.language,
      theme: "night-owl",
    });
  } catch {
    return `<pre><code>${snippet.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  }
}

export async function buildHeroCards(tips: HeroTip[]): Promise<HeroCard[]> {
  return Promise.all(
    tips.map(async (t) => ({
      label: t.label,
      title: t.title,
      github: t.github,
      codeHtml: await highlight(t),
    }))
  );
}
