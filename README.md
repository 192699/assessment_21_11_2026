# Field & Co. product catalogue

A small, growable MVP: customers browse and search a catalogue, open a product, and send an enquiry to sales.

**Client:** React web app (TypeScript)  
**Backend:** Node.js (TypeScript, Express)

I chose this pair because a reviewer can run it with one Docker command, TypeScript is shared across the stack, and both sides can be swapped later (new UI, new product source, new mail provider) without rewriting the rest. Mobile would have been a poorer fit for a 2–3 hour foundation that must boot in under 10 minutes.

## Run locally (preferred)

You need Docker Desktop and an internet connection (product images and the Fake Store API are remote).

```bash
docker compose up --build
```

Then open:

- Catalogue: http://localhost:8080
- Sales inbox (Mailpit): http://localhost:8025
- API health: http://localhost:3001/api/health

No `.env` file is required for Docker. Enquiries appear in Mailpit rather than a real mailbox, so the reviewer does not need an email account.

## Run without rebuilding images

Use this if you are iterating on the code.

1. Copy `.env.example` to `.env`.
2. Start Mailpit: `docker compose up mailpit`
3. Install and start the API and web app:

```bash
cd apps/api && npm install && npm run dev
cd apps/web && npm install && npm run dev
```

Or from the repo root after `npm install` in the root and both apps:

```bash
npm run dev
```

Web: http://localhost:5173  
API: http://localhost:3001

## Tests

```bash
cd apps/api && npm test
cd apps/web && npm test
```

From root (after installing dependencies in both apps):

```bash
npm test
```

What is covered:

- **API (`apps/api`)** — ranking/search pure functions, the Fake Store adapter (mapping, caching, upstream failures), the enquiry service (email content, HTML escaping), and every HTTP route including 400/404/429/502/503 paths. Tests use in-memory port implementations, so they need no network or SMTP.
- **Web (`apps/web`)** — `App.test.tsx` walks each acceptance criterion (home, category, search button, product tile, enquiry → thank you, enquiry failure) through the real router and pages with only `fetch` stubbed, plus component tests.

CI (`.github/workflows/ci.yml`) runs build + tests for both apps and `docker compose build` on every PR.

## What you should see

Featured products on the home page are the five highest Fake Store ratings, with review count as the tie-breaker. With the current Fake Store dataset that is typically:

1. WD 4TB Gaming Drive (4.8, 400 reviews)
2. Silicon Power 256GB SSD (4.8, 319)
3. Mens Cotton Jacket (4.7, 500)
4. MBJ Women's Boat Neck (4.7, 130)
5. John Hardy Naga bracelet (4.6, 400)

Search matches title, description, and category (case-insensitive). Submit an enquiry from a product page, then confirm the message in Mailpit.

## Configuration

See `.env.example`. Nothing secret is required. To point at another product API later, change `PRODUCT_SOURCE_URL` and/or replace the Fake Store adapter. To send real mail later, point SMTP at Amazon SES (or another provider) and keep the `EmailSender` port.

## Docs

- [DECISIONS.md](./DECISIONS.md) — assumptions, trade-offs, how this grows
- [AI_USAGE.md](./AI_USAGE.md) — tools, prompts, review notes
- [PLAN.md](./PLAN.md) — the short spec used to build
- [AGENTS.md](./AGENTS.md) — boundaries for later AI-assisted work
