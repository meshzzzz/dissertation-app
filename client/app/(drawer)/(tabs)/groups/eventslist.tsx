import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    View,
    TouchableOpacity,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth, API_URL } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Event } from '@/types/Event';
import { useEvents } from '@/context/EventContext';
import EventCard from '@/components/events/EventCard';
import { Ionicons } from '@expo/vector-icons';
import AddEventModal from '@/components/events/AddEventModal';

export default function GroupEventsScreen() {
    const params = useLocalSearchParams();
    const { groupId } = params;
    const { isSuperuser } = usePermissions();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;
    const { 
        eventsById, 
        groupEvents, 
        loading, 
        errors,
        fetchGroupEvents 
    } = useEvents();
    
    const [addModalVisible, setAddModalVisible] = useState(false);

    useEffect(() => {
        if (groupId) {
            fetchGroupEvents(groupId as string);
        }
    }, [groupId]);

    const handleEventPress = (eventId: string) => {
        router.push(`/groups/events/${eventId}`)
    }

    // get events for this group
    const eventIds = groupEvents[groupId as string] || [];
    const events = eventIds.map(id => eventsById[id]).filter(Boolean);

    // event loading & errors
    const isLoading = loading.groups?.[groupId as string];
    const errorMessage = errors.groups?.[groupId as string];

    // render a single event card
    const renderEventItem = ({ item }: { item: Event }) => {
        return (
            <EventCard 
                event={item}
                onPress={() => handleEventPress(item._id)}
            />
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            </SafeAreaView>
        );
    }

    if (errorMessage || !events) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage || 'No events found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
                options={{ 
                    title: 'Group Events',
                    headerRight: () => (
                        isSuperuser() ? (
                            <TouchableOpacity 
                                onPress={() => setAddModalVisible(true)}
                                style={styles.headerButton}
                            >
                                <Ionicons 
                                    name="add" 
                                    size={24} 
                                    color={primaryColor} 
                                />
                            </TouchableOpacity>
                        ) : null
                    )
                }} 
            />
            <FlatList
                data={events}
                keyExtractor={(item) => item._id}
                renderItem={renderEventItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No events in this group</Text>
                    </View>
                }
            />
            <AddEventModal
                modalVisible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                groupId={groupId as string}
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
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.7,
    },
    headerButton: {
        marginLeft: 15,
        padding: 5
    }
});