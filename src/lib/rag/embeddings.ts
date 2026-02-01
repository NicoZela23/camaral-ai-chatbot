import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let embeddingModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

function getEmbeddingModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  }

  return embeddingModel!;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const model = getEmbeddingModel();

  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  try {
    const result = await model.embedContent(text);

    let embedding: number[];
    if (result.embedding?.values) {
      embedding = result.embedding.values;
    } else if (Array.isArray(result.embedding)) {
      embedding = result.embedding;
    } else {
      throw new Error("Unexpected embedding format from API");
    }

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Invalid embedding: empty or not an array");
    }

    embedding = embedding.map((val) => Number(val));

    return embedding;
  } catch (error: unknown) {
    console.error("Error generating embedding:", error);

    if (error instanceof Error) {
      const errorObj = error as Error & { status?: number };
      if (errorObj.status === 400 && error.message?.includes("API key")) {
        throw new Error(
          "Invalid GEMINI_API_KEY. Please check your API key in .env.local or .env file. " +
            "Get a valid key from: https://makersuite.google.com/app/apikey"
        );
      }
      throw new Error(`Failed to generate embedding: ${error.message || "Unknown error"}`);
    }

    throw new Error("Failed to generate embedding: Unknown error");
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)));
    return embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}
