---
name: UI/UX Phase 2 – Compact card actions on small screens
about: Move less-used actions into a 3-dots menu on Spot/Restaurant cards
title: "UI/UX: Small-screen action menu for Spot/Restaurant cards"
labels: ["enhancement", "ui/ux"]
assignees: []
---

## Background
Card actions crowd on small screens. A compact overflow (3-dots) menu improves clarity.

## Scope
- Add a small-screen overflow menu component.
- Keep primary actions (bookmark, calendar) visible; move secondary into menu.

## Acceptance Criteria
- <640px viewport shows condensed actions; ≥640px shows current grid buttons.
- No loss of functionality; keyboard operable.

## Affected Files
- `src/components/SpotCard.tsx`
- `src/components/RestaurantCard.tsx`
- `src/components/ui` (new Menu component)

## Risks
- Ensure accessible menu patterns (focus trap, aria attributes).

## Checklist
- [ ] Implement Menu component
- [ ] Integrate into both cards with responsive logic
- [ ] A11y + keyboard tests

