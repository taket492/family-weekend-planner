---
name: UI/UX Phase 2 – Make all filter sections collapsible
about: Parity for remaining FilterPanel sections (age/score/radius/sort/season)
title: "UI/UX: Make all remaining filter sections collapsible"
labels: ["enhancement", "ui/ux"]
assignees: []
---

## Background
Some FilterPanel sections are collapsible. Complete parity for: 対象年齢, 子連れ適性, 検索範囲, 並び替え, 季節イベント.

## Scope
- Wrap each section in `Collapse` with sensible default states.
- Keep current behavior and state persistence intact.

## Acceptance Criteria
- All five sections are collapsible with title rows.
- No regression to filter logic, badges, clear-all, or persistence.

## Affected Files
- `src/components/FilterPanel.tsx`

## Risks
- None major; ensure proper keyboard focus and aria-expanded states.

## Checklist
- [ ] Add Collapse wrappers
- [ ] Verify behavior on mobile drawer and desktop sidebar
- [ ] Quick a11y pass (keyboard + screen reader)

