# AIMate for POS

Enterprise AI voice ordering foundation for FoodHub POS integration.

## What is included

- FoodHub Partner API RAG knowledge base in `rag/foodhub`
- PRD v1.2 implementation blueprint in `docs/prd`
- Next.js dashboard in `apps/dashboard`
- Render-ready WebSocket voice bridge in `apps/voice-bridge`
- Shared TypeScript packages for domain models, FoodHub API access, RAG/menu search, payment mocks, telephony mocks, datastore locks, and voice tools
- Phase I-III implementation guide in `docs/phase-1-3-testing-and-credentials.md`

## Local setup

```bash
npm install
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env` and fill in real FoodHub, MongoDB, Redis, voice provider, telephony, payment, and webhook credentials when available.

## Development

```bash
npm run dev:dashboard
npm run dev:voice
```

Default local services:

- Dashboard: `http://127.0.0.1:3000`
- Voice bridge: `http://127.0.0.1:4100`

## Verification status

The scaffold currently passes:

- TypeScript typecheck
- Vitest unit tests
- Next.js production build
- Voice bridge health and WebSocket menu-search smoke test
- npm audit with zero moderate-or-higher vulnerabilities

Current Phase I-III implementation adds mock-safe order lifecycle tools, menu catalog refresh structure, and voice regression scenarios. FoodHub writes remain in clearly labeled mock mode until real FoodHub credentials are configured.
