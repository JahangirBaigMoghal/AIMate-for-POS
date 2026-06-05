import path from "node:path";
import { loadJsonlChunks, searchChunks } from "@aimate/rag";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const type = url.searchParams.get("type") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;

  if (!query.trim()) {
    return Response.json({ ok: false, error: "Missing q query parameter" }, { status: 400 });
  }

  const chunksPath = path.join(process.cwd(), "..", "..", "rag", "foodhub", "normalized", "chunks.jsonl");
  const chunks = await loadJsonlChunks(chunksPath);
  return Response.json({
    ok: true,
    results: searchChunks(chunks, query, { type, tag, limit: 8, minScore: 2 })
  });
}
