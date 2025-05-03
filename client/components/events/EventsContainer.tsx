import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { useEvents } from '@/context/EventContext';

interface EventsContainerProps {
    eventIds: string[];
}

const EventsContainer = ({eventIds}: EventsContainerProps) => {
    const { eventsById } = useEvents();

    // get event objects from their IDs
    const eventObjects = eventIds.map(id => eventsById[id]);

    // handle event press
    const handleEventPress = (eventId: string) => {
        router.push(`/groups/events/${eventId}`);
    };

    // format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });

        // Add suffix to day (1st, 2nd, 3rd, etc.)
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

    // calculate days to go
    const getDaysToGo = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        
        // reset time to midnight to get accurate day difference
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // calculate difference in days
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    return (
        <View style={styles.container}>
            <View style={styles.eventsSection}>
                <Text style={styles.eventsSectionTitle}>What's On?</Text>
                {eventObjects.length === 0 ? (
                    <Text style={styles.noEventsText}>No upcoming events</Text>
                ) : (
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                        style={styles.eventsScrollView}
                    >
                        {eventObjects.map((event) => {
                            if (!event) return null;
                            const daysToGo = getDaysToGo(event.date);
                            return (
                                <TouchableOpacity 
                                    key={event._id} 
                                    onPress={() => handleEventPress(event._id)}
                                    style={styles.eventCard}
                                >
                                    <Image 
                                        source={{ uri: event.eventImage }} 
                                        style={StyleSheet.absoluteFillObject}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.overlay} />
                                    <View style={styles.daysOverlay}>
                                        <Text style={styles.daysNumber}>{daysToGo}</Text>
                                        <Text style={styles.daysText}>
                                            {daysToGo === 1 ? 'day' : 'days'} to go
                                        </Text>
                                    </View>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventTitle}>
                                            {event.title}
                                        </Text>
                                        <Text style={styles.eventDateTime}>
                                            {formatDate(event.date)} • {formatTime(event.date)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 191,
        backgroundColor: '#DC80B8',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 6
    },
    eventsSection: {
        width: '100%',
        paddingLeft: 25,
    },
    eventsSectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 18,
        alignSelf: 'flex-start',
        color: '#fff',
    },
    eventsScrollView: {
        width: '100%',
    },
    eventCard: {
        marginRight: 16,
        borderRadius: 15,
        overflow: 'hidden',
        width: 125,
        height: 125,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    eventImage: {
        width: '100%',
        height: 110,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    daysOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1,
    },
    daysNumber: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
    },
    daysText: {
        fontSize: 9,
        color: 'white',
    },
    eventInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    eventTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    eventDateTime: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.8)',
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
    noEventsText: {
        fontSize: 14,
        color: 'white',
        marginVertical: 10,
    }
});

export default EventsContainer;