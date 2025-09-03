---
name: UI/UX Phase 2 – Motion polish (drawer/collapse/toasts)
about: Add subtle transitions to improve perceived performance and delight
title: "UI/UX: Motion polish for drawer, collapse, and toasts"
labels: ["enhancement", "ui/ux"]
assignees: []
---

## Background
Micro-interactions improve perceived performance and clarity.

## Scope
- Drawer slide-in/out, Collapse expand/collapse, Toast fade/slide.
- Respect reduced motion preferences.

## Acceptance Criteria
- Smooth animations at 150–220ms with easing; no jank on low-end devices.
- `prefers-reduced-motion` disables animations.

## Affected Files
- `src/app/page.tsx` (drawer)
- `src/components/ui/Collapse.tsx`
- `src/components/ui/ToastProvider.tsx`

## Risks
- Avoid layout shift; use transform/opacity.

## Checklist
- [ ] Add CSS transitions/utility classes
- [ ] Add reduced-motion guard
- [ ] Verify on mobile + desktop

