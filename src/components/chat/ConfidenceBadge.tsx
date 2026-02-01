'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ConfidenceBadgeProps {
  score: number;
  level: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ score, level }: ConfidenceBadgeProps) {
  const configs = {
    high: {
      icon: CheckCircle,
      label: 'Alta Confianza',
      color:
        'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      tooltip: 'Esta respuesta está bien respaldada por nuestra base de conocimiento',
    },
    medium: {
      icon: AlertCircle,
      label: 'Confianza Media',
      color:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      tooltip: 'Esta respuesta se basa en información parcial',
    },
    low: {
      icon: XCircle,
      label: 'Baja Confianza',
      color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      tooltip:
        'Información limitada disponible. Considera contactar con nuestro equipo.',
    },
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn('gap-1.5', config.color)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
            <span className="opacity-70">({Math.round(score * 100)}%)</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
