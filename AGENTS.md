# Agent instructions

This repository is a small product catalogue intended to grow beyond a proof of concept.

## Stack

- Client: React + TypeScript (`apps/web`)
- Backend: Node.js + TypeScript (`apps/api`)
- Product data: Fake Store API, accessed only from the backend
- Email: SMTP port (`EmailSender`), Mailpit in local Docker

## Boundaries (do not collapse these)

1. HTTP handlers validate input and map to/from JSON. They do not know Fake Store or nodemailer.
2. Application services (`CatalogueService`, `EnquiryService`) contain use-case logic.
3. Ports live in `apps/api/src/ports`. Adapters implement those ports.
4. Domain types (`Product`, `Enquiry`) must not leak Fake Store field names to the client.

## When changing product data or email

- Add a new adapter; do not rewrite routes or React pages.
- Keep ranking, search, and enquiry validation in the service/domain layer so they stay testable without I/O.

## Style

- TypeScript strict.
- Prefer small pure functions for ranking and search.
- No secrets in git. Use `.env.example`.
- Do not call third-party product APIs from the browser.
