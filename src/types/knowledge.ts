export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  tags: string[];
  path: string;
  priority: number;
  description?: string;
}

export interface KnowledgeIndex {
  version: string;
  lastUpdated: string;
  documents: KnowledgeDocument[];
  categories: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}
