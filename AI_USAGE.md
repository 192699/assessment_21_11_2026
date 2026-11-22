# AI usage

## Tools and models

- **Cursor** with **Grok 4.6** (agent) for planning, scaffolding, implementation, and docs in this repository.
- **Claude Code** (Claude Opus 5.5, VS Code extension) for a second-pass review against the brief: gap-check of each acceptance criterion and submission item, boundary audit against `AGENTS.md`, hardening, and extra tests. Using a different model for review than for generation was deliberate, so the reviewer was not anchored on its own output.

## Agent instruction files (committed)

- `AGENTS.md` — architecture boundaries for later sessions
- `.cursor/rules/catalogue.md` — short Cursor rule: ports, no client-side product API
- `PLAN.md` — the spec the agent was told to follow

These files were written as part of the submission, not imported from another project.

## Plan / spec

`PLAN.md` is the working spec: stack, ports-and-adapters sketch, critical path, and explicit out-of-scope list. The agent implemented against that, not against a wandering feature list.

## Prompts / moments that shaped the solution

1. **Paste of the full brief** with an instruction to treat judgement and growability as the scoring criteria, not feature count. That pushed ports/adapters and Mailpit instead of a UI-only demo.
2. **Constraint: reviewer runs it in under 10 minutes, no paid accounts.** That decided Docker Compose + Mailpit and ruled out SES, SendGrid, and mobile simulators.
3. **“Do not call Fake Store from the client.”** The API maps Fake Store into a catalogue DTO so the web app never sees `rating.rate` or Fake Store URLs as a dependency.
4. **“Featured means ranking unless we have a CMS.”** Home and category featured slices are pure functions (`takeFeatured`, `splitCategoryProducts`) with tests, not hardcoded IDs.
5. **“Own the AI output.”** After generation I checked ranking against live Fake Store ratings, stopped HTML `minLength` from hiding enquiry validation in tests, and kept SMTP behind `EmailSender` instead of sending mail from the route handler.

## Where the AI was wrong (and what I changed)

- A form with `minLength={10}` on the message field would have made the unit test depend on native browser validation and never show the “thank you” path’s error copy. I removed that HTML constraint and kept schema validation on the server plus an explicit client message.
- Enquiry form tests leaked DOM between cases until I added Testing Library `cleanup` in `src/test/setup.ts`.
- It is easy for an agent to put `fetch('https://fakestoreapi.com')` in React. The rule file and the `ProductCatalogue` port exist specifically so that does not happen.
- Vite `tsc -b` would have failed without project references; the web build is `tsc --noEmit && vite build`.
- Docker healthchecks need `wget` on the API image; the first Dockerfile sketch assumed it was already there.

Found in the Claude Code review pass:

- **Broken Docker build.** Both `apps/api/package.json` and `apps/web/package.json` had picked up `"product-catalogue": "file:../.."` (a link back to the repo root). It worked locally, but each Dockerfile builds with only its app folder as context, so `npm install` in the image could not resolve it. Removed from both manifests and lockfiles, and verified with a clean `npm ci` of each app in an isolated folder. CI now runs `docker compose build` so this class of bug fails the PR.
- **Boundary leak.** `http/errors.ts` imported `UpstreamUnavailableError` from the Fake Store adapter — exactly what rule 1 in `AGENTS.md` forbids. Moved to `CatalogueUnavailableError` on the port, and added `EmailDeliveryError` so SMTP failures return a clear 502 instead of a generic 500.
- **Dead config.** `EMAIL_PROVIDER=smtp` was in compose and `.env.example` but nothing read it. Removed rather than implying a switch that does not exist.
- **Untested failure paths.** The original tests covered the happy path only. Added tests for upstream down/malformed, unknown product enquiry, malformed JSON, email failure, rate limiting and bad config, plus a web-level walkthrough of every acceptance criterion.

I read every source file in `apps/api` and `apps/web` before considering the work done. The ranking numbers in the README were computed from the live Fake Store payload, not copied from the model.
