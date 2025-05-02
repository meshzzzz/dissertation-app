import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth, API_URL } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import axios from 'axios';
import { User } from '@/types/User';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_PFP } from '@/constants/DefaultImages';

export default function GroupMembersScreen() {
    const params = useLocalSearchParams();
    const { groupId } = params;
    const { authState } = useAuth();
    const { isSuperuser } = usePermissions();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    const fetchMembers = async () => {
        if (!authState?.token) return;

        setLoading(true);
        setError(null);

        try {
        const response = await axios.get(`${API_URL}/groups/${groupId}`, {
            params: { token: authState.token }
        });

        if (response.data.status === 'ok') {
            setMembers(response.data.data.members);
        } else {
            setError('Failed to fetch group members');
        }
        } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Network error while fetching data');
        } finally {
        setLoading(false);
        }
    };

    fetchMembers();
    }, [groupId, authState]);

    const handleRemoveMember = async (memberId: string) => {
        if (!authState?.token || !groupId) return;
        
        Alert.alert(
            "Remove Member",
            "Are you sure you want to remove this member from the group?",
            [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        const response = await axios.post(
                        `${API_URL}/groups/remove-member`,
                        {
                            groupId,
                            memberId
                        },
                        {
                            params: { token: authState.token }
                        }
                        );
            
                        if (response.data.status === "ok") {
                            // remove member from local state
                            setMembers(members.filter(member => member._id !== memberId));
                        } else {
                            Alert.alert("Error", response.data.data || "Failed to remove member");
                        }
                    } catch (err) {
                        console.error("Error removing member:", err);
                        Alert.alert("Error", "Network error while removing member");
                    }
                }
            }
            ]
        );
    };

    // render a single member item
    const renderMemberItem = ({ item }: { item: User }) => {
        const displayName = item.preferredName || `${item.firstName} ${item.lastName}`;

        return (
            <View style={styles.memberItem}>
                <View style={styles.profileImageContainer}>
                    <Image 
                        source={{ uri: item.profileImage || DEFAULT_PFP}} 
                        style={styles.profileImage}
                    />
                </View>
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{displayName}</Text>
                    <Text style={styles.memberDetails}>{`${item.firstName} ${item.lastName}`}</Text>
                </View>
                
                {isSuperuser() &&
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(item._id)}
                    >
                        <Ionicons name="trash-outline" size={24} color={'#F54E42'} />
                    </TouchableOpacity>
                }
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !members) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'No members found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.memberCount}>{members.length} members</Text>
            </View>
            
            <FlatList
                data={members}
                keyExtractor={(item) => item._id}
                renderItem={renderMemberItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No members in this group</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    memberCount: {
        fontSize: 16,
        fontWeight: 'bold',
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
    listContent: {
        padding: 16,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    profileImageContainer: {
        marginRight: 12,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
        marginRight: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberDetails: {
        fontSize: 14,
        opacity: 0.7,
    },
    removeButton: {
        padding: 8,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.7,
    },
});