'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  stage?: string; // "embedding" | "searching" | "generating"
}

export function TypingIndicator({ stage = 'generating' }: TypingIndicatorProps) {
  const stageMessages = {
    embedding: 'Procesando tu pregunta...',
    searching: 'Buscando en la base de conocimiento...',
    generating: 'Generando respuesta...',
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
      {/* Animated Dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Status Text */}
      <span className="text-sm text-muted-foreground">
        {stageMessages[stage as keyof typeof stageMessages] || stageMessages.generating}
      </span>
    </div>
  );
}
