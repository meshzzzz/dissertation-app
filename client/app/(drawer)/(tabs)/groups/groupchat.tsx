import React, { useEffect, useState, useRef } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import MessageInput from '@/components/groupchat/MessageInput';
import ChatMessage from '@/components/groupchat/ChatMessage';
import TypingIndicator from '@/components/groupchat/TypingIndicator';
import ErrorView from '@/components/groupchat/ErrorView';

export default function GroupChatScreen() {
    const params = useLocalSearchParams();
    const { groupId } = params;
    const { authState } = useAuth();
    const {
        messages,
        loading,
        error,
        joinGroupChat,
        leaveGroupChat,
        fetchMessages,
        sendMessage,
        sendTypingIndicator,
        typingUsers
    } = useChat();
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flatListRef = useRef(null);

    // get current group messages
    const groupMessages = messages[groupId as string] || [];

    useEffect(() => {
    // join chat room and fetch initial messages
    joinGroupChat(groupId as string);
    fetchMessages(groupId as string, 1).then(data => {
        if (data && data.pagination) {
            setHasMore(data.pagination.page < data.pagination.pages);
        }
    });

    //  lean up on unmount
    return () => {
        leaveGroupChat(groupId as string);
    };
    }, [groupId]);

    // handle typing indicator
    const handleTextChange = (value: string) => {
        setText(value);

        // send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            sendTypingIndicator(groupId as string, true);
        }

        // clear previous timeout
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        // set new timeout to stop typing indicator after 1.5 seconds
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
            sendTypingIndicator(groupId as string, false);
        }, 1500);
    };

    // handle sending a message
    const handleSend = async () => {
        if (!text.trim()) return;

        setIsSending(true);
        try {
            await sendMessage(groupId as string, text);
            setText('');
            
            // stop typing indicator
            if (isTyping) {
                setIsTyping(false);
                sendTypingIndicator(groupId as string, false);
                if (typingTimeout.current) {
                    clearTimeout(typingTimeout.current);
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setIsSending(false);
        }
    };

    // load more messages when scrolling up
    const handleLoadMore = async () => {
        if (loading[groupId as string] || !hasMore) return;

        const nextPage = page + 1;
        const data = await fetchMessages(groupId as string, nextPage);
        if (data && data.pagination) {
            setPage(nextPage);
            setHasMore(data.pagination.page < data.pagination.pages);
        }
    };

    // get list of users currently typing
    const getTypingUsers = () => {
        const groupTypingUsers = typingUsers[groupId as string] || {};
        return Object.keys(groupTypingUsers).filter(id => groupTypingUsers[id]);
    };

    return (
        <SafeAreaView style={styles.container}> 
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                {loading[groupId as string] && page === 1 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={primaryColor} />
                    </View>
                ) : error[groupId as string] ? (
                    <ErrorView 
                        error={error[groupId as string]} 
                        onRetry={() => fetchMessages(groupId as string, 1)}
                    />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={groupMessages}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <ChatMessage 
                                message={item} 
                                isOwnMessage={item.senderId._id === authState?.user?.id} 
                            />
                        )}
                        inverted
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loading[groupId as string] && page > 1 ? (
                                <View style={styles.loadMoreContainer}>
                                    <ActivityIndicator size="small" color={primaryColor} />
                                </View>
                            ) : null
                        }
                        ListHeaderComponent={
                            getTypingUsers().length > 0 ? (
                            <TypingIndicator typingUsers={getTypingUsers()} />
                            ) : null
                        }
                        contentContainerStyle={styles.flatListContent}
                    />
                )}
                
                <MessageInput
                    text={text}
                    onChangeText={handleTextChange}
                    onSend={handleSend}
                    isSending={isSending}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContent: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    loadMoreContainer: {
        paddingVertical: 10,
        alignItems: 'center',
    },
});