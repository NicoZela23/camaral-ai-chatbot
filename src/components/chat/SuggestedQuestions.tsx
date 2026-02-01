'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  '¿Qué es Camaral y qué hacen?',
  '¿Cómo funcionan los avatares digitales en reuniones de ventas?',
  '¿Cuáles son los beneficios para atención al cliente?',
  '¿Cómo puedo empezar con Camaral?',
  '¿Qué integraciones soportan?',
  'Cuéntame sobre sus precios',
];

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            👋 Bienvenido al Asistente IA de Camaral
          </h1>
          <p className="text-muted-foreground text-lg">
            Pregúntame cualquier cosa sobre nuestra tecnología de avatares digitales
          </p>
        </motion.div>

        {/* Suggested Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUGGESTED_QUESTIONS.map((question, index) => (
            <motion.div
              key={question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-4 cursor-pointer hover:bg-accent hover:border-primary transition-all group"
                onClick={() => onSelectQuestion(question)}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium leading-relaxed">
                    {question}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          O escribe tu propia pregunta abajo
        </motion.p>
      </div>
    </div>
  );
}
