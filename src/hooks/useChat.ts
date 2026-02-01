"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, Source, ConfidenceScore } from "@/types/chat";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSources, setCurrentSources] = useState<Source[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState<ConfidenceScore | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setCurrentSources([]);
      setCurrentConfidence(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            conversationHistory: messages,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let buffer = "";
        let assistantMessage: Message | null = null;
        let currentEventType = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith("event: ")) {
              currentEventType = line.slice(7).trim();
              continue;
            }

            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (currentEventType === "status") {
                  continue;
                }

                if (currentEventType === "sources" && data.sources) {
                  setCurrentSources(data.sources);
                }

                if (currentEventType === "confidence" && data.score !== undefined) {
                  setCurrentConfidence({
                    score: data.score,
                    level: data.level,
                  });
                }

                if (currentEventType === "chunk" && data.text) {
                  if (!assistantMessage) {
                    assistantMessage = {
                      id: `msg_${Date.now()}`,
                      role: "assistant",
                      content: "",
                      timestamp: new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, assistantMessage!]);
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage!.id
                        ? { ...msg, content: msg.content + data.text }
                        : msg
                    )
                  );
                }

                if (currentEventType === "done" && data.message) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage!.id
                        ? {
                            ...msg,
                            ...data.message,
                            sources: currentSources,
                            confidence: currentConfidence || undefined,
                          }
                        : msg
                    )
                  );
                }

                if (currentEventType === "error" && data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage: Message = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: `Lo siento, ocurrió un error: ${error instanceof Error ? error.message : "Error desconocido"}`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setCurrentSources([]);
        setCurrentConfidence(null);
      }
    },
    [messages, isLoading, currentSources, currentConfidence]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSources([]);
    setCurrentConfidence(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
