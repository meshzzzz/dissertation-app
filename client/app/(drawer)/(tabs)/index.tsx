import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PostList from '@/components/posts/PostList';
import { Post } from '@/types/Post';
import axios from 'axios';

export default function Feed() {
    const { authState } = useAuth();
    const colorScheme = useColorScheme();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // fetch posts for feed
        const fetchPosts = async () => {
          if (!authState?.token) return;
    
          try {
            setError(null);
            
            // get all posts from user's groups (newest first)
            const response = await axios.get(`${API_URL}/posts/feed`, {
                params: { token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                setPosts(response.data.data);
            } else {
                setError('Failed to fetch posts');
            }
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Network error while fetching posts');
            } finally {
            setLoading(false);
            }
        };
    
        fetchPosts();
    }, [authState]);

    return (
    <View style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <PostList 
                    posts={posts}
                    showInFeed={true}
                    emptyMessage="No posts yet. Join some groups to see posts!"
                />
            </ScrollView>
        )}
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 16,
  },
  errorText: {
    color: 'red',
    marginVertical: 20,
  }
});
