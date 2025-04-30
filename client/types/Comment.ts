export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
    };
    likes: number;
    userHasLiked: boolean;
    parent: string | null;
    // track if replies have been loaded
    hasReplies: boolean;
    replyCount: number;
}

export interface CommentTreeNode extends Comment {
    replies: CommentTreeNode[];
}