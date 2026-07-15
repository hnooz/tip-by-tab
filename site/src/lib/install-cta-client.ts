import { FIREFOX_ADDON_URL } from "@/lib/seo";

// Chromium browsers (Edge, Brave, Opera, Arc) all install from the Chrome Web Store,
// which is what the markup renders by default — only Firefox needs a swap.
function isFirefox(): boolean {
  return /firefox|fxios/i.test(navigator.userAgent);
}

export function initInstallCta(): void {
  if (!isFirefox()) return;

  for (const el of document.querySelectorAll<HTMLAnchorElement>("[data-install-cta]")) {
    el.href = FIREFOX_ADDON_URL;
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Chrome")) {
        node.textContent = node.textContent.replace("Chrome", "Firefox");
      }
    }
  }
}
