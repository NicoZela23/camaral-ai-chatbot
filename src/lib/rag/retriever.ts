import { vectorStore } from './vectorStore';
import { generateEmbedding } from './embeddings';
import type { RetrievalResult, Source } from '@/types/rag';

const TOP_K = parseInt(process.env.RAG_TOP_K || '5', 10);

export async function retrieveContext(
  query: string,
  topK: number = TOP_K
): Promise<RetrievalResult> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const results = await vectorStore.query(queryEmbedding, topK);

    const sources: Source[] = results.documents.map((doc, index) => ({
      title: results.metadatas[index]?.title || 'Untitled',
      excerpt: doc.substring(0, 200) + '...',
      relevanceScore: 1 - (results.distances[index] || 0),
      category: results.metadatas[index]?.category || 'general',
      path: results.metadatas[index]?.source || '',
      content: doc,
    }));

    return {
      sources,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error retrieving context:', error);
    throw new Error('Failed to retrieve context');
  }
}
