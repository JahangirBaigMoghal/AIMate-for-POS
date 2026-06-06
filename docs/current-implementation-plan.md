# AIMate Current Implementation Plan

Audit date: 2026-06-06
Latest pre-Phase-0 audited commit: `909da19`
Phase 0 implementation status: completed in this changeset

This document redrafts the implementation plan after reviewing the PRD, the older enterprise analysis, the Phase I-III guide, and the current codebase. It is intended to be the working source of truth for what is complete, what is partial, and what still needs to be built before AIMate can be treated as production-ready.

## Documents Reviewed

- `docs/prd/aimate-foodhub-ai-voice-agent-prd.md`
- `docs/prd/aimate-pos-comprehensive-analysis.md`
- `docs/phase-1-3-testing-and-credentials.md`
- Current app/package code under `apps/*` and `packages/*`
- Local FoodHub RAG under `rag/foodhub`

## External Research Notes

- Gemini Live is the right class of API for low-latency bidirectional voice, interruption, function calling, and server-to-server usage. The current model should stay pinned to `gemini-2.5-flash-native-audio-preview-12-2025` unless changed through a planned canary.
- Twilio phone ordering needs bidirectional `<Connect><Stream>` for the assistant to speak back to the caller. A fallback TwiML instruction after the stream is useful if the stream ends.
- Render Web Services should bind the public HTTP/WebSocket server to `process.env.PORT` on `0.0.0.0`.
- Vercel monorepo deployments should configure the correct project root for the dashboard and let Next.js own the `.next` output.
- Payment flow must avoid collecting card number, CVV, or expiry by voice. Hosted provider payment links keep the app away from raw card data.
- Production observability should use correlated traces, metrics, and logs, with `call_id`, `tenant_id`, `store_id`, `order_attempt_id`, and provider request IDs propagated.
- Menu and API retrieval should move from keyword-only search to hybrid lexical plus vector search before production voice ordering depends on it.

## Current Status Summary

The project has moved beyond the older analysis document, which said there was no application code. There is now a working TypeScript monorepo with a dashboard, voice bridge, FoodHub client, Gemini Live bridge, Twilio media-stream support, mock-safe order workflow, payment adapter shape, menu normalization, tests, and deployment configuration.

However, the current implementation is still best classified as a controlled MVP scaffold. Phase 0 has now added durable Mongo-backed operational records, webhook idempotency, production env checks, readiness visibility, and kill switches. It is still not enterprise production-ready because the next high-risk requirements around real FoodHub staging validation, payment reconciliation, dashboard auth/RBAC, full observability, and operational runbooks are not complete.

## Completed To Date

### Foundation

- Monorepo scaffold exists with `apps/dashboard`, `apps/voice-bridge`, and shared packages.
- TypeScript, npm workspaces, tests, typecheck, and production build scripts exist.
- Generated FoodHub OpenAPI TypeScript types exist in `packages/foodhub/src/generated`.
- Local FoodHub API RAG exists in normalized JSONL, markdown, manifest, and retrieval-map form.
- `.env.example` includes the main deployment variables.
- Dashboard Vercel config exists at `apps/dashboard/vercel.json`.

### Voice Runtime

- Fastify voice bridge runs as a long-lived Render-compatible service.
- Voice bridge binds to `process.env.PORT` when Render supplies it.
- Health and readiness endpoints exist.
- Gemini Live WebSocket wrapper exists.
- Gemini server errors are now surfaced instead of silently failing.
- Twilio inbound webhook returns TwiML and opens bidirectional media streaming.
- Twilio mu-law audio is converted to PCM for Gemini, and Gemini audio is converted back to mu-law for Twilio.
- Twilio/Gemini setup now sends an opening assistant prompt so the call does not go blank after the welcome greeting.
- If Gemini is missing or fails, the call closes in a way that allows Twilio fallback speech.
- Barge-in/interruption handling sends a Twilio `clear` event.

### Domain, Prompt, and Tools

- System prompt exists and includes closed-world menu/pricing rules, payment safety, confirmation rules, handoff rules, and tool discipline.
- Gemini tool declarations exist for menu search, cart updates, customer details, fulfillment, confirmation, FoodHub order creation, payment links, and staff handoff.
- Zod schemas exist for tool inputs, cart, customer details, delivery address, price breakdown, and FoodHub create-order payloads.
- Voice workflow blocks FoodHub order creation until explicit confirmation.
- Payment link creation rejects amount mismatch against the confirmed order total.
- Regression scenarios exist for simple orders, delivery address confirmation, ambiguity, allergy handoff, and online payment link safety.

