export interface ChromaDocument {
  id: string;
  embedding: number[];
  document: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  source: string;
  title: string;
  category: string;
  tags: string[];
  chunkIndex: number;
  totalChunks: number;
  createdAt: string;
}

export interface Source {
  title: string;
  excerpt: string;
  content: string;
  relevanceScore: number;
  category: string;
  path: string;
}

export interface RetrievalResult {
  sources: Source[];
  query: string;
  timestamp: string;
}

export interface RerankedSource extends Source {
  finalScore?: number;
}
