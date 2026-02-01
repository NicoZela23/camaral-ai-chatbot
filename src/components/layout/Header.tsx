"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Trash2 } from "lucide-react";

interface HeaderProps {
  onClear: () => void;
}

export function Header({ onClear }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1
            onClick={onClear}
            className="cursor-pointer select-none text-lg font-semibold transition-opacity hover:opacity-70"
            title="Haz clic para iniciar un nuevo chat"
          >
            Camaral AI Assistant
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="Limpiar chat"
            title="Limpiar chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
