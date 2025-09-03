# UI/UX: Component rollout (Phase 1) shipped; propose Phase 2

Labels: enhancement, ui/ux

## Summary

Phase 1 of the UI kit rollout is live. This draft can be pasted into a GitHub issue if templates are disabled.

## Shipped

- Shared UI: Button, Badge, Input, Select, Checkbox, Card, ToastProvider, Collapse
- Forms: Manual forms use shared UI; validation + focus/aria + toasts
- Filters: Active badges + clear-all; state persistence; mobile drawer; collapsible sections (partially)
- Lists/Cards: Skeleton loading; SpotCard/RestaurantCard standardized
- Ops: Seed protected; /api/health added

Commits (subset): 2426db2, 8af4642, f872d01, 920df61, 234a662

## How to verify

- Submit forms with/without required fields; observe toasts and focus
- Apply/clear filters; badges reflect changes; reload persists filters
- Open mobile drawer; close with backdrop or button
- Cards show unified buttons/badges

## Phase 2 (proposal)

- Make remaining filter sections collapsible for parity
- Small-screen action menu on cards (3-dots)
- Motion polish for collapse/drawer/toast
- A11y audit (landmarks, tab flow, focus rings)
- Paging: infinite scroll or pagination

## Risks

- Avoid over-styling; keep shared UI minimal and composable
- Watch bundle size; shared components should be lightweight

