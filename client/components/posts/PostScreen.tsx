import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import PostCard from '@/components/posts/PostCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { usePosts } from '@/context/PostContext';

interface PostScreenProps {
    postId: string;
    showInFeed?: boolean;
}

const PostScreen = ({ postId, showInFeed=false }: PostScreenProps) => {
    const colorScheme = useColorScheme();
    const { postsById, loading, errors, fetchPost } = usePosts();
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            setIsInitialLoading(true);
            
            // if post not already in context, fetch it
            if (!postsById[postId]) {
              await fetchPost(postId);
            }
            
            setIsInitialLoading(false);
          };
      
          loadPost();
    }, [postId]);

    // get post from context
    const post = postsById[postId];

    // get loading state
    const isLoading = isInitialLoading || loading.posts[postId];

    // get any error
    const error = errors.posts[postId];

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
        <ScrollView style={styles.container}>
            <PostCard
                {...post}
                onComment={() => console.log('Comment')}
                isInPostPage={true}
                showInFeed={showInFeed}
            />
            
            {/* comments section */}
            <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments</Text>
                <Text style={styles.noCommentsText}>No comments yet</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        opacity: 0.7,
        marginVertical: 20,
    }
});

export default PostScreen;