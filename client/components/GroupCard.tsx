import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

interface GroupCardProps {
    id: string;
    name: string;
    membersCount: number;
    backgroundColor: string;
    onPress: (id: string) => void;
}

const { width } = Dimensions.get('window');
// calculate card width to ensure proper dimensions even with percentage classes
const cardWidth = Math.floor((width - 40) / 2);

const GroupCard = ({ 
    id, 
    name, 
    membersCount, 
    backgroundColor, 
    onPress 
}: GroupCardProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                { 
                    width: cardWidth, 
                    height: cardWidth,
                    backgroundColor 
                }
            ]}
            onPress={() => onPress(id)}
            activeOpacity={0.8}
        >
            {/* overlay for better text visibility */}
            <View style={styles.overlay} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.membersCount}>{membersCount} members</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        borderRadius: 12, 
        marginBottom: 16, 
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8, 
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