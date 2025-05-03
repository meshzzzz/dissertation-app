import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import PostList from '@/components/posts/PostList';
import EventsContainer from '@/components/events/EventsContainer';
import { usePosts } from '@/context/PostContext';
import { useEvents } from '@/context/EventContext';

export default function Feed() {
    const colorScheme = useColorScheme();
    const { 
        feedPosts, 
        loading: postLoading, 
        errors: postErrors, 
        fetchFeedPosts 
    } = usePosts();
    const {
        userEvents,
        loading: eventLoading,
        errors: eventErrors,
        fetchUserEvents
    } = useEvents();

    // loading & error states
    const isLoading = postLoading.feed || eventLoading.user;
    const [error, setError] = useState<string | null>(null);

    // error messages for posts & events
    useEffect(() => {
        if (postErrors.feed || eventErrors.user) {
            setError(postErrors.feed || eventErrors.user);
        } else {
            setError(null);
        }
    }, [postErrors.feed, eventErrors.user]);

    useEffect(() => {
        // fetch posts and events when component mounts
        fetchFeedPosts();
        fetchUserEvents();
    }, []);
    
    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <EventsContainer 
                        eventIds={userEvents}
                    />
                    <View style={styles.postList}>
                        <PostList 
                            postIds={feedPosts}
                            showGroup={true}
                            emptyMessage="No posts yet. Join some groups to see posts!"
                        />
                    </View>
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
    postList: {
        padding: 16,
        marginTop: 5
    },
    errorText: {
        color: 'red',
        marginVertical: 20,
    }
});
