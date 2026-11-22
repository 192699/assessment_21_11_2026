# Catalogue MVP

- Keep product data and email behind backend ports in `apps/api/src/ports`.
- Never call Fake Store (or any product source) from `apps/web`.
- Prefer changing adapters over changing React pages when the data source or email provider changes.
- Record new assumptions in `DECISIONS.md`.
