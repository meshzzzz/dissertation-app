import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const BackButton = () => {
    const colorScheme = useColorScheme();
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="chevron-back" size={24} color={Colors[colorScheme ?? 'light'].primary} />
        </TouchableOpacity>
    );
};

export default BackButton;
