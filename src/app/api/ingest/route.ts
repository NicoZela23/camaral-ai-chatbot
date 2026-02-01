import { ingestKnowledgeBase } from "@/scripts/ingest-knowledge";
import type { IngestRequest, IngestResponse } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await request.json();

    const startTime = Date.now();

    const result = await ingestKnowledgeBase();

    const duration = Date.now() - startTime;

    const response: IngestResponse = {
      success: true,
      documentsProcessed: result.documentsProcessed || 0,
      chunksCreated: result.chunksCreated || 0,
      embeddingsGenerated: result.embeddingsGenerated || 0,
      duration,
      errors: result.errors || [],
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ingest API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
