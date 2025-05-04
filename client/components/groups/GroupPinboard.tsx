import React from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Event } from '@/types/Event';

interface GroupPinboardProps {
    name: string;
    memberCount: number;
    description: string;
    groupImage: string;
    upcomingEvent?: Event | null;
    onEventsPress: () => void;
}

const GroupPinboard = ({ name, memberCount, description, groupImage, upcomingEvent, onEventsPress }: GroupPinboardProps) => {
    const colorScheme = useColorScheme();
    const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;

    // format date helper function
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
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

    return (
        <View style={[
            styles.pinboard,
            { backgroundColor: pinboardColor }
        ]}>
            {/* pinboard corner dots */}
            <View style={[styles.cornerDot, styles.topLeftDot]} />
            <View style={[styles.cornerDot, styles.topRightDot]} />
            <View style={[styles.cornerDot, styles.bottomLeftDot]} />
            <View style={[styles.cornerDot,styles.bottomRightDot]} />
            
            <View style={styles.pinboardContent}>
                <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                        <Text style={[
                            styles.pinboardTitle,
                            { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}
                        >
                            {name}
                        </Text>
                    </View>
                    {/* polaroid group pic */}
                    <View style={styles.polaroidContainer}>
                        <View style={styles.polaroidFrame}>
                            <Image 
                                source={{ uri: groupImage }} 
                                style={styles.polaroidImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.polaroidCaption}>
                                {memberCount} members
                            </Text>
                        </View>
                    </View>
                </View>
                {/* description postit */}
                <ImageBackground 
                    source={require('@/assets/images/pink_postit.png')} 
                    style={styles.postitContainer}
                >
                    <Text style={styles.descriptionText}>
                        {description}
                    </Text>
                </ImageBackground>
                <ImageBackground 
                    source={require('@/assets/images/notepaper.png')} 
                    style={styles.eventsNoteContainer}
                >
                    <Text style={styles.eventTitle}>Next Event</Text>
                    {upcomingEvent ? (
                        <View style={styles.upcomingEventContainer}>
                            <Image 
                                source={{ uri: upcomingEvent.eventImage }} 
                                style={styles.upcomingEventImage}
                                resizeMode="cover"
                            />
                            <View style={styles.upcomingText}>
                                <Text style={styles.upcomingEventTitle} numberOfLines={1}>
                                    {upcomingEvent.title}
                                </Text>
                                <Text style={styles.upcomingEventDate}>
                                    {formatDate(upcomingEvent.date)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noEventText}>No upcoming events</Text>
                    )}
                    <TouchableOpacity style={styles.seeMoreButton} onPress={onEventsPress}>
                        <Text style={styles.seeMoreText}>See more</Text>
                        <Ionicons name="chevron-forward-outline" size={12} color={'black'}/>
                    </TouchableOpacity>
                </ImageBackground>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pinboard: {
        position: 'relative',
        borderRadius: 15,
        padding: 15,
        marginTop: 10,
        marginBottom: 18,
        width: '90%',
        height: 400,
        alignSelf: 'center',
    },
    cornerDot: {
        position: 'absolute',
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#C19259'
    },
    topLeftDot: {
        top: 15,
        left: 15,
    },
    topRightDot: {
        top: 15,
        right: 15,
    },
    bottomLeftDot: {
        bottom: 15,
        left: 15,
    },
    bottomRightDot: {
        bottom: 15,
        right: 15,
    },
    pinboardContent: {
        marginHorizontal: 20,
        marginVertical: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleContainer: {
        flex: 1,
        marginRight: 10,
    },
    pinboardTitle: {
        fontFamily: 'LondrinaShadow',
        fontSize: 40,
        marginBottom: 6,
        marginTop: 4,
    },
    polaroidContainer: {
        marginTop: 10,
    },
    polaroidFrame: {
        backgroundColor: 'white',
        padding: 5,
        borderWidth: 1,
        borderColor: 'black',
    },
    polaroidImage: {
        width: 100,
        height: 80,
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 3
    },
    polaroidCaption: {
        fontFamily: 'Itim',
        fontSize: 11,
        textAlign: 'center',
        color: 'black',
    },
    postitContainer: {
        width: '80%',
        minHeight: 150,
        padding: 20,
        marginLeft: -20,
        marginTop: 50
    },
    descriptionText: {
        fontFamily: 'Itim',
        fontSize: 11,
        lineHeight: 14,
        color: 'black',
        width: 104,
        height: 88,
        marginLeft: 20,
        marginTop: 15
    },
    eventsNoteContainer: {
        width: 140,
        height: 200,
        marginLeft: 150,
        marginTop: -200,
        position: 'relative',
    },
    eventTitle: {
        fontFamily: 'LondrinaShadow',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 5,
    },
    upcomingEventContainer: {
        paddingHorizontal: 10,
    },
    upcomingEventImage: {
        alignSelf:'center',
        width: 103,
        height: 77,
    },
    upcomingText: {
        alignSelf: 'center'
    },
    upcomingEventTitle: {
        fontFamily: 'Itim',
        fontSize: 11,
        color: 'black',
        marginTop: 4,
        textAlign: 'left',
    },
    upcomingEventDate: {
        fontFamily: 'Itim',
        fontSize: 8,
        color: '#C80474',
        marginTop: 2,
        textAlign: 'left',
    },
    noEventText: {
        fontFamily: 'Itim',
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    seeMoreText: {
        fontFamily: 'Itim',
        fontSize: 11,
        color: 'black',
    }
});

export default GroupPinboard;