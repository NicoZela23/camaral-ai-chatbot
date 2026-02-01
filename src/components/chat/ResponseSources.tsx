'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Source } from '@/types/chat';

interface ResponseSourcesProps {
  sources: Source[];
}

export function ResponseSources({ sources }: ResponseSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const topSources = sources.slice(0, 2);
  const displaySources = isExpanded ? sources : topSources;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Fuentes ({sources.length})</span>
        </div>
        {sources.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Mostrar Menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Mostrar Todas
              </>
            )}
          </Button>
        )}
      </div>

      {/* Sources List */}
      <AnimatePresence>
        <div className="space-y-2">
          {displaySources.map((source, index) => (
            <motion.div
              key={source.path}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="p-3 bg-muted/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium">{source.title}</h4>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {Math.round(source.relevanceScore * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {source.excerpt}
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {source.category}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
