Collaborative Plans (Phase 1)

API (token-based, pre-Auth)
- Create invite: POST `/api/plans/{id}/collaborators/invite` JSON `{ email?, role? }` → `{ invite, inviteUrl }`
- Fetch collab data: GET `/api/plans/{id}/collab` with `Authorization: Bearer {token}` → `{ comments, checklist }`
- Comments:
  - POST `/api/plans/{id}/comments` (Bearer) `{ author?, text }`
  - DELETE `/api/plans/{id}/comments/{commentId}` (Bearer)
- Checklist:
  - POST `/api/plans/{id}/checklist` (Bearer) `{ text }`
  - PATCH `/api/plans/{id}/checklist/{itemId}` (Bearer) `{ done? }`
  - DELETE `/api/plans/{id}/checklist/{itemId}` (Bearer)

Notes
- Requires DB migration: `npx prisma db push`
- This phase uses plan-scoped invite tokens (no global Auth yet). NextAuth-based protection and email/push notifications will be added in #9/#14.
