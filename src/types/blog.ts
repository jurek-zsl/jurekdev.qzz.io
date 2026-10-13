export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  content: string;
  toc: TocItem[];
  coverGradient?: string;
}
