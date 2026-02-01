import type { Message } from "./chat";

export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  sessionId?: string;
}

export interface IngestRequest {
  force?: boolean;
}

export interface IngestResponse {
  success: boolean;
  documentsProcessed: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  duration: number;
  errors?: string[];
}
