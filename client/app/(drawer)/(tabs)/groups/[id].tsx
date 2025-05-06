import React, { useEffect, useState } from 'react';
import { 
    SafeAreaView, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth, API_URL } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '@/types/Group';
import GroupPinboard from '@/components/groups/GroupPinboard';
import RoundedButton from '@/components/RoundedButton';
import PostList from '@/components/posts/PostList';
import AddPostModal from '@/components/posts/AddPostModal';
import EditGroupModal from '@/components/groups/EditGroupModal';
import { usePosts } from '@/context/PostContext';
import { useEvents } from '@/context/EventContext';

export default function GroupDetail() {
    const params = useLocalSearchParams();
    const groupId = params.id as string;
    const { authState } = useAuth();
    const { isSuperuser } = usePermissions();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    const { 
        groupPosts, 
        loading, 
        errors, 
        fetchGroupPosts 
    } = usePosts();

    const { getUpcomingEvent, fetchGroupEvents, loading: eventsLoading } = useEvents();

    const [loadingGroup, setLoadingGroup] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [groupError, setGroupError] = useState<string | null>(null);
    const [isAddPostModalVisible, setIsAddPostModalVisible] = useState(false);
    const [isEditGroupModalVisible, setIsEditGroupModalVisible] = useState(false);

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

    useEffect(() => {
        loadGroupData();

        // load group posts
        if (authState?.token) {
            fetchGroupPosts(groupId);
            fetchGroupEvents(groupId);
        }
    }, [groupId, authState]);

    const handlePostCreated = () => {
        // refetch group posts after creating a new post
        fetchGroupPosts(groupId);
        setIsAddPostModalVisible(false);
    };

    const handleViewMembers = () => {
        router.push({
            pathname: '/groups/members',
            params: {groupId: group?.id}
        });
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

    const handleEditGroup = () => {
        setIsEditGroupModalVisible(true);
    };

    const handleGroupUpdated = (updatedGroup: Group) => {
        // update local state with the updated group data
        setGroup(updatedGroup);
        setIsEditGroupModalVisible(false);
    };

    const handleGroupDeleted = () => {
        router.push('/groups');
    };

    const onEventsPress = () => {
        router.push({
            pathname: '/groups/eventslist',
            params: { groupId }
        });
    }

    // get group post IDs
    const postIds = groupPosts[groupId] || [];

    // check if posts are loading
    const isPostsLoading = loading.groups[groupId];
    const postsError = errors.groups[groupId];

    const isEventsLoading = eventsLoading.groups[groupId];
    const upcomingEvent = !isEventsLoading && groupId ? getUpcomingEvent(groupId) : null;

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
                        headerRight: () => (
                            <View style={styles.headerButtons}>
                                <TouchableOpacity 
                                    onPress={handleViewMembers}
                                    style={styles.headerButton}
                                >
                                    <Ionicons 
                                        name="people" 
                                        size={24} 
                                        color={primaryColor} 
                                    />
                                </TouchableOpacity>
                                
                                {isSuperuser() && (
                                    <TouchableOpacity 
                                        onPress={handleEditGroup}
                                        style={styles.headerButton}
                                    >
                                        <Ionicons 
                                            name="pencil" 
                                            size={24} 
                                            color={primaryColor} 
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )
                    }} 
                />
            )}
            <ScrollView style={styles.scrollView}>          
                <GroupPinboard 
                    name={group.name}
                    memberCount={group.membersCount}
                    description={group.description}
                    groupImage={group.groupImage}
                    onEventsPress={onEventsPress}
                    upcomingEvent={upcomingEvent}
                />

                {/* contact admin / groupchat buttons */}
                <View style={styles.actionButtons}>
                    <RoundedButton
                        label="Contact Admin"
                        onPress={() => console.log('Contact admin')}
                        color="#C80474"
                        iconName="help"
                        marginRight={true}
                    />
                    
                    <RoundedButton
                        label="Groupchat"
                        onPress={() => handleGroupChatPress()}
                        color="#00529C"
                        iconName="chatbubble"
                    />
                </View>
                
                {/* posts */}
                <View style={styles.postsContainer}>
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

            <EditGroupModal
                modalVisible={isEditGroupModalVisible}
                group={group}
                onClose={() => setIsEditGroupModalVisible(false)}
                onSuccess={handleGroupUpdated}
                onDeleted={handleGroupDeleted}
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginHorizontal: 8,
        padding: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    postsContainer: {
        padding: 16,
        marginBottom: 45,
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