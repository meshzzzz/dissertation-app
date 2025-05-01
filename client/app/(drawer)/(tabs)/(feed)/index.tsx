import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PostList from '@/components/posts/PostList';
import { usePosts } from '@/context/PostContext';

export default function Feed() {
    const colorScheme = useColorScheme();
    const { 
        feedPosts, 
        loading, 
        errors, 
        fetchFeedPosts 
    } = usePosts();

    useEffect(() => {
        // fetch posts when component mounts
        fetchFeedPosts();
    }, []);
    
    return (
    <View style={styles.container}>
        {loading.feed ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        ) : errors.feed ? (
            <Text style={styles.errorText}>{errors.feed}</Text>
        ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <PostList 
                    postIds={feedPosts}
                    showGroup={true}
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
