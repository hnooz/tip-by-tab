export interface FilterGroup {
  label: string;
  stacks: string[];
  color: string;
}

export const FILTER_GROUPS: Record<string, FilterGroup> = {
  backend: {
    label: "Backend",
    stacks: ["laravel", "nest", "node", "go", "python", "php", "rust"],
    color: "#533afd",
  },
  frontend: {
    label: "Frontend",
    stacks: ["vue", "react", "svelte", "angular", "next", "nuxt"],
    color: "#10b981",
  },
  devops: {
    label: "DevOps",
    stacks: ["bash", "docker", "kubernetes", "terraform"],
    color: "#f59e0b",
  },
};

export const FILTER_ORDER = ["backend", "frontend", "devops"] as const;
export type FilterKey = (typeof FILTER_ORDER)[number];

export function categoryForStack(stack: string): string | null {
  for (const [key, group] of Object.entries(FILTER_GROUPS)) {
    if (group.stacks.includes(stack)) return key;
  }
  return null;
}
