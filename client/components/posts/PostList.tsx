import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '@/components/Themed';
import PostCard from './PostCard';
import { Post } from '@/types/Post';
import { useRouter } from 'expo-router';

interface PostListProps {
    posts: Post[];
    showInFeed?: boolean;
    groupId?: string;
    emptyMessage?: string; 
}

const PostList = ({
    posts,
    showInFeed = false,
    groupId,
    emptyMessage = "No posts yet. Be the first to share something!",
}: PostListProps) => {
    const router = useRouter();

    // handle post press
    const handlePostPress = (postId: string) => {
        if (showInFeed) {
            router.push(`/posts/${postId}`);
        } else {
            router.push(`/groups/posts/${postId}`);
        }
    };

    // handle like press
    const handleLikePress = (postId: string) => {
        console.log(`Like post: ${postId}`);
        // TODO: implement like functionality
    };

    // handle comment press - open post (TODO)
    const handleCommentPress = (postId: string) => {
        router.push(`/groups/${groupId}/posts/${postId}?showComments=true`);
    };

    if (posts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <View>
            {posts.map((item) => (
                <PostCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    content={item.content}
                    createdAt={item.createdAt}
                    author={item.author}
                    group={item.group}
                    likes={item.likes}
                    comments={item.comments}
                    showInFeed={showInFeed}
                    onPress={() => handlePostPress(item.id)}
                    onLike={() => handleLikePress(item.id)}
                    onComment={() => handleCommentPress(item.id)}
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