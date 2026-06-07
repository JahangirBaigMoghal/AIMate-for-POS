import { getMongoDb } from "@aimate/datastore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB || "aimate";

  if (!mongoUri) {
    return NextResponse.json({ ok: false, error: "MongoDB is not configured" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { ai_answering, order_commit, payment_links, handoff, fallback_staff_number } = body;

    const db = await getMongoDb(mongoUri, mongoDbName);
    const storeConfigs = db.collection("store_configs");

    // Get the latest configuration version
    const latestConfig = await storeConfigs.findOne({}, { sort: { version: -1 } });
    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    const now = new Date().toISOString();
    const newConfig = {
      tenant_id: latestConfig?.tenant_id || "demo",
      store_id: latestConfig?.store_id || "demo-store",
      version: nextVersion,
      staff_number: fallback_staff_number ?? latestConfig?.staff_number ?? "",
      kill_switches: {
        ai_answering: typeof ai_answering === "boolean" ? ai_answering : (latestConfig?.kill_switches?.ai_answering ?? true),
        order_commit: typeof order_commit === "boolean" ? order_commit : (latestConfig?.kill_switches?.order_commit ?? true),
        payment_links: typeof payment_links === "boolean" ? payment_links : (latestConfig?.kill_switches?.payment_links ?? true),
        handoff: typeof handoff === "boolean" ? handoff : (latestConfig?.kill_switches?.handoff ?? true)
      },
      created_at: latestConfig?.created_at || now,
      updated_at: now
    };

    await storeConfigs.insertOne(newConfig);

    return NextResponse.json({ ok: true, config: newConfig });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
