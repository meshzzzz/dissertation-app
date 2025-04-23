import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import TabButtons, { TabOption } from '@/components/TabButtons';
import GroupCard from '@/components/GroupCard';

interface Group {
    id: string;
    name: string;
    membersCount: number;
    backgroundColor: string;
}

export default function Groups() {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { authState } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // tab options
    const tabOptions: TabOption[] = [
    { id: 'my', label: 'My Groups' },
    { id: 'all', label: 'All Groups' }
    ];

    // background colors for groups
    const groupBackgroundColors = [
        '#5E35B1', // Deep Purple
        '#1E88E5', // Blue
        '#43A047', // Green
        '#E53935', // Red
        '#FB8C00', // Orange
        '#8E24AA', // Purple
        '#3949AB', // Indigo
        '#039BE5', // Light Blue
    ];

    // Function to fetch all groups
    const fetchAllGroups = async () => {
        try {
            const response = await axios.get(`${API_URL}/groups`);
            if (response.data.status === 'ok') {
                setAllGroups(response.data.data);
            } else {
                setError('Failed to fetch groups');
            }
        } catch (error) {
            console.error("Error fetching all groups:", error);
            setError('Network error when fetching groups');
        }
    };

    // Function to fetch user's groups
    const fetchMyGroups = async () => {
        if (authState?.token) {
            try {
                const response = await axios.post(`${API_URL}/my-groups`, {
                    token: authState.token
                });
                
                if (response.data.status === 'ok') {
                    setMyGroups(response.data.data);
                } else {
                    setError('Failed to fetch your groups');
                }
            } catch (error) {
                console.error("Error fetching user groups:", error);
                setError('Network error when fetching your groups');
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                await Promise.all([fetchAllGroups(), fetchMyGroups()]);
            } catch (error) {
                console.error("Error loading data:", error);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
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

    // Filter the groups based on search query
    const filteredGroups = () => {
        const groups = activeTab === 'all' ? allGroups : myGroups;
        
        if (!searchQuery) return groups;
        
        return groups.filter(group => 
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

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
                ) : filteredGroups().length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'my' 
                                ? "You haven't joined any groups yet." 
                                : "No groups found."}
                        </Text>
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={styles.groupsGrid}>
                            {filteredGroups().map((group) => (
                                <GroupCard
                                    key={group.id}
                                    id={group.id}
                                    name={group.name}
                                    membersCount={group.membersCount}
                                    backgroundColor={group.backgroundColor}
                                    onPress={handleGroupPress}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
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
    },
    scrollViewContent: {
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