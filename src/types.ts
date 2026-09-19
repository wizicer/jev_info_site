export interface Author {
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface Demo {
  id: string;
  url: string;
  createdAt: string;
  score: number;
  category: string;
  description: string;
  author: Author;
  mediaType: 'video' | 'image';
  src: string;
  width: number;
  height: number;
}

export interface Category {
  code: string;
  name: string;
  enName: string;
  description: string;
}

export interface Group {
  code: string;
  name: string;
  enName: string;
  categories: Category[];
}
