import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface ErrorViewProps {
    error: string | null;
    onRetry: () => void;
}

export default function ErrorView({ error, onRetry }: ErrorViewProps) {
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;

    return (
        <View style={styles.container}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: primaryColor }]}
                onPress={onRetry}
            >
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#E53935',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});