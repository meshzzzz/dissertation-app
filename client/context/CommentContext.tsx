import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { Comment, CommentTreeNode } from '@/types/Comment';
import { API_URL, useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostContext';

interface CommentContextType {
    commentsByPost: Record<string, CommentTreeNode[]>;
    isLoadingComments: Record<string, boolean>;
    commentErrors: Record<string, string | null>;
    fetchComments: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string, parent?: string | null) => Promise<void>;
    toggleLike: (commentId: string, postId: string) => Promise<void>;
    deleteComment: (commentId: string, postId: string) => Promise<boolean>;
}
  
const CommentContext = createContext<CommentContextType | undefined>(undefined);

// helper function to build a nested comment tree from flat comment array
// maps parent-child relationships and organises comments into tree structure
function buildCommentTree(flatComments: Comment[]): CommentTreeNode[] {
    const map = new Map<string, CommentTreeNode>();
    const roots: CommentTreeNode[] = [];
  
    // create all nodes with empty replies arrays
    flatComments.forEach(c => {
        map.set(c.id, { ...c, replies: [] });
    });
  
    // connect parents and children
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

// helper function to update a specific comment in the tree
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

// helper function to remove a comment from the tree + replies
function removeCommentFromTree(
    tree: CommentTreeNode[], 
    commentId: string
): CommentTreeNode[] {
    return tree
        .filter(c => c.id !== commentId)
        .map(c => ({
            ...c,
            replies: c.replies.length > 0 
                ? removeCommentFromTree(c.replies, commentId) 
                : []
        }));
}

// helper function to find a comment in the tree by ID
function findCommentInTree(
    tree: CommentTreeNode[], 
    commentId: string
): CommentTreeNode | null {
    for (const comment of tree) {
        if (comment.id === commentId) return comment;
        
        if (comment.replies.length > 0) {
            const found = findCommentInTree(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}
  
// comment provider wraps application to provide comment functionality
export const CommentProvider = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();
    const { postsById, updatePostCommentCount } = usePosts();

    // state for comments
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentTreeNode[]>>({});
    const [isLoadingComments, setIsLoadingComments] = useState<Record<string, boolean>>({});
    const [commentErrors, setCommentErrors] = useState<Record<string, string | null>>({});

    // fetch comments for a specific post + build tree structure
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

            updatePostCommentCount(postId, 1);
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

    // delete a comment
    const deleteComment = async (commentId: string, postId: string): Promise<boolean> => {
        if (!authState?.token) return false;
    
        try {
          const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
            params: { token: authState.token }
          });
    
          if (res.data.status === 'ok') {
                // check if comment is a parent with replies
                const comment = findCommentInTree(commentsByPost[postId] || [], commentId);
                const isParentWithReplies = comment && !comment.parent && comment.replies.length > 0;
                
                // calculate total comments to remove (1 + replies if parent)
                const countToRemove = isParentWithReplies ? 1 + comment.replies.length : 1;
                
                // remove the comment from the tree
                setCommentsByPost(prev => ({
                    ...prev,
                    [postId]: removeCommentFromTree(prev[postId] || [], commentId)
                }));
                
                // update the post's comment count
                updatePostCommentCount(postId, -countToRemove);
                
                return true;
          } else {
            console.error('Failed to delete comment:', res.data.data);
            return false;
          }
        } catch (err) {
          console.error('Error deleting comment', err);
          return false;
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
        toggleLike,
        deleteComment
    };

    return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

// hook to use the CommentContext
export const useComments = () => {
    const context = useContext(CommentContext);
    if (context === undefined) {
        throw new Error('useComments must be used within a CommentProvider');
    }
    return context;
};