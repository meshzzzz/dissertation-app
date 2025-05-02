import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { API_URL, useAuth } from './AuthContext';
import { Message } from '@/types/Message';

declare module 'socket.io-client' {
    interface Socket {
        userId?: string;
    }
}

interface ChatContextState {
    messages: Record<string, Message[]>;
    typingUsers: Record<string, Record<string, boolean>>;
    loading: Record<string, boolean>;
    error: Record<string, string | null>;
    isConnected: boolean;
    joinGroupChat: (groupId: string) => void;
    leaveGroupChat: (groupId: string) => void;
    fetchMessages: (groupId: string, page?: number) => Promise<any>;
    sendMessage: (groupId: string, text: string, attachments?: string[]) => Promise<any>;
    sendTypingIndicator: (groupId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextState>({
    messages: {},
    typingUsers: {},
    loading: {},
    error: {},
    isConnected: false,
    joinGroupChat: () => {},
    leaveGroupChat: () => {},
    fetchMessages: async () => null,
    sendMessage: async () => null,
    sendTypingIndicator: () => {},
});
  

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, boolean>>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});
    
    // initialise socket connection when user is authenticated
    useEffect(() => {
        if (!authState?.token) return;
        
        // clear previous socket connection if it exists
        if (socket) {
            socket.disconnect();
        }
        
        // create new socket connection
        const newSocket = io(API_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });
        
        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            
            // authenticate socket with token
            newSocket.emit('authenticate', { token: authState.token });
        });
        
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });
        
        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setIsConnected(false);
        });
        
        setSocket(newSocket);
        
        // clean up on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [authState?.token]);
    
    // join a group chat
    const joinGroupChat = (groupId: string) => {
        if (!socket || !isConnected) return;

        socket.emit('join_group', { groupId });
        
        // listen for new messages in this group
        socket.on('new_message', (message) => {
            if (message.groupId === groupId) {
                setMessages(prev => ({
                    ...prev,
                    [groupId]: [message, ...(prev[groupId] || [])]
                }));
            }
        });
        
        // listen for typing indicators
        socket.on('user_typing', ({ userId, isTyping }) => {
            // skip for current user
            if (userId === authState?.user?.id) return;
            
            setTypingUsers(prev => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    [userId]: isTyping
                }
            }));
        });
    };
    
    // leave a group chat
    const leaveGroupChat = (groupId: string) => {
        if (!socket || !isConnected) return;
        
        socket.emit('leave_group', { groupId });
        socket.off('new_message');
        socket.off('user_typing');
    };
    
    // send typing indicator
    const sendTypingIndicator = (groupId: string, isTyping: boolean) => {
        if (!socket || !isConnected) return;
        
        socket.emit('typing', { groupId, isTyping });
    };
    
    // fetch messages for a group
    const fetchMessages = async (groupId: string, page = 1) => {
        if (!authState?.token) return;
        
        setLoading(prev => ({ ...prev, [groupId]: true }));
        setError(prev => ({ ...prev, [groupId]: null }));
        
        try {
            const response = await axios.get(`${API_URL}/chat/${groupId}`, {
                params: { page, token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                const newMessages = response.data.data.messages;
                
                setMessages(prev => ({
                    ...prev,
                    [groupId]: page === 1 ? newMessages : [...(prev[groupId] || []), ...newMessages]
                }));
                
                return response.data.data;
            } else {
                throw new Error(response.data.data);
            }
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            const errorMessage = err.response?.data?.data || 'Failed to load messages';
            setError(prev => ({ ...prev, [groupId]: errorMessage }));
        } finally {
            setLoading(prev => ({ ...prev, [groupId]: false }));
        }
    };
    
    // send a message
    const sendMessage = async (groupId: string, text: string, attachments: string[] = []) => {
        if (!authState?.token || !text.trim()) return;
        
        try {
            const response = await axios.post(`${API_URL}/chat`, {
                groupId,
                text,
                attachments,
                token: authState.token
            });
            
            if (response.data.status === 'ok') {
                // message added through the socket
                return response.data.data;
            } else {
                throw new Error(response.data.data);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            throw err;
        }
    };
    
    const value = {
        messages,
        typingUsers,
        loading,
        error,
        isConnected,
        joinGroupChat,
        leaveGroupChat,
        fetchMessages,
        sendMessage,
        sendTypingIndicator
    };
    
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};