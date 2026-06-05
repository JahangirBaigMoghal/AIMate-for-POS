import type { MenuEntity } from "@aimate/domain";

export type MenuSearchResult = MenuEntity & {
  score: number;
  reason: string;
};

export class MenuIndex {
  constructor(private readonly entities: MenuEntity[]) {}

  search(query: string, limit = 5): MenuSearchResult[] {
    const normalizedQuery = normalize(query);
    return this.entities
      .map((entity) => {
        const candidates = [entity.name, entity.name_localized, ...entity.aliases]
          .filter(Boolean)
          .map((value) => normalize(value as string));
        const exact = candidates.some((candidate) => candidate === normalizedQuery);
        const includes = candidates.some(
          (candidate) => candidate.includes(normalizedQuery) || normalizedQuery.includes(candidate)
        );
        const tokenOverlap = overlapScore(normalizedQuery, candidates.join(" "));
        const score = (exact ? 100 : 0) + (includes ? 40 : 0) + tokenOverlap;
        return {
          ...entity,
          score,
          reason: exact ? "exact_alias_or_name" : includes ? "partial_alias_or_name" : "token_overlap"
        };
      })
      .filter((result) => result.score > 0 && result.stock_status !== "UNAVAILABLE")
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function overlapScore(query: string, haystack: string): number {
  const queryTokens = new Set(query.split(/\s+/).filter(Boolean));
  const haystackTokens = new Set(haystack.split(/\s+/).filter(Boolean));
  let score = 0;
  for (const token of queryTokens) {
    if (haystackTokens.has(token)) score += 8;
  }
  return score;
}
