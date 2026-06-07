import { getMongoDb } from "@aimate/datastore";
import { NextResponse } from "next/server";

export async function GET() {
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB || "aimate";

  // Check which credentials are set in the environment
  const credentials = {
    mongodb: !!mongoUri,
    gemini: !!process.env.GEMINI_API_KEY,
    twilio: !!process.env.TWILIO_ACCOUNT_SID,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    foodhub: !!(process.env.FOODHUB_CLIENT_ID && process.env.FOODHUB_CLIENT_SECRET)
  };

  if (!mongoUri) {
    // Return mock/empty data if MongoDB is not configured, so the dashboard doesn't crash
    return NextResponse.json({
      ok: true,
      credentials,
      config: {
        ai_answering: false,
        order_commit: false,
        payment_links: false,
        handoff: false
      },
      sessions: [],
      attempts: [],
      webhooks: [],
      stats: {
        totalCalls: 0,
        activeCalls: 0,
        successfulOrders: 0,
        failedOrders: 0,
        paymentPending: 0
      }
    });
  }

  try {
    const db = await getMongoDb(mongoUri, mongoDbName);

    // 1. Fetch store configuration or set defaults
    const configDoc = await db.collection("store_configs").findOne({}, { sort: { version: -1 } });
    const config = {
      ai_answering: configDoc?.kill_switches?.ai_answering ?? !process.env.AIMATE_KILL_AI_ANSWERING,
      order_commit: configDoc?.kill_switches?.order_commit ?? !process.env.AIMATE_KILL_ORDER_COMMIT,
      payment_links: configDoc?.kill_switches?.payment_links ?? !process.env.AIMATE_KILL_PAYMENT_LINKS,
      handoff: configDoc?.kill_switches?.handoff ?? !process.env.AIMATE_KILL_HANDOFF,
      fallback_staff_number: configDoc?.staff_number ?? process.env.DEFAULT_STAFF_NUMBER ?? ""
    };

    // 2. Fetch call sessions
    const sessions = await db
      .collection("call_sessions")
      .find({})
      .sort({ started_at: -1 })
      .limit(50)
      .toArray();

    // 3. Fetch cart snapshots for these sessions
    const callIds = sessions.map((s) => s.call_id);
    const carts = await db
      .collection("cart_snapshots")
      .find({ call_id: { $in: callIds } })
      .toArray();

    // Group carts by call_id for fast lookup
    const cartMap: Record<string, any> = {};
    for (const cart of carts) {
      // Keep the latest version
      if (!cartMap[cart.call_id] || cartMap[cart.call_id].version < cart.version) {
        cartMap[cart.call_id] = cart;
      }
    }

    // Combine sessions with their cart summaries
    const sessionsWithCarts = sessions.map((session) => {
      const cartSnap = cartMap[session.call_id];
      return {
        ...session,
        cart: cartSnap ? cartSnap.cart : null,
        price: cartSnap ? cartSnap.price : null,
        summary: cartSnap ? cartSnap.summary : "No items"
      };
    });

    // 4. Fetch order attempts
    const attempts = await db
      .collection("order_attempts")
      .find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    // 5. Fetch webhook events
    const webhooks = await db
      .collection("webhook_events")
      .find({})
      .sort({ received_at: -1 })
      .limit(50)
      .toArray();

    // 6. Calculate statistics
    const totalCalls = await db.collection("call_sessions").countDocuments();
    const activeCalls = await db.collection("call_sessions").countDocuments({ status: { $ne: "ENDED" } });
    const successfulOrders = await db.collection("order_attempts").countDocuments({ state: "SUBMITTED" });
    const failedOrders = await db.collection("order_attempts").countDocuments({ state: "FAILED" });
    const paymentPending = await db.collection("payment_attempts").countDocuments({ status: "CREATED" });

    return NextResponse.json({
      ok: true,
      credentials,
      config,
      sessions: sessionsWithCarts,
      attempts,
      webhooks,
      stats: {
        totalCalls,
        activeCalls,
        successfulOrders,
        failedOrders,
        paymentPending
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Database connection error" },
      { status: 500 }
    );
  }
}
