import { readFile } from "node:fs/promises";

export type RagChunk = {
  id: string;
  type?: string;
  tag?: string;
  method?: string;
  path?: string;
  name?: string;
  operationId?: string;
  text?: string;
};

export type RagSearchOptions = {
  type?: string;
  tag?: string;
  limit?: number;
  minScore?: number;
};

export async function loadJsonlChunks(filePath: string): Promise<RagChunk[]> {
  const text = await readFile(filePath, "utf8");
  return text
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RagChunk);
}

export function searchChunks(
  chunks: RagChunk[],
  query: string,
  options: RagSearchOptions = {}
): Array<RagChunk & { score: number }> {
  const terms = tokenize(query);
  const filtered = chunks.filter((chunk) => {
    if (options.type && chunk.type !== options.type) return false;
    if (options.tag && chunk.tag !== options.tag) return false;
    return true;
  });

  return filtered
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

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9_{}./:-]+/)
    .filter((term) => term.length > 1);
}
