# AIMate Phase I-III Testing and Credentials Guide

This project can run in mock mode before FoodHub credentials arrive. Mock mode lets you test the cart, confirmation, payment-link structure, Twilio/Gemini wiring, and order submission flow without sending real orders to FoodHub.

## What Phase I-III now includes

- Phase I: call session, cart, customer details, fulfillment, order confirmation, mock/real FoodHub submission path, payment-link safety checks, and handoff payloads.
- Phase II: FoodHub menu catalog structure, fallback menu, live menu refresh path, menu webhook stale/refresh handling, and FoodHub menu normalization.
- Phase III: stronger system prompt, cart/action tool declarations, confirmation-before-submit rules, and voice regression scenarios.

## Local mock testing

1. Copy `.env.example` to `.env.local`.
2. Add at least `GEMINI_API_KEY` if you want to test the live voice model.
3. Keep FoodHub credentials blank until FoodHub gives them to you.
4. Run `npm install`.
5. Run `npm run typecheck`.
6. Run `npm test`.
7. Start the voice bridge with `npm run dev:voice`.
8. Start the dashboard with `npm run dev:dashboard`.

Default local URLs:

- Dashboard: `http://127.0.0.1:3000`
- Voice bridge health: `http://127.0.0.1:4100/health`
- Voice bridge readiness: `http://127.0.0.1:4100/ready`

## FoodHub credentials to request

Ask FoodHub for:

- Partner API base URL for staging/sandbox.
- Partner API base URL for production.
- OAuth/client credentials client ID.
- OAuth/client credentials client secret.
- Store ID for the test restaurant.
- Required scopes for menu read, store read, opening-hours read, order create, order get/list, order update/cancel if allowed.
- Webhook signing secret.
- Webhook event list enabled for menu, stock, opening hours, and order lifecycle events.
- Confirmation whether FoodHub supports a staging store where test orders do not hit a real kitchen.
- Confirmation of rate limits and whether `external_reference_id` can be used for reconciliation.

## Environment variables to fill later

```text
FOODHUB_BASE_URL=
FOODHUB_CLIENT_ID=
FOODHUB_CLIENT_SECRET=
FOODHUB_DEFAULT_STORE_ID=
FOODHUB_WEBHOOK_SECRET=
DEFAULT_DELIVERY_FEE_PENCE=
DEFAULT_STAFF_NUMBER=
```

Optional but useful for full manual testing:

```text
GEMINI_API_KEY=
GEMINI_LIVE_MODEL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TELEPHONY_PROVIDER=twilio
STRIPE_SECRET_KEY=
PAYMENT_PROVIDER=stripe
REDIS_URL=
MONGODB_URI=
MONGODB_DB=
```

## Where each environment variable goes

### Vercel

Use Vercel for the dashboard and serverless dashboard APIs only.

Add these in Vercel Project Settings > Environment Variables:

```text
APP_BASE_URL=https://your-vercel-domain.vercel.app
FOODHUB_BASE_URL=
FOODHUB_CLIENT_ID=
FOODHUB_CLIENT_SECRET=
FOODHUB_DEFAULT_STORE_ID=
FOODHUB_WEBHOOK_SECRET=
MONGODB_URI=
MONGODB_DB=
REDIS_URL=
DEFAULT_DELIVERY_FEE_PENCE=
```

Optional on Vercel:

```text
PAYMENT_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
PAYMENT_PROVIDER=stripe
```

Vercel should import this repository from the repository root. The root `vercel.json` builds only the dashboard with `npm run build:dashboard` and serves `apps/dashboard/.next`.

### Render

Use Render for the long-running voice bridge. Vercel should not host the voice WebSocket bridge.

Add these in Render Service > Environment:

```text
NODE_ENV=production
VOICE_BRIDGE_PORT=4100
APP_BASE_URL=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
FOODHUB_BASE_URL=
FOODHUB_CLIENT_ID=
FOODHUB_CLIENT_SECRET=
FOODHUB_DEFAULT_STORE_ID=
FOODHUB_WEBHOOK_SECRET=
REDIS_URL=
MONGODB_URI=
MONGODB_DB=
DEFAULT_STAFF_NUMBER=
DEFAULT_DELIVERY_FEE_PENCE=
```

If using Twilio phone calls:

```text
TELEPHONY_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

If using Stripe payment links:

```text
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

Recommended Render build/start commands:

```text
Build Command: npm install && npm run build:voice
Start Command: npm run start -w @aimate/voice-bridge
```

### Twilio

Use Twilio only when you are ready to test real calls.

Set the Twilio phone number voice webhook to:

```text
https://your-render-service.onrender.com/api/telephony/twilio/inbound?tenant_id=demo&store_id=YOUR_FOODHUB_STORE_ID&language=en
```

The voice bridge will return TwiML that connects the call to:

```text
wss://your-render-service.onrender.com/ws/voice-twilio
```

### Stripe

Use Stripe only for hosted card payment links.

Add the Stripe secret key to Render first, because the voice bridge creates payment links during calls:

```text
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_or_sk_test...
```

Add payment webhook handling later when you are ready to reconcile payment status.

## How to obtain credentials

### FoodHub

Email or ask your FoodHub partner/integration contact for Partner API access. Request:

1. Sandbox/staging API base URL.
2. Production API base URL.
3. Client ID.
4. Client secret.
5. Test restaurant store ID.
6. Allowed OAuth scopes.
7. Webhook signing secret.
8. Webhook setup screen or instructions.
9. Confirmation that sandbox orders will not print in a real restaurant.
10. FoodHub rate limits and retry guidance.

### Gemini

1. Open Google AI Studio or Google Cloud Vertex AI.
2. Create or select a project.
3. Enable Gemini API access.
4. Create an API key for development.
5. Put it in Render as `GEMINI_API_KEY`.

### Twilio

1. Open the Twilio Console.
2. Copy Account SID into `TWILIO_ACCOUNT_SID`.
3. Copy Auth Token into `TWILIO_AUTH_TOKEN`.
4. Buy or select a phone number.
5. Set the number's voice webhook to the Render inbound Twilio URL above.

### Stripe

1. Open Stripe Dashboard.
2. For testing, use Developers > API keys > Secret key.
3. Put it in Render as `STRIPE_SECRET_KEY`.
4. Keep `PAYMENT_PROVIDER=mock` until you are ready to create real hosted payment sessions.

## Manual test order flow

1. Start the voice bridge.
2. Open `/ready` and check FoodHub says `mock-mode` until credentials are added.
3. Use the voice test socket or Twilio media stream.
4. Ask for a demo item such as "chicken burger" or "cola".
5. Confirm collection or delivery.
6. Provide name and phone.
7. Ask for the cart summary.
8. Confirm the order.
9. Submit the order.
10. Before FoodHub credentials exist, the result should say `provider: mock-foodhub`.
11. After credentials exist, the result should say `provider: foodhub` and include a FoodHub order ID/resource URI.
