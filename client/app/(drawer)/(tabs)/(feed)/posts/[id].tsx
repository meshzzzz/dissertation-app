import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import PostCard from '@/components/posts/PostCard';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Post } from '@/types/Post';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function PostScreen() {
    const params = useLocalSearchParams();
    const postId = params.id as string;
    const { authState } = useAuth();
    const colorScheme = useColorScheme();
    
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Load post data
        const fetchPost = async () => {
            if (!authState?.token) return;
            
            try {
                const response = await axios.get(`${API_URL}/posts/${postId}`, {
                    params: { token: authState.token }
                });
                
                if (response.data.status === 'ok') {
                    setPost(response.data.data);
                } else {
                    setError('Failed to load post');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Error loading post');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPost();
    }, [postId, authState]);
    
    if (loading) {
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
                id={post.id}
                title={post.title}
                content={post.content}
                createdAt={post.createdAt}
                author={post.author}
                group={post.group}
                likes={post.likes}
                comments={post.comments}
                // Disable these handlers since we're in the detail view
                onPress={() => {}}
                onLike={() => console.log('Like')}
                onComment={() => console.log('Comment')}
            />
            
            {/* Comments section can be added here */}
            <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments</Text>
                {/* Comment list would go here */}
                <Text style={styles.noCommentsText}>No comments yet</Text>
            </View>
        </ScrollView>
    );
}

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
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    noCommentsText: {
        textAlign: 'center',
        fontStyle: 'italic',
        opacity: 0.7,
        marginVertical: 20,
    }
});