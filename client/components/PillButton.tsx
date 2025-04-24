import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface PillButtonProps {
    label?: string;
    onPress: () => void;
    isActive?: boolean;
    marginRight?: boolean;
    color?: string;
    iconName?: string;
    iconSize?: number;
}

const PillButton = ({ 
    label, 
    onPress, 
    isActive = false, 
    marginRight = false,
    color,
    iconName,
    iconSize = 16
}: PillButtonProps) => {
    const colorScheme = useColorScheme();
    const secondaryColor = color || Colors[colorScheme ?? 'light'].secondary;
    const contentColor = isActive ? '#fff' : secondaryColor;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                marginRight && styles.marginRight,
                { 
                    backgroundColor: isActive 
                        ? secondaryColor 
                        : 'transparent',
                    borderWidth: isActive ? 0 : 1,
                    borderColor: secondaryColor
                }
            ]}
            onPress={onPress}
        >
            {iconName ? (
                <Ionicons name={iconName as any} size={iconSize} color={contentColor} />
            ) : (
                <Text style={{ color: contentColor, fontSize: 14, fontWeight: '500' }}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 9999, 
        paddingHorizontal: 20, 
        paddingVertical: 8, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    marginRight: {
        marginRight: 20,
    },
});

export default PillButton;