import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '@/types/Group';
import RoundedButton from '@/components/RoundedButton';
import PostList from '@/components/posts/PostList';
import AddPostModal from '@/components/posts/AddPostModal';
import { usePosts } from '@/context/PostContext';

export default function GroupDetail() {
    const params = useLocalSearchParams();
    const groupId = params.id as string;
    const { authState } = useAuth();
    const colorScheme = useColorScheme();

    const { 
        groupPosts, 
        loading, 
        errors, 
        fetchGroupPosts 
    } = usePosts();

    const [loadingGroup, setLoadingGroup] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [groupError, setGroupError] = useState<string | null>(null);
    const [isAddPostModalVisible, setIsAddPostModalVisible] = useState(false);
    
    useEffect(() => {
        // load group data
        const loadGroupData = async () => {
            if (!authState?.token) return;

            setLoadingGroup(true);
            setGroupError(null);

            try {
                // load group details
                const groupResponse = await axios.get(`${API_URL}/groups/${groupId}`, {
                    params: { token: authState.token }
                });
                
                if (groupResponse.data.status === 'ok') {
                    setGroup(groupResponse.data.data);
                } else {
                    setGroupError('Failed to fetch group details');
                }
            } catch (err) {
                console.error('Error fetching group data:', err);
                setGroupError('Network error while fetching data');
            } finally {
                setLoadingGroup(false);
            }
        };

        loadGroupData();

        // load group posts
        if (authState?.token) {
            fetchGroupPosts(groupId);
        }
    }, [groupId, authState]);

    const handlePostCreated = () => {
        // refetch group posts after creating a new post
        fetchGroupPosts(groupId);
        setIsAddPostModalVisible(false);
    };

    const handleGroupChatPress = () => {
        router.push({
            pathname: '/groups/groupchat',
            params: {
                groupId: group?.id,
                groupName: group?.name
            }
        })
    }

    // get group post IDs
    const postIds = groupPosts[groupId] || [];

    // check if posts are loading
    const isPostsLoading = loading.groups[groupId];
    const postsError = errors.groups[groupId];

    if (loadingGroup) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (groupError || !group) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{groupError || 'Group not found'}</Text>
                </View>
            </SafeAreaView>
        );
     }

    return (
        <SafeAreaView style={styles.container}>
            {group && (
                <Stack.Screen 
                    options={{ 
                        title: group.name,
                    }} 
                />
            )}
            <ScrollView style={styles.scrollView}>
                {/* group header */}
                <View style={styles.header}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.memberCount}>{group.membersCount} members</Text>
                </View>
                
                {/* contax admin / groupchat buttons */}
                <View style={styles.actionButtons}>
                    <RoundedButton
                        label="Contact Admin"
                        onPress={() => console.log('Contact admin')}
                        color="#C80474"
                        iconName="person"
                        marginRight={true}
                    />
                    
                    <RoundedButton
                        label="Groupchat"
                        onPress={() => handleGroupChatPress()}
                        color="#00529C"
                        iconName="chatbubble"
                    />
                </View>
                
                {/* group description */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About this group</Text>
                    <Text style={styles.description}>{group.description}</Text>
                </View>
                
                {/* posts */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Posts</Text>
                    {isPostsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
                        </View>
                    ) : postsError ? (
                        <Text style={styles.errorText}>{postsError}</Text>
                    ) : (
                        <PostList
                            postIds={postIds}
                            showGroup={false}
                            emptyMessage="No posts yet. Be the first to share something!"
                        />
                    )}
                </View>
            </ScrollView>
            
            {/* add post button */}
            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}
                onPress={() => setIsAddPostModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* add post modal */}
            <AddPostModal
                visible={isAddPostModalVisible}
                onClose={() => setIsAddPostModalVisible(false)}
                onPostCreated={handlePostCreated}
                groupId={groupId}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#E53935',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 16,
        alignItems: 'flex-start',
    },
    groupName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberCount: {
        fontSize: 14,
        opacity: 0.7,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionContainer: {
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});