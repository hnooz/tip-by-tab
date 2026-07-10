---
title: The stale closure, your debounced callback saves old state
stack: react
tags:
  - react19
  - debounce
  - performance
  - js
language: js
author:
  github: DevDhaif
  name: Dhaifallah Ahmed
publishedAt: 2026-07-11
id: react-0006
---

```js
function useDebouncedCallback(callback, delay) {
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback; // refresh every render
  });
  return useMemo(() => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => latest.current(...args), delay); // fresh closure
    };
  }, [delay]);
}
const saveDraft = useDebouncedCallback(() => api.save(form), 800);
// form is current when the timer fires, not the mount-time value
```

Stabilizing a debounce with `useMemo(() => debounce(fn, 300), [])` fixes one bug and creates a worse one: the callback is frozen at mount, so it captures the initial state forever.

Classic symptom → debounced autosave that saves an empty form.

The fix: the latest-ref pattern.
- The debounced shell stays stable, so timers survive re-renders
- It calls through a ref that always points at the newest closure
