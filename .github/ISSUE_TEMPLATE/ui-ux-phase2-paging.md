---
name: UI/UX Phase 2 – Paging for spot results
about: Add infinite scroll or pagination for large result sets
title: "UI/UX: Add paging (infinite scroll or pagination)"
labels: ["enhancement", "ui/ux", "performance"]
assignees: []
---

## Background
Large result sets need paging to improve performance and scannability.

## Options
- Infinite scroll with intersection observer
- Classic pagination with page size (e.g., 24) and controls

## Acceptance Criteria
- Stable scroll and preserved filters across pages/loads.
- Loading indicators between pages; no duplicate items.

## Affected Files
- `src/components/SpotList.tsx`
- Store/API as needed for page parameters

## Checklist
- [ ] Decide infinite vs pagination
- [ ] Implement with loading states
- [ ] Verify with >200 items (mock if needed)

