import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface MessageInputProps {
    text: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isSending: boolean;
}

export default function MessageInput({
    text,
    onChangeText,
    onSend,
    isSending
}: MessageInputProps) {
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={onChangeText}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                />
            </View>
            
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    { backgroundColor: text.trim() ? primaryColor : '#ccc' }
                ]}
                onPress={onSend}
                disabled={!text.trim() || isSending}
            >
                {isSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    inputContainer: {
        flex: 1,
    },
    input: {
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
    },
    submitButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});