### FoodHub and Menu

- FoodHub client supports token retrieval, store lookup, opening-hours lookup, menu fetch, order list/get, and create-order.
- FoodHub create-order payload is validated locally before submission.
- Retry and circuit-breaker primitives exist.
- Redis token store exists.
- Menu catalog can refresh from FoodHub when credentials exist and fall back to demo menu when they do not.
- Menu normalizer extracts searchable entities from FoodHub-like nested menu data.
- Menu index supports exact, partial, alias, token-overlap, stock, and fulfillment-mode filtering.
- FoodHub webhook endpoints exist in both dashboard and voice bridge.

### Payments, Telephony, and State

- Mock payment provider exists.
- Stripe Checkout Session adapter exists.
- Mock telephony provider exists.
- Twilio transfer adapter exists.
- Redis lock manager exists for order-submit locking.
- MongoDB connection helper, tenant/store-safe repositories, required index definitions, durable call/cart/order/payment persistence, prompt-version observation, audit events, and webhook event idempotency exist.
- Production voice bridge readiness exposes MongoDB status, kill switches, and env validation.
- Emergency kill switches exist for AI answering, order commit, payment links, and handoff.

### Dashboard

- Next.js dashboard builds successfully.
- Dashboard landing/control-center scaffold exists.
- Dashboard health route exists.
- RAG search API route exists.
- FoodHub webhook route verifies HMAC when a secret is configured.

### Verification

- `npm run build:dashboard` passes.
- `npm run build:voice` passes.
- `npm run typecheck` passes.
- `npm test` passes.
- `npm audit --audit-level=moderate` reports zero vulnerabilities.

## Phase 0 Completed

- MongoDB write-through persistence for active call workflow.
- Tenant/store-leading indexes for operational collections.
- Durable records for call sessions, cart snapshots, order attempts, payment attempts, webhook events, audit events, prompt versions, menu snapshots, store configs, and credential metadata.
- Raw-body FoodHub webhook HMAC verification.
- Webhook event idempotency by provider/event ID, with duplicate-safe responses.
- Production env validation for voice bridge deployment.
- `/ready` exposes MongoDB status, production env validation, and kill switch state.
- Emergency kill switches for AI answering, order commit, payment links, and handoff.
- Tests for durable workflow writes, webhook idempotency, raw-body signatures, kill switches, typecheck, builds, and audit.

## Partially Complete

- FoodHub integration is structurally present, but not validated against real FoodHub staging credentials.
- Order creation can call FoodHub if credentials are configured, and order attempts are now persisted, but reconciliation after timeout/ambiguous commit is not complete.
- Webhook signature checks and idempotent storage exist, but queue-backed async processing and replay tooling are not complete.
- MongoDB now stores operational milestones, but active call recovery after process restart still needs a formal resume/handoff strategy.
- Redis is used for tokens and locks when configured, but call heartbeat/session recovery is not implemented.
- Stripe Checkout adapter exists, and payment attempts are persisted, but success/cancel URLs, webhook verification, and reconciliation are not complete.
- Handoff can redirect a Twilio call, but there is no staff dashboard, call queue, screen-pop, SMS alert, or failed-handoff loop control.
- Dashboard is an informational scaffold, not an authenticated operational console.
- RAG/API search is keyword-based, not hybrid vector plus lexical search.
- Menu normalization exists, but required modifiers, min/max rules, half-and-half placement, deals, coupons, delivery zones, and taxes are not fully enforced.
- Prompt version hash is tracked and persisted during session start, but prompt approval, versioning, canary, and rollback workflow are not implemented.

## Not Yet Complete

### Production-Critical Gaps

