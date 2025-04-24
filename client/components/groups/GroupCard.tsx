import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Group } from '@/types/Group';

interface GroupCardProps {
    group: Group
    isJoined: boolean;
    onPress: (id: string) => void;
    onJoinPress: (group: Group) => void;
}

const { width } = Dimensions.get('window');
 // spacing between cards
const gap = 14;
// 2 cards + 3 gaps (left, middle, right)
const cardWidth = Math.floor((width - gap * 3) / 2); 
// 75% of the width
const cardHeight = Math.floor(cardWidth * 0.75); 

const GroupCard = ({ 
    group,
    isJoined,
    onPress,
    onJoinPress
}: GroupCardProps) => {
    const colorScheme = useColorScheme();
    const secondaryColor = Colors[colorScheme ?? 'light'].secondary;
    
    const handlePress = () => {
        if (isJoined) {
            // if user has joined, navigate to group details
            onPress(group.id);
        } else {
            // if user hasn't joined, show join modal
            onJoinPress(group);
        }
    };
    return (
        <TouchableOpacity
            style={[styles.card, { width: cardWidth, height: cardHeight, marginBottom: 12 }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: group.groupImage }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            {/* overlay for better text visibility */}
            <View style={styles.overlay} />
            {/* Joined indicator */}
            {isJoined && (
                <View style={styles.joinedBadgeContainer}>
                    <View style={[styles.joinedBadge, { backgroundColor: `${secondaryColor}CC` }]}>
                        <Text style={styles.joinedText}>Joined</Text>
                    </View>
                </View>
            )}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{group.name}</Text>
                <Text style={styles.membersCount}>{group.membersCount} members</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        borderRadius: 12, 
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    },
    joinedBadgeContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        padding: 4,
    },
    joinedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    joinedText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14, 
    },
    title: {
        color: 'white',
        fontSize: 18, 
        fontWeight: 'bold', 
    },
    membersCount: {
        color: 'white',
        fontSize: 12, 
    }
});

export default GroupCard;