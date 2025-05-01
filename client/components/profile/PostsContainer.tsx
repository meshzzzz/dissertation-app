import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { usePosts } from '@/context/PostContext';
import { router } from 'expo-router';

const PostsContainer = () => {
    const { 
        myPosts, 
        postsById, 
        loading, 
        errors, 
        fetchMyPosts 
    } = usePosts();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const bottomBgColor = Colors[colorScheme ?? 'light'].profile.bottomBackground;

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const postObjects = myPosts.map(id => postsById[id]);

    // handle post press
    const handlePostPress = (postId: string) => {
        router.push(`/profile/posts/${postId}`);
    };

    // format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });

        // add suffix to day (1st, 2nd, 3rd, etc.)
        let suffix = 'th';
        if (day === 1 || day === 21 || day === 31) suffix = 'st';
        else if (day === 2 || day === 22) suffix = 'nd';
        else if (day === 3 || day === 23) suffix = 'rd';

        return `${day}${suffix} ${month}`;
    };

    // format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }).toLowerCase();
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: bottomBgColor }
        ]}>
            <View style={styles.postsSection}>
                <Text style={styles.postsSectionTitle}>My posts</Text>
                
                {loading.myPosts ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={accentColor} />
                    </View>
                ) : errors.myPosts ? (
                    <Text style={styles.errorText}>{errors.myPosts}</Text>
                ) : postObjects.length === 0 ? (
                    <Text style={styles.noPostsText}>No posts yet</Text>
                ) : (
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                        style={styles.postsScrollView}
                    >
                        {postObjects.map((post) => (
                            <TouchableOpacity 
                                key={post.id} 
                                onPress={() => handlePostPress(post.id)}
                                style={[
                                styles.postCard,
                                { backgroundColor: colors.background }
                                ]}
                            >
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <Text style={styles.postTitle}>{post.title || post.content.substring(0, 20) + '...'}</Text>
                                    <Text style={styles.postDate}>
                                        {formatDate(post.createdAt)} • {formatTime(post.createdAt)}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.postTag,
                                    { backgroundColor: accentColor }
                                ]}>
                                    <Text style={styles.postTagText}>
                                        {post.group?.name || 'Personal'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 200,
    },
    postsSection: {
        width: '100%',
        paddingLeft: 20,
    },
    postsSectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 16,
        alignSelf: 'flex-start',
        color: '#fff',
    },
    postsScrollView: {
        width: '100%',
    },
    postCard: {
        marginRight: 16,
        borderRadius: 12,
        padding: 14,
        height: 125,
        width: 125,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    postDate: {
        fontSize: 10,
        color: '#888',
        marginTop: 8,
    },
    postTag: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 18,
    },
    postTagText: {
        fontSize: 10,
        color: '#fff',
    },
    loadingContainer: {
        height: 125,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginVertical: 10,
    },
    noPostsText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
        marginVertical: 10,
    }
});

export default PostsContainer;