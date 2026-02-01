import type { Source } from "@/types/rag";

export function rerankSources(sources: Source[], query: string): Source[] {
  const queryLower = query.toLowerCase();
  const queryTokens = queryLower.split(/\s+/);

  const categoryPriority: Record<string, number> = {
    company: 3,
    products: 2,
    faqs: 1,
  };

  const scoredSources = sources.map((source) => {
    let score = source.relevanceScore;

    const titleLower = source.title.toLowerCase();
    const titleMatches = queryTokens.filter((token) => titleLower.includes(token)).length;
    score += titleMatches * 0.1;

    const contentLower = source.content.toLowerCase();
    const contentMatches = queryTokens.filter((token) => contentLower.includes(token)).length;
    score += contentMatches * 0.05;

    const categoryBoost = categoryPriority[source.category] || 0;
    score += categoryBoost * 0.05;

    return {
      ...source,
      finalScore: score,
    };
  });

  return scoredSources
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    .map(({ finalScore: _finalScore, ...source }) => source);
}
