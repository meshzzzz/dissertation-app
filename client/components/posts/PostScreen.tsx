import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import PostCard from '@/components/posts/PostCard';
import CommentCard from '../comments/CommentCard';
import CommentInput from '../comments/CommentInput';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { usePosts } from '@/context/PostContext';
import { useComments } from '@/context/CommentContext';

interface PostScreenProps {
    postId: string;
    showInFeed?: boolean;
}

const PostScreen = ({ postId, showInFeed=false }: PostScreenProps) => {
    const colorScheme = useColorScheme();
    const { postsById, loading, errors, fetchPost } = usePosts();
    const { 
        commentsByPost, 
        isLoadingComments, 
        commentErrors, 
        fetchComments, 
        addComment 
    } = useComments();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
    const commentInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsInitialLoading(true);
            
            // if post not already in context, fetch it
            if (!postsById[postId]) {
              await fetchPost(postId);
            }

            // fetch comments for this post
            await fetchComments(postId);
            
            setIsInitialLoading(false);
          };
      
          loadData();
    }, [postId]);

    // get data from context
    const post = postsById[postId];
    const comments = commentsByPost[postId] || [];
    const isCommentsLoading = isLoadingComments[postId] || false;
    const commentError = commentErrors[postId];
    
    // get loading state
    const isLoading = isInitialLoading || loading.posts[postId];

    // get any error
    const error = errors.posts[postId];

    // handle submitting a new comment
    const handleSubmitComment = async (content: string) => {
        if (replyingTo) {
            // add reply
            await addComment(postId, content, replyingTo.id);
            setReplyingTo(null);
        } else {
            // add top-level comment
            await addComment(postId, content);
        }
    };

    // handle reply to comment
    const handleReplyToComment = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        // Focus the input
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    // cancel replying
    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleCommentPress = () => {
        // focus the comment input
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator 
                    size="large" 
                    color={Colors[colorScheme ?? 'light'].primary} 
                />
            </View>
        );
    }

    if (error || !post) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error || 'Post not found'}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            <ScrollView style={styles.scrollContainer}>
                {/* post */}
                <PostCard
                    id={postId}
                    showInFeed={showInFeed}
                    isInPostPage={true}
                    onComment={handleCommentPress}
                />
                
                {/* comments section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>
                        Comments {comments.length > 0 && `(${comments.length})`}
                    </Text>
                    
                    {/* comment error */}
                    {commentError && (
                        <Text style={styles.errorText}>{commentError}</Text>
                    )}
                    
                    {/* comments loading */}
                    {isCommentsLoading && (
                        <View style={styles.loadingCommentsContainer}>
                            <ActivityIndicator 
                                size="small" 
                                color={Colors[colorScheme ?? 'light'].primary} 
                            />
                        </View>
                    )}
                    
                    {/* no comments */}
                    {!isCommentsLoading && comments.length === 0 && (
                        <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                    )}
                    
                    {/* comments list */}
                    {comments.map(comment => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReply={handleReplyToComment}
                        />
                    ))}
                </View>
            </ScrollView>
        
            {/* comment input */}
            <CommentInput 
                ref={commentInputRef}
                onSubmit={handleSubmitComment}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                replyingTo={replyingTo?.name}
                onCancelReply={handleCancelReply}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    commentsSection: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    commentsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    noCommentsText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 20,
    },
    loadingCommentsContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    }
});

export default PostScreen;