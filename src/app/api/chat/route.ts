import { handleChat } from '@/lib/llm/chatHandler';
import type { Message } from '@/types/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const response of handleChat(
            message,
            conversationHistory as Message[]
          )) {
            const data = `event: ${response.type}\ndata: ${JSON.stringify(response.data)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `event: error\ndata: ${JSON.stringify({
            error: 'Stream failed',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
