import type { Source } from '@/types/rag';

const MAX_CONTEXT_LENGTH = 4000;

export function buildContext(sources: Source[]): string {
  let context = '';
  let currentLength = 0;
  for (const source of sources) {
    const sourceText = `[Source: ${source.title} (${source.category})]${source.content}---`;

    if (currentLength + sourceText.length > MAX_CONTEXT_LENGTH) {
      break;
    }

    context += sourceText;
    currentLength += sourceText.length;
  }

  return context.trim();
}

export function calculateConfidence(sources: Source[]): {
  score: number;
  level: 'high' | 'medium' | 'low';
} {
  if (sources.length === 0) {
    return { score: 0, level: 'low' };
  }

  const topSources = sources.slice(0, 3);
  const avgScore =
    topSources.reduce((sum, s) => sum + s.relevanceScore, 0) /
    topSources.length;

  let level: 'high' | 'medium' | 'low';
  if (avgScore >= 0.8) {
    level = 'high';
  } else if (avgScore >= 0.5) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score: avgScore, level };
}
