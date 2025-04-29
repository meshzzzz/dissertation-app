import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Post } from '@/types/Post';
import { API_URL, useAuth } from '@/context/AuthContext';

interface LoadingState {
    feed: boolean;
    groups: Record<string, boolean>;
    posts: Record<string, boolean>;
    myPosts: boolean;
}
  
  interface ErrorState {
    feed: string | null;
    groups: Record<string, string | null>;
    posts: Record<string, string | null>;
    myPosts: string | null;
}

interface PostsContextType {
    postsById: Record<string, Post>;
    feedPosts: string[];
    groupPosts: Record<string, string[]>;
    myPosts: string[];
    loading: LoadingState;
    errors: ErrorState;
    fetchFeedPosts: () => Promise<void>;
    fetchGroupPosts: (groupId: string) => Promise<void>;
    fetchMyPosts: (page?: number, limit?: number) => Promise<void>;
    fetchPost: (postId: string) => Promise<Post | null>;
    toggleLike: (postId: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();

    // post data
    const [postsById, setPostsById] = useState<Record<string, Post>>({});
    const [feedPosts, setFeedPosts] = useState<string[]>([]);
    const [groupPosts, setGroupPosts] = useState<Record<string, string[]>>({});
    const [myPosts, setMyPosts] = useState<string[]>([]);

    // other statuses
    const [loading, setLoading] = useState<LoadingState>({
        feed: false,
        groups: {},
        posts: {},
        myPosts: false
    });

    const [errors, setErrors] = useState<ErrorState>({
        feed: null,
        groups: {},
        posts: {},
        myPosts: null
    });

    // helper to add posts to cache
    const addPostsToCache = (posts: Post[]) => {
        const newPosts: Record<string, Post> = {};
        posts.forEach(post => {
            newPosts[post.id] = post;
        });

        setPostsById(prev => ({
            ...prev,
            ...newPosts
        }));
    };

    // fetch feed posts
    const fetchFeedPosts = async () => {
        if (!authState?.token) return;

        try {
            // set loading
            setLoading(prev => ({ ...prev, feed: true }));
            setErrors(prev => ({ ...prev, feed: null }));
            
            const response = await axios.get(`${API_URL}/posts/feed`, {
                params: { token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                const posts = response.data.data;
                
                // store the posts in cache
                addPostsToCache(posts);
                
                // one feed per user - stored in a flat array
                setFeedPosts(posts.map((post: Post) => post.id));
                
            } else {
                setErrors(prev => ({ ...prev, feed: 'Failed to fetch posts' }));
            }
        } catch (err) {
            console.error('Error fetching feed posts:', err);
            setErrors(prev => ({ ...prev, feed: 'Network error while fetching posts' }));
        } finally {
            setLoading(prev => ({ ...prev, feed: false }));
        }
    };

    // fetch my posts
    const fetchMyPosts = async (page: number = 1, limit: number = 10) => {
        if (!authState?.token) return;

        try {
            // set loading
            setLoading(prev => ({ ...prev, myPosts: true }));
            setErrors(prev => ({ ...prev, myPosts: null }));
            
            const response = await axios.get(`${API_URL}/posts/my`, {
                params: { 
                    page,
                    limit
                }
            });
            
            if (response.data.status === 'ok') {
                const posts = response.data.data;
                
                // store the posts in cache
                addPostsToCache(posts);
                
                // store my posts as a flat array of IDs
                setMyPosts(posts.map((post: Post) => post.id));
                
            } else {
                setErrors(prev => ({ ...prev, myPosts: 'Failed to fetch my posts' }));
            }
        } catch (err) {
            console.error('Error fetching my posts:', err);
            setErrors(prev => ({ ...prev, myPosts: 'Network error while fetching my posts' }));
        } finally {
            setLoading(prev => ({ ...prev, myPosts: false }));
        }
    };

    // fetch group posts
    const fetchGroupPosts = async (groupId: string) => {
        if (!authState?.token) return;

        try {
            // set loading
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: true } 
            }));
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: null } 
            }));
            
            const response = await axios.get(`${API_URL}/groups/${groupId}/posts`, {
                params: { token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                const posts = response.data.data;
                
                // store the posts in cache
                addPostsToCache(posts);
                
                // each group has a list of posts - stored in a dictionary by group ID
                setGroupPosts(prev => ({
                    ...prev,
                    [groupId]: posts.map((post: Post) => post.id)
                }));
                
            } else {
                setErrors(prev => ({ 
                    ...prev, 
                    groups: { ...prev.groups, [groupId]: 'Failed to fetch group posts' } 
                }));
            }
        } catch (err) {
            console.error(`Error fetching posts for group ${groupId}:`, err);
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: 'Network error while fetching posts' } 
            }));
        } finally {
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: false } 
            }));
        }
    };

    // fetch a single post
    const fetchPost = async (postId: string): Promise<Post | null> => {
        if (!authState?.token) return null;

        // if post already in cache, return it
        if (postsById[postId]) {
            return postsById[postId];
        }

        try {
            // set loading
            setLoading(prev => ({ 
                ...prev, 
                posts: { ...prev.posts, [postId]: true } 
            }));
            setErrors(prev => ({ 
                ...prev, 
                posts: { ...prev.posts, [postId]: null } 
            }));
            
            const response = await axios.get(`${API_URL}/posts/${postId}`, {
                params: { token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                const post = response.data.data;
                
                // add to cache
                addPostsToCache([post]);
                
                return post;
            } else {
                setErrors(prev => ({ 
                    ...prev, 
                    posts: { ...prev.posts, [postId]: 'Failed to fetch post' } 
                }));
            }
        } catch (err) {
            console.error(`Error fetching post ${postId}:`, err);
            setErrors(prev => ({ 
                ...prev, 
                posts: { ...prev.posts, [postId]: 'Network error while fetching post' } 
            }));
        } finally {
            setLoading(prev => ({ 
                ...prev, 
                posts: { ...prev.posts, [postId]: false } 
            }));
        }

        return null;
    };

    // toggle like on a post
    const toggleLike = async (postId: string) => {
        if (!authState?.token) return;

        try {
            const response = await axios.post(`${API_URL}/posts/${postId}/like`, {
                token: authState.token
            });
            
            if (response.data.status === 'ok') {
                const updatedPost = response.data.data;
                
                // update like status in state
                setPostsById(prev => ({ 
                    ...prev, 
                    [postId]: updatedPost
                }));
            }
        } catch (err) {
            console.error(`Error toggling like for post ${postId}:`, err);
        }
    };

    // reset state when auth changes
    useEffect(() => {
        setPostsById({});
        setFeedPosts([]);
        setGroupPosts({});
        setMyPosts([]);
    }, [authState?.token]);
  
    const value = {
        postsById,
        feedPosts,
        groupPosts,
        myPosts,
        loading,
        errors,
        fetchFeedPosts,
        fetchGroupPosts,
        fetchMyPosts,
        fetchPost,
        toggleLike,
    };
  
    return (
        <PostsContext.Provider value={value}>
            {children}
        </PostsContext.Provider>
    );
};

// custom hook to use the PostsContext
export const usePosts = () => {
    const context = useContext(PostsContext);
    if (context === undefined) {
        throw new Error('usePosts must be used within a PostsProvider');
    }
    return context;
};