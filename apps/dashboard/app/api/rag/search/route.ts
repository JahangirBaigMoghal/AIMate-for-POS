import { existsSync } from "node:fs";
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

  const chunksPath = findChunksPath();
  const chunks = await loadJsonlChunks(chunksPath);
  return Response.json({
    ok: true,
    results: searchChunks(chunks, query, { type, tag, limit: 8, minScore: 2 })
  });
}

function findChunksPath(): string {
  const candidates = [
    path.join(process.cwd(), "rag", "foodhub", "normalized", "chunks.jsonl"),
    path.join(process.cwd(), "..", "..", "rag", "foodhub", "normalized", "chunks.jsonl"),
    path.join(process.cwd(), "..", "rag", "foodhub", "normalized", "chunks.jsonl")
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("FoodHub RAG chunks file was not found in the deployment bundle.");
  }
  return found;
}
