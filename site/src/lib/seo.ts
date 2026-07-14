export const SITE_URL = "https://tipbytab.moidris.com/";
export const GITHUB_REPO_URL = "https://github.com/hnooz/tip-by-tab";
// Pre-launch: points at the repo until the Web Store listing is live.
// Launch day: swap to the real listing URL — every install CTA imports this.
export const WEBSTORE_URL =
  "https://chromewebstore.google.com/detail/calklaaocjacgelaggbofconddlkdegf?utm_source=item-share-cb";
export const SITE_NAME = "Tip by Tab";
export const SITE_DESCRIPTION =
  "One atomic developer tip per new tab. Community-curated, contributor-credited.";

export function tipUrl(stack: string, slug: string): string {
  return new URL(`/${stack}/${slug}`, SITE_URL).toString();
}

export function ogUrl(stack: string): string {
  return new URL(`/og/${stack}.png`, SITE_URL).toString();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[*_~#>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