- Real FoodHub sandbox credentials and end-to-end FoodHub order tests.
- Durable MongoDB-backed call sessions, carts, order attempts, payment attempts, webhook events, handoff sessions, audit events, prompt versions, and menu snapshots.
- Per-tenant and per-store credential storage with encryption and least-privilege separation.
- Raw-body webhook verification and idempotent event processing.
- Order reconciliation job across internal state, FoodHub state, payment state, and SMS state.
- Payment webhooks, payment success/failure state machine, stale-payment alerts, and revenue-protection dashboard.
- Admin authentication, RBAC, tenant/store access control, and PII redaction.
- Live dashboard for calls, failed orders, handoffs, API health, webhook health, latency, and provider status.
- OpenTelemetry traces/metrics/log correlation.
- Production alerts, runbooks, incident severity process, and kill switches.
- Voice/load testing for concurrent calls, restarts, provider errors, and FoodHub timeouts.
- CI/CD gates for contract tests, security scan, regression scenarios, and deployment promotion.

### PRD Feature Gaps

- Order amendments.
- Order cancellation.
- Refund flow.
- Order status update.
- Driver assignment and unassignment.
- Store status pause/resume controls.
- Deals and coupon lookup/application.
- Address validation and delivery-zone enforcement.
- Pre-order and scheduled-order flow.
- Multi-language policy and per-store language configuration.
- Admin-managed menu aliases and multilingual synonyms.
- Noise confidence metrics and audio-quality fallback.
- SMS ordering link/callback fallback.
- Multi-store enterprise controls.
- Provider failover between Gemini and another realtime voice provider.
- Disaster recovery drills and RTO/RPO validation.

## Redrafted Phase Plan

### Phase 0 - Production Foundation Reset

Goal: turn the current scaffold into a durable, testable backend foundation.

Status: completed for code-level foundation, with deeper recovery/replay work carried into Phase 1/2.

1. Done: wire MongoDB write-through persistence into the voice workflow.
2. Done: persist `call_sessions`, `cart_snapshots`, `order_attempts`, `payment_attempts`, `webhook_events`, `audit_events`, `prompt_versions`, `menu_snapshots`, `store_configs`, and `credential_metadata`.
3. Done: enforce tenant/store partition filters and indexes in repositories.
4. Partial: credential metadata structure exists; encrypted credential onboarding UI is deferred to Phase 1/3.
5. Partial: store configuration records exist; replacing all `demo-store` defaults is deferred to Phase 1.
6. Done: production env validation for the voice bridge.
7. Done: raw request body preservation for FoodHub webhook signature checks.
8. Done: idempotent webhook event storage and duplicate-safe response path.
9. Partial: trace IDs are introduced for webhook processing; full OpenTelemetry export is Phase 3.
10. Done: kill switches for AI answering, FoodHub order commit, payment links, and handoff.

Exit criteria:

- A call can restart or fail without losing committed milestones.
- Every stored record includes correct tenant/store ownership.
- Webhook events are stored exactly once.
- Production readiness can be measured from data, not logs only.

### Phase 1 - Controlled FoodHub Staging MVP

Goal: prove real ordering safely in FoodHub staging/sandbox.

1. Add FoodHub staging credentials and verify token, store, opening-hours, menu, and create-order endpoints.
2. Build FoodHub contract tests from the local OpenAPI and staging examples.
3. Validate create-order payloads against real FoodHub responses.
4. Implement order-attempt ledger with unique `external_reference_id`.
5. Implement reconciliation after timeout or ambiguous create-order result.
6. Enforce store open/closed status before taking an order.
7. Enforce live menu item IDs, item availability, and current price.
8. Build reliable delivery vs collection flow.
9. Add address read-back and delivery address confirmation.
10. Add Twilio call status callbacks and call lifecycle audit.
11. Add first authenticated dashboard pages for call history, order attempts, webhooks, and readiness.

Exit criteria:

- A confirmed call creates a valid FoodHub staging order.
- Duplicate order submission is prevented.
- If FoodHub fails, the call hands off or fails visibly.
- Store owner can see call/order outcome in the dashboard.

### Phase 2 - Payment, Handoff, and Operations

Goal: make the MVP usable under real restaurant pressure.

1. Complete Stripe hosted payment links with real success/cancel URLs.
2. Add Stripe webhook verification and payment state persistence.
3. Add payment/FoodHub reconciliation every 5 minutes.
4. Add stale-payment, paid-without-order, and order-without-payment alerts.
5. Implement warm handoff screen-pop/briefing storage.
6. Add staff number/store config management.
7. Add failed-handoff loop prevention and callback/message fallback.
8. Add delivery-zone validation and postcode/address validation.
9. Add dashboard alerts for FoodHub errors, Gemini errors, Twilio stream errors, and webhook failures.
10. Add basic production runbooks.

