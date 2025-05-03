import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@/types/Event';
import { DEFAULT_PFP } from '@/constants/DefaultImages';

interface EventCardProps {
    event: Event;
    onPress?: () => void;
}

const EventCard = ({ event, onPress }: EventCardProps) => {
    // button in groupslist, static card in event detail screen
    const isButton = !!onPress;

    // format date helper function
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

    // format time helper function
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }).toLowerCase();
    };

    const CardContent = () => (
        <>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                        {formatDate(event.date)} • {formatTime(event.date)}
                    </Text>
                </View>
                
                <View style={styles.creatorContainer}>
                    <Text style={styles.creatorName}>
                        {event.createdBy.preferredName || `${event.createdBy.firstName}`}
                    </Text>
                    <Image 
                        source={{ uri: DEFAULT_PFP }} 
                        style={styles.creatorImage}
                    />
                </View>
            </View>
            <Text style={styles.eventDescription}>{event.description}</Text>
        </>
    );

    // chevron included if card is a button
    const CardFooter = () => (
        <View style={styles.cardFooter}>
            <View style={styles.footerLeftContent}>
                <View style={styles.groupBadge}>
                    <Text style={styles.groupName}>{event.groupName || event.group.name}</Text>
                </View>
                <View style={styles.interestedContainer}>
                    <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.interestedText}>
                        {event.interestedUsers.length} interested
                    </Text>
                </View>
            </View>
            
            {isButton && (
                <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color="rgba(255,255,255,0.7)" 
                />
            )}
        </View>
    );

    // render as touchableopacity if card is a button
    if (isButton) {
        return (
            <TouchableOpacity 
                style={styles.eventCard} 
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Image 
                    source={{ uri: event.eventImage }} 
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
                <View style={styles.eventContent}>
                    <View style={styles.upperContent}>
                        <CardContent />
                    </View>
                    <CardFooter />
                </View>
            </TouchableOpacity>
        );
    }

    // if not a button render as a static View
    return (
        <View style={styles.eventCard}>
            <Image 
                source={{ uri: event.eventImage }} 
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.eventContent}>
                <View style={styles.upperContent}>
                    <CardContent />
                </View>
                <CardFooter />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    eventCard: {
        borderRadius: 15,
        overflow: 'hidden',
        width: '100%',
        marginBottom: 16,
        height: 225,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    eventContent: {
        padding: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    upperContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    creatorName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginRight: 8,
    },
    eventTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    eventDescription: {
        fontSize: 12,
        color: 'white',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    footerLeftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 20
    },
    groupName: {
        fontSize: 10,
        color: 'white',
        fontWeight: '500',
    },
    interestedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interestedText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 6,
    },
});

export default EventCard;