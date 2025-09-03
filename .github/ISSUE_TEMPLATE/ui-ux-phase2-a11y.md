---
name: UI/UX Phase 2 – Accessibility pass
about: Landmarks, keyboard flow, focus rings, aria for interactive controls
title: "UI/UX: A11y audit + improvements"
labels: ["enhancement", "ui/ux", "accessibility"]
assignees: []
---

## Background
Ensure consistent keyboard access, landmarks, and assistive tech support.

## Scope
- Landmarks (header/main/nav/aside) and labels.
- Focus ring consistency for Buttons, Inputs, Links.
- Aria attributes for menus, collapse, dialogs.

## Acceptance Criteria
- Full keyboard navigation without traps.
- Visible focus states and proper aria-expanded/controls on toggles.

## Affected Files
- `src/app/layout.tsx` (landmarks)
- `src/components/ui/*`, `src/components/*` (focus/aria)

## Checklist
- [ ] Landmarks + roles
- [ ] Focus outlines unified
- [ ] Screen reader labels/aria audited

