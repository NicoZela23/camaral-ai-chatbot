"use client";

import { useState, useEffect } from "react";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Header } from "@/components/layout/Header";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils/cn";

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className }: ChatWidgetProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    clearMessages();
    setShowSuggestions(true);
  };

  return (
    <div className={cn("flex h-screen flex-col bg-background", className)}>
      <Header onClear={handleClear} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {showSuggestions && messages.length === 0 ? (
          <SuggestedQuestions onSelectQuestion={handleSuggestedQuestion} />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      <InputBox onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
