import { createHmac, timingSafeEqual } from "node:crypto";
import { loadEnv } from "@aimate/shared";

export async function POST(request: Request) {
  const env = loadEnv();
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";

  if (env.FOODHUB_WEBHOOK_SECRET && !isValidSignature(body, signature, env.FOODHUB_WEBHOOK_SECRET)) {
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
    event
  });
}

function isValidSignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
