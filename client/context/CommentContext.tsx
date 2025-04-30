import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { Comment, CommentTreeNode } from '@/types/Comment';
import { API_URL, useAuth } from '@/context/AuthContext';

interface CommentContextType {
    commentsByPost: Record<string, CommentTreeNode[]>;
    isLoadingComments: Record<string, boolean>;
    commentErrors: Record<string, string | null>;
    fetchComments: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string, parent?: string | null) => Promise<void>;
    toggleLike: (commentId: string, postId: string) => Promise<void>;
}
  
const CommentContext = createContext<CommentContextType | undefined>(undefined);

function buildCommentTree(flatComments: Comment[]): CommentTreeNode[] {
    const map = new Map<string, CommentTreeNode>();
    const roots: CommentTreeNode[] = [];
  
    flatComments.forEach(c => {
        map.set(c.id, { ...c, replies: [] });
    });
  
    map.forEach(comment => {
        if (comment.parent) {
            const parent = map.get(comment.parent);
            if (parent) parent.replies.push(comment);
        } else {
            roots.push(comment);
        }
    });
  
    return roots;
}

function updateCommentTree(
    tree: CommentTreeNode[],
    commentId: string,
    updater: (c: CommentTreeNode) => CommentTreeNode
): CommentTreeNode[] {
    return tree.map(c => {
        if (c.id === commentId) return updater(c);
        if (c.replies.length > 0) {
            return {
                ...c,
                replies: updateCommentTree(c.replies, commentId, updater)
            };
        }
        return c;
    });
}
  

export const CommentProvider = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();

    // state for comments
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentTreeNode[]>>({});
    const [isLoadingComments, setIsLoadingComments] = useState<Record<string, boolean>>({});
    const [commentErrors, setCommentErrors] = useState<Record<string, string | null>>({});

    // fetch top-level comments for a post
    const fetchComments = async (postId: string) => {
        if (!authState?.token) return;
    
        setIsLoadingComments(prev => ({ ...prev, [postId]: true }));
        setCommentErrors(prev => ({ ...prev, [postId]: null }));
    
        try {
          const res = await axios.get(`${API_URL}/posts/${postId}/comments`, {
            params: { token: authState.token }
          });
    
          if (res.data.status === 'ok') {
            const tree = buildCommentTree(res.data.data);
            setCommentsByPost(prev => ({ ...prev, [postId]: tree }));
          } else {
            setCommentErrors(prev => ({ ...prev, [postId]: 'Failed to load comments' }));
          }
        } catch (err) {
          setCommentErrors(prev => ({ ...prev, [postId]: 'Network error' }));
        } finally {
          setIsLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    // add a new comment / reply
    const addComment = async (postId: string, content: string, parent: string | null = null) => {
        if (!authState?.token) return;
    
        try {
          const res = await axios.post(`${API_URL}/posts/${postId}/comments`, {
            content,
            parent,
            token: authState.token
          });
    
          if (res.data.status === 'ok') {
            const newComment: CommentTreeNode = { ...res.data.data, replies: [] };
            setCommentsByPost(prev => {
              if (!parent) {
                return {
                  ...prev,
                  [postId]: [newComment, ...(prev[postId] || [])]
                };
              } else {
                const updatedTree = updateCommentTree(prev[postId] || [], parent, c => ({
                  ...c,
                  replies: [newComment, ...c.replies]
                }));
                return { ...prev, [postId]: updatedTree };
              }
            });
          }
        } catch (err) {
          console.error('Error adding comment', err);
        }
    };

    // toggle like on a comment
    const toggleLike = async (commentId: string, postId: string) => {
        if (!authState?.token) return;
    
        try {
          const res = await axios.post(`${API_URL}/comments/${commentId}/like`, {
            token: authState.token
          });
    
          if (res.data.status === 'ok') {
            const updated = res.data.data;
            setCommentsByPost(prev => ({
              ...prev,
              [postId]: updateCommentTree(prev[postId], commentId, c => ({
                ...c,
                likes: updated.likes,
                userHasLiked: updated.userHasLiked
              }))
            }));
          }
        } catch (err) {
          console.error('Error toggling like', err);
        }
    };

    // clear comment state when auth changes
    useEffect(() => {
        setCommentsByPost({});
        setIsLoadingComments({});
        setCommentErrors({});
    }, [authState?.token]);

    const value = {
        commentsByPost,
        isLoadingComments,
        commentErrors,
        fetchComments,
        addComment,
        toggleLike
    };

    return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

// custom hook to use the CommentContext
export const useComments = () => {
    const context = useContext(CommentContext);
    if (context === undefined) {
        throw new Error('useComments must be used within a CommentProvider');
    }
    return context;
};