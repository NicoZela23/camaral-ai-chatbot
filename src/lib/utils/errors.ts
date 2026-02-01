export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof ChatError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}
