import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const webhookSecret = process.env.FOODHUB_WEBHOOK_SECRET;

  if (webhookSecret && !isValidSignature(body, signature, webhookSecret)) {
    return Response.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    received: true,
    action: inferAction(event),
    event
  });
}

function isValidSignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

function inferAction(event: unknown): string {
  if (!event || typeof event !== "object") return "record_only";
  const eventType = String((event as { event_type?: unknown }).event_type ?? "");
  if (eventType.includes("MENU") || eventType.includes("ENTITY") || eventType.includes("STOCK")) {
    return "refresh_menu_snapshot";
  }
  if (eventType.includes("OPEN_CLOSE") || eventType.includes("HOURS")) {
    return "refresh_store_context";
  }
  if (eventType.includes("ORDER")) {
    return "reconcile_order";
  }
  return "record_only";
}
