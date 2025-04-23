import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, StatusBar, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import TabButtons, { TabOption } from '@/components/TabButtons';
import GroupCard from '@/components/groups/GroupCard';
import JoinGroupModal from '@/components/groups/JoinGroupModal';
import Popup from '@/components/Popup';
import { Group } from '@/types/Group';

export default function Groups() {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { authState } = useAuth();
    // state for search & tabs
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    // state for groups data
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // state for join modal
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<{
        id: string;
        name: string;
        backgroundColor: string;
        membersCount: number;
        description: string;
    } | null>(null);
    const [joiningGroup, setJoiningGroup] = useState(false);
    // state for success/error notification popup
    const [notification, setNotification] = useState({
        visible: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });


    // tab options
    const tabOptions: TabOption[] = [
    { id: 'my', label: 'My Groups' },
    { id: 'all', label: 'All Groups' }
    ];

    // load groups data
    const loadData = async () => {
        if (!authState?.token) return;

        setLoading(true);
        setError(null);

        try {
            const [allRes, myRes] = await Promise.all([
                axios.get(`${API_URL}/groups`),
                axios.post(`${API_URL}/my-groups`, { token: authState.token })
            ]);

            if (allRes.data.status === 'ok') setAllGroups(allRes.data.data);
            else setError('Failed to fetch all groups.');

            if (myRes.data.status === 'ok') setMyGroups(myRes.data.data);
            else setError('Failed to fetch your groups.');
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Network error while fetching groups.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [authState]);

    // function to handle navigation
    const handleGroupPress = (groupId: string) => {
        try {
            router.push(`/groups/${groupId}`);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    // open join group modal
    const handleJoinPress = (group: Group) => {
        setSelectedGroup(group);
        setJoinModalVisible(true);
    };

     // join a group
     const handleJoinGroup = async () => {
        if (!selectedGroup || !authState?.token) return;
        
        setJoiningGroup(true);
        
        try {
            const response = await axios.post(`${API_URL}/join-group`, {
                token: authState.token,
                groupId: selectedGroup.id
            });
            
            if (response.data.status === 'ok') {
                // refresh groups data
                await loadData();
                
                // show success notification
                setNotification({
                    visible: true,
                    type: 'success',
                    message: `You've joined ${selectedGroup.name}!`
                });
                
                // close modal
                setJoinModalVisible(false);
            } else {
                setNotification({
                    visible: true,
                    type: 'error',
                    message: response.data.data || 'Failed to join group'
                });
            }
        } catch (error) {
            console.error("Error joining group:", error);
            setNotification({
                visible: true,
                type: 'error',
                message: 'Network error when joining group'
            });
        } finally {
            setJoiningGroup(false);
        }
    };

    // close notification
    const closeNotification = () => {
        setNotification({...notification, visible: false});
    };

    // check if user has joined a group
    const isGroupJoined = (groupId: string) => {
        return myGroups.some(group => group.id === groupId);
    };

    // filter the groups based on search query w/ memoisation
    const groupsToDisplay = useMemo(() => {
        const base = activeTab === 'all' ? allGroups : myGroups;
        if (!searchQuery) return base;
        return base.filter(group =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, activeTab, allGroups, myGroups]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
            
                {/* Search Bar Component */}
                <SearchBar 
                    placeholder="Search Groups.."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
                {/* Tab Buttons Component */}
                <TabButtons 
                    options={tabOptions}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                
                {/* Groups Grid */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : groupsToDisplay.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'my' 
                                ? "You haven't joined any groups yet." 
                                : "No groups found."}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.scrollView}>
                        <View style={styles.groupsGrid}>
                            {groupsToDisplay.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    isJoined={isGroupJoined(group.id)}
                                    onPress={handleGroupPress}
                                    onJoinPress={handleJoinPress}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* join group modal */}
            {selectedGroup && (
                <JoinGroupModal 
                    isVisible={joinModalVisible}
                    onClose={() => setJoinModalVisible(false)}
                    onJoin={handleJoinGroup}
                    group={selectedGroup}
                    isLoading={joiningGroup}
                />
            )}
            
            {/* notification popup */}
            <Popup
                visible={notification.visible}
                type={notification.type}
                message={notification.message}
                onClose={closeNotification}
                autoClose={true}
                duration={3000}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollView: {
        flex: 1,
        paddingBottom: 20,
    },
    groupsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#E53935',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    }
});