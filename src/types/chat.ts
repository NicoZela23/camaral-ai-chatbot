export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  confidence?: ConfidenceScore;
  quickActions?: QuickAction[];
}

export interface Source {
  title: string;
  excerpt: string;
  relevanceScore: number;
  category: string;
  path: string;
}

export interface ConfidenceScore {
  score: number;
  level: 'high' | 'medium' | 'low';
}

export interface QuickAction {
  label: string;
  icon: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export type ChatResponse =
  | { type: 'status'; data: { stage: string } }
  | { type: 'sources'; data: { sources: Source[] } }
  | { type: 'confidence'; data: ConfidenceScore }
  | { type: 'chunk'; data: { text: string } }
  | { type: 'done'; data: { message: Message } }
  | { type: 'error'; data: { error: string } };

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sessionId: string;
  error: string | null;
}
