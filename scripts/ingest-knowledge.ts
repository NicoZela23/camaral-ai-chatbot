import dotenv from "dotenv";
import { resolve } from "path";


const envPath = resolve(process.cwd(), ".env.local");
const envPathFallback = resolve(process.cwd(), ".env");

if (require("fs").existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (require("fs").existsSync(envPathFallback)) {
  dotenv.config({ path: envPathFallback });
} else {
  dotenv.config();
}

import fs from "fs";
import path from "path";
import { vectorStore } from "../src/lib/rag/vectorStore";
import { generateEmbedding } from "../src/lib/rag/embeddings";
import type { ChromaDocument } from "../src/types/rag";

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "src/knowledge-base");
const CHUNK_SIZE = parseInt(process.env.RAG_CHUNK_SIZE || "500", 10);
const CHUNK_OVERLAP = parseInt(process.env.RAG_CHUNK_OVERLAP || "50", 10);

interface KnowledgeIndex {
  documents: Array<{
    id: string;
    title: string;
    category: string;
    tags: string[];
    path: string;
    priority: number;
  }>;
}

async function chunkDocument(
  content: string,
  chunkSize: number,
  overlap: number
): Promise<string[]> {
  const chunks: string[] = [];
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = currentChunk.slice(-overlap) + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

export async function ingestKnowledgeBase() {
  console.log("Starting knowledge base ingestion...\n");

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("Error: GEMINI_API_KEY is not set or is using the placeholder value");
    process.exit(1);
  }

  if (process.env.GEMINI_API_KEY.length < 20) {
    console.error("Error: GEMINI_API_KEY appears to be invalid (too short)");
    console.error("   Please verify your API key is correct");
    process.exit(1);
  }

  try {
    const indexPath = path.join(KNOWLEDGE_BASE_DIR, "index.json");
    const indexData: KnowledgeIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

    console.log(`Found ${indexData.documents.length} documents to process\n`);

    await vectorStore.initialize();
    console.log("Connected to ChromaDB\n");

    await vectorStore.reset();
    console.log("Reset collection\n");

    let totalChunks = 0;
    const chromaDocuments: ChromaDocument[] = [];

    for (const docMeta of indexData.documents) {
      console.log(`Processing: ${docMeta.title}`);

      const filePath = path.join(KNOWLEDGE_BASE_DIR, docMeta.path);
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, "utf-8");

      const chunks = await chunkDocument(content, CHUNK_SIZE, CHUNK_OVERLAP);
      console.log(`   └─ Created ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkTitle =
          i === 0 ? extractTitle(content) : `${extractTitle(content)} (Part ${i + 1})`;

        console.log(`   └─ Generating embedding for chunk ${i + 1}/${chunks.length}...`);
        const embedding = await generateEmbedding(chunk);

        chromaDocuments.push({
          id: `doc_${totalChunks}`,
          embedding,
          document: chunk,
          metadata: {
            source: docMeta.path,
            title: chunkTitle,
            category: docMeta.category,
            tags: docMeta.tags,
            chunkIndex: i,
            totalChunks: chunks.length,
            createdAt: new Date().toISOString(),
          },
        });

        totalChunks++;
      }

      console.log(`Completed: ${docMeta.title}\n`);
    }

    const batchSize = 50;
    const totalBatches = Math.ceil(chromaDocuments.length / batchSize);

    for (let i = 0; i < chromaDocuments.length; i += batchSize) {
      const batch = chromaDocuments.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      try {
        await vectorStore.addDocuments(batch);
        console.log(
          `   └─ Stored batch ${batchNumber}/${totalBatches} (${batch.length} documents)`
        );
        
        if (i + batchSize < chromaDocuments.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to store batch ${batchNumber}`);
        throw error;
      }
    }

    console.log("\nIngestion complete!");
    console.log(`Statistics:`);
    console.log(`      - Documents processed: ${indexData.documents.length}`);
    console.log(`      - Total chunks created: ${totalChunks}`);
    console.log(`      - Embeddings generated: ${totalChunks}`);

    const count = await vectorStore.count();
    console.log(`      - Documents in vector store: ${count}`);

    return {
      documentsProcessed: indexData.documents.length,
      chunksCreated: totalChunks,
      embeddingsGenerated: totalChunks,
      errors: [],
    };
  } catch (error) {
    console.error("\nError during ingestion:", error);
    throw error;
  }
}

if (require.main === module) {
  ingestKnowledgeBase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
