import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface BackButtonProps {
    color?: string;
    size?: number;
}

const BackButton = ({ color = '#000', size = 24 }: BackButtonProps) => {

    return (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="chevron-back" size={size} color={color} />
        </TouchableOpacity>
    );
};

export default BackButton;
