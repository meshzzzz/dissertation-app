import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    View,
    TouchableOpacity,
    Alert,
    FlatList,
    Image
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useEvents } from '@/context/EventContext';
import { usePermissions } from '@/hooks/usePermissions';
import EventCard from '@/components/events/EventCard';
import { Ionicons } from '@expo/vector-icons';
import RoundedButton from '@/components/RoundedButton';
import { DEFAULT_PFP } from '@/constants/DefaultImages';
import { User } from '@/types/User';

export default function EventDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { authState } = useAuth();
    const { isSuperuser } = usePermissions();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    const { 
        eventsById, 
        loading, 
        errors, 
        fetchEventDetails,
        toggleInterest,
        deleteEvent
    } = useEvents();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isInterestLoading, setIsInterestLoading] = useState(false);

     // Load event data
     useEffect(() => {
        const load = async () => {
            if (!id) return;
            setIsInitialLoading(true);
            await fetchEventDetails(id as string);
            setIsInitialLoading(false);
        };
        load();
    }, [id]);

    // get event from context
    const event = eventsById[id as string];
    const isEventLoading = loading.events && loading.events[id as string];
    const isLoading = isInitialLoading || isEventLoading;
    const errorMessage = errors.events[id as string];

    const handleInterestToggle = async () => {
        if (!authState?.token || isInterestLoading) return;
        
        setIsInterestLoading(true);
        
        try {
            const success = await toggleInterest(id as string);
            
            if (!success) {
                Alert.alert('Error', 'Failed to update interest status');
            }
        } catch (err) {
            console.error('Error toggling interest:', err);
            Alert.alert('Error', 'An error occurred while updating interest status');
        } finally {
            setIsInterestLoading(false);
        }
    };

    const handleDeleteEvent = () => {
        if (isDeleteLoading) return;
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleteLoading(true);
                        const success = await deleteEvent(id as string);
                        if (success) router.back();
                        else Alert.alert('Error', 'Failed to delete event');
                        setIsDeleteLoading(false);
                    },
                },
            ]
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

    if (errorMessage || !event) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage || 'Event not found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const userInterested = event.userInterested || false;

    const renderUserItem = ({ item }: { item: User }) => {
        const displayName = item.preferredName || `${item.firstName} ${item.lastName}`;
        const imageUri = item.profileImage || DEFAULT_PFP;
      
        return (
          <View style={styles.userItem}>
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
            <View>
              <Text style={styles.userName}>{displayName}</Text>
              {!item.preferredName && (
                <Text style={styles.userDetails}>{`${item.firstName} ${item.lastName}`}</Text>
              )}
            </View>
          </View>
        );
      };

    return (
        <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Event',
            headerRight: () =>
              isSuperuser() ? (
                <TouchableOpacity onPress={handleDeleteEvent} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color="#F54E42" />
                </TouchableOpacity>
              ) : null,
          }}
        />
  
        <FlatList
            data={event.interestedUsers}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            ListHeaderComponent={
            <>
              <EventCard event={event} />
              <View style={styles.actionContainer}>
                <RoundedButton
                  label={userInterested ? 'Remove Interest' : 'Register Interest'}
                  onPress={handleInterestToggle}
                  color={'#00529C'}
                  iconName={userInterested ? 'star' : 'star-outline'}
                  disabled={isInterestLoading}
                  fullWidth
                />
                {isInterestLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#00529C" />
                  </View>
                )}
              </View>
              <View style={styles.interestedHeader}>
                <Text style={styles.interestedTitle}>Interested Users</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{event.interestedUsers?.length}</Text>
                </View>
              </View>
            </>
          }
          contentContainerStyle={styles.scrollContent}
        />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    scrollContent: { 
        padding: 16 
    },
    deleteButton: { 
        padding: 8 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    errorText: { 
        fontSize: 16, 
        color: '#E53935', 
        textAlign: 'center' 
    },
    actionContainer: { 
        marginTop: 12, 
        marginBottom: 24 
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 16,
    },
    interestedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 12,
    },
    interestedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    countBadge: {
        backgroundColor: '#00529C',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#ddd',
    },
    userName: {
        fontSize: 14,
        fontWeight: '500',
    },
    userDetails: {
        fontSize: 12,
        opacity: 0.7,
    },
});