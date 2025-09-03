---
name: UI/UX Overhaul – Phase 1 shipped, Phase 2 plan
about: Track the completed UI kit rollout and propose next steps
title: "UI/UX: Component rollout (Phase 1) shipped; propose Phase 2"
labels: ["enhancement", "ui/ux"]
assignees: []
---

## Summary

Phase 1 of the UI kit rollout is shipped on `main`. This issue tracks what changed, how to verify, and the proposed Phase 2 tasks.

## Shipped (Phase 1)

- Shared UI: `Button`, `Badge`, `Input`, `Select`, `Checkbox`, `Card`, `ToastProvider`, `Collapse`.
- Forms: Manual spot/restaurant forms unified with shared components; validation + toasts; focus/aria improvements.
- Filters: Persisted state, active-filter badges, clear-all; mobile drawer; key sections collapsible.
- Lists/Cards: Loading skeletons; SpotCard/RestaurantCard standardized with shared UI.
- Ops: Seed endpoint protected; `/api/health` added.

Commits (subset):
- refactor(ux): migrate FilterPanel selects… (2426db2)
- refactor(ui): standardize SpotCard/RestaurantCard… (8af4642)
- refactor(ui): unify top navigation tabs… (f872d01)
- refactor(ui): replace FilterPanel checkboxes… + mobile drawer (920df61)
- feat(ui): add Collapse; wrap cards with Card; collapsible filters (234a662)

## Verify

- Forms: Required fields show red outline + toast; success toast on submit.
- Filters: Change filters → badges appear; badges/clear-all remove filters; state persists on reload.
- Mobile: Tap “🔧 フィルターを開く” → drawer opens; close by backdrop/ボタン。
- Cards: Buttons look consistent; badges render for genres/price/smoking and facilities.

## Phase 2 – Proposed Tasks

- Filters: Make “対象年齢/子連れ適性/検索範囲/並び/季節” also collapsible for parity.
- Cards: Move less-used actions into a compact menu on small screens (3-dots menu).
- Animations: Add subtle transitions for drawer/collapse/toasts.
- Accessibility: Landmark roles, tab order audit, focus ring unification.
- Pagination: Infinite scroll or pager when results > N.

## Screens Affected

- `src/app/page.tsx`, `src/components/{FilterPanel, SpotCard, RestaurantCard, ...}`.

## Notes / Risks

- Ensure no secrets are logged; seed is protected by `DATA_COLLECTION_SECRET`.
- Keep shared UI minimal; avoid framework lock-in.

## Checklist

- [ ] Approve Phase 2 scope
- [ ] Implement collapsible remaining filter sections
- [ ] Add small-screen action menu for cards
- [ ] Add motion + a11y polish
- [ ] Add paging strategy

