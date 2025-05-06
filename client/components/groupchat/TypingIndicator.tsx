import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface TypingIndicatorProps {
    typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    if (typingUsers.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Text style={styles.text}>
                    {typingUsers.length === 1 
                    ? 'Someone is typing...' 
                    : 'Multiple people are typing...'}
                </Text>
                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                    <View style={[styles.dot, styles.dotMiddle, { backgroundColor: primaryColor }]} />
                    <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        alignItems: 'flex-start',
    },
    bubble: {
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 12,
        color: '#777',
        marginRight: 5,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.7,
    },
    dotMiddle: {
        marginHorizontal: 3,
    },
});