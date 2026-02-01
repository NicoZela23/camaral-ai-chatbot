import type { ChromaDocument } from "@/types/rag";

let ChromaClient: any;
let Collection: any;

async function getChromaClient() {
  if (typeof window !== "undefined") {
    throw new Error("ChromaDB can only be used on the server");
  }

  if (!ChromaClient) {
    const chromadb = await import("chromadb");
    ChromaClient = chromadb.ChromaClient;
    Collection = chromadb.Collection;
  }

  return { ChromaClient, Collection };
}

const COLLECTION_NAME = "camaral_knowledge";

export class VectorStore {
  private client: any;
  private collection: any = null;
  private chromaInitialized = false;

  constructor() {
  }

  private async ensureChromaLoaded() {
    if (!this.chromaInitialized) {
      const { ChromaClient: ChromaClientClass } = await getChromaClient();
      const chromaUrl = process.env.CHROMADB_URL || "http://localhost:8000";
      this.client = new ChromaClientClass({
        path: chromaUrl,
      });
      this.chromaInitialized = true;
    }
  }

  async initialize(): Promise<void> {
    try {
      await this.ensureChromaLoaded();
      this.collection = await this.client.getOrCreateCollection({
        name: COLLECTION_NAME,
      });
    } catch (error) {
      console.error("Error initializing ChromaDB:", error);
      throw new Error("Failed to initialize vector store");
    }
  }

  async addDocuments(documents: ChromaDocument[]): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    if (documents.length === 0) {
      console.warn("No documents to add");
      return;
    }

    try {
      for (const doc of documents) {
        if (!doc.id || !doc.embedding || !doc.document) {
          throw new Error(`Invalid document: missing required fields for doc ${doc.id}`);
        }
        if (!Array.isArray(doc.embedding) || doc.embedding.length === 0) {
          throw new Error(`Invalid embedding for doc ${doc.id}: must be non-empty array`);
        }
      }

      const metadatas = documents.map((doc) => {
        const metadata = { ...doc.metadata };
        let tagsValue = "";
        if (Array.isArray(metadata.tags)) {
          tagsValue = metadata.tags.join(",");
        } else if (metadata.tags) {
          tagsValue = String(metadata.tags);
        }

        return {
          source: String(metadata.source || "").substring(0, 200),
          title: String(metadata.title || "Untitled").substring(0, 200),
          category: String(metadata.category || "general").substring(0, 50),
          tags: tagsValue.substring(0, 500),
          chunkIndex: Number(metadata.chunkIndex) || 0,
          totalChunks: Number(metadata.totalChunks) || 0,
          createdAt: String(metadata.createdAt || new Date().toISOString()).substring(0, 50),
        };
      });
      
      const ids = documents.map((doc) => doc.id);
      const embeddings = documents.map((doc) => doc.embedding);
      const documentTexts = documents.map((doc) => doc.document);

      await this.collection!.add({
        ids: ids,
        embeddings: embeddings,
        documents: documentTexts,
        metadatas: metadatas,
      });
    } catch (error: any) {
      console.error("Error adding documents:", error);
      if (error.message) {
        console.error("Error message:", error.message);
      }
      if (documents.length > 0) {
        console.error("First document sample:", {
          id: documents[0]?.id,
          embeddingLength: documents[0]?.embedding?.length,
          documentLength: documents[0]?.document?.length,
          metadata: documents[0]?.metadata,
        });
      }
      throw new Error(
        `Failed to add documents to vector store: ${error.message || "Unknown error"}`
      );
    }
  }

  async query(
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<{
    documents: string[];
    metadatas: any[];
    distances: number[];
  }> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      const results = await this.collection!.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
      });

      return {
        documents: results.documents[0] || [],
        metadatas: results.metadatas[0] || [],
        distances: results.distances?.[0] || [],
      };
    } catch (error) {
      console.error("Error querying vector store:", error);
      throw new Error("Failed to query vector store");
    }
  }

  async reset(): Promise<void> {
    try {
      await this.ensureChromaLoaded();
      await this.client.deleteCollection({ name: COLLECTION_NAME });
      await this.initialize();
    } catch (error) {
      console.error("Error resetting collection:", error);
      throw new Error("Failed to reset vector store");
    }
  }

  async count(): Promise<number> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      const result = await this.collection!.count();
      return result;
    } catch (error) {
      console.error("Error counting documents:", error);
      return 0;
    }
  }
}

export const vectorStore = new VectorStore();
