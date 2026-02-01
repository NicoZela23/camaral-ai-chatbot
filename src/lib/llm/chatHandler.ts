import { getGeminiModel, geminiConfig } from "./gemini";
import {
  buildPrompt,
  shouldAddFallback,
  FALLBACK_MESSAGE,
  OUT_OF_CONTEXT_MESSAGE,
  isOutOfContext,
} from "./prompts";
import { retrieveContext } from "../rag/retriever";
import { rerankSources } from "../rag/reranker";
import { buildContext, calculateConfidence } from "../rag/contextBuilder";
import type { ChatResponse, Message } from "@/types/chat";

export async function* handleChat(
  message: string,
  conversationHistory: Message[] = []
): AsyncGenerator<ChatResponse> {
  try {
    yield {
      type: "status",
      data: { stage: "embedding" },
    };

    const retrieval = await retrieveContext(message);

    yield {
      type: "status",
      data: { stage: "searching" },
    };

    const rerankedSources = rerankSources(retrieval.sources, message);
    const confidence = calculateConfidence(rerankedSources);
    const outOfContext = isOutOfContext(confidence.score, rerankedSources);

    if (outOfContext && process.env.NODE_ENV === "development") {
      console.log("Out of context detected:", {
        confidence: confidence.score,
        sourcesCount: rerankedSources.length,
        topSourceScore: rerankedSources[0]?.relevanceScore,
        topSourceTitle: rerankedSources[0]?.title,
        query: message,
      });
    }

    yield {
      type: "sources",
      data: {
        sources: rerankedSources.slice(0, 5).map((s) => ({
          title: s.title,
          excerpt: s.excerpt,
          relevanceScore: s.relevanceScore,
          category: s.category,
          path: s.path,
        })),
      },
    };

    yield {
      type: "confidence",
      data: confidence,
    };

    let fullResponse = "";
    if (outOfContext) {
      fullResponse = OUT_OF_CONTEXT_MESSAGE;

      yield {
        type: "status",
        data: { stage: "generating" },
      };

      yield {
        type: "chunk",
        data: { text: OUT_OF_CONTEXT_MESSAGE },
      };
    } else {
      yield {
        type: "status",
        data: { stage: "generating" },
      };
    
      const context = buildContext(rerankedSources);
      const prompt = buildPrompt(
        message,
        context,
        conversationHistory.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      const model = getGeminiModel();

      try {
        const result = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        if (!result || !result.stream) {
          throw new Error("Failed to get stream from Gemini API - result.stream is undefined");
        }

        for await (const chunk of result.stream) {
          try {
            const chunkText = chunk.text();
            if (chunkText) {
              fullResponse += chunkText;

              yield {
                type: "chunk",
                data: { text: chunkText },
              };
            }
          } catch (chunkError) {
            console.error("Error processing chunk:", chunkError);
          }
        }
      } catch (streamError: unknown) {
        console.error("Error in generateContentStream:", streamError);
        const errorMessage = streamError instanceof Error ? streamError.message : "Unknown error";
        throw new Error(
          `Failed to generate content stream: ${errorMessage}. ` +
            `Model: ${geminiConfig.model}. ` +
            `Check if the model is available and your API key has the correct permissions.`
        );
      }

      const isFirstMessage =
        conversationHistory.length === 0 || conversationHistory.every((msg) => msg.role === "user");

      if (shouldAddFallback(confidence.score) && isFirstMessage) {
        fullResponse += FALLBACK_MESSAGE;

        yield {
          type: "chunk",
          data: { text: FALLBACK_MESSAGE },
        };
      }
    }
    
    yield {
      type: "done",
      data: {
        message: {
          role: "assistant",
          content: fullResponse,
          timestamp: new Date().toISOString(),
          id: `msg_${Date.now()}`,
        },
      },
    };
  } catch (error) {
    console.error("Error in chat handler:", error);
    yield {
      type: "error",
      data: {
        error: error instanceof Error ? error.message : "An error occurred",
      },
    };
  }
}
