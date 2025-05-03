import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    View,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useEvents } from '@/context/EventContext';
import EventCard from '@/components/events/EventCard';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailsScreen() {
    const params = useLocalSearchParams();
    const { id } = params;
    const { authState } = useAuth();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    const { 
        eventsById, 
        loading, 
        errors, 
        fetchEventDetails,
        toggleInterest,
    } = useEvents();

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [interested, setInterested] = useState(false);

    useEffect(() => {
        const loadEventData = async () => {
            if (!id) return;

            setIsInitialLoading(true);
            
            try {
                // if event not already in context, fetch it
                if (!eventsById[id as string]) {
                    await fetchEventDetails(id as string);
                }
                
                setIsInitialLoading(false);
            } catch (err) {
                console.error('Error loading event details:', err);
                setIsInitialLoading(false);
            }
        };

        loadEventData();
    }, [id]);

    // get event from context
    const event = eventsById[id as string];
    const isEventLoading = loading.events && loading.events[id as string];

    // get loading & error state
    const isLoading = isInitialLoading || isEventLoading;
    const errorMessage = errors.events[id as string];

    const handleInterestToggle = async () => {
        if (!authState?.token || !id) return;
        
        try {
            const success = await toggleInterest(id as string);
            
            if (success) {
                // update local interested state
                setInterested(!interested);
            } else {
                Alert.alert('Error', 'Failed to update interest status');
            }
        } catch (err) {
            console.error('Error toggling interest:', err);
            Alert.alert('Error', 'An error occurred while updating interest status');
        } 
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

    if (errorMessage || !event) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage || 'Event not found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <EventCard event={event} />
                <TouchableOpacity
                    style={styles.interestButton}
                    onPress={handleInterestToggle}
                >
                    <Ionicons
                        name="star-outline"
                        size={18}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Register Interest</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    interestButton: {
        backgroundColor: '#3c2b58',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
});