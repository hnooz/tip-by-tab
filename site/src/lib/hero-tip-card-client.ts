// Client behavior for HeroTipCard: cycles through real tips, paused on hover.
import gsap from "gsap";

interface HcCard {
  label: string;
  title: string;
  github: string;
  codeHtml: string;
}

const ACCENTS = ["#f87171", "#38bdf8", "#b9b9f9", "#f96bee", "#85e89d", "#f9a06b"];

export function initHeroTipCard(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const card = document.querySelector<HTMLElement>("#hero-tip-card");
  const hcInner = document.querySelector<HTMLElement>("#hc-inner");
  const dataEl = document.querySelector("#hc-data");
  const cards: HcCard[] = dataEl ? JSON.parse(dataEl.textContent ?? "[]") : [];
  if (!card || !hcInner || cards.length < 2) return;

  const hcBadge = document.querySelector<HTMLElement>("#hc-badge")!;
  const hcTitle = document.querySelector<HTMLElement>("#hc-title")!;
  const hcCode = document.querySelector<HTMLElement>("#hc-code")!;
  const hcAvatar = document.querySelector<HTMLImageElement>("#hc-avatar")!;
  const hcAuthor = document.querySelector<HTMLElement>("#hc-author")!;

  function hcApply(d: HcCard, i: number) {
    const c = ACCENTS[i % ACCENTS.length];
    hcBadge.textContent = d.label;
    hcBadge.style.color = c;
    hcBadge.style.background = `color-mix(in srgb, ${c} 12%, transparent)`;
    hcBadge.style.border = `1px solid color-mix(in srgb, ${c} 30%, transparent)`;
    hcTitle.textContent = d.title;
    // build-time shiki output from repo-reviewed tips, not user input
    hcCode.innerHTML = d.codeHtml;
    hcAvatar.src = `https://github.com/${d.github}.png?size=44`;
    hcAuthor.textContent = `@${d.github}`;
  }

  let hcIdx = 0;
  let paused = false;

  function hcShovel() {
    if (paused) return;
    gsap.to(hcInner, {
      x: 75,
      rotation: 10,
      opacity: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete() {
        hcIdx = (hcIdx + 1) % cards.length;
        hcApply(cards[hcIdx], hcIdx);
        gsap.set(hcInner, { x: -45, rotation: -8, opacity: 0 });
        gsap.to(hcInner, {
          x: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.44,
          ease: "power2.out",
        });
      },
    });
  }

  card.addEventListener("mouseenter", () => (paused = true));
  card.addEventListener("mouseleave", () => (paused = false));
  setInterval(hcShovel, 6500);
}
