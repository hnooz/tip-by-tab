---
title: Share state across components with useState, never a module-level ref, on SSR
stack: nuxt
tags:
  - nuxt4
  - state
  - ssr
  - security
language: typescript
file: composables/useCart.ts
author:
  github: hnooz
  name: Mohamed Idris
source: https://nuxt.com/docs/api/composables/use-state
publishedAt: 2026-07-03
---

```typescript
export const useCart = () =>
  useState<CartItem[]>('cart', () => [])

// DON'T do this in an SSR app:
// const cart = ref<CartItem[]>([])  // shared across ALL requests
// export const useCart = () => cart
```

On the server a module-level `ref` is created once and shared by every request, so one user's cart can leak into another's response — a real data-isolation bug, not just a style issue. `useState` is request-scoped and SSR-friendly: each request gets its own instance, and the value is serialized into the payload so it survives hydration. Always reach for `useState` (keyed) for cross-component shared state in Nuxt.