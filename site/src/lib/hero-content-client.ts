// Client behavior for HeroContent: cycling stack name.
export function initStackCycle(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cycleEl = document.querySelector<HTMLElement>("#stack-cycle");
  const stacksEl = document.querySelector("#stack-cycle-data");
  const stacks: string[] = stacksEl ? JSON.parse(stacksEl.textContent ?? "[]") : [];
  if (!cycleEl || stacks.length < 2) return;

  let idx = 0;
  setInterval(() => {
    cycleEl.style.opacity = "0";
    cycleEl.style.transform = "translateY(6px)";
    setTimeout(() => {
      idx = (idx + 1) % stacks.length;
      cycleEl.textContent = stacks[idx];
      cycleEl.style.opacity = "1";
      cycleEl.style.transform = "translateY(0)";
    }, 280);
  }, 4000);
}
