'use client';

import { Button } from '@/components/ui/button';
import type { QuickAction } from '@/types/chat';

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.href}
          variant={action.variant === 'primary' ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <a href={action.href} target="_blank" rel="noopener noreferrer">
            {action.label}
          </a>
        </Button>
      ))}
    </div>
  );
}
