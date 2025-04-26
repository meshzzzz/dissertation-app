export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
    };
    title?: string;
    content: string;
    group?: {
        id: string;
        name: string;
    };
    likes: number;
    comments: number;
    createdAt: string;
  }