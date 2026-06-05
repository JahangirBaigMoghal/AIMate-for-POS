import { readFile } from "node:fs/promises";
import path from "node:path";

const query = process.argv.slice(2).join(" ").trim();

if (!query) {
  console.error("Usage: node tools/search-foodhub-rag.mjs <query>");
  process.exit(1);
}

const chunksPath = path.join(process.cwd(), "rag", "foodhub", "normalized", "chunks.jsonl");
const text = await readFile(chunksPath, "utf8");
const chunks = text
  .trim()
  .split(/\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const terms = query
  .toLowerCase()
  .split(/[^a-z0-9_{}./:-]+/)
  .filter((term) => term.length > 1);

function score(chunk) {
  const haystack = `${chunk.id} ${chunk.type ?? ""} ${chunk.tag ?? ""} ${chunk.method ?? ""} ${chunk.path ?? ""} ${chunk.name ?? ""} ${chunk.operationId ?? ""} ${chunk.text ?? ""}`.toLowerCase();
  let total = 0;

  for (const term of terms) {
    const exact = haystack.includes(term) ? 4 : 0;
    const occurrences = haystack.split(term).length - 1;
    total += exact + Math.min(occurrences, 12);
  }

  if (chunk.path && query.includes(chunk.path)) total += 50;
  if (chunk.name && query.toLowerCase().includes(chunk.name.toLowerCase())) total += 40;
  if (chunk.operationId && query.toLowerCase().includes(chunk.operationId.toLowerCase())) {
    total += 40;
  }

  return total;
}

const results = chunks
  .map((chunk) => ({ chunk, score: score(chunk) }))
  .filter((row) => row.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8);

for (const { chunk, score: value } of results) {
  const label = [
    chunk.type,
    chunk.method,
    chunk.path,
    chunk.name,
    chunk.tag,
    chunk.id,
  ]
    .filter(Boolean)
    .join(" | ");
  const preview = String(chunk.text ?? "")
    .replace(/\s+/g, " ")
    .slice(0, 900);

  console.log(`\nScore: ${value}`);
  console.log(label);
  console.log(preview);
}
