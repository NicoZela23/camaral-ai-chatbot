"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ResponseSources } from "./ResponseSources";
import { QuickActions } from "./QuickActions";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Message, Source, ConfidenceScore, QuickAction } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  sources?: Source[];
  confidence?: ConfidenceScore;
  quickActions?: QuickAction[];
}

export function MessageBubble({ message, sources, confidence, quickActions }: MessageBubbleProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-4 flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[80%]", isUser && "ml-auto")}>
        <Card
          className={cn(
            "overflow-hidden p-4",
            isUser ? "bg-primary text-white" : "bg-card text-card-foreground"
          )}
        >
          {/* Message Content */}
          <div
            className={cn(
              "prose prose-sm max-w-none break-words",
              isUser ? "prose-invert text-white" : "text-foreground dark:prose-invert"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => (
                  <p
                    className={cn(
                      "mb-3 break-words last:mb-0",
                      isUser ? "text-white" : "text-foreground"
                    )}
                  >
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul
                    className={cn(
                      "my-3 ml-4 list-disc break-words",
                      isUser ? "text-white" : "text-foreground"
                    )}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    className={cn(
                      "my-3 ml-4 list-decimal break-words",
                      isUser ? "text-white" : "text-foreground"
                    )}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className={cn("mb-1 break-words", isUser ? "text-white" : "text-foreground")}>
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong
                    className={cn("font-semibold", isUser ? "text-white" : "text-foreground")}
                  >
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className={cn("italic", isUser ? "text-white" : "text-foreground")}>
                    {children}
                  </em>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "break-all font-medium underline",
                      isUser
                        ? "text-white underline-offset-2 hover:text-white/80"
                        : "text-primary hover:text-primary/80"
                    )}
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className={cn("my-4", isUser ? "border-white/20" : "border-border")} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* AI Message Metadata */}
          {!isUser && (
            <div className="mt-4 space-y-3">
              {/* Confidence Badge */}
              {confidence && <ConfidenceBadge score={confidence.score} level={confidence.level} />}

              {/* Sources */}
              {sources && sources.length > 0 && <ResponseSources sources={sources} />}

              {/* Actions Row */}
              <div className="flex items-center gap-2 border-t pt-2">
                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content)}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>

                {/* Quick Actions */}
                {quickActions && quickActions.length > 0 && <QuickActions actions={quickActions} />}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={cn(
              "mt-2 text-xs",
              isUser ? "text-right text-white/80" : "text-left text-muted-foreground"
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
