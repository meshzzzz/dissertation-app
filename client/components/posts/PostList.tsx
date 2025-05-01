import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import PostCard from './PostCard';
import { useRouter } from 'expo-router';

interface PostListProps {
    postIds: string[];
    showGroup?: boolean;
    emptyMessage?: string; 
}

const PostList = ({
    postIds,
    showGroup = false,
    emptyMessage = "No posts yet. Be the first to share something!",
}: PostListProps) => {
    const router = useRouter();

    // handle post press
    const handlePostPress = (postId: string) => {
        if (showGroup) {
            router.push(`/posts/${postId}`);
        } else {
            router.push(`/groups/posts/${postId}`);
        }
    };

    // handle comment press - open post (TODO)
    const handleCommentPress = (postId: string) => {
        handlePostPress(postId);
    };

    if (postIds.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <View>
            {postIds.map(id => (
                <PostCard
                    key={id}
                    id={id}
                    showGroup={showGroup}
                    onPress={() => handlePostPress(id)}
                    onComment={() => handleCommentPress(id)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});

export default PostList;