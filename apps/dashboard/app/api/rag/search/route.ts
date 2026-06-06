import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

type RagChunk = {
  id: string;
  type?: string;
  tag?: string;
  method?: string;
  path?: string;
  name?: string;
  operationId?: string;
  text?: string;
};

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

async function loadJsonlChunks(filePath: string): Promise<RagChunk[]> {
  const text = await readFile(filePath, "utf8");
  return text
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RagChunk);
}

function searchChunks(
  chunks: RagChunk[],
  query: string,
  options: { type?: string; tag?: string; limit?: number; minScore?: number }
): Array<RagChunk & { score: number }> {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9_{}./:-]+/)
    .filter((term) => term.length > 1);
  return chunks
    .filter((chunk) => !options.type || chunk.type === options.type)
    .filter((chunk) => !options.tag || chunk.tag === options.tag)
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, terms, query) }))
    .filter((chunk) => chunk.score >= (options.minScore ?? 1))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 8);
}

function scoreChunk(chunk: RagChunk, terms: string[], query: string): number {
  const haystack = [
    chunk.id,
    chunk.type,
    chunk.tag,
    chunk.method,
    chunk.path,
    chunk.name,
    chunk.operationId,
    chunk.text
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const term of terms) {
    const occurrences = haystack.split(term).length - 1;
    score += Math.min(occurrences, 10);
    if (haystack.includes(term)) score += 2;
  }
  if (chunk.path && query.includes(chunk.path)) score += 50;
  if (chunk.operationId && query.includes(chunk.operationId)) score += 30;
  return score;
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
