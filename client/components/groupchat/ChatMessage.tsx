import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { DEFAULT_PFP } from '@/constants/DefaultImages';

interface ChatMessageProps {
    message: any;
    isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
    const colorScheme = useColorScheme();

    // format timestamp to readable time
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={[
            styles.container,
            isOwnMessage ? styles.ownContainer : styles.otherContainer
        ]}>
            {!isOwnMessage && (
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: message.senderId.profileImage || DEFAULT_PFP }}
                        style={styles.avatar}
                    />
                </View>
            )}
            
            <View style={[
                styles.bubble,
                isOwnMessage 
                    ? styles.ownBubble
                    : styles.otherBubble
            ]}>
                {!isOwnMessage && (
                    <Text style={[styles.senderName]}>
                        {message.senderId.preferredName || `${message.senderId.firstName} ${message.senderId.lastName}`}
                    </Text>
                )}
                <Text style={[
                    styles.messageText,
                    { color: isOwnMessage ? 'white' : 'black' }
                ]}>
                    {message.text}
                </Text>
                <Text style={[
                    styles.timestamp,
                    { color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#999' }
                ]}>
                    {formatTime(message.createdAt)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    ownContainer: {
        justifyContent: 'flex-end',
    },
    otherContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    bubble: {
        borderRadius: 20,
        padding: 12,
        maxWidth: '75%',
    },
    ownBubble: {
        borderBottomRightRadius: 5,
        backgroundColor: '#00529C'
    },
    otherBubble: {
        borderBottomLeftRadius: 5,
        backgroundColor: '#EFCCE2'
    },
    senderName: {
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 4,
        color:'#555'
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
});