Exit criteria:

- Card payments use hosted links only.
- Payment state cannot silently diverge from order state.
- Staff handoff includes a useful briefing.
- On-call/support can diagnose failed calls from dashboard and logs.

### Phase 3 - Enterprise Hardening

Goal: meet the PRD's enterprise control requirements.

1. Add auth/RBAC for dashboard users.
2. Add audit log, PII redaction, retention controls, and export/delete workflow.
3. Add prompt registry with version approval, regression tests, canary release, and rollback.
4. Add model/provider routing and failover strategy.
5. Add call heartbeat snapshots in Redis.
6. Add concurrent call limits per tenant/store.
7. Add load tests for 10, 100, and then 1000+ concurrent-call planning.
8. Add hybrid API/menu RAG using vector plus lexical search.
9. Add retrieval evaluation suite with expected results and quality metrics.
10. Add CI/CD release gates for tests, contract tests, security scan, and voice regression.
11. Add disaster recovery runbooks and periodic restore tests.

Exit criteria:

- Controlled paid traffic can run with monitoring, rollback, and auditability.
- Store data is isolated.
- Prompt/model changes are governed.
- Retrieval quality is measured, not guessed.

### Phase 4 - Operational Completeness

Goal: expand beyond new order-taking.

1. Order lookup with caller verification.
2. Cancel order flow.
3. Amend order flow.
4. Refund flow where FoodHub/store policy allows it.
5. Status update flow where allowed.
6. Deals and coupons lookup/application.
7. Driver assignment/unassignment where allowed.
8. Store pause/resume controls for managers.
9. Pre-order and scheduled-order support.
10. SMS ordering link and callback workflows.

Exit criteria:

- The agent can handle common post-order customer calls safely.
- Admin-only operations are gated and audited.
- The voice agent no longer depends on staff for every non-new-order workflow.

### Phase 5 - Advanced Automation and Scale

Goal: move from MVP restaurant assistant to enterprise platform.

1. Multi-store chain dashboard.
2. Per-store voice, language, hours, handoff, payment, and policy configuration.
3. Provider failover and multi-region voice bridge planning.
4. Cost dashboard by tenant/store for AI, telephony, SMS, infrastructure, and payment fees.
5. Upsell/cross-sell framework grounded only in live FoodHub data.
6. Advanced QA review with transcript/audio redaction.
7. Staff workflow integrations.
8. Automated onboarding checklist for new stores.

## Recommended Immediate Next Sprint

The next sprint should move directly into Phase 1. The key risk is no longer "do we have a durable scaffold?" It is "can we safely create and reconcile real FoodHub staging orders?"

1. Add real FoodHub staging smoke tests once credentials arrive.
2. Add order-attempt reconciliation logic.
3. Replace remaining `demo-store` defaults with Mongo-backed store config.
4. Add Stripe webhook/payment reconciliation if payments are part of first pilot.
5. Add dashboard auth and the first real operational pages.
6. Add queue-backed webhook processing and replay tooling.
7. Add OpenTelemetry exporter wiring and alert destinations.
8. Add deployment runbook and incident checklist.

## Manual Credential Dependency

Before full end-to-end production testing, the project still needs:

- FoodHub sandbox base URL.
- FoodHub production base URL.
- FoodHub client ID.
- FoodHub client secret.
- FoodHub test store ID.
- FoodHub scopes.
- FoodHub webhook secret.
- Confirmation of FoodHub staging behavior and rate limits.
- Gemini API key or Vertex AI project/service account.
- Twilio account SID, auth token, phone number, and webhook URL.
- MongoDB Atlas URI and database name.
- Redis URL.
- Stripe secret key and webhook signing secret if card payments are tested.
- Staff phone number for handoff.

## Production Readiness Verdict

Current verdict: not production-ready yet, but the scaffold is healthy and moving in the right direction.

Best next milestone: "FoodHub staging MVP with durable state." Once that is complete, the product can enter a controlled pilot with a single restaurant and strict monitoring. Paid live traffic should wait until Phase 0 and Phase 1 exit criteria are met